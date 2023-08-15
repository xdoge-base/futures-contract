// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ILpManager {

    event MintLp(address indexed account, address indexed tokenIn, uint256 amountIn, uint256 lpOut);
    event BurnLp(address indexed account, address indexed receiver, address indexed tokenOut, uint256 lpAmount, uint256 amountOut);
    event MintFee(
        address indexed account, address indexed tokenIn, uint256 amountIn,
        uint256 tokenInPrice, uint256 mintFeeUsd, uint256 lpAmount
    );
    event BurnFee(
        address indexed account, address indexed tokenOut, uint256 amountOut,
        uint256 tokenOutPrice, uint256 burnFeeUsd, uint256 lpAmount
    );

    function LP() external view returns (address);

    function coolingDuration() external view returns (uint256);

    function setCoolingDuration(uint256 coolingDuration_) external;

    function mintLp(address tokenIn, uint256 amount, uint256 minLp, bool stake) external;

    function mintLpETH(uint256 minLp, bool stake) external payable;

    function burnLp(address tokenOut, uint256 lpAmount, uint256 minOut, address receiver) external;

    function burnLpETH(uint256 lpAmount, uint256 minOut, address payable receiver) external;

    function lpPrice() external view returns (uint256);

    function lastMintedTimestamp(address account) external view returns (uint256);
}
