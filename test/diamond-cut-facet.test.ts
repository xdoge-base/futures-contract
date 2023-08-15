import {expect} from 'chai'
import {ethers} from 'hardhat'
import {loadFixture} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import {DiamondLoupeFacet} from '@tc/contracts/diamond/facets'
import {DiamondCutFacet, IDiamondCut} from '@tc/contracts/diamond/facets/DiamondCutFacet'
import {init} from './shared/fixtures'

describe('DiamondCutFacet', function () {
    describe('diamondCut role', function () {
        it('NonSelf', async function () {
            const fixture = await loadFixture(init)
            const [notSelf] = await ethers.getSigners()

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(notSelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondLoupeFacet.getAddress(),
                            action: 0,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).to.be.revertedWith('OnlySelf: Only self call')
        })

        it('OnlySelf', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getImpersonatedSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet
            const diamondLoupeFacet = fixture.diamondLoupeFacet.attach(await fixture.tradeX.getAddress()) as DiamondLoupeFacet
            const interfaceIds = ['0x01ffc9a7', '0x1f931c1c', '0x48e2b093']

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondLoupeFacet.getAddress(),
                            action: 0,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).not.reverted

            for (const interfaceId of interfaceIds) {
                const bool = await diamondLoupeFacet.supportsInterface(interfaceId)

                expect(bool).to.be.true
            }
        })
    })

    describe('diamondCut validate', function () {
        it('No selectors in facet to cut', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondLoupeFacet.getAddress(),
                            action: 0,
                            functionSelectors: []
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).to.be.revertedWith('LibDiamondCut: No selectors in facet to cut')
        })

        it('Incorrect facet cut action', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondLoupeFacet.getAddress(),
                            action: 99,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).to.be.reverted
        })
    })

    describe('diamondCut add', function () {
        it('Add', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet
            const diamondCutArgs = [
                {
                    facetAddress: await fixture.diamondLoupeFacet.getAddress(),
                    action: 0,
                    functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                }
            ]

            function isPass(diamondCut: IDiamondCut.FacetCutStructOutput[]): boolean {
                expect(diamondCut.length).to.equal(1)
                expect(diamondCut[0].facetAddress).to.equal(diamondCutArgs[0].facetAddress)
                expect(diamondCut[0].action).to.equal(0)
                expect(diamondCut[0].functionSelectors).to.eql(diamondCutArgs[0].functionSelectors)

                return true
            }

            await expect(diamondCutFacet.connect(onlySelf).diamondCut(diamondCutArgs, ethers.ZeroAddress, '0x'))
                .to.emit(diamondCutFacet, 'DiamondCut')
                .withArgs(isPass, ethers.ZeroAddress, '0x')
        })

        it('Add facet cant be address(0)', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: ethers.ZeroAddress,
                            action: 0,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).to.be.revertedWith("LibDiamondCut: Add facet can't be address(0)")
        })

        it('New facet has no code', async function () {
            const fixture = await loadFixture(init)
            const [eoa] = await ethers.getSigners()
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: eoa.address,
                            action: 0,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).to.be.revertedWith('LibDiamondCut: New facet has no code')
        })

        it('Cant add function that already exists', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondCutFacet.getAddress(),
                            action: 0,
                            functionSelectors: [fixture.diamondCutFacet.interface.getFunction('diamondCut').selector]
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).to.be.revertedWith("LibDiamondCut: Can't add function that already exists")
        })
    })

    describe('diamondCut replace', function () {
        it('Replace', async function () {
            const fixture = await loadFixture(init)
            const [deployer] = await ethers.getSigners()
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet', deployer)
            const anotherDiamondCutFacet = await DiamondCutFacet.deploy()

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet
            const diamondCutArgs = [
                {
                    facetAddress: await anotherDiamondCutFacet.getAddress(),
                    action: 1,
                    functionSelectors: [anotherDiamondCutFacet.interface.getFunction('diamondCut').selector]
                }
            ]

            function isPass(diamondCut: IDiamondCut.FacetCutStructOutput[]): boolean {
                expect(diamondCut.length).to.equal(1)
                expect(diamondCut[0].facetAddress).to.equal(diamondCutArgs[0].facetAddress)
                expect(diamondCut[0].action).to.equal(1)
                expect(diamondCut[0].functionSelectors).to.eql(diamondCutArgs[0].functionSelectors)

                return true
            }

            await expect(diamondCutFacet.connect(onlySelf).diamondCut(diamondCutArgs, ethers.ZeroAddress, '0x'))
                .to.emit(diamondCutFacet, 'DiamondCut')
                .withArgs(isPass, ethers.ZeroAddress, '0x')
        })

        it('Add facet cant be address(0)', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: ethers.ZeroAddress,
                            action: 1,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).to.be.revertedWith("LibDiamondCut: Add facet can't be address(0)")
        })

        it('Cant replace function with same function', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondCutFacet.getAddress(),
                            action: 1,
                            functionSelectors: [fixture.diamondCutFacet.interface.getFunction('diamondCut').selector]
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).to.be.revertedWith("LibDiamondCut: Can't replace function with same function")
        })

        it('Cant remove function that doesnt exist', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondLoupeFacet.getAddress(),
                            action: 1,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).to.be.revertedWith("LibDiamondCut: Can't remove function that doesn't exist")
        })

        it('Cant remove immutable function', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await diamondCutFacet.connect(onlySelf).diamondCut(
                [
                    {
                        facetAddress: await fixture.tradeX.getAddress(),
                        action: 0,
                        functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                    }
                ],
                ethers.ZeroAddress,
                '0x'
            )
            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondLoupeFacet.getAddress(),
                            action: 1,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).to.be.revertedWith("LibDiamondCut: Can't remove immutable function")
        })
    })

    describe('diamondCut remove', function () {
        it('Remove', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet
            const diamondCutArgs = [
                {
                    facetAddress: ethers.ZeroAddress,
                    action: 2,
                    functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('facets').selector]
                }
            ]

            function isPass(diamondCut: IDiamondCut.FacetCutStructOutput[]): boolean {
                expect(diamondCut.length).to.equal(1)
                expect(diamondCut[0].facetAddress).to.equal(diamondCutArgs[0].facetAddress)
                expect(diamondCut[0].action).to.equal(2)
                expect(diamondCut[0].functionSelectors).to.eql(diamondCutArgs[0].functionSelectors)

                return true
            }

            await expect(diamondCutFacet.connect(onlySelf).diamondCut(diamondCutArgs, ethers.ZeroAddress, '0x'))
                .to.emit(diamondCutFacet, 'DiamondCut')
                .withArgs(isPass, ethers.ZeroAddress, '0x')
        })

        it('Remove facet address must be address(0)', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondLoupeFacet.getAddress(),
                            action: 2,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    ethers.ZeroAddress,
                    '0x'
                )
            ).to.be.revertedWith('LibDiamondCut: Remove facet address must be address(0)')
        })
    })

    describe('diamondCut init', function () {
        it('Init address has no code', async function () {
            const fixture = await loadFixture(init)
            const [eoa] = await ethers.getSigners()
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondLoupeFacet.getAddress(),
                            action: 0,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    eoa.address,
                    '0x'
                )
            ).to.be.revertedWith('LibDiamondCut: Init address has no code')
        })

        it('Initialization function reverted', async function () {
            const fixture = await loadFixture(init)
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondCutFacet.getAddress(),
                            action: 0,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    await fixture.diamondCutFacet.getAddress(),
                    '0x'
                )
            )
                .to.be.revertedWithCustomError(diamondCutFacet, 'InitializationFunctionReverted')
                .withArgs(await fixture.diamondCutFacet.getAddress(), '0x')
        })

        it('Initialization function return error', async function () {
            const fixture = await loadFixture(init)
            const [deployer] = await ethers.getSigners()
            const onlySelf = await ethers.getSigner(await fixture.tradeX.getAddress())

            const MockTrademanInit = await ethers.getContractFactory('MockTrademanInit', deployer)
            const trademanInit = await MockTrademanInit.deploy()

            const diamondCutFacet = fixture.diamondCutFacet.attach(await fixture.tradeX.getAddress()) as DiamondCutFacet

            await expect(
                diamondCutFacet.connect(onlySelf).diamondCut(
                    [
                        {
                            facetAddress: await fixture.diamondLoupeFacet.getAddress(),
                            action: 0,
                            functionSelectors: [fixture.diamondLoupeFacet.interface.getFunction('supportsInterface').selector]
                        }
                    ],
                    await trademanInit.getAddress(),
                    trademanInit.interface.getFunction('init').selector
                )
            ).to.be.revertedWith('MockTrademanInit: Can only init roles for 0x0')
        })
    })
})
