// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {ZERO, ONE, UC, uc, into} from "unchecked-counter/src/UC.sol";
import "../interfaces/ITrading.sol";
import "../interfaces/ITradingCore.sol";
import "../interfaces/IVault.sol";

library LibTrading {

    using EnumerableSet for EnumerableSet.Bytes32Set;

    bytes32 constant TRADING_POSITION = keccak256("trademan.trading.storage");

    struct TradingStorage {
        uint256 salt;
        //--------------- pending ---------------
        // tradeHash =>
        mapping(bytes32 => ITrading.PendingTrade) pendingTrades;
        // margin.tokenIn => total amount of all pending trades
        mapping(address => uint256) pendingTradeAmountIns;
        //--------------- open ---------------
        // tradeHash =>
        mapping(bytes32 => ITrading.OpenTrade) openTrades;
        // user => tradeHash[]
        mapping(address => bytes32[]) userOpenTradeHashes;
        // tokenIn =>
        mapping(address => uint256) openTradeAmountIns;
        // tokenIn[]
        address[] openTradeTokenIns;

        //--------------- added for enumeration ---------------
        // We add them at the end of the TradingStorage struct to avoid 
        // storage collisions

        // all pending market orders
        EnumerableSet.Bytes32Set allPendingTradeHashes;
        // all open positions
        EnumerableSet.Bytes32Set allOpenTradeHashes;
    }

    function tradingStorage() internal pure returns (TradingStorage storage ts) {
        bytes32 position = TRADING_POSITION;
        assembly {
            ts.slot := position
        }
    }

    function calcFundingFee(
        ITrading.OpenTrade memory ot,
        IVault.MarginToken memory mt,
        uint256 marketPrice
    ) internal view returns (int256 fundingFee) {
        int256 longAccFundingFeePerShare = ITradingCore(address(this)).lastLongAccFundingFeePerShare(ot.pairBase);
        return calcFundingFee(ot, mt, marketPrice, longAccFundingFeePerShare);
    }

    function calcFundingFee(
        ITrading.OpenTrade memory ot,
        IVault.MarginToken memory mt,
        uint256 marketPrice,
        int256 longAccFundingFeePerShare
    ) internal pure returns (int256 fundingFee) {
        int256 fundingFeeUsd;
        if (ot.isLong) {
            fundingFeeUsd = int256(ot.qty * marketPrice) * (longAccFundingFeePerShare - ot.longAccFundingFeePerShare) / 1e18;
        } else {
            fundingFeeUsd = int256(ot.qty * marketPrice) * (longAccFundingFeePerShare - ot.longAccFundingFeePerShare) * (- 1) / 1e18;
        }
        fundingFee = fundingFeeUsd * int256(10 ** mt.decimals) / int256(1e10 * mt.price);
        return fundingFee;
    }

    function increaseOpenTradeAmount(TradingStorage storage ts, address token, uint256 amount) internal {
        address[] storage tokenIns = ts.openTradeTokenIns;
        bool exists;
        for (UC i = ZERO; i < uc(tokenIns.length); i = i + ONE) {
            if (tokenIns[i.into()] == token) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            tokenIns.push(token);
        }
        ts.openTradeAmountIns[token] += amount;
    }


    function addPendingTradeHash(TradingStorage storage ts, bytes32 tradeHash) internal {
        ts.allPendingTradeHashes.add(tradeHash);
    }

    function removePendingTradeHash(TradingStorage storage ts, bytes32 tradeHash) internal {
        ts.allPendingTradeHashes.remove(tradeHash);
    }

    function addOpenTradeHash(TradingStorage storage ts, bytes32 tradeHash) internal {
        ts.allOpenTradeHashes.add(tradeHash);
    }

    function removeOpenTradeHash(TradingStorage storage ts, bytes32 tradeHash) internal {
        ts.allOpenTradeHashes.remove(tradeHash);
    }

    function hasOpenTrade(TradingStorage storage ts, bytes32 tradeHash) internal view returns (bool) {
        return ts.allOpenTradeHashes.contains(tradeHash);
    }

    function getOpenTradeHashes(uint offset, uint maxCount) internal view returns (bytes32[] memory hashes, uint total) {
        TradingStorage storage s = tradingStorage();

        total = s.allOpenTradeHashes.length();
        if (offset + maxCount > total) {
            maxCount = offset > total ? 0 : total - offset;
        }

        hashes = new bytes32[](maxCount);
        for (uint i; i < maxCount; i++) {
            hashes[i] = s.allOpenTradeHashes.at(offset + i);
        }
    }

    function getPendingTradeHashes(uint offset, uint maxCount) internal view returns (bytes32[] memory hashes, uint total) {
        TradingStorage storage s = tradingStorage();

        total = s.allPendingTradeHashes.length();
        if (offset + maxCount > total) {
            maxCount = offset > total ? 0 : total - offset;
        }

        hashes = new bytes32[](maxCount);
        for (uint i; i < maxCount; i++) {
            hashes[i] = s.allPendingTradeHashes.at(offset + i);
        }
    }
}
