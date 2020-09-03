require('dotenv').config()

const SunCoin = artifacts.require('SunCoin')
const TokenVesting = artifacts.require('TokenVesting')
const UniswapV2Router02 = artifacts.require('UniswapV2Router02')

const { UNISWAP_FACTORY, WETH_TOKEN } = process.env


module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    console.log('Deployer:', accounts[0])

    const SUNTokenInstance = await deployer.deploy(SunCoin, accounts[0])
    console.log('SUN token:', SUNTokenInstance.address)

    const UniswapRouterInstance = await deployer.deploy(UniswapV2Router02, UNISWAP_FACTORY, WETH_TOKEN, SUNTokenInstance.address)
    console.log('Router contract:', UniswapRouterInstance.address)

    console.log('Contracts deployed!')
    console.log('SUN token:', SUNTokenInstance.address)
    console.log('RouterV2:', UniswapRouterInstance.address)
  })
}