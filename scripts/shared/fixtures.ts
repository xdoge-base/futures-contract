import {ethers, upgrades} from 'hardhat'

async function deployTradeX(diamondCutFacet: string, diamondLoupeFacet: string, init: string) {
    const [deployer] = await ethers.getSigners()

    const TradeX = await ethers.getContractFactory('TradeX', deployer)
    const tradeX = await TradeX.deploy(await deployer.getAddress(), await deployer.getAddress(), diamondCutFacet, diamondLoupeFacet, init)
    console.log(`\tAdmin: ${await deployer.getAddress()}`)
    console.log(`\tDeployer: ${await deployer.getAddress()}`)
    console.log(`\tTradeX: ${await tradeX.getAddress()}`)

    return {
        contract: tradeX,
        diamondCut: []
    }
}

async function deployTradeXLp() {
    const [deployer] = await ethers.getSigners()

    const TradeXLp = await ethers.getContractFactory('TradeXLP', deployer)
    const tradeXLp = await upgrades.deployProxy(TradeXLp, [await deployer.getAddress()])
    await tradeXLp.waitForDeployment()
    console.log(`\tTradeXLp: ${await tradeXLp.getAddress()}`)

    return {
        contract: tradeXLp,
        diamondCut: []
    }
}

async function deployDiamondCutFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.deploy()
    console.log(`\tDiamondCutFacet: ${await diamondCutFacet.getAddress()}`)

    return {
        contract: diamondCutFacet,
        diamondCut: [
            {
                facetAddress: await diamondCutFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    diamondCutFacet.interface.getFunction('diamondCut').selector // ONLY_SELF
                ]
            }
        ]
    }
}

async function deployDiamondLoupeFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet', deployer)
    const diamondLoupeFacet = await DiamondLoupeFacet.deploy()
    console.log(`\tDiamondLoupeFacet: ${await diamondLoupeFacet.getAddress()}`)

    return {
        contract: diamondLoupeFacet,
        diamondCut: [
            {
                facetAddress: await diamondLoupeFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [diamondLoupeFacet.interface.getFunction('facets').selector, diamondLoupeFacet.interface.getFunction('facetFunctionSelectors').selector, diamondLoupeFacet.interface.getFunction('facetAddresses').selector, diamondLoupeFacet.interface.getFunction('facetAddress').selector, diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
            }
        ]
    }
}

async function deployTrademanInit(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const TrademanInit = await ethers.getContractFactory('TrademanInit', deployer)
    const trademanInit = await TrademanInit.deploy()
    console.log(`\tTrademanInit: ${await trademanInit.getAddress()}`)

    return {
        contract: trademanInit,
        diamondCut: []
    }
}

async function deployAccessControlEnumerableFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const AccessControlEnumerableFacet = await ethers.getContractFactory('AccessControlEnumerableFacet', deployer)
    const accessControlEnumerableFacet = await AccessControlEnumerableFacet.deploy()
    console.log(`\tAccessControlEnumerableFacet: ${await accessControlEnumerableFacet.getAddress()}`)

    return {
        contract: accessControlEnumerableFacet,
        diamondCut: [
            {
                facetAddress: await accessControlEnumerableFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    accessControlEnumerableFacet.interface.getFunction('hasRole').selector,
                    accessControlEnumerableFacet.interface.getFunction('getRoleAdmin').selector,
                    accessControlEnumerableFacet.interface.getFunction('grantRole').selector, // DEFAULT_ADMIN_ROLE
                    accessControlEnumerableFacet.interface.getFunction('revokeRole').selector, // DEFAULT_ADMIN_ROLE
                    accessControlEnumerableFacet.interface.getFunction('renounceRole').selector, // ROLE_SELF
                    accessControlEnumerableFacet.interface.getFunction('getRoleMember').selector,
                    accessControlEnumerableFacet.interface.getFunction('getRoleMemberCount').selector
                ]
            }
        ]
    }
}

