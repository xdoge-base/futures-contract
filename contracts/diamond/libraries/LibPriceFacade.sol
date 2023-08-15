// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {ZERO, ONE, UC, uc, into} from "unchecked-counter/src/UC.sol";
import "../../utils/Constants.sol";
import "../interfaces/ITradingClose.sol";
import "../interfaces/ITradingOpen.sol";
import "./LibChain.sol";
import "./LibChainlinkPrice.sol";

library LibPriceFacade {

    using EnumerableSet for EnumerableSet.Bytes32Set;

    bytes32 constant PRICE_FACADE_POSITION = keccak256("trademan.price.facade.storage");

    struct LatestCallbackPrice {
        uint64 price;
        uint40 timestamp;
    }

    struct OpenOrClose {
        bytes32 id;
        bool isOpen;
    }

    struct PendingPrice {
        uint256 blockNumber;
        address token;
        OpenOrClose[] ids;
    }

    struct PriceFacadeStorage {
        // BTC/ETH/ARB/.../ =>
        mapping(address => LatestCallbackPrice) callbackPrices;
        // keccak256(token, block.number) =>
        mapping(bytes32 => PendingPrice) pendingPrices;
        uint16 lowPriceGapP;   // 1e4
        uint16 highPriceGapP;  // 1e4
        uint16 maxDelay;

        // added for enumerating all pending prices ids
        EnumerableSet.Bytes32Set pendingPriceRequestIDs;
    }

    function priceFacadeStorage() internal pure returns (PriceFacadeStorage storage pfs) {
        bytes32 position = PRICE_FACADE_POSITION;
        assembly {
            pfs.slot := position
        }
    }

    event SetLowPriceGapP(uint16 indexed oldLowPriceGapP, uint16 indexed lowPriceGapP);
    event SetHighPriceGapP(uint16 indexed oldHighPriceGapP, uint16 indexed highPriceGapP);
    event SetMaxDelay(uint16 indexed oldMaxDelay, uint16 indexed maxDelay);
    event RequestPrice(bytes32 indexed requestId, address indexed token);
    event PriceRejected(
        address indexed feeder, bytes32 indexed requestId, address indexed token,
        uint64 price, uint64 beforePrice, uint40 updatedAt
    );
    event PriceUpdated(
        address indexed feeder, bytes32 indexed requestId,
        address indexed token, uint64 price
    );

    function initialize(uint16 lowPriceGapP, uint16 highPriceGapP, uint16 maxDelay) internal {
        PriceFacadeStorage storage pfs = priceFacadeStorage();
        require(pfs.lowPriceGapP == 0 && pfs.highPriceGapP == 0 && pfs.maxDelay == 0, "LibPriceFacade: Already initialized");
        _setLowPriceGapP(pfs, lowPriceGapP);
        _setHighPriceGapP(pfs, highPriceGapP);
        setMaxDelay(maxDelay);
    }

    function _setLowPriceGapP(PriceFacadeStorage storage pfs, uint16 lowPriceGapP) private {
        uint16 old = pfs.lowPriceGapP;
        pfs.lowPriceGapP = lowPriceGapP;
        emit SetLowPriceGapP(old, lowPriceGapP);
    }

    function _setHighPriceGapP(PriceFacadeStorage storage pfs, uint16 highPriceGapP) private {
        uint16 old = pfs.highPriceGapP;
        pfs.highPriceGapP = highPriceGapP;
        emit SetHighPriceGapP(old, highPriceGapP);
    }

    function setLowAndHighPriceGapP(uint16 lowPriceGapP, uint16 highPriceGapP) internal {
        PriceFacadeStorage storage pfs = priceFacadeStorage();
        if (lowPriceGapP > 0 && highPriceGapP > 0) {
            require(highPriceGapP > lowPriceGapP, "LibPriceFacade: HighPriceGapP must be greater than lowPriceGapP");
            _setLowPriceGapP(pfs, lowPriceGapP);
            _setHighPriceGapP(pfs, highPriceGapP);
        } else if (lowPriceGapP > 0) {
            require(pfs.highPriceGapP > lowPriceGapP, "LibPriceFacade: HighPriceGapP must be greater than lowPriceGapP");
            _setLowPriceGapP(pfs, lowPriceGapP);
        } else {
            require(highPriceGapP > pfs.lowPriceGapP, "LibPriceFacade: HighPriceGapP must be greater than lowPriceGapP");
            _setHighPriceGapP(pfs, highPriceGapP);
        }
    }

    function setMaxDelay(uint16 maxDelay) internal {
        PriceFacadeStorage storage pfs = priceFacadeStorage();
        uint16 old = pfs.maxDelay;
        pfs.maxDelay = maxDelay;
        emit SetMaxDelay(old, maxDelay);
    }

    function getPrice(address token) internal view returns (uint256) {
        (uint256 price, uint8 decimals,) = LibChainlinkPrice.getPriceFromChainlink(token);
        return decimals == 8 ? price : price * 1e8 / (10 ** decimals);
    }

    function requestPrice(bytes32 id, address token, bool isOpen) internal {
        PriceFacadeStorage storage pfs = priceFacadeStorage();
        bytes32 requestId = keccak256(abi.encode(token, LibChain.getBlockNumber()));
        PendingPrice storage pendingPrice = pfs.pendingPrices[requestId];
        require(pendingPrice.ids.length < Constants.MAX_REQUESTS_PER_PAIR_IN_BLOCK, "LibPriceFacade: The requests for price retrieval are too frequent.");
        pendingPrice.ids.push(OpenOrClose(id, isOpen));
        if (pendingPrice.blockNumber != LibChain.getBlockNumber()) {
            pendingPrice.token = token;
            pendingPrice.blockNumber = LibChain.getBlockNumber();

            // add to pendingPriceRequestIDs
            pfs.pendingPriceRequestIDs.add(requestId);

            emit RequestPrice(requestId, token);
        }
    }

    function requestPriceCallback(bytes32 requestId, uint64 price) internal {
        PriceFacadeStorage storage pfs = priceFacadeStorage();
        PendingPrice memory pendingPrice = pfs.pendingPrices[requestId];
        OpenOrClose[] memory ids = pendingPrice.ids;
        require(pendingPrice.blockNumber > 0 && ids.length > 0, "LibPriceFacade: RequestId does not exist");

        (uint64 beforePrice, uint40 updatedAt) = getPriceFromCacheOrOracle(pfs, pendingPrice.token);
        uint64 priceGap = price > beforePrice ? price - beforePrice : beforePrice - price;
        uint gapPercentage = priceGap * 1e4 / beforePrice;
        // Excessive price difference. Reject this price
        if (gapPercentage > pfs.highPriceGapP) {
            emit PriceRejected(msg.sender, requestId, pendingPrice.token, price, beforePrice, updatedAt);
            return;
        }
        LatestCallbackPrice storage cachePrice = pfs.callbackPrices[pendingPrice.token];
        cachePrice.timestamp = uint40(block.timestamp);
        cachePrice.price = price;
        // The time interval is too long.
        // receive the current price but not use it
        // and wait for the next price to be fed.
        if (block.timestamp > updatedAt + pfs.maxDelay) {
            emit PriceRejected(msg.sender, requestId, pendingPrice.token, price, beforePrice, updatedAt);
            return;
        }
        uint64 upperPrice = price;
        uint64 lowerPrice = price;
        if (gapPercentage > pfs.lowPriceGapP) {
            (upperPrice, lowerPrice) = price > beforePrice ? (price, beforePrice) : (beforePrice, price);
        }
        for (UC i = ZERO; i < uc(ids.length); i = i + ONE) {
            OpenOrClose memory openOrClose = ids[i.into()];
            if (openOrClose.isOpen) {
                ITradingOpen(address(this)).marketTradeCallback(openOrClose.id, upperPrice, lowerPrice);
            } else {
                ITradingClose(address(this)).closeTradeCallback(openOrClose.id, upperPrice, lowerPrice);
            }
        }
        // Deleting data can save a little gas
        emit PriceUpdated(msg.sender, requestId, pendingPrice.token, price);
        delete pfs.pendingPrices[requestId];
        // remove from pendingPriceRequestIDs
        pfs.pendingPriceRequestIDs.remove(requestId);
    }

    function getPriceFromCacheOrOracle(address token) internal view returns (uint64, uint40) {
        return getPriceFromCacheOrOracle(priceFacadeStorage(), token);
    }

    function getPriceFromCacheOrOracle(PriceFacadeStorage storage pfs, address token) internal view returns (uint64, uint40) {
        LatestCallbackPrice memory cachePrice = pfs.callbackPrices[token];
        (uint256 price, uint8 decimals, uint256 oracleUpdatedAt) = LibChainlinkPrice.getPriceFromChainlink(token);
        // Internally, we use 8 decimals for prices, which means all the prices will be converted to 8-decimal prices. 
        // The maximum available 8-decimal price is  "type(uint64).max".
        // However, if the price returned from chainlink has less than 8 decimals, 
        // its 8-decimal price (i.e: "price * 1e8 / (10 ** decimals)") may be greater than  "type(uint64).max". 
        require(price <= type(uint64).max && price * 1e8 / (10 ** decimals) <= type(uint64).max, "LibPriceFacade: Invalid price");
        uint40 updatedAt = cachePrice.timestamp >= oracleUpdatedAt ? cachePrice.timestamp : uint40(oracleUpdatedAt);
        // Take the newer price
        uint64 tokenPrice = cachePrice.timestamp >= oracleUpdatedAt ? cachePrice.price :
        (decimals == 8 ? uint64(price) : uint64(price * 1e8 / (10 ** decimals)));
        return (tokenPrice, updatedAt);
    }

    function getPendingPrices(uint offset, uint maxCount) internal view returns (PendingPrice[] memory prices, uint total) {
        PriceFacadeStorage storage pfs = priceFacadeStorage();

        // the total number of pending request Price IDs 
        total = pfs.pendingPriceRequestIDs.length();
        if (offset + maxCount > total) {
            maxCount = offset > total ? 0 : total - offset;
        }

        prices = new PendingPrice[](maxCount);
        for (uint i; i < maxCount; i++) {
            prices[i] = pfs.pendingPrices[pfs.pendingPriceRequestIDs.at(offset + i)];
        }
    }
}
