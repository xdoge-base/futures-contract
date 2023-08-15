export default {
    goerli: {
        token: {
            weth: '0x4200000000000000000000000000000000000006' // WETH
        },
        chainlink: [
            {
                token: '0x1f80391358Ac758427c471a333228f4cc6e3Bce4', // USDT
                feed: '0xd5973EB46D6fE54E82C5337dD9536B35D080912C' // USDT/USD
            },
            {
                token: '0x376CAab45Cc106CCa0B58287dEF16d2Bb7294Dcb', // USDC
                feed: '0xb85765935B4d9Ab6f841c9a00690Da5F34368bc0' // USDC/USD
            },
            {
                token: '0x749e774B5a091426B176b0E9F2a747304B85f61B', // BTC
                feed: '0xAC15714c08986DACC0379193e22382736796496f' // BTC/USD
            },
            {
                token: '0x6125C26D2D07C018dB5bB7b901402796e39115c3', // ETH
                feed: '0xcD2A119bD1F7DF95d706DE6F2057fDD45A0503E2' // ETH/USD
            }
        ],
        price: {
            lowPriceGapP: '80', //0.8%
            highPriceGapP: '100', //1.0%
            maxPriceDelay: '65535'
        },
        vault: {
            securityMarginP: '5000', //50%
            margin: [
                {
                    tokenAddress: '0x1f80391358Ac758427c471a333228f4cc6e3Bce4', // USDT
                    feeBasisPoints: '25',
                    taxBasisPoints: '5',
                    stable: true,
                    dynamicFee: false,
                    asMargin: true,
                    weights: ['10000']
                },
                {
                    tokenAddress: '0x376CAab45Cc106CCa0B58287dEF16d2Bb7294Dcb', // USDC
                    feeBasisPoints: '25',
                    taxBasisPoints: '5',
                    stable: true,
                    dynamicFee: false,
                    asMargin: true,
                    weights: ['5000', '5000']
                }
            ]
        },
        lp: {
            coolingDuration: '3600' // 1H
        },
        fee: {
            daoShareP: '1000' // 10%
        },
        broker: [
            {
                id: '1',
                commissionP: '7000', //70%
                name: 'TradeX',
                url: 'https://perp.trademan.xyz'
            }
        ],
        pair: {
            slippage: [
                {
                    name: 'btc fixed slippage',
                    index: '0',
                    slippageType: '0', //SlippageType.FIXED
                    onePercentDepthAboveUsd: '0',
                    onePercentDepthBelowUsd: '0',
                    slippageLongP: '1', //1‱
                    slippageShortP: '1' //1‱
                },
                {
                    name: 'eth dynamic slippage',
                    index: '1',
                    slippageType: '1', //SlippageType.ONE_PERCENT_DEPTH
                    onePercentDepthAboveUsd: '249506876000000000000000000',
                    onePercentDepthBelowUsd: '282123302000000000000000000',
                    slippageLongP: '0',
                    slippageShortP: '0'
                }
            ],
            underlying: [
                {
                    base: '0x749e774B5a091426B176b0E9F2a747304B85f61B', // BTC
                    name: 'BTC/USD',
                    pairType: '0', //PairType.CRYPTO
                    status: '0', //PairStatus.AVAILABLE
                    pairConfig: {
                        maxLongOiUsd: '30000000000000000000000000', //30M
                        maxShortOiUsd: '30000000000000000000000000', //30M
                        fundingFeePerSecondP: '4042998478',
                        minFundingFeeR: '3333333333',
                        maxFundingFeeR: '95000000000'
                    },
                    slippageConfigIndex: '0',
                    feeConfigIndex: '0',
                    leverageMargins: [
                        {
                            tier: '1',
                            notionalUsd: '2000000000000000000000000', //2M
                            maxLeverage: '150', //150x
                            initialLostP: '8500', //85%
                            liqLostP: '9000' //90%
                        }
                    ]
                },
                {
                    base: '0x6125C26D2D07C018dB5bB7b901402796e39115c3', //ETH
                    name: 'ETH/USD',
                    pairType: '0', //PairType.CRYPTO
                    status: '0', //PairStatus.AVAILABLE
                    pairConfig: {
                        maxLongOiUsd: '30000000000000000000000000', //30M
                        maxShortOiUsd: '30000000000000000000000000', //30M
                        fundingFeePerSecondP: '3497590056',
                        minFundingFeeR: '3333333333',
                        maxFundingFeeR: '95000000000'
                    },
                    slippageConfigIndex: '1',
                    feeConfigIndex: '0',
                    leverageMargins: [
                        {
                            tier: '1',
                            notionalUsd: '2000000000000000000000000', //2M
                            maxLeverage: '150', //150x
                            initialLostP: '8500', //85%
                            liqLostP: '9000' //90%
                        }
                    ]
                }
            ]
        },
        trading: {
            executionFeeUsd: '0', //0.0U
            minNotionalUsd: '200000000000000000000', //200U
            maxTakeProfitP: '50000' //5x
        }
    }
}
