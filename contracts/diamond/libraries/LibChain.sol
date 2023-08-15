// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IArbSys.sol";

library LibChain {

    uint256 public constant ARBITRUM_MAINNET = 42161;
    uint256 public constant ARBITRUM_TESTNET = 421613;
    IArbSys public constant ARBITRUM_SYS = IArbSys(address(100));

    function getBlockHash(uint256 blockNumber) internal view returns (bytes32) {
        if (block.chainid == ARBITRUM_MAINNET || block.chainid == ARBITRUM_TESTNET) {
            return ARBITRUM_SYS.arbBlockHash(blockNumber);
        }

        return blockhash(blockNumber);
    }

    function getBlockNumber() internal view returns (uint256) {
        if (block.chainid == ARBITRUM_MAINNET || block.chainid == ARBITRUM_TESTNET) {
            return ARBITRUM_SYS.arbBlockNumber();
        }

        return block.number;
    }

    function getBlockTimestamp() internal view returns (uint256) {
        return block.timestamp;
    }
}
