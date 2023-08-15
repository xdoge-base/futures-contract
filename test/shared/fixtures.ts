import {expect} from 'chai'
import {ethers} from 'hardhat'
import {setBalance, impersonateAccount} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import {AccessControlEnumerableFacet, BrokerManagerFacet, ChainlinkPriceFacet, DiamondCutFacet, FeeManagerFacet, LimitOrderFacet, LpManagerFacet, OrderAndTradeHistoryFacet, PairsManagerFacet, PriceFacadeFacet, TradingCloseFacet, TradingConfigFacet, TradingCoreFacet, TradingOpenFacet, TradingPortalFacet, TradingReaderFacet, VaultFacet} from '@tc/contracts/diamond/facets'
import fixtures from '../../scripts/shared/fixtures'

export async function init() {
    const {contract: trademanInit} = await fixtures.deployTrademanInit()
    const {contract: diamondCutFacet} = await fixtures.deployDiamondCutFacet()
    const {contract: diamondLoupeFacet} = await fixtures.deployDiamondLoupeFacet()
    const {contract: tradeX} = await fixtures.deployTradeX(await diamondCutFacet.getAddress(), await diamondLoupeFacet.getAddress(), await trademanInit.getAddress())

    await setBalance(await tradeX.getAddress(), 100n * 10n ** 18n)
    await impersonateAccount(await tradeX.getAddress())

    return {
        tradeX,
        diamondCutFacet,
        diamondLoupeFacet
    }
}

export async function initTradeXLp(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const {contract: tradeXLp} = await fixtures.deployTradeXLp()

    await tradeXLp.grantRole(ethers.id('MINTER_ROLE'), tradeX)
    await tradeXLp.addFromWhiteList(tradeX)
    await tradeXLp.addToWhiteList(tradeX)

    return tradeXLp
}

export async function initTrademanERC20() {
    const [deployer] = await ethers.getSigners()
    const {contract: usdt} = await fixtures.deployMockTrademanERC20('Mock Trademan Tether USD', 'USDT')
    const {contract: usdc} = await fixtures.deployMockTrademanERC20('Mock Trademan USD Coin', 'USDC')
    const {contract: btc} = await fixtures.deployMockTrademanERC20('Mock Trademan Bitcoin', 'BTC/USD')
    const {contract: eth} = await fixtures.deployMockTrademanERC20('Mock Trademan Ether', 'ETH/USD')

    await usdt.mint(deployer.address, 100000000n * 10n ** 18n)
    await usdc.mint(deployer.address, 100000000n * 10n ** 18n)

    return {
        usdt,
        usdc,
        btc,
        eth
    }
}

export async function initTrademanAggregator() {
    const {contract: usdt} = await fixtures.deployMockTrademanAggregator(8, 'Mock Trademan USDT Aggregator', 0, 100000000)
    const {contract: usdc} = await fixtures.deployMockTrademanAggregator(8, 'Mock Trademan USDC Aggregator', 0, 100000000)
    const {contract: btc} = await fixtures.deployMockTrademanAggregator(8, 'Mock Trademan BTC Aggregator', 0, 3000000000000)
    const {contract: eth} = await fixtures.deployMockTrademanAggregator(8, 'Mock Trademan ETH Aggregator', 0, 200000000000)

    return {
        usdt,
        usdc,
        btc,
        eth
    }
}

export async function initTrademanWETH9() {
    const {contract: weth} = await fixtures.deployMockTrademanWETH9()

    return weth
}

export async function initAccessControlEnumerableFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const accessControlEnumerableFacet = await fixtures.deployAccessControlEnumerableFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(accessControlEnumerableFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    const trademanAccessControlEnumerableFacet = accessControlEnumerableFacet.contract.attach(tradeX) as AccessControlEnumerableFacet

    await trademanAccessControlEnumerableFacet.grantRole(ethers.ZeroHash, deployer.address)
    await trademanAccessControlEnumerableFacet.grantRole(ethers.id('ADMIN_ROLE'), deployer.address)
    await trademanAccessControlEnumerableFacet.grantRole(ethers.id('TOKEN_OPERATOR_ROLE'), deployer.address)
    await trademanAccessControlEnumerableFacet.grantRole(ethers.id('PRICE_FEED_OPERATOR_ROLE'), deployer.address)
    await trademanAccessControlEnumerableFacet.grantRole(ethers.id('PAIR_OPERATOR_ROLE'), deployer.address)
    await trademanAccessControlEnumerableFacet.grantRole(ethers.id('KEEPER_ROLE'), deployer.address)
    await trademanAccessControlEnumerableFacet.grantRole(ethers.id('PRICE_FEEDER_ROLE'), deployer.address)
    await trademanAccessControlEnumerableFacet.grantRole(ethers.id('MONITOR_ROLE'), deployer.address)

    return trademanAccessControlEnumerableFacet
}

