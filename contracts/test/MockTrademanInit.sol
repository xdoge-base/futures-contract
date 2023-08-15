// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockTrademanInit {

    function init() external view {
        require(address(0x0) == msg.sender, "MockTrademanInit: Can only init roles for 0x0");
    }
}
