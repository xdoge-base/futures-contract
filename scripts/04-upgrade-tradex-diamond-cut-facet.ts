import {ethers} from 'hardhat'
import {DiamondCutFacet} from '@tc/contracts/diamond/facets'
import fixtures from './shared/fixtures'

async function main() {
    console.log(`[1/2] Deploy DiamondCutFacet contract...`)
    const diamondCutFacet = await fixtures.deployDiamondCutFacet(1)

    console.log(`[2/2] Replace diamond cut..`)
    const trademanDiamondCutFacet = (await diamondCutFacet.contract
        // @ts-ignore
        .attach(process.env.TRADEX)) as DiamondCutFacet
    await trademanDiamondCutFacet.diamondCut(diamondCutFacet.diamondCut, ethers.ZeroAddress, '0x')

    console.log()
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