export async function initTimeLockFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const timeLockFacet = await fixtures.deployTimeLockFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(timeLockFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    return timeLockFacet.contract.attach(tradeX)
}

export async function initPausableFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const pausableFacet = await fixtures.deployPausableFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(pausableFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    return pausableFacet.contract.attach(tradeX)
}

export async function initChainlinkPriceFacet(tradeX: string, tokens: any, feeds: any) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const chainlinkPriceFacet = await fixtures.deployChainlinkPriceFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(chainlinkPriceFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    const trademanChainlinkPriceFacet = chainlinkPriceFacet.contract.attach(tradeX) as ChainlinkPriceFacet

    const datas = [
        {
            token: tokens.usdt,
            feed: feeds.usdt
        },
        {
            token: tokens.usdc,
            feed: feeds.usdc
        },
        {
            token: tokens.btc,
            feed: feeds.btc
        },
        {
            token: tokens.eth,
            feed: feeds.eth
        }
    ]
    for (const data of datas) {
        await trademanChainlinkPriceFacet.addChainlinkPriceFeed(data.token.address, data.feed.address)
    }

    return trademanChainlinkPriceFacet
}

export async function initPriceFacadeFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const priceFacadeFacet = await fixtures.deployPriceFacadeFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(priceFacadeFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    const trademanPriceFacadeFacet = priceFacadeFacet.contract.attach(tradeX) as PriceFacadeFacet

    await trademanPriceFacadeFacet.initPriceFacadeFacet(80n, 100n, 65535n)

    return trademanPriceFacadeFacet
}

export async function initVaultFacet(tradeX: string, weth: string, tokens: any) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const vaultFacet = await fixtures.deployVaultFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(vaultFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    const trademanVaultFacet = vaultFacet.contract.attach(tradeX) as VaultFacet

    await trademanVaultFacet.initVaultFacet(weth)
    const datas = [
        {
            tokenAddress: tokens.usdt.address,
            feeBasisPoints: 0n,
            taxBasisPoints: 0n,
            stable: true,
            dynamicFee: false,
            asMargin: true,
            weights: [10000n]
        },
        {
            tokenAddress: tokens.usdc.address,
            feeBasisPoints: 0n,
            taxBasisPoints: 0n,
            stable: true,
            dynamicFee: false,
            asMargin: true,
            weights: [5000n, 5000n]
        }
    ]
    for (const data of datas) {
        await trademanVaultFacet.addToken(data.tokenAddress, data.feeBasisPoints, data.taxBasisPoints, data.stable, data.dynamicFee, data.asMargin, data.weights)
    }
    await trademanVaultFacet.setSecurityMarginP(5000n)

    return trademanVaultFacet
}