async function deployTimeLockFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const TimeLockFacet = await ethers.getContractFactory('TimeLockFacet', deployer)
    const timeLockFacet = await TimeLockFacet.deploy()
    console.log(`\tTimeLockFacet: ${await timeLockFacet.getAddress()}`)

    return {
        contract: timeLockFacet,
        diamondCut: [
            {
                facetAddress: await timeLockFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    timeLockFacet.interface.getFunction('queueTransaction').selector, // ADMIN_ROLE|DEPLOYER_ROLE
                    timeLockFacet.interface.getFunction('cancelTransaction').selector, // ADMIN_ROLE
                    timeLockFacet.interface.getFunction('executeTransaction').selector // ADMIN_ROLE
                ]
            }
        ]
    }
}

async function deployPausableFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const PausableFacet = await ethers.getContractFactory('PausableFacet', deployer)
    const pausableFacet = await PausableFacet.deploy()
    console.log(`\tPausableFacet: ${await pausableFacet.getAddress()}`)

    return {
        contract: pausableFacet,
        diamondCut: [
            {
                facetAddress: await pausableFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    pausableFacet.interface.getFunction('paused').selector,
                    pausableFacet.interface.getFunction('pause').selector, // MONITOR_ROLE
                    pausableFacet.interface.getFunction('unpause').selector // MONITOR_ROLE
                ]
            }
        ]
    }
}

async function deployChainlinkPriceFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const ChainlinkPriceFacet = await ethers.getContractFactory('ChainlinkPriceFacet', deployer)
    const chainlinkPriceFacet = await ChainlinkPriceFacet.deploy()
    console.log(`\tChainlinkPriceFacet: ${await chainlinkPriceFacet.getAddress()}`)

    return {
        contract: chainlinkPriceFacet,
        diamondCut: [
            {
                facetAddress: await chainlinkPriceFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    chainlinkPriceFacet.interface.getFunction('addChainlinkPriceFeed').selector, // PRICE_FEED_OPERATOR_ROLE
                    chainlinkPriceFacet.interface.getFunction('removeChainlinkPriceFeed').selector, // PRICE_FEED_OPERATOR_ROLE
                    chainlinkPriceFacet.interface.getFunction('getPriceFromChainlink').selector,
                    chainlinkPriceFacet.interface.getFunction('chainlinkPriceFeeds').selector
                ]
            }
        ]
    }
}

async function deployPriceFacadeFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const PriceFacadeFacet = await ethers.getContractFactory('PriceFacadeFacet', deployer)
    const priceFacadeFacet = await PriceFacadeFacet.deploy()
    console.log(`\tPriceFacadeFacet: ${await priceFacadeFacet.getAddress()}`)

    return {
        contract: priceFacadeFacet,
        diamondCut: [
            {
                facetAddress: await priceFacadeFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    priceFacadeFacet.interface.getFunction('initPriceFacadeFacet').selector, // DEPLOYER_ROLE
                    priceFacadeFacet.interface.getFunction('setLowAndHighPriceGapP').selector, // ADMIN_ROLE
                    priceFacadeFacet.interface.getFunction('setMaxDelay').selector, // ADMIN_ROLE
                    priceFacadeFacet.interface.getFunction('getPriceFacadeConfig').selector,
                    priceFacadeFacet.interface.getFunction('getPrice').selector,
                    priceFacadeFacet.interface.getFunction('getPriceFromCacheOrOracle').selector,
                    priceFacadeFacet.interface.getFunction('requestPrice').selector, // ONLY_SELF
                    priceFacadeFacet.interface.getFunction('requestPriceCallback').selector, // PRICE_FEEDER_ROLE
                    priceFacadeFacet.interface.getFunction('confirmTriggerPrice').selector, // ONLY_SELF
                    priceFacadeFacet.interface.getFunction('getPendingPrices').selector
                ]
            }
        ]
    }
}

