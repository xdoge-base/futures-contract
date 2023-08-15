// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./LibChain.sol";
import "./LibTokenReward.sol";

library LibStakeReward {

    using SafeERC20 for IERC20;

    bytes32 constant STAKE_REWARD_POSITION = keccak256("trademan.stake.reward.storage");

    /* ========== STATE VARIABLES ========== */
    struct StakeRewardStorage {
        IERC20 stakingToken;
        uint256 totalStaked;
        mapping(address => uint256) userStaked;
        mapping(address => uint256) lastBlockNumberCalled;
    }

    /* ========== EVENTS ========== */
    event Stake(address indexed account, uint256 amount);
    event UnStake(address indexed account, uint256 amount);

    function stakeRewardStorage() internal pure returns (StakeRewardStorage storage st) {
        bytes32 position = STAKE_REWARD_POSITION;
        assembly {
            st.slot := position
        }
    }

    function initialize(address _stakingToken) internal {
        StakeRewardStorage storage st = stakeRewardStorage();
        require(address(st.stakingToken) == address(0), "LibStakeReward: Already initialized!");
        st.stakingToken = IERC20(_stakingToken);
    }

    /* ========== VIEWS ========== */
    function totalStaked() internal view returns (uint256) {
        StakeRewardStorage storage st = stakeRewardStorage();
        return st.totalStaked;
    }

    function stakeOf(address _user) internal view returns (uint256) {
        StakeRewardStorage storage st = stakeRewardStorage();
        return st.userStaked[_user];
    }

    /* ========== MUTATIVE FUNCTIONS ========== */
    function checkOncePerBlock(address user) internal {
        StakeRewardStorage storage st = stakeRewardStorage();
        require(st.lastBlockNumberCalled[user] < LibChain.getBlockNumber(), "LibStakeReward: Once per block");
        st.lastBlockNumberCalled[user] = LibChain.getBlockNumber();
    }

    function stake(uint256 _amount) internal {
        require(_amount > 0, 'LibStakeReward: Invalid amount');

        StakeRewardStorage storage st = stakeRewardStorage();
        st.stakingToken.safeTransferFrom(address(msg.sender), address(this), _amount);
        st.userStaked[msg.sender] += _amount;
        st.totalStaked += _amount;
        LibTokenReward.stake(_amount);
        emit Stake(msg.sender, _amount);
    }

    function unStake(uint256 _amount) internal {
        require(_amount > 0, "LibStakeReward: Invalid withdraw amount");

        StakeRewardStorage storage st = stakeRewardStorage();
        require(st.userStaked[msg.sender] >= _amount, "LibStakeReward: Insufficient balance");
        st.userStaked[msg.sender] -= _amount;
        st.totalStaked -= _amount;
        LibTokenReward.unStake(_amount);
        st.stakingToken.safeTransfer(address(msg.sender), _amount);

        emit UnStake(msg.sender, _amount);
    }

    function claimAllReward() internal {
        LibTokenReward.claimTokenReward(msg.sender);
    }
}
