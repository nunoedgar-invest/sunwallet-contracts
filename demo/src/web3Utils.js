const Web3 = require('web3')
const Biconomy = require('@biconomy/mexa')
const { biconomyApi, selectedNetwork } = require('./config')

export const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    // Ethereum user detected. You can now use the provider.
    const provider = window.ethereum
    const accounts = await provider.enable()
    const chainId = provider.networkVersion

    if (chainId.toString() !== selectedNetwork.id) {
      throw new Error(`Invalid network (switch to ${selectedNetwork.title})`)
    }

    const biconomy = new Biconomy(provider, {
      apiKey: biconomyApi,
      debug: 'true',
    })

    const web3 = new Web3(biconomy)
    return new Promise((resolve, reject) => {
      biconomy.onEvent(biconomy.READY, async () => {
        resolve({
          web3,
          chainId,
          account: accounts[0],
        })
      }).onEvent(biconomy.ERROR, (error, message) => {
        reject({
          error,
          message
        })
      })
    })
  } else {
    throw new Error('Install Metamask extension first: https://metamask.io/')
  }
}