async function deployVaultFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const VaultFacet = await ethers.getContractFactory('VaultFacet', deployer)
    const vaultFacet = await VaultFacet.deploy()
    console.log(`\tVaultFacet: ${await vaultFacet.getAddress()}`)

    return {
        contract: vaultFacet,
        diamondCut: [
            {
                facetAddress: await vaultFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    vaultFacet.interface.getFunction('initVaultFacet').selector, // DEPLOYER_ROLE
                    vaultFacet.interface.getFunction('addToken').selector, // TOKEN_OPERATOR_ROLE
                    vaultFacet.interface.getFunction('removeToken').selector, // TOKEN_OPERATOR_ROLE
                    vaultFacet.interface.getFunction('updateToken').selector, // TOKEN_OPERATOR_ROLE
                    vaultFacet.interface.getFunction('updateAsMargin').selector, // TOKEN_OPERATOR_ROLE
                    vaultFacet.interface.getFunction('changeWeight').selector, // TOKEN_OPERATOR_ROLE
                    vaultFacet.interface.getFunction('setSecurityMarginP').selector, // ADMIN_ROLE
                    vaultFacet.interface.getFunction('securityMarginP').selector,
                    vaultFacet.interface.getFunction('tokensV2').selector,
                    vaultFacet.interface.getFunction('getTokenByAddress').selector,
                    vaultFacet.interface.getFunction('getTokenForTrading').selector,
                    vaultFacet.interface.getFunction('itemValue').selector,
                    vaultFacet.interface.getFunction('totalValue').selector,
                    vaultFacet.interface.getFunction('increaseByCloseTrade').selector, // ONLY_SELF
                    vaultFacet.interface.getFunction('decreaseByCloseTrade').selector, // ONLY_SELF
                    vaultFacet.interface.getFunction('maxWithdrawAbleUsd').selector
                ]
            }
        ]
    }
}

async function deployLpManagerFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const LpManagerFacet = await ethers.getContractFactory('LpManagerFacet', deployer)
    const lpManagerFacet = await LpManagerFacet.deploy()
    console.log(`\tLpManagerFacet: ${await lpManagerFacet.getAddress()}`)

    return {
        contract: lpManagerFacet,
        diamondCut: [
            {
                facetAddress: await lpManagerFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    lpManagerFacet.interface.getFunction('initLpManagerFacet').selector, // DEPLOYER_ROLE
                    lpManagerFacet.interface.getFunction('LP').selector,
                    lpManagerFacet.interface.getFunction('coolingDuration').selector,
                    lpManagerFacet.interface.getFunction('setCoolingDuration').selector, // ADMIN_ROLE
                    lpManagerFacet.interface.getFunction('mintLp').selector,
                    lpManagerFacet.interface.getFunction('burnLp').selector,
                    lpManagerFacet.interface.getFunction('lpPrice').selector,
                    lpManagerFacet.interface.getFunction('lastMintedTimestamp').selector
                ]
            }
        ]
    }
}

async function deployFeeManagerFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const FeeManagerFacet = await ethers.getContractFactory('FeeManagerFacet', deployer)
    const feeManagerFacet = await FeeManagerFacet.deploy()
    console.log(`\tFeeManagerFacet: ${await feeManagerFacet.getAddress()}`)

    return {
        contract: feeManagerFacet,
        diamondCut: [
            {
                facetAddress: await feeManagerFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    feeManagerFacet.interface.getFunction('initFeeManagerFacet').selector, // DEPLOYER_ROLE
                    feeManagerFacet.interface.getFunction('addFeeConfig').selector, // PAIR_OPERATOR_ROLE
                    feeManagerFacet.interface.getFunction('removeFeeConfig').selector, // PAIR_OPERATOR_ROLE
                    feeManagerFacet.interface.getFunction('updateFeeConfig').selector, // PAIR_OPERATOR_ROLE
                    feeManagerFacet.interface.getFunction('setDaoRepurchase').selector, // ADMIN_ROLE
                    feeManagerFacet.interface.getFunction('setDaoShareP').selector, // ADMIN_ROLE
                    feeManagerFacet.interface.getFunction('getFeeConfigByIndex').selector,
                    feeManagerFacet.interface.getFunction('getFeeDetails').selector,
                    feeManagerFacet.interface.getFunction('daoConfig').selector,
                    feeManagerFacet.interface.getFunction('chargeOpenFee').selector, // ONLY_SELF
                    feeManagerFacet.interface.getFunction('chargeCloseFee').selector // ONLY_SELF
                ]
            }
        ]
    }
}

