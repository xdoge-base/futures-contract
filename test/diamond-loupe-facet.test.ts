import {expect} from 'chai'
import {loadFixture} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import {init} from './shared/fixtures'
import {DiamondLoupeFacet} from '@tc/contracts/diamond/facets'

describe('DiamondLoupeFacet', function () {
    it('facets', async function () {
        const fixture = await loadFixture(init)

        const diamondLoupeFacet = fixture.diamondLoupeFacet.attach(await fixture.tradeX.getAddress()) as DiamondLoupeFacet
        const facets = await diamondLoupeFacet.facets()

        expect(facets[0].facetAddress).to.equal(await fixture.diamondCutFacet.getAddress())
        expect(facets[0].functionSelectors).to.eql([fixture.diamondCutFacet.interface.getFunction('diamondCut').selector])

        expect(facets[1].facetAddress).to.equal(await fixture.diamondLoupeFacet.getAddress())
        expect(facets[1].functionSelectors).to.eql([fixture.diamondLoupeFacet.interface.getFunction('facets').selector, fixture.diamondLoupeFacet.interface.getFunction('facetAddresses').selector, fixture.diamondLoupeFacet.interface.getFunction('facetAddress').selector, fixture.diamondLoupeFacet.interface.getFunction('facetFunctionSelectors').selector])
    })

    it('facetFunctionSelectors', async function () {
        const fixture = await loadFixture(init)

        const diamondLoupeFacet = fixture.diamondLoupeFacet.attach(await fixture.tradeX.getAddress()) as DiamondLoupeFacet
        const diamondCutFacetSelectors = await diamondLoupeFacet.facetFunctionSelectors(await fixture.diamondCutFacet.getAddress())
        const diamondLoupeFacetSelectors = await diamondLoupeFacet.facetFunctionSelectors(await fixture.diamondLoupeFacet.getAddress())

        expect(diamondCutFacetSelectors).to.eql([fixture.diamondCutFacet.interface.getFunction('diamondCut').selector])
        expect(diamondLoupeFacetSelectors).to.eql([fixture.diamondLoupeFacet.interface.getFunction('facets').selector, fixture.diamondLoupeFacet.interface.getFunction('facetAddresses').selector, fixture.diamondLoupeFacet.interface.getFunction('facetAddress').selector, fixture.diamondLoupeFacet.interface.getFunction('facetFunctionSelectors').selector])
    })

    it('facetAddresses', async function () {
        const fixture = await loadFixture(init)

        const diamondLoupeFacet = fixture.diamondLoupeFacet.attach(await fixture.tradeX.getAddress()) as DiamondLoupeFacet
        const addresses = await diamondLoupeFacet.facetAddresses()

        expect(addresses).to.eql([await fixture.diamondCutFacet.getAddress(), await fixture.diamondLoupeFacet.getAddress()])
    })

    it('facetAddress', async function () {
        const fixture = await loadFixture(init)

        const diamondLoupeFacet = fixture.diamondLoupeFacet.attach(await fixture.tradeX.getAddress()) as DiamondLoupeFacet
        const diamondCutFacetSelectors = [fixture.diamondCutFacet.interface.getFunction('diamondCut').selector]
        const diamondLoupeFacetSelectors = [fixture.diamondLoupeFacet.interface.getFunction('facets').selector, fixture.diamondLoupeFacet.interface.getFunction('facetAddresses').selector, fixture.diamondLoupeFacet.interface.getFunction('facetAddress').selector, fixture.diamondLoupeFacet.interface.getFunction('facetFunctionSelectors').selector]

        for (const selector of diamondCutFacetSelectors) {
            const address = await diamondLoupeFacet.facetAddress(selector)

            expect(address).to.equal(await fixture.diamondCutFacet.getAddress())
        }
        for (const selector of diamondLoupeFacetSelectors) {
            const address = await diamondLoupeFacet.facetAddress(selector)

            expect(address).to.equal(await fixture.diamondLoupeFacet.getAddress())
        }
    })
})
