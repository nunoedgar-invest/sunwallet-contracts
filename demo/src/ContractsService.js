const {
  config,
  MAX_UINT,
  domainType,
  permitType,
  daiPermitType,
  metaTransactionType,
} = require('./config')

const getNow = async () => {
  const latestBlock = await window.web3.eth.getBlock('latest')
  const now = latestBlock.timestamp
  return parseInt(now)
}

const getSignatureParameters = (signature) => {
  if (!window.web3.utils.isHexStrict(signature)) {
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

const sendToSign = async (sender, message) => {
  try {
    return new Promise((resolve, reject) => {
      window.web3.currentProvider.send(
        {
          jsonrpc: '2.0',
          id: 999999999999,
          method: 'eth_signTypedData_v4',
          params: [sender, message],
        }, (error, response) => {
          if (!error) {
            const { v, r, s } = getSignatureParameters(response.result)
            resolve({ v, r, s })
          } else {
            reject(error)
          }
        }
      )
    })
  } catch (error) {
    throw error
  }
}

const numberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const getUnblockTokensData = async (owner, tokenSymbol) => {
  try {
    const { name, version, abi, address, dappId } = config[tokenSymbol]
    const tokenInstance = new window.web3.eth.Contract(
      abi,
      address
    )

    let metaTxBody
    const now = await getNow()
    const nonce = await tokenInstance.methods.nonces(owner).call()

    if (name === config['dai'].name) {
      const message = {
        'holder': owner,
        'spender': config['router'].address,
        'nonce': nonce,
        'expiry': now + 60 * 60,
        'allowed': true,
      }

      const domainData = {
        'name': name,
        'verifyingContract': address,
        'version': version,
        'chainId': window.web3.currentProvider.networkVersion.toString()
      }

      const dataToSign = JSON.stringify({
        'types': {
            'EIP712Domain': domainType,
            'Permit': daiPermitType,
        },
        'domain': domainData,
        'primaryType': 'Permit',
        'message': message
      })

      const { r, s, v } = await sendToSign(message.holder, dataToSign)

      metaTxBody = {
        to: address,
        userAddress: message.holder,
        apiId: dappId,
        params: [
          message.holder,
          message.spender,
          message.nonce,
          message.expiry,
          message.allowed,
          v, r, s
        ],
      }
    } else {
      const message = {
        'owner': owner,
        'spender': config['router'].address,
        'value': MAX_UINT,
        'nonce': nonce,
        'deadline': now + 60 * 60,
      }

      const domainData = {
        'name': name,
        'verifyingContract': address,
        'version': version,
        'chainId': window.web3.currentProvider.networkVersion.toString()
      }

      const dataToSign = JSON.stringify({
        'types': {
            'EIP712Domain': domainType,
            'Permit': permitType,
        },
        'domain': domainData,
        'primaryType': 'Permit',
        'message': message
      })

      const { r, s, v } = await sendToSign(message.owner, dataToSign)

      metaTxBody = {
        to: address,
        userAddress: message.owner,
        apiId: dappId,
        params: [
          message.owner,
          message.spender,
          message.value,
          message.deadline,
          v, r, s
        ],
      }
    }


    return metaTxBody
  } catch (error) {
    throw error
  }
}

export const approveNonMetaTokens = (owner, tokenAddress) => {
  try {
    const { abi } = config['sun'] // Just an example ABI which supports approve method
    const { address } = config['router']
    const tokenInstance = new window.web3.eth.Contract(
      abi,
      tokenAddress
    )

    return tokenInstance.methods.approve(address, MAX_UINT).send({ from: owner })
  } catch (error) {
    throw error
  }
}

export const getTransferTokensData = async (owner, receiver, amount, tokenSymbol) => {
  try {
    const token = config[tokenSymbol]
    const { name, version, abi, address, dappId } = config['router']
    const routerInstance = new window.web3.eth.Contract(
      abi,
      address
    )

    const nonce = await routerInstance.methods.nonces(owner).call()
    const functionSignature = routerInstance.methods.tokenTransfer(receiver, amount, token.address).encodeABI()

    const message = {
      'nonce': nonce,
      'from': owner,
      'functionSignature': functionSignature
    }

    const domainData = {
      'name': name,
      'verifyingContract': address,
      'version': version,
      'chainId': window.web3.currentProvider.networkVersion.toString()
    }

    const dataToSign = JSON.stringify({
      'types': {
          'EIP712Domain': domainType,
          'MetaTransaction': metaTransactionType,
      },
      'domain': domainData,
      'primaryType': 'MetaTransaction',
      'message': message
    })

    const { r, s, v } = await sendToSign(message.from, dataToSign)
    const metaTxBody = {
      to: address,
      userAddress: message.from,
      apiId: dappId,
      params: [
        message.from,
        functionSignature,
        v, r, s
      ],
    }

    return metaTxBody
  } catch (error) {
    throw error
  }
}

export const getSwapTokensData = async (owner, amount, amountsOutMin, inputTokenName, outputTokenName, to) => {
  try {
    const { name, version, abi, address, dappId } = config['router']
    const routerInstance = new window.web3.eth.Contract(
      abi,
      address
    )

    const path = [
      config[inputTokenName].address,
      config[outputTokenName].address,
    ]

    const now = await getNow()
    const deadline = now + 60 * 60

    const nonce = await routerInstance.methods.nonces(owner).call()
    const functionSignature = routerInstance.methods.swapExactTokensForTokens(
      window.web3.utils.toWei(amount.toString(), 'ether'),
      window.web3.utils.toWei(amountsOutMin.toString(), 'ether'),
      path,
      to,
      deadline
    ).encodeABI()

    const message = {
      'nonce': nonce,
      'from': owner,
      'functionSignature': functionSignature
    }

    const domainData = {
      'name': name,
      'verifyingContract': address,
      'version': version,
      'chainId': window.web3.currentProvider.networkVersion.toString()
    }

    const dataToSign = JSON.stringify({
      'types': {
          'EIP712Domain': domainType,
          'MetaTransaction': metaTransactionType,
      },
      'domain': domainData,
      'primaryType': 'MetaTransaction',
      'message': message
    })

    const { r, s, v } = await sendToSign(message.from, dataToSign)

    const metaTxBody = {
      to: address,
      userAddress: message.from,
      apiId: dappId,
      params: [
        message.from,
        functionSignature,
        v, r, s
      ],
    }

    return metaTxBody
  } catch (error) {
    throw error
  }
}

export const getRequiredSunAmount = async () => {
  try {
    const { abi, address } = config['router']
    const routerInstance = new window.web3.eth.Contract(
      abi,
      address
    )

    const amount = await routerInstance.methods.necessarySunCoins().call()
    return numberWithCommas(window.web3.utils.fromWei(amount.toString(), 'ether'))
  } catch (error) {
    throw error
  }
}

export const getUserTokenBalance = async (user, tokenSymbol) => {
  try {
    const { abi, address } = config[tokenSymbol]
    const tokenInstance = new window.web3.eth.Contract(
      abi,
      address
    )

    const amount = await tokenInstance.methods.balanceOf(user).call()
    return numberWithCommas(window.web3.utils.fromWei(amount.toString(), 'ether'))
  } catch (error) {
    throw error
  }
}

export const isUserBlocked = async (user) => {
  try {
    const { abi, address } = config['router']
    const routerInstance = new window.web3.eth.Contract(
      abi,
      address
    )

    const isBlocked = await routerInstance.methods.senderBlocked(user).call()
    return isBlocked
  } catch (error) {
    throw error
  }
}

export const getAmountOut = async (inputAmount, inputTokenName, outputTokenName) => {
  try {
    const inputAmountWei = window.web3.utils.toWei(inputAmount.toString(), 'ether')

    const { abi, address } = config['router']
    const routerInstance = new window.web3.eth.Contract(
      abi,
      address
    )

    const path = [
      config[inputTokenName].address,
      config[outputTokenName].address,
    ]

    const amountsOut = await routerInstance.methods.getAmountsOut(inputAmountWei, path).call()
    const outputString = amountsOut[1].toString()
    return outputString
  } catch (error) {
    throw error
  }
}