async function deployBrokerManagerFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const BrokerManagerFacet = await ethers.getContractFactory('BrokerManagerFacet', deployer)
    const brokerManagerFacet = await BrokerManagerFacet.deploy()
    console.log(`\tBrokerManagerFacet: ${await brokerManagerFacet.getAddress()}`)

    return {
        contract: brokerManagerFacet,
        diamondCut: [
            {
                facetAddress: await brokerManagerFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    brokerManagerFacet.interface.getFunction('initBrokerManagerFacet').selector, // DEPLOYER_ROLE
                    brokerManagerFacet.interface.getFunction('addBroker').selector, // ADMIN_ROLE
                    brokerManagerFacet.interface.getFunction('removeBroker').selector, // ADMIN_ROLE
                    brokerManagerFacet.interface.getFunction('updateBrokerCommissionP').selector, // ADMIN_ROLE
                    brokerManagerFacet.interface.getFunction('updateBrokerReceiver').selector, // ADMIN_ROLE
                    brokerManagerFacet.interface.getFunction('updateBrokerName').selector, // ADMIN_ROLE
                    brokerManagerFacet.interface.getFunction('updateBrokerUrl').selector, // ADMIN_ROLE
                    brokerManagerFacet.interface.getFunction('getBrokerById').selector,
                    brokerManagerFacet.interface.getFunction('brokers').selector,
                    brokerManagerFacet.interface.getFunction('withdrawCommission').selector
                ]
            }
        ]
    }
}

async function deployPairsManagerFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const PairsManagerFacet = await ethers.getContractFactory('PairsManagerFacet', deployer)
    const pairsManagerFacet = await PairsManagerFacet.deploy()
    console.log(`\tPairsManagerFacet: ${await pairsManagerFacet.getAddress()}`)

    return {
        contract: pairsManagerFacet,
        diamondCut: [
            {
                facetAddress: await pairsManagerFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    pairsManagerFacet.interface.getFunction('addSlippageConfig').selector, // PAIR_OPERATOR_ROLE
                    pairsManagerFacet.interface.getFunction('removeSlippageConfig').selector, // PAIR_OPERATOR_ROLE
                    pairsManagerFacet.interface.getFunction('updateSlippageConfig').selector, // PAIR_OPERATOR_ROLE
                    pairsManagerFacet.interface.getFunction('getSlippageConfigByIndex').selector,
                    pairsManagerFacet.interface.getFunction('addPair').selector, // PAIR_OPERATOR_ROLE
                    pairsManagerFacet.interface.getFunction('updatePairMaxOi').selector, // MONITOR_ROLE
                    pairsManagerFacet.interface.getFunction('updatePairFundingFeeConfig').selector, // PAIR_OPERATOR_ROLE
                    pairsManagerFacet.interface.getFunction('removePair').selector, // PAIR_OPERATOR_ROLE
                    pairsManagerFacet.interface.getFunction('updatePairStatus').selector, // MONITOR_ROLE
                    pairsManagerFacet.interface.getFunction('batchUpdatePairStatus').selector, // MONITOR_ROLE
                    pairsManagerFacet.interface.getFunction('updatePairSlippage').selector, // PAIR_OPERATOR_ROLE
                    pairsManagerFacet.interface.getFunction('updatePairFee').selector, // PAIR_OPERATOR_ROLE
                    pairsManagerFacet.interface.getFunction('updatePairLeverageMargin').selector, // PAIR_OPERATOR_ROLE
                    pairsManagerFacet.interface.getFunction('pairs').selector,
                    pairsManagerFacet.interface.getFunction('getPairByBase').selector,
                    pairsManagerFacet.interface.getFunction('getPairForTrading').selector,
                    pairsManagerFacet.interface.getFunction('getPairConfig').selector,
                    pairsManagerFacet.interface.getFunction('getPairFeeConfig').selector,
                    pairsManagerFacet.interface.getFunction('getPairSlippageConfig').selector
                ]
            }
        ]
    }
}

async function deployTradingCheckerFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const TradingCheckerFacet = await ethers.getContractFactory('TradingCheckerFacet', deployer)
    const tradingCheckerFacet = await TradingCheckerFacet.deploy()
    console.log(`\tTradingCheckerFacet: ${await tradingCheckerFacet.getAddress()}`)

    return {
        contract: tradingCheckerFacet,
        diamondCut: [
            {
                facetAddress: await tradingCheckerFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    tradingCheckerFacet.interface.getFunction('checkTp').selector,
                    tradingCheckerFacet.interface.getFunction('checkSl').selector,
                    tradingCheckerFacet.interface.getFunction('checkLimitOrderTp').selector,
                    tradingCheckerFacet.interface.getFunction('openLimitOrderCheck').selector,
                    tradingCheckerFacet.interface.getFunction('executeLimitOrderCheck').selector,
                    tradingCheckerFacet.interface.getFunction('checkMarketTradeTp').selector,
                    tradingCheckerFacet.interface.getFunction('openMarketTradeCheck').selector,
                    tradingCheckerFacet.interface.getFunction('marketTradeCallbackCheck').selector,
                    tradingCheckerFacet.interface.getFunction('executeLiquidateCheck').selector
                ]
            }
        ]
    }
}