export async function initLpManagerFacet(tradeX: string, lp: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const lpManagerFacet = await fixtures.deployLpManagerFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(lpManagerFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    const trademanLpManagerFacet = lpManagerFacet.contract.attach(tradeX) as LpManagerFacet

    await trademanLpManagerFacet.initLpManagerFacet(lp)
    await trademanLpManagerFacet.setCoolingDuration(172800n)

    return trademanLpManagerFacet
}

export async function initFeeManagerFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const feeManagerFacet = await fixtures.deployFeeManagerFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(feeManagerFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    const trademanFeeManagerFacet = feeManagerFacet.contract.attach(tradeX) as FeeManagerFacet

    await trademanFeeManagerFacet.initFeeManagerFacet(deployer.address, 1000n)

    return trademanFeeManagerFacet
}

export async function initBrokerManagerFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const brokerManagerFacet = await fixtures.deployBrokerManagerFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(brokerManagerFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    const trademanBrokerManagerFacet = brokerManagerFacet.contract.attach(tradeX) as BrokerManagerFacet

    const datas = [
        {
            id: 1n,
            commissionP: 7000n,
            receiver: deployer.address,
            name: 'TradeX',
            url: 'https://perp.trademan.xyz'
        }
    ]
    for (const data of datas) {
        await trademanBrokerManagerFacet.initBrokerManagerFacet(data.id, data.commissionP, data.receiver, data.name, data.url)
    }

    return trademanBrokerManagerFacet
}

export async function initPairsManagerFacet(tradeX: string, tokens: any) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const pairsManagerFacet = await fixtures.deployPairsManagerFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(pairsManagerFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    const trademanPairsManagerFacet = pairsManagerFacet.contract.attach(tradeX) as PairsManagerFacet

    const slippage = [
        {
            name: 'btc fixed slippage',
            index: 0n,
            slippageType: 0n,
            onePercentDepthAboveUsd: 0n,
            onePercentDepthBelowUsd: 0n,
            slippageLongP: 1n,
            slippageShortP: 1n
        },
        {
            name: 'eth dynamic slippage',
            index: 1n,
            slippageType: 1n,
            onePercentDepthAboveUsd: 392819700000000000000000000n,
            onePercentDepthBelowUsd: 425533900000000000000000000n,
            slippageLongP: 0n,
            slippageShortP: 0n
        }
    ]
    for (const data of slippage) {
        await trademanPairsManagerFacet.addSlippageConfig(data.name, data.index, data.slippageType, data.onePercentDepthAboveUsd, data.onePercentDepthBelowUsd, data.slippageLongP, data.slippageShortP)
    }
    const underlying = [
        {
            base: tokens.btc.address,
            name: 'BTC/USD',
            pairType: 0n,
            status: 0n,
            pairConfig: {
                maxLongOiUsd: 3000000000000000000000000n,
                maxShortOiUsd: 3000000000000000000000000n,
                fundingFeePerSecondP: 20811136478n,
                minFundingFeeR: 3333333333n,
                maxFundingFeeR: 95000000000n
            },
            slippageConfigIndex: 0n,
            feeConfigIndex: 0n,
            leverageMargins: [
                {
                    tier: 1n,
                    notionalUsd: 2000000000000000000000000n,
                    maxLeverage: 150n,
                    initialLostP: 8500n,
                    liqLostP: 9000n
                }
            ]
        },
        {
            base: tokens.eth.address,
            name: 'ETH/USD',
            pairType: 0n,
            status: 0n,
            pairConfig: {
                maxLongOiUsd: 3000000000000000000000000n,
                maxShortOiUsd: 3000000000000000000000000n,
                fundingFeePerSecondP: 20262557077n,
                minFundingFeeR: 3333333333n,
                maxFundingFeeR: 95000000000n
            },
            slippageConfigIndex: 1n,
            feeConfigIndex: 0n,
            leverageMargins: [
                {
                    tier: 1n,
                    notionalUsd: 2000000000000000000000000n,
                    maxLeverage: 150n,
                    initialLostP: 8500n,
                    liqLostP: 9000n
                }
            ]
        }
    ]
    for (const data of underlying) {
        await trademanPairsManagerFacet.addPair(data.base, data.name, data.pairType, data.status, data.pairConfig, data.slippageConfigIndex, data.feeConfigIndex, data.leverageMargins)
    }

    return trademanPairsManagerFacet
}

export async function initTradingCheckerFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const tradingCheckerFacet = await fixtures.deployTradingCheckerFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(tradingCheckerFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    return tradingCheckerFacet.contract.attach(tradeX) as TradingConfigFacet
}

export async function initTradingConfigFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const tradingConfigFacet = await fixtures.deployTradingConfigFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(tradingConfigFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    const trademanTradingConfigFacet = tradingConfigFacet.contract.attach(tradeX) as TradingConfigFacet

    await trademanTradingConfigFacet.initTradingConfigFacet(300000000000000000n, 200000000000000000000n, 50000n)

    return trademanTradingConfigFacet
}

export async function initTradingCoreFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const tradingCoreFacet = await fixtures.deployTradingCoreFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(tradingCoreFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    return tradingCoreFacet.contract.attach(tradeX) as TradingCoreFacet
}

export async function initTradingPortalFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const tradingPortalFacet = await fixtures.deployTradingPortalFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(tradingPortalFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    return tradingPortalFacet.contract.attach(tradeX) as TradingPortalFacet
}

export async function initOrderAndTradeHistoryFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const orderAndTradeHistoryFacet = await fixtures.deployOrderAndTradeHistoryFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(orderAndTradeHistoryFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    return orderAndTradeHistoryFacet.contract.attach(tradeX) as OrderAndTradeHistoryFacet
}

export async function initTradingOpenFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const tradingOpenFacet = await fixtures.deployTradingOpenFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(tradingOpenFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    return tradingOpenFacet.contract.attach(tradeX) as TradingOpenFacet
}

export async function initTradingCloseFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const tradingCloseFacet = await fixtures.deployTradingCloseFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(tradingCloseFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    return tradingCloseFacet.contract.attach(tradeX) as TradingCloseFacet
}

export async function initLimitOrderFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const limitOrderFacet = await fixtures.deployLimitOrderFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(limitOrderFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    return limitOrderFacet.contract.attach(tradeX) as LimitOrderFacet
}

export async function initTradingReaderFacet(tradeX: string) {
    const [deployer] = await ethers.getSigners()
    const onlySelf = await ethers.getImpersonatedSigner(tradeX)

    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
    const diamondCutFacet = await DiamondCutFacet.attach(tradeX)
    const tradingReaderFacet = await fixtures.deployTradingReaderFacet()

    await expect((diamondCutFacet.connect(onlySelf) as DiamondCutFacet).diamondCut(tradingReaderFacet.diamondCut, ethers.ZeroAddress, '0x')).to.emit(diamondCutFacet, 'DiamondCut')

    return tradingReaderFacet.contract.attach(tradeX) as TradingReaderFacet
}

export async function integration() {
    const tokens = await initTrademanERC20()
    const feeds = await initTrademanAggregator()
    const weth = await initTrademanWETH9()

    const {tradeX, diamondCutFacet, diamondLoupeFacet} = await init()
    const tradeXLp = await initTradeXLp(await tradeX.getAddress())

    const accessControlEnumerableFacet = await initAccessControlEnumerableFacet(await tradeX.getAddress())
    const timeLockFacet = await initTimeLockFacet(await tradeX.getAddress())
    const pausableFacet = await initPausableFacet(await tradeX.getAddress())
    const chainlinkPriceFacet = await initChainlinkPriceFacet(await tradeX.getAddress(), tokens, feeds)
    const priceFacadeFacet = await initPriceFacadeFacet(await tradeX.getAddress())
    const vaultFacet = await initVaultFacet(await tradeX.getAddress(), await weth.getAddress(), tokens)
    const lpManagerFacet = await initLpManagerFacet(await tradeX.getAddress(), await tradeXLp.getAddress())
    const feeManagerFacet = await initFeeManagerFacet(await tradeX.getAddress())
    const brokerManagerFacet = await initBrokerManagerFacet(await tradeX.getAddress())
    const pairsManagerFacet = await initPairsManagerFacet(await tradeX.getAddress(), tokens)
    const tradingCheckerFacet = await initTradingCheckerFacet(await tradeX.getAddress())
    const tradingConfigFacet = await initTradingConfigFacet(await tradeX.getAddress())
    const tradingCoreFacet = await initTradingCoreFacet(await tradeX.getAddress())
    const tradingPortalFacet = await initTradingPortalFacet(await tradeX.getAddress())
    const orderAndTradeHistoryFacet = await initOrderAndTradeHistoryFacet(await tradeX.getAddress())
    const tradingOpenFacet = await initTradingOpenFacet(await tradeX.getAddress())
    const tradingCloseFacet = await initTradingCloseFacet(await tradeX.getAddress())
    const limitOrderFacet = await initLimitOrderFacet(await tradeX.getAddress())

    return {
        tokens,
        feeds,
        weth,
        tradeX,
        diamondCutFacet,
        diamondLoupeFacet,
        tradeXLp,
        accessControlEnumerableFacet,
        timeLockFacet,
        pausableFacet,
        chainlinkPriceFacet,
        priceFacadeFacet,
        vaultFacet,
        lpManagerFacet,
        feeManagerFacet,
        brokerManagerFacet,
        pairsManagerFacet,
        tradingCheckerFacet,
        tradingConfigFacet,
        tradingCoreFacet,
        tradingPortalFacet,
        orderAndTradeHistoryFacet,
        tradingOpenFacet,
        tradingCloseFacet,
        limitOrderFacet
    }
}
