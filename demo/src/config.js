const { sunAbi, daiAbi, routerAbi } = require('./abi')

export const config = {
  'sun': {
    name: 'Sun Coin',
    symbol: 'SUN',
    version: '1',
    address: '0x7af250981432eeda34a20fc47372971b26684942',
    abi: sunAbi,
    dappId: 'a0fbad38-a931-4800-91dd-7dab56b4b790'
  },
  'dai': {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    version: '1',
    address: '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735',
    abi: daiAbi,
    dappId: '5b765421-fc7b-4493-a28d-105f96cef389'
  },
  'router': {
    name: 'Sun coin proxy',
    version: '1',
    address: '0x9DAb71186E6693388C4863eA364347Cf47F96d0a',
    abi: routerAbi,
    transferDappId: '38ffbafe-efa7-4752-9455-bb868be36c9f'
  }
}

export const biconomyApiKey = 'WotnWP9Mu.96788423-9366-475c-9670-4c0915245589'
export const biconomyUrl = 'https://api.biconomy.io/api/v2/meta-tx/native'

export const MAX_UINT = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

export const selectedNetwork = {
  id: '4',
  title: 'Rinkeby'
}

export const domainType = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

export const permitType = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
]

export const daiPermitType = [
  { name: 'holder', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'expiry', type: 'uint256' },
  { name: 'allowed', type: 'bool' },
]

export const domainTypeEIP2585 = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
]

export const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" }
];