async function deployTradingConfigFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const TradingConfigFacet = await ethers.getContractFactory('TradingConfigFacet', deployer)
    const tradingConfigFacet = await TradingConfigFacet.deploy()
    console.log(`\tTradingConfigFacet: ${await tradingConfigFacet.getAddress()}`)

    return {
        contract: tradingConfigFacet,
        diamondCut: [
            {
                facetAddress: await tradingConfigFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    tradingConfigFacet.interface.getFunction('initTradingConfigFacet').selector, // DEPLOYER_ROLE
                    tradingConfigFacet.interface.getFunction('getTradingConfig').selector,
                    tradingConfigFacet.interface.getFunction('setTradingSwitches').selector, // MONITOR_ROLE
                    tradingConfigFacet.interface.getFunction('setExecutionFeeUsd').selector, // ADMIN_ROLE
                    tradingConfigFacet.interface.getFunction('setMinNotionalUsd').selector, // ADMIN_ROLE
                    tradingConfigFacet.interface.getFunction('setMaxTakeProfitP').selector // ADMIN_ROLE
                ]
            }
        ]
    }
}

async function deployTradingCoreFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const TradingCoreFacet = await ethers.getContractFactory('TradingCoreFacet', deployer)
    const tradingCoreFacet = await TradingCoreFacet.deploy()
    console.log(`\tTradingCoreFacet: ${await tradingCoreFacet.getAddress()}`)

    return {
        contract: tradingCoreFacet,
        diamondCut: [
            {
                facetAddress: await tradingCoreFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    tradingCoreFacet.interface.getFunction('getPairQty').selector,
                    tradingCoreFacet.interface.getFunction('slippagePrice(address,uint256,uint256,bool)').selector,
                    tradingCoreFacet.interface.getFunction('slippagePrice((uint256,uint256),(uint256,uint256,uint16,uint16,uint8),uint256,uint256,bool)').selector,
                    tradingCoreFacet.interface.getFunction('triggerPrice(address,uint256,uint256,bool)').selector,
                    tradingCoreFacet.interface.getFunction('triggerPrice((uint256,uint256),(uint256,uint256,uint16,uint16,uint8),uint256,uint256,bool)').selector,
                    tradingCoreFacet.interface.getFunction('lastLongAccFundingFeePerShare').selector,
                    tradingCoreFacet.interface.getFunction('updatePairPositionInfo').selector, // ONLY_SELF
                    tradingCoreFacet.interface.getFunction('lpUnrealizedPnlUsd()').selector,
                    tradingCoreFacet.interface.getFunction('lpUnrealizedPnlUsd(address)').selector,
                    tradingCoreFacet.interface.getFunction('lpNotionalUsd').selector
                ]
            }
        ]
    }
}

async function deployOrderAndTradeHistoryFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const OrderAndTradeHistoryFacet = await ethers.getContractFactory('OrderAndTradeHistoryFacet', deployer)
    const orderAndTradeHistoryFacet = await OrderAndTradeHistoryFacet.deploy()
    console.log(`\tOrderAndTradeHistoryFacet: ${await orderAndTradeHistoryFacet.getAddress()}`)

    return {
        contract: orderAndTradeHistoryFacet,
        diamondCut: [
            {
                facetAddress: await orderAndTradeHistoryFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    orderAndTradeHistoryFacet.interface.getFunction('createLimitOrder').selector, // ONLY_SELF
                    orderAndTradeHistoryFacet.interface.getFunction('cancelLimitOrder').selector, // ONLY_SELF
                    orderAndTradeHistoryFacet.interface.getFunction('limitTrade').selector, // ONLY_SELF
                    orderAndTradeHistoryFacet.interface.getFunction('marketTrade').selector, // ONLY_SELF
                    orderAndTradeHistoryFacet.interface.getFunction('closeTrade').selector, // ONLY_SELF
                    orderAndTradeHistoryFacet.interface.getFunction('updateMargin').selector, // ONLY_SELF
                    orderAndTradeHistoryFacet.interface.getFunction('getOrderAndTradeHistory').selector
                ]
            }
        ]
    }
}

