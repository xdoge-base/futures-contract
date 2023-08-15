// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/Address.sol";
import "../security/Pausable.sol";
import "../security/ReentrancyGuard.sol";
import "../interfaces/ILp.sol";
import "../interfaces/ILpManager.sol";
import "../libraries/LibAccessControlEnumerable.sol";
import "../libraries/LibLpManager.sol";
import "../libraries/LibStakeReward.sol";
import "../libraries/LibVault.sol";

contract LpManagerFacet is ReentrancyGuard, Pausable, ILpManager {

    using Address for address;

    function initLpManagerFacet(address lpToken) external {
        LibAccessControlEnumerable.checkRole(Constants.DEPLOYER_ROLE);
        require(lpToken != address(0), "LpManagerFacet: Invalid lpToken");
        LibLpManager.initialize(lpToken);
    }

    function LP() public view override returns (address) {
        return LibLpManager.lpManagerStorage().lp;
    }

    function coolingDuration() external view override returns (uint256) {
        return LibLpManager.lpManagerStorage().coolingDuration;
    }

    function setCoolingDuration(uint256 coolingDuration_) external override {
        LibAccessControlEnumerable.checkRole(Constants.ADMIN_ROLE);
        LibLpManager.LpManagerStorage storage ams = LibLpManager.lpManagerStorage();
        ams.coolingDuration = coolingDuration_;
    }

    function mintLp(address tokenIn, uint256 amount, uint256 minLp, bool stake) external whenNotPaused nonReentrant override {
        require(amount > 0, "LpManagerFacet: Invalid amount");
        address account = msg.sender;
        uint256 lpAmount = LibLpManager.mintLp(account, tokenIn, amount);
        require(lpAmount >= minLp, "LpManagerFacet: Insufficient LP output");
        _mint(account, tokenIn, amount, lpAmount, stake);
    }

    function mintLpETH(uint256 minLp, bool stake) external payable whenNotPaused nonReentrant override {
        uint amount = msg.value;
        require(amount > 0, "LpManagerFacet: Invalid msg.value");
        address account = msg.sender;
        uint256 lpAmount = LibLpManager.mintLpETH(account, amount);
        require(lpAmount >= minLp, "LpManagerFacet: Insufficient LP output");
        _mint(account, LibVault.WETH(), amount, lpAmount, stake);
    }

    function _mint(address account, address tokenIn, uint256 amount, uint256 lpAmount, bool stake) private {
        ILp(LP()).mint(account, lpAmount);
        emit MintLp(account, tokenIn, amount, lpAmount);
        if (stake) {
            LibStakeReward.stake(lpAmount);
        }
    }

    function burnLp(address tokenOut, uint256 lpAmount, uint256 minOut, address receiver) external whenNotPaused nonReentrant override {
        require(lpAmount > 0, "LpManagerFacet: Invalid lpAmount");
        address account = msg.sender;
        uint256 amountOut = LibLpManager.burnLp(account, tokenOut, lpAmount, receiver);
        require(amountOut >= minOut, "LpManagerFacet: Insufficient token output");
        ILp(LP()).burnFrom(account, lpAmount);
        emit BurnLp(account, receiver, tokenOut, lpAmount, amountOut);
    }

    function burnLpETH(uint256 lpAmount, uint256 minOut, address payable receiver) external whenNotPaused nonReentrant override {
        require(lpAmount > 0, "LpManagerFacet: Invalid lpAmount");
        address account = msg.sender;
        uint256 amountOut = LibLpManager.burnLpETH(account, lpAmount, receiver);
        require(amountOut >= minOut, "LpManagerFacet: Insufficient ETH output");
        ILp(LP()).burnFrom(account, lpAmount);
        emit BurnLp(account, receiver, LibVault.WETH(), lpAmount, amountOut);
    }

    function lpPrice() external view override returns (uint256){
        return LibLpManager.lpPrice();
    }

    function lastMintedTimestamp(address account) external view override returns (uint256) {
        return LibLpManager.lpManagerStorage().lastMintedAt[account];
    }
}
