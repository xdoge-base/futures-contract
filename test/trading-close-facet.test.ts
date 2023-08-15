import {expect} from 'chai'
import {ethers} from 'hardhat'
import {loadFixture} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import {init, initTradingCloseFacet} from './shared/fixtures'

describe('TradingCloseFacet', function () {
    async function fixture() {
        const context = await init()

        return await initTradingCloseFacet(await context.tradeX.getAddress())
    }

    describe('closeTradeCallback', function () {
        it('Close trade rejected', async function () {
            const tradingCloseFacet = await loadFixture(fixture)
            const onlySelf = await ethers.getImpersonatedSigner(await tradingCloseFacet.getAddress())

            await expect(tradingCloseFacet.connect(onlySelf).closeTradeCallback('0x1230000000000000000000000000000000000000000000000000000000000abc', 1, 1))
                .to.emit(tradingCloseFacet, 'CloseTradeRejected')
                .withArgs('0x1230000000000000000000000000000000000000000000000000000000000abc')
        })
    })
})
