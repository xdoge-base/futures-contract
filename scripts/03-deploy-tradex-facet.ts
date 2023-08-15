import {ethers, network} from 'hardhat'
import {AccessControlEnumerableFacet, BrokerManagerFacet, ChainlinkPriceFacet, FeeManagerFacet, LpManagerFacet, PairsManagerFacet, PriceFacadeFacet, TradingConfigFacet, VaultFacet} from '@tc/contracts/diamond/facets'
import fixtures from './shared/fixtures'
import networks from './config/networks'

async function main() {
    console.log(`[01/30] Deploy AccessControlEnumerableFacet contract...`)
    const accessControlEnumerableFacet = await fixtures.deployAccessControlEnumerableFacet()

    console.log(`[02/30] Deploy TimeLockFacet contract...`)
    const timeLockFacet = await fixtures.deployTimeLockFacet()

    console.log(`[03/30] Deploy PausableFacet contract...`)
    const pausableFacet = await fixtures.deployPausableFacet()

    console.log(`[04/30] Deploy ChainlinkPriceFacet contract...`)
    const chainlinkPriceFacet = await fixtures.deployChainlinkPriceFacet()

    console.log(`[05/30] Deploy PriceFacadeFacet contract...`)
    const priceFacadeFacet = await fixtures.deployPriceFacadeFacet()

    console.log(`[06/30] Deploy VaultFacet contract...`)
    const vaultFacet = await fixtures.deployVaultFacet()

    console.log(`[07/30] Deploy LpManagerFacet contract...`)
    const lpManagerFacet = await fixtures.deployLpManagerFacet()

    console.log(`[08/30] Deploy FeeManagerFacet contract...`)
    const feeManagerFacet = await fixtures.deployFeeManagerFacet()

    console.log(`[09/30] Deploy BrokerManagerFacet contract...`)
    const brokerManagerFacet = await fixtures.deployBrokerManagerFacet()

    console.log(`[10/30] Deploy PairsManagerFacet contract...`)
    const pairsManagerFacet = await fixtures.deployPairsManagerFacet()

    console.log(`[11/30] Deploy TradingCheckerFacet contract...`)
    const tradingCheckerFacet = await fixtures.deployTradingCheckerFacet()

    console.log(`[12/30] Deploy TradingConfigFacet contract...`)
    const tradingConfigFacet = await fixtures.deployTradingConfigFacet()

    console.log(`[13/30] Deploy TradingCoreFacet contract...`)
    const tradingCoreFacet = await fixtures.deployTradingCoreFacet()

    console.log(`[14/30] Deploy TradingPortalFacet contract...`)
    const tradingPortalFacet = await fixtures.deployTradingPortalFacet()

    console.log(`[15/30] Deploy OrderAndTradeHistoryFacet contract...`)
    const orderAndTradeHistoryFacet = await fixtures.deployOrderAndTradeHistoryFacet()

    console.log(`[16/30] Deploy TradingOpenFacet contract...`)
    const tradingOpenFacet = await fixtures.deployTradingOpenFacet()

    console.log(`[17/30] Deploy TradingCloseFacet contract...`)
    const tradingCloseFacet = await fixtures.deployTradingCloseFacet()

    console.log(`[18/30] Deploy LimitOrderFacet contract...`)
    const limitOrderFacet = await fixtures.deployLimitOrderFacet()

    console.log(`[19/30] Deploy TradingReaderFacet contract...`)
    const tradingReaderFacet = await fixtures.deployTradingReaderFacet()

    console.log(`[20/30] Add diamond cut..`)
    const [deployer] = await ethers.getSigners()
    const diamondCut = accessControlEnumerableFacet.diamondCut
        .concat(timeLockFacet.diamondCut)
        .concat(pausableFacet.diamondCut)
        .concat(chainlinkPriceFacet.diamondCut)
        .concat(priceFacadeFacet.diamondCut)
        .concat(vaultFacet.diamondCut)
        .concat(lpManagerFacet.diamondCut)
        .concat(feeManagerFacet.diamondCut)
        .concat(brokerManagerFacet.diamondCut)
        .concat(pairsManagerFacet.diamondCut)
        .concat(tradingCheckerFacet.diamondCut)
        .concat(tradingConfigFacet.diamondCut)
        .concat(tradingCoreFacet.diamondCut)
        .concat(tradingPortalFacet.diamondCut)
        .concat(orderAndTradeHistoryFacet.diamondCut)
        .concat(tradingOpenFacet.diamondCut)
        .concat(tradingCloseFacet.diamondCut)
        .concat(limitOrderFacet.diamondCut)
        .concat(tradingReaderFacet.diamondCut)
    const MockDiamondCutFacet = await ethers.getContractFactory('MockDiamondCutFacet', deployer)
    // @ts-ignore
    await (MockDiamondCutFacet.attach(process.env.TRADEX) as MockDiamondCutFacet).diamondCut(diamondCut, ethers.ZeroAddress, '0x')

    // @ts-ignore
    const config = network.name && networks[network.name] ? networks[network.name] : networks.goerli
    const DEFAULT_ADMIN_ROLE = ethers.ZeroHash
    const ADMIN_ROLE = ethers.id('ADMIN_ROLE')
    const TOKEN_OPERATOR_ROLE = ethers.id('TOKEN_OPERATOR_ROLE')
    const STAKE_OPERATOR_ROLE = ethers.id('STAKE_OPERATOR_ROLE')
    const PRICE_FEED_OPERATOR_ROLE = ethers.id('PRICE_FEED_OPERATOR_ROLE')
    const PAIR_OPERATOR_ROLE = ethers.id('PAIR_OPERATOR_ROLE')
    const KEEPER_ROLE = ethers.id('KEEPER_ROLE')
    const PRICE_FEEDER_ROLE = ethers.id('PRICE_FEEDER_ROLE')
    const MONITOR_ROLE = ethers.id('MONITOR_ROLE')

    console.log(`[21/30] Grant role...`)
    const trademanAccessControlEnumerableFacet = (await accessControlEnumerableFacet.contract
        // @ts-ignore
        .attach(process.env.TRADEX)) as AccessControlEnumerableFacet
    // @ts-ignore
    await trademanAccessControlEnumerableFacet.grantRole(DEFAULT_ADMIN_ROLE, process.env.DEFAULT_ADMIN)
    // @ts-ignore
    await trademanAccessControlEnumerableFacet.grantRole(ADMIN_ROLE, process.env.ADMIN)
    await trademanAccessControlEnumerableFacet.grantRole(ADMIN_ROLE, deployer.address)
    // @ts-ignore
    await trademanAccessControlEnumerableFacet.grantRole(TOKEN_OPERATOR_ROLE, process.env.TOKEN_OPERATOR)
    await trademanAccessControlEnumerableFacet.grantRole(TOKEN_OPERATOR_ROLE, deployer.address)
    // @ts-ignore
    await trademanAccessControlEnumerableFacet.grantRole(PRICE_FEED_OPERATOR_ROLE, process.env.PRICE_FEED_OPERATOR)
    await trademanAccessControlEnumerableFacet.grantRole(PRICE_FEED_OPERATOR_ROLE, deployer.address)
    // @ts-ignore
    await trademanAccessControlEnumerableFacet.grantRole(PAIR_OPERATOR_ROLE, process.env.PAIR_OPERATOR)
    await trademanAccessControlEnumerableFacet.grantRole(PAIR_OPERATOR_ROLE, deployer.address)
    // @ts-ignore
    for (const keeper of process.env.KEEPERS.split(',')) {
        await trademanAccessControlEnumerableFacet.grantRole(KEEPER_ROLE, keeper)
    }
    // @ts-ignore
    for (const feeder of process.env.PRICE_FEEDERS.split(',')) {
        await trademanAccessControlEnumerableFacet.grantRole(PRICE_FEEDER_ROLE, feeder)
    }
    // @ts-ignore
    for (const monitor of process.env.MONITORS.split(',')) {
        await trademanAccessControlEnumerableFacet.grantRole(MONITOR_ROLE, monitor)
    }

    console.log(`[22/30] Add chainlink price feed...`)
    const trademanChainlinkPriceFacet = (await chainlinkPriceFacet.contract
        // @ts-ignore
        .attach(process.env.TRADEX)) as ChainlinkPriceFacet
    for (const data of config.chainlink) {
        await trademanChainlinkPriceFacet.addChainlinkPriceFeed(data.token, data.feed)
    }

    console.log(`[23/30] Init price facade facet...`)
    const trademanPriceFacadeFacet = (await priceFacadeFacet.contract
        // @ts-ignore
        .attach(process.env.TRADEX)) as PriceFacadeFacet
    await trademanPriceFacadeFacet.initPriceFacadeFacet(config.price.lowPriceGapP, config.price.highPriceGapP, config.price.maxPriceDelay)

    console.log(`[24/30] Init vault facet and add token...`)
    const trademanVaultFacet = (await vaultFacet.contract
        // @ts-ignore
        .attach(process.env.TRADEX)) as VaultFacet
    await trademanVaultFacet.initVaultFacet(config.token.weth)
    for (const data of config.vault.margin) {
        await trademanVaultFacet.addToken(data.tokenAddress, data.feeBasisPoints, data.taxBasisPoints, data.stable, data.dynamicFee, data.asMargin, data.weights)
    }
    await trademanVaultFacet.setSecurityMarginP(config.vault.securityMarginP)

    console.log(`[25/30] Init lp manager facet...`)
    const trademanLpManagerFacet = (await lpManagerFacet.contract
        // @ts-ignore
        .attach(process.env.TRADEX)) as LpManagerFacet
    // @ts-ignore
    await trademanLpManagerFacet.initLpManagerFacet(process.env.TRADEX_LP)
    await trademanLpManagerFacet.setCoolingDuration(config.lp.coolingDuration)

    console.log(`[26/30] Init fee manager facet...`)
    const trademanFeeManagerFacet = (await feeManagerFacet.contract
        // @ts-ignore
        .attach(process.env.TRADEX)) as FeeManagerFacet
    // @ts-ignore
    await trademanFeeManagerFacet.initFeeManagerFacet(process.env.TRADEMAN_DAO_REPURCHASE, config.fee.daoShareP)

    console.log(`[27/30] Init broker manager facet...`)
    const trademanBrokerManagerFacet = (await brokerManagerFacet.contract
        // @ts-ignore
        .attach(process.env.TRADEX)) as BrokerManagerFacet
    for (const data of config.broker) {
        // @ts-ignore
        await trademanBrokerManagerFacet.initBrokerManagerFacet(data.id, data.commissionP, process.env.TRADEMAN_BROKER_RECEIVER, data.name, data.url)
    }

    console.log(`[28/30] Init pairs manager facet...`)
    const trademanPairsManagerFacet = (await pairsManagerFacet.contract
        // @ts-ignore
        .attach(process.env.TRADEX)) as PairsManagerFacet
    for (const data of config.pair.slippage) {
        await trademanPairsManagerFacet.addSlippageConfig(data.name, data.index, data.slippageType, data.onePercentDepthAboveUsd, data.onePercentDepthBelowUsd, data.slippageLongP, data.slippageShortP)
    }
    for (const data of config.pair.underlying) {
        await trademanPairsManagerFacet.addPair(data.base, data.name, data.pairType, data.status, data.pairConfig, data.slippageConfigIndex, data.feeConfigIndex, data.leverageMargins)
    }

    console.log(`[29/30] Init trading config facet...`)
    const trademanTradingConfigFacet = (await tradingConfigFacet.contract
        // @ts-ignore
        .attach(process.env.TRADEX)) as TradingConfigFacet
    await trademanTradingConfigFacet.initTradingConfigFacet(config.trading.executionFeeUsd, config.trading.minNotionalUsd, config.trading.maxTakeProfitP)

    console.log(`[30/30] Renounce role...`)
    await trademanAccessControlEnumerableFacet.renounceRole(PAIR_OPERATOR_ROLE, deployer.address)
    await trademanAccessControlEnumerableFacet.renounceRole(PRICE_FEED_OPERATOR_ROLE, deployer.address)
    await trademanAccessControlEnumerableFacet.renounceRole(TOKEN_OPERATOR_ROLE, deployer.address)
    await trademanAccessControlEnumerableFacet.renounceRole(ADMIN_ROLE, deployer.address)
    await trademanAccessControlEnumerableFacet.renounceRole(DEFAULT_ADMIN_ROLE, deployer.address)

    console.log()
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