async function deployTradingPortalFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const TradingPortalFacet = await ethers.getContractFactory('TradingPortalFacet', deployer)
    const tradingPortalFacet = await TradingPortalFacet.deploy()
    console.log(`\tTradingPortalFacet: ${await tradingPortalFacet.getAddress()}`)

    return {
        contract: tradingPortalFacet,
        diamondCut: [
            {
                facetAddress: await tradingPortalFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    tradingPortalFacet.interface.getFunction('openMarketTrade').selector,
                    tradingPortalFacet.interface.getFunction('updateTradeTp').selector,
                    tradingPortalFacet.interface.getFunction('updateTradeSl').selector,
                    tradingPortalFacet.interface.getFunction('updateTradeTpAndSl').selector,
                    tradingPortalFacet.interface.getFunction('settleLpFundingFee').selector, // ONLY_SELF
                    tradingPortalFacet.interface.getFunction('closeTrade').selector,
                    tradingPortalFacet.interface.getFunction('addMargin').selector
                ]
            }
        ]
    }
}

async function deployTradingOpenFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const TradingOpenFacet = await ethers.getContractFactory('TradingOpenFacet', deployer)
    const tradingOpenFacet = await TradingOpenFacet.deploy()
    console.log(`\tTradingOpenFacet: ${await tradingOpenFacet.getAddress()}`)

    return {
        contract: tradingOpenFacet,
        diamondCut: [
            {
                facetAddress: await tradingOpenFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    tradingOpenFacet.interface.getFunction('limitOrderDeal').selector, // ONLY_SELF
                    tradingOpenFacet.interface.getFunction('marketTradeCallback').selector // ONLY_SELF
                ]
            }
        ]
    }
}

async function deployTradingCloseFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const TradingCloseFacet = await ethers.getContractFactory('TradingCloseFacet', deployer)
    const tradingCloseFacet = await TradingCloseFacet.deploy()
    console.log(`\tTradingCloseFacet: ${await tradingCloseFacet.getAddress()}`)

    return {
        contract: tradingCloseFacet,
        diamondCut: [
            {
                facetAddress: await tradingCloseFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    tradingCloseFacet.interface.getFunction('closeTradeCallback').selector, // ONLY_SELF
                    tradingCloseFacet.interface.getFunction('executeTpSlOrLiq').selector // KEEPER_ROLE
                ]
            }
        ]
    }
}

async function deployLimitOrderFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const LimitOrderFacet = await ethers.getContractFactory('LimitOrderFacet', deployer)
    const limitOrderFacet = await LimitOrderFacet.deploy()
    console.log(`\tLimitOrderFacet: ${await limitOrderFacet.getAddress()}`)

    return {
        contract: limitOrderFacet,
        diamondCut: [
            {
                facetAddress: await limitOrderFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    limitOrderFacet.interface.getFunction('openLimitOrder').selector,
                    limitOrderFacet.interface.getFunction('updateOrderTp').selector,
                    limitOrderFacet.interface.getFunction('updateOrderSl').selector,
                    limitOrderFacet.interface.getFunction('updateOrderTpAndSl').selector,
                    limitOrderFacet.interface.getFunction('executeLimitOrder').selector, // KEEPER_ROLE
                    limitOrderFacet.interface.getFunction('cancelLimitOrder').selector,
                    limitOrderFacet.interface.getFunction('getLimitOrderByHash').selector,
                    limitOrderFacet.interface.getFunction('getLimitOrders(address,address)').selector,
                    limitOrderFacet.interface.getFunction('getLimitOrders(uint256,uint256)').selector
                ]
            }
        ]
    }
}

