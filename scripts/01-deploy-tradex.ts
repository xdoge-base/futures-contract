import {ethers} from 'hardhat'
import {MockDiamondCutFacet} from '@tc/contracts/test'
import fixtures from './shared/fixtures'

async function main() {
    console.log(`[1/2] Deploy contract...`)
    const {contract: trademanInit} = await fixtures.deployTrademanInit()
    const {contract: mockDiamondCutFacet} = await fixtures.deployMockDiamondCutFacet()
    const {contract: diamondLoupeFacet} = await fixtures.deployDiamondLoupeFacet()
    const {contract: tradeX} = await fixtures.deployTradeX(await mockDiamondCutFacet.getAddress(), await diamondLoupeFacet.getAddress(), await trademanInit.getAddress())

    console.log(`[2/2] Add facet with supportsInterface method...`)
    console.log(`\tDiamondLoupeFacet: ${await diamondLoupeFacet.getAddress()}`)
    await (mockDiamondCutFacet.attach(await tradeX.getAddress()) as MockDiamondCutFacet).diamondCut(
        [
            {
                facetAddress: diamondLoupeFacet.getAddress(),
                action: 0,
                functionSelectors: [diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
            }
        ],
        ethers.ZeroAddress,
        '0x'
    )

    console.log()
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
