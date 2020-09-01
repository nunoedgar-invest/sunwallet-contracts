require('dotenv').config()

const SunCoin = artifacts.require('SunCoin')
const TokenVesting = artifacts.require('TokenVesting')
const MetaContract = artifacts.require('MetaContract')
const UniswapV2Router02 = artifacts.require('UniswapV2Router02')

const { UNISWAP_FACTORY, WETH_TOKEN } = process.env

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    console.log('Deployer:', accounts[0])
    const SunTokenConfigs = ['SUN', 'Sun Coin', accounts[0]]

    const SUNTokenInstance = await deployer.deploy(SunCoin, ...SunTokenConfigs)
    console.log('SUN token:', SUNTokenInstance.address)

    const UniswapRouterInstance = await deployer.deploy(UniswapV2Router02, UNISWAP_FACTORY, WETH_TOKEN)
    console.log('RouterV2:', UniswapRouterInstance.address)

    const MetaContractInstance = await deployer.deploy(MetaContract, SUNTokenInstance.address)
    console.log('Meta contract:', MetaContractInstance.address)

    console.log('Contracts deployed!')
    console.log('SUN token:', SUNTokenInstance.address)
    console.log('RouterV2:', UniswapRouterInstance.address)
    console.log('Meta contract:', MetaContractInstance.address)
  })
}