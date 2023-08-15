// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../utils/Constants.sol";
import "../interfaces/ITokenReward.sol";
import "../libraries/LibAccessControlEnumerable.sol";
import "../libraries/LibTokenReward.sol";

// calculate token award
contract TokenRewardFacet is ITokenReward {

    function initializeTokenRewardFacet(address _rewardsToken, uint256 _tokenPerBlock, uint256 _startBlock) external {
        require(_rewardsToken != address(0), "TokenRewardFacet: Invalid rewardsToken");
        require(_tokenPerBlock > 0, "TokenRewardFacet: TokenPerBlock greater than 0");

        LibAccessControlEnumerable.checkRole(Constants.DEPLOYER_ROLE);
        LibTokenReward.initialize(_rewardsToken, _tokenPerBlock, _startBlock);
    }

    function updateTokenPerBlock(uint256 _tokenPerBlock) external override {
        LibAccessControlEnumerable.checkRole(Constants.STAKE_OPERATOR_ROLE);
        LibTokenReward.updateTokenPerBlock(_tokenPerBlock);
    }

    function addReserves(uint256 amount) external override {
        require(amount > 0, "TokenRewardFacet: Amount must be greater than 0");
        LibTokenReward.addReserves(amount);
    }

    function tokenPoolInfo() external view returns (TokenPoolInfo memory) {
        return LibTokenReward.tokenPoolInfo();
    }

    function pendingToken(address _account) external view override returns (uint256) {
        return LibTokenReward.pendingToken(_account);
    }
}
