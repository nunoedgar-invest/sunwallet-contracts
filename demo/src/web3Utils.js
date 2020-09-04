const Web3 = require('web3')
const Biconomy = require('@biconomy/mexa')
const { biconomyApiKey, selectedNetwork } = require('./config')

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
      apiKey: biconomyApiKey,
      debug: true
    })

    const web3 = new Web3(biconomy)
    // Update the window web3 to Biconomy web3
    window.web3 = web3

    return new Promise((resolve, reject) => {
      biconomy.onEvent(biconomy.READY, () => {
        resolve(accounts[0])
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

export const getTxUrl = (txHash) => {
  const chainId = window.web3.currentProvider.networkVersion.toString()
  switch (chainId) {
    case '4':
      return `https://rinkeby.etherscan.io/tx/${txHash}`
      break;

    default:
      break;
  }
}
