const { sunAbi, daiAbi, routerAbi } = require('./Abi')

export const config = {
  'sun': {
    name: 'Sun Coin',
    symbol: 'SUN',
    address: '0xACB75f33BF55CB5420aE442c620419f6a961175d',
    abi: sunAbi
  },
  'dai': {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    address: '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735',
    abi: daiAbi
  },
  'router': {
    name: 'Sun coin proxy',
    address: '0xD4aecf650c2c9A0d4E2BF08Fd10268CA1e199fcD',
    abi: routerAbi
  }
}

export const biconomyApi = 'N_qQS71U1.065ae611-a407-4545-ad5b-392a3a149bda'

export const selectedNetwork = {
  id: '4',
  title: 'Rinkeby'
}