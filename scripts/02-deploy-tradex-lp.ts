import {ethers} from 'hardhat'
import fixtures from './shared/fixtures'

async function main() {
    const DEFAULT_ADMIN_ROLE = ethers.ZeroHash
    const ADMIN_ROLE = ethers.id('ADMIN_ROLE')
    const MINTER_ROLE = ethers.id('MINTER_ROLE')
    const UPGRADER_ROLE = ethers.id('UPGRADER_ROLE')

    console.log(`[1/8] Deploy contract...`)
    const {contract: tradeXLp} = await fixtures.deployTradeXLp()

    console.log(`[2/8] Add minter...`)
    console.log(`\tMinter: ${process.env.TRADEX}`)
    await tradeXLp.grantRole(MINTER_ROLE, process.env.TRADEX)

    console.log(`[3/8] Add from whitelist...`)
    console.log(`\tFromWhiteList: ${process.env.TRADEX}`)
    await tradeXLp.addFromWhiteList(process.env.TRADEX)

    console.log(`[4/8] Add to whitelist...`)
    console.log(`\tToWhiteList: ${process.env.TRADEX}`)
    await tradeXLp.addToWhiteList(process.env.TRADEX)

    console.log(`[5/8] Add admin...`)
    console.log(`\tAdmin: ${process.env.ADMIN}`)
    await tradeXLp.grantRole(ADMIN_ROLE, process.env.ADMIN)

    console.log(`[6/8] Add default admin...`)
    console.log(`\tAdmin: ${process.env.DEFAULT_ADMIN}`)
    await tradeXLp.grantRole(DEFAULT_ADMIN_ROLE, process.env.DEFAULT_ADMIN)

    const [deployer] = await ethers.getSigners()
    console.log(`[7/8] Renounce admin...`)
    console.log(`\tAdmin: ${deployer.address}`)
    await tradeXLp.renounceRole(ADMIN_ROLE, deployer.address)

    console.log(`[8/8] Renounce default admin...`)
    console.log(`\tAdmin: ${deployer.address}`)
    await tradeXLp.renounceRole(DEFAULT_ADMIN_ROLE, deployer.address)

    console.log()
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
