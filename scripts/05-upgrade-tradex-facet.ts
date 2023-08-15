import {ethers} from 'hardhat'
import {DiamondCutFacet, TimeLockFacet} from '@tc/contracts/diamond/facets'
import fixtures from './shared/fixtures'

async function main() {
    console.log(`[1/3] Deploy TradingCloseFacet contract...`)
    const tradingCloseFacet = await fixtures.deployTradingCloseFacet(1)

    console.log(`[2/3] Deploy TradingReaderFacet contract...`)
    const tradingReaderFacet = await fixtures.deployTradingReaderFacet(1)

    console.log(`[3/3] Replace diamond cut..`)
    const [deployer] = await ethers.getSigners()
    const TimeLockFacet = await ethers.getContractFactory('TimeLockFacet', deployer)
    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)

    // @ts-ignore
    const trademanDiamondCutFacet = (await DiamondCutFacet.attach(process.env.TRADEX)) as DiamondCutFacet
    const diamondCut = tradingCloseFacet.diamondCut.concat(tradingReaderFacet.diamondCut)
    const parameter = await trademanDiamondCutFacet.diamondCut.populateTransaction(diamondCut, ethers.ZeroAddress, '0x')

    // @ts-ignore
    const trademanTimeLockFacet = (await TimeLockFacet.attach(process.env.TRADEX)) as TimeLockFacet
    // @ts-ignore
    const tx = await trademanTimeLockFacet.queueTransaction('diamondCut((address,uint8,bytes4[])[],address,bytes)', `0x${parameter.data.substring(10)}`)
    console.log(`\tQueueTransaction: ${tx.hash}`)

    console.log()
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
