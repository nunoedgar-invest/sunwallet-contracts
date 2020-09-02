require('dotenv').config()

const HDWalletProvider = require('@truffle/hdwallet-provider')
const {
  INFURA_KEY,
  PRIVATE_KEY
} = process.env

module.exports = {
  networks: {
    "development": {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },

    "rinkeby": {
      provider: () => new HDWalletProvider(PRIVATE_KEY, `https://rinkeby.infura.io/v3/${INFURA_KEY}`),
      network_id: 4,            // Rinkeby's id
      gas: 9500000,             // Rinkeby has a lower block limit than mainnet
      gasPrice: 0x174876e800,   // 100 gwei
      confirmations: 0,         // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 50,        // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true          // Skip dry run before migrations? (default: false for public nets )
    },

    "kovan": {
      provider: () => new HDWalletProvider(PRIVATE_KEY, `https://kovan.infura.io/v3/${INFURA_KEY}`),
      network_id: 42,         // Kovan id
      gas: 9500000,           // Kovan has a lower block limit than mainnet
      gasPrice: 0x174876e800, // 100 gwei
      confirmations: 0,       // # of configs to wait between deployments. (default: 0)
      timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true        // Skip dry run before migrations? (default: false for public nets)
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.6.6",    // Fetch exact version from solc-bin (default: truffle's version)
      docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
      //  evmVersion: "byzantium"
      }
    }
  }
}
