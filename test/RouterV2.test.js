const SunCoin = artifacts.require('SunCoin')
const UniswapV2Router02 = artifacts.require('UniswapV2Router02')

const assert = require('assert')
const Web3 = require('web3')
const { constants, balance, ether, expectRevert, expectEvent } = require('openzeppelin-test-helpers')
const { MAX_UINT256 } = constants

const web3 = new Web3('http://127.0.0.1:8545')

contract('Meta transactions', (accounts) => {
  let routerInstance
  let sunInstance

  approveSun = async (owner, ownerPk) => {
    try {
      const deadline = '999999999999'
      const nonce = await sunInstance.nonces(owner)
      const data = getSunMessage(sunInstance.address, routerInstance.address, owner, nonce.toString(), deadline)
      const { r, s, v } =  await sendToSign(data, ownerPk)

      await sunInstance.permit(owner, routerInstance.address, MAX_UINT256.toString(), deadline, v, r, s, { from: accounts[0] })
    } catch (error) {
      throw error
    }
  }

  before(async () => {
    sunInstance = await SunCoin.deployed()
    routerInstance = await UniswapV2Router02.deployed()
  })

  describe('Meta transaction for token approve', async () => {
    it('Sign approve data and send', async () => {
      const user = accounts[1]
      const userPk = '0xb0cb4c71a924e588b14b747ced67fd7f0cbedc4a65dc7d56b000890c6b27dcac'
      await approveSun(user, userPk)
    })
  })
})


// Helpers

const getSunMessage = (sunAddress, routerAddress, sender, nonce, deadline) => {
  const domainType = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ]

  const permitType = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ]

  const message = {
    'owner': sender,
    'spender': routerAddress,
    'value': MAX_UINT256.toString(),
    'nonce': nonce,
    'deadline': deadline,
  }

  const domainData = {
    'name': 'Sun Coin',
    'version': '1',
    'chainId': '1337',
    'verifyingContract': sunAddress,
  }

  return JSON.stringify({
    'types': {
        'EIP712Domain': domainType,
        'Permit': permitType,
    },
    'domain': domainData,
    'primaryType': 'Permit',
    'message': message
  })
}

const sendToSign = async (message, userPk) => {
  try {
    const {signature} = web3.eth.accounts.sign(message, userPk)
    const { v, r, s } = getSignatureParameters(signature)
    return ({ v, r, s })
  } catch (error) {
    throw error
  }
}

const getSignatureParameters = (signature) => {
  if (!web3.utils.isHexStrict(signature)) {
    throw new Error(
      'Given value "'.concat(signature, '" is not a valid hex string.')
    )
  }

  signature = signature.substring(2)
  const r = '0x' + signature.substring(0, 64)
  const s = '0x' + signature.substring(64, 128)
  const v = parseInt(signature.substring(128, 130), 16)

  return { v, r, s }
}