async function deployTradingReaderFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const TradingReaderFacet = await ethers.getContractFactory('TradingReaderFacet', deployer)
    const tradingReaderFacet = await TradingReaderFacet.deploy()
    console.log(`\tTradingReaderFacet: ${await tradingReaderFacet.getAddress()}`)

    return {
        contract: tradingReaderFacet,
        diamondCut: [
            {
                facetAddress: await tradingReaderFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    tradingReaderFacet.interface.getFunction('getMarketInfo').selector,
                    tradingReaderFacet.interface.getFunction('getMarketInfos').selector,
                    tradingReaderFacet.interface.getFunction('getPendingTrade').selector,
                    tradingReaderFacet.interface.getFunction('getPendingTrades').selector,
                    tradingReaderFacet.interface.getFunction('getPositionByHash').selector,
                    tradingReaderFacet.interface.getFunction('getPositions(address,address)').selector,
                    tradingReaderFacet.interface.getFunction('getPositions(uint256,uint256)').selector,
                    tradingReaderFacet.interface.getFunction('traderAssets').selector
                ]
            }
        ]
    }
}

async function deployMockDiamondCutFacet(facetCutAction: number = 0) {
    const [deployer] = await ethers.getSigners()

    const MockDiamondCutFacet = await ethers.getContractFactory('MockDiamondCutFacet', deployer)
    const mockDiamondCutFacet = await MockDiamondCutFacet.deploy()
    console.log(`\tMockDiamondCutFacet: ${await mockDiamondCutFacet.getAddress()}`)

    return {
        contract: mockDiamondCutFacet,
        diamondCut: [
            {
                facetAddress: await mockDiamondCutFacet.getAddress(),
                action: facetCutAction,
                functionSelectors: [
                    mockDiamondCutFacet.interface.getFunction('diamondCut').selector // DEPLOYER_ROLE
                ]
            }
        ]
    }
}

async function deployMockTrademanAggregator(decimals: number, description: string, version: number, answer: number) {
    const [deployer] = await ethers.getSigners()
    const MockTrademanAggregator = await ethers.getContractFactory('MockTrademanAggregator', deployer)
    const mockTrademanAggregator = await MockTrademanAggregator.deploy(decimals, description, version, answer)
    console.log(`\tMockTrademanAggregator: ${await mockTrademanAggregator.getAddress()}`)

    return {
        contract: mockTrademanAggregator,
        diamondCut: []
    }
}

async function deployMockTrademanERC20(name: string, symbol: string) {
    const [deployer] = await ethers.getSigners()

    const MockTrademanERC20 = await ethers.getContractFactory('MockTrademanERC20', deployer)
    const mockTrademanERC20 = await MockTrademanERC20.deploy(name, symbol)
    console.log(`\tMockTrademanERC20: ${await mockTrademanERC20.getAddress()}`)

    return {
        contract: mockTrademanERC20,
        diamondCut: []
    }
}

async function deployMockTrademanWETH9() {
    const [deployer] = await ethers.getSigners()

    const MockTrademanWETH9 = await ethers.getContractFactory('MockTrademanWETH9', deployer)
    const mockTrademanWETH9 = await MockTrademanWETH9.deploy()
    console.log(`\tMockTrademanWETH9: ${await mockTrademanWETH9.getAddress()}`)

    return {
        contract: mockTrademanWETH9,
        diamondCut: []
    }
}

export default {
    deployTradeX,
    deployTradeXLp,
    deployDiamondCutFacet,
    deployDiamondLoupeFacet,
    deployTrademanInit,
    deployAccessControlEnumerableFacet,
    deployTimeLockFacet,
    deployPausableFacet,
    deployChainlinkPriceFacet,
    deployPriceFacadeFacet,
    deployVaultFacet,
    deployLpManagerFacet,
    deployFeeManagerFacet,
    deployBrokerManagerFacet,
    deployPairsManagerFacet,
    deployTradingCheckerFacet,
    deployTradingConfigFacet,
    deployTradingCoreFacet,
    deployTradingPortalFacet,
    deployTradingOpenFacet,
    deployTradingCloseFacet,
    deployLimitOrderFacet,
    deployOrderAndTradeHistoryFacet,
    deployTradingReaderFacet,
    deployMockDiamondCutFacet,
    deployMockTrademanAggregator,
    deployMockTrademanERC20,
    deployMockTrademanWETH9
}
