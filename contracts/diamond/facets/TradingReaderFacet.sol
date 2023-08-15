// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IPriceFacade.sol";
import "../interfaces/ITradingCore.sol";
import "../interfaces/ITradingReader.sol";
import "../libraries/LibLimitOrder.sol";
import "../libraries/LibTrading.sol";
import "../libraries/LibTradingCore.sol";

contract TradingReaderFacet is ITradingReader {

    function getMarketInfo(address pairBase) public view override returns (MarketInfo memory) {
        ITradingCore.PairPositionInfo memory ppi = LibTradingCore.tradingCoreStorage().pairPositionInfos[pairBase];
        return MarketInfo(pairBase, ppi.longQty, ppi.shortQty, ppi.lpLongAvgPrice, ppi.lpShortAvgPrice, LibTradingCore.fundingFeeRate(ppi, pairBase));
    }

    function getMarketInfos(address[] calldata pairBases) external view override returns (MarketInfo[] memory) {
        MarketInfo[] memory marketInfos = new MarketInfo[](pairBases.length);
        for (uint i; i < pairBases.length; i++) {
            marketInfos[i] = getMarketInfo(pairBases[i]);
        }
        return marketInfos;
    }

    function getPendingTrade(bytes32 tradeHash) external view override returns (PendingTrade memory) {
        return LibTrading.tradingStorage().pendingTrades[tradeHash];
    }

    /**
     * Enumerate all Pending (Market Order) Trades 
     * @param offset the start offset 
     * @param maxCount  The maximum number of trades returned  
     * @return trades  returned Pending Trades 
     * @return total   the total number of pending Trades in protocol
     */
    function getPendingTrades(uint offset, uint maxCount) external view returns (PendingTrade[] memory trades, uint total) {
        (bytes32[] memory hashes, uint _total) = LibTrading.getPendingTradeHashes(offset, maxCount);

        PendingTrade[] memory _trades = new PendingTrade[](hashes.length);
        for (uint i; i < hashes.length; i++) {
            _trades[i] = LibTrading.tradingStorage().pendingTrades[hashes[i]];
        }

        return (_trades, _total);
    }

    function getPositionByHash(bytes32 tradeHash) public view override returns (Position memory) {
        LibTrading.TradingStorage storage ts = LibTrading.tradingStorage();
        ITrading.OpenTrade memory ot = ts.openTrades[tradeHash];
        int256 fundingFee;
        if (ot.margin > 0) {
            (uint marketPrice,) = IPriceFacade(address(this)).getPriceFromCacheOrOracle(ot.pairBase);
            IVault.MarginToken memory mt = IVault(address(this)).getTokenForTrading(ot.tokenIn);
            fundingFee = LibTrading.calcFundingFee(ot, mt, marketPrice);
        }
        return Position(
            tradeHash, IPairsManager(address(this)).getPairForTrading(ot.pairBase).name, ot.pairBase,
            ot.tokenIn, ot.isLong, ot.margin, ot.qty, ot.entryPrice, ot.stopLoss, ot.takeProfit,
            ot.openFee, ot.executionFee, fundingFee, ot.timestamp, ot.user, ot.longAccFundingFeePerShare
        );
    }

    function getPositions(address user, address pairBase) external view override returns (Position[] memory) {
        bytes32[] memory tradeHashes = LibTrading.tradingStorage().userOpenTradeHashes[user];
        // query all
        if (pairBase == address(0)) {
            Position[] memory positions = new Position[](tradeHashes.length);
            for (uint i; i < tradeHashes.length; i++) {
                positions[i] = getPositionByHash(tradeHashes[i]);
            }
            return positions;
        } else {
            Position[] memory _positions = new Position[](tradeHashes.length);
            uint count;
            for (uint i; i < tradeHashes.length; i++) {
                Position memory p = getPositionByHash(tradeHashes[i]);
                if (p.pairBase == pairBase) {
                    count++;
                }
                _positions[i] = p;
            }
            Position[] memory positions = new Position[](count);
            uint index;
            for (uint i; i < tradeHashes.length; i++) {
                Position memory p = _positions[i];
                if (p.pairBase == pairBase) {
                    positions[index] = p;
                    index++;
                }
            }
            return positions;
        }
    }

    /**
     * Enumerate all Positions (i.e OpenTrade)
     * @param offset the start offset 
     * @param maxCount  The maximum number of Positions returned  
     * @return positions  returned Positions
     * @return total   the total number of open positions in protocol
     */
    function getPositions(uint offset, uint maxCount) external view returns (Position[] memory positions, uint total) {
        (bytes32[] memory tradeHashes, uint _total) = LibTrading.getOpenTradeHashes(offset, maxCount);

        Position[] memory _positions = new Position[](tradeHashes.length);
        for (uint i; i < tradeHashes.length; i++) {
            _positions[i] = getPositionByHash(tradeHashes[i]);
        }

        return (_positions, _total);
    }

    function traderAssets(address[] memory tokens) external view override returns (TraderAsset[] memory) {
        TraderAsset[] memory assets = new TraderAsset[](tokens.length * 3);
        if (tokens.length > 0) {
            for (uint i; i < tokens.length; i++) {
                address token = tokens[i];
                assets[i * 3] = TraderAsset(AssetPurpose.LIMIT, token, LibLimitOrder.limitOrderStorage().limitOrderAmountIns[token]);
                assets[i * 3 + 1] = TraderAsset(AssetPurpose.PENDING, token, LibTrading.tradingStorage().pendingTradeAmountIns[token]);
                assets[i * 3 + 2] = TraderAsset(AssetPurpose.POSITION, token, LibTrading.tradingStorage().openTradeAmountIns[token]);
            }
        }
        return assets;
    }
}
