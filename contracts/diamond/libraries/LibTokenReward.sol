// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/ITokenReward.sol";
import "./LibChain.sol";

library LibTokenReward {

    using SafeERC20 for IERC20;

    bytes32 constant TOKEN_REWARD_POSITION = keccak256("trademan.token.reward.storage");

    /* ========== STATE VARIABLES ========== */
    struct TokenRewardStorage {
        IERC20 rewardToken;
        // Mining start block
        uint256 startBlock;
        // Info of each pool.
        ITokenReward.TokenPoolInfo poolInfo;
        // Info of each user that stakes LP tokens.
        mapping(address => ITokenReward.TokenUserInfo) userInfo;
    }

    event ClaimTokenReward(address indexed user, uint256 reward);
    event AddReserves(address indexed contributor, uint256 amount);

    function tokenRewardStorage() internal pure returns (TokenRewardStorage storage ars) {
        bytes32 position = TOKEN_REWARD_POSITION;
        assembly {
            ars.slot := position
        }
    }

    function initialize(address _rewardsToken, uint256 _tokenPerBlock, uint256 _startBlock) internal {
        TokenRewardStorage storage st = tokenRewardStorage();
        require(address(st.rewardToken) == address(0), "LibTokenReward: Already initialized!");
        st.rewardToken = IERC20(_rewardsToken);
        st.startBlock = _startBlock;
        // staking pool
        st.poolInfo = ITokenReward.TokenPoolInfo({
            totalStaked: 0,
            tokenPerBlock: _tokenPerBlock,
            lastRewardBlock: _startBlock,
            accTokenPerShare: 0,
            totalReward: 0,
            reserves: 0
        });
    }

    /* ========== VIEWS ========== */

    function tokenPoolInfo() internal view returns (ITokenReward.TokenPoolInfo memory poolInfo) {
        TokenRewardStorage storage ars = tokenRewardStorage();
        ITokenReward.TokenPoolInfo storage pool = ars.poolInfo;

        poolInfo.totalStaked = pool.totalStaked;
        poolInfo.tokenPerBlock = pool.tokenPerBlock;
        poolInfo.lastRewardBlock = pool.lastRewardBlock;
        poolInfo.accTokenPerShare = pool.accTokenPerShare;

        uint256 tokenReward;
        if (LibChain.getBlockNumber() > pool.lastRewardBlock && pool.totalStaked != 0) {
            uint256 blockGap = LibChain.getBlockNumber() - pool.lastRewardBlock;
            tokenReward = blockGap * pool.tokenPerBlock;
        }
        poolInfo.totalReward = pool.totalReward + tokenReward;
        poolInfo.reserves = pool.reserves;
    }

    // View function to see pending Tokens on frontend.
    function pendingToken(address _user) internal view returns (uint256) {
        TokenRewardStorage storage st = tokenRewardStorage();
        ITokenReward.TokenPoolInfo storage pool = st.poolInfo;
        ITokenReward.TokenUserInfo storage user = st.userInfo[_user];
        uint256 accTokenPerShare = pool.accTokenPerShare;
        uint256 lpSupply = pool.totalStaked;

        if (LibChain.getBlockNumber() > pool.lastRewardBlock && lpSupply != 0) {
            uint256 blockGap = LibChain.getBlockNumber() - pool.lastRewardBlock;
            uint256 tokenReward = blockGap * pool.tokenPerBlock;
            accTokenPerShare = accTokenPerShare + (tokenReward * 1e12 / lpSupply);
        }
        return user.amount * accTokenPerShare / 1e12 - user.rewardDebt + user.pendingReward;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */
    function stake(uint256 _amount) internal {
        TokenRewardStorage storage st = tokenRewardStorage();
        require(_amount > 0, 'LibTokenReward: Invalid amount');
        require(LibChain.getBlockNumber() >= st.startBlock, "LibTokenReward: Mining not started yet");
        ITokenReward.TokenPoolInfo storage pool = st.poolInfo;
        ITokenReward.TokenUserInfo storage user = st.userInfo[msg.sender];
        updatePool();
        if (user.amount > 0) {
            uint256 pending = user.amount * pool.accTokenPerShare / 1e12 - user.rewardDebt;
            if (pending > 0) {
                user.pendingReward = user.pendingReward + pending;
            }
        }

        pool.totalStaked += _amount;
        user.amount += _amount;
        user.rewardDebt = user.amount * pool.accTokenPerShare / 1e12;
    }

    function unStake(uint256 _amount) internal {
        TokenRewardStorage storage st = tokenRewardStorage();

        ITokenReward.TokenPoolInfo storage pool = st.poolInfo;
        ITokenReward.TokenUserInfo storage user = st.userInfo[msg.sender];

        require(_amount > 0, "LibTokenReward: Invalid withdraw amount");
        require(user.amount >= _amount, "LibTokenReward: Insufficient balance");
        updatePool();
        uint256 pending = user.amount * pool.accTokenPerShare / 1e12 - user.rewardDebt;
        if (pending > 0) {
            user.pendingReward = user.pendingReward + pending;
        }

        user.amount -= _amount;
        pool.totalStaked -= _amount;
        user.rewardDebt = user.amount * pool.accTokenPerShare / 1e12;
    }

    function claimTokenReward(address account) internal {
        TokenRewardStorage storage st = tokenRewardStorage();
        ITokenReward.TokenPoolInfo storage pool = st.poolInfo;
        ITokenReward.TokenUserInfo storage user = st.userInfo[account];

        updatePool();
        uint256 pending = user.amount * pool.accTokenPerShare / 1e12 - user.rewardDebt + user.pendingReward;
        if (pending > 0) {
            user.pendingReward = 0;
            user.rewardDebt = user.amount * pool.accTokenPerShare / 1e12;
            require(pool.reserves >= pending, "LibTokenReward: Token reserves shortage");
            pool.reserves -= pending;
            st.rewardToken.safeTransfer(account, pending);
            emit ClaimTokenReward(account, pending);
        }
    }

    function addReserves(uint256 amount) internal {
        TokenRewardStorage storage ars = tokenRewardStorage();
        ITokenReward.TokenPoolInfo storage pool = ars.poolInfo;
        ars.rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        pool.reserves += amount;
        emit AddReserves(msg.sender, amount);
    }

    function updateTokenPerBlock(uint256 _tokenPerBlock) internal {
        TokenRewardStorage storage st = tokenRewardStorage();
        require(_tokenPerBlock > 0, "LibTokenReward: TokenPerBlock greater than 0");
        updatePool();
        st.poolInfo.tokenPerBlock = _tokenPerBlock;
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool() internal {
        TokenRewardStorage storage st = tokenRewardStorage();
        ITokenReward.TokenPoolInfo storage pool = st.poolInfo;
        if (LibChain.getBlockNumber() <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.totalStaked;
        if (lpSupply == 0) {
            pool.lastRewardBlock = LibChain.getBlockNumber();
            return;
        }
        uint256 blockGap = LibChain.getBlockNumber() - pool.lastRewardBlock;
        uint256 tokenReward = blockGap * pool.tokenPerBlock;
        pool.totalReward = pool.totalReward + tokenReward;
        pool.accTokenPerShare = pool.accTokenPerShare + (tokenReward * 1e12 / lpSupply);
        pool.lastRewardBlock = LibChain.getBlockNumber();
    }
}
