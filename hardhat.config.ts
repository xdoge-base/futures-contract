import 'dotenv/config'
import 'tsconfig-paths/register'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import {HardhatUserConfig} from 'hardhat/config'
import {HARDHAT_NETWORK_MNEMONIC} from 'hardhat/internal/core/config/default-config'

const config: HardhatUserConfig = {
    networks: {
        BaseMainnet: {
            url: 'https://mainnet.base.org',
            accounts: {
                mnemonic: process.env.MNEMONIC || HARDHAT_NETWORK_MNEMONIC
            }
        },
        BaseGoerli: {
            url: 'https://goerli.base.org',
            gasPrice: 5000000000,
            accounts: {
                mnemonic: process.env.MNEMONIC || HARDHAT_NETWORK_MNEMONIC
            }
        }
    },
    etherscan: {
        apiKey: {
            // @ts-ignore
            BaseGoerli: process.env.ETHERSCAN_API_KEY
        },
        customChains: [
            {
                network: 'BaseGoerli',
                chainId: 84531,
                urls: {
                    apiURL: 'https://api-goerli.basescan.org/api',
                    browserURL: 'https://goerli.basescan.org'
                }
            }
        ]
    },
    solidity: {
        compilers: [
            {
                version: '0.8.19',
                settings: {
                    // viaIR: true,
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                    metadata: {
                        bytecodeHash: 'none'
                    }
                }
            }
        ]
    },
    paths: {
        cache: './cache/hardhat',
        artifacts: './artifacts/hardhat'
    },
    mocha: {
        reporter: 'mochawesome',
        timeout: 10 * 100000,
        slow: 3 * 1000,
        bail: true,
        diff: true,
        reporterOptions: {
            overwrite: true,
            inline: true,
            cdn: true,
            charts: true,
            autoOpen: true,
            showSkipped: true,
            json: false,
            reportDir: 'docs',
            reportTitle: 'trademan-perp-contracts',
            reportFilename: 'trademan-perp-contracts',
            reportPageTitle: 'trademan-perp-contracts'
        }
    }
}

export default config
