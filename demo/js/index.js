const Web3 = require('web3')
const Biconomy = require('@biconomy/mexa')
const { config } = require('./config')
const sigUtil = require('eth-sig-util')

let web3
let contract
let erc20Contract
let biconomy
let networkName

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

const domainTypeEIP2585 = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
]

const MetaTransactionType = [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'chainId', type: 'uint256' },
    { name: 'replayProtection', type: 'address' },
    { name: 'nonce', type: 'bytes' },
    { name: 'data', type: 'bytes' },
    { name: 'innerMessageHash', type: 'bytes32' },
]

const domainData = {
    name: 'Forwarder',
    version: '1',
}

const domainDataERC20 = {
    version: '1',
}

const showFaucetLink = function () {
    if (networkName == 'rinkeby') {
      DAILink = 'https://rinkeby.etherscan.io/address/0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735#writeContract'
    }

    const x = document.createElement('LABEL')
    const a1 = document.createElement('a')
    a1.href = DAILink
    a1.title = 'faucet'
    a1.target = '_blank'
    const link1 = document.createTextNode('DAI faucet: mint yourself 100000000000000000000 (100 DAI)')
    a1.appendChild(link1)
    document.body.prepend(x)
    const br = document.createElement('br')
    a1.appendChild(br)
    document.body.prepend(a1)
}

const forwarderEIP2585 = async function (_data) {
    var EIP712ForwarderContract = new web3.eth.Contract(
        config.contract.EIP712forwarderABI,
        config[networkName].EIP712forwarderAddress
    )
    signer = ethereum.selectedAddress
    var from = signer
    var to = config[networkName].routerAddress
    var value = 0
    var chainId = await web3.eth.net.getId()
    var replayProtection = config[networkName].EIP712forwarderAddress
    var batchId = 0
    var batchNonce = await EIP712ForwarderContract.methods
        .getNonce(signer, batchId)
        .call()
    var value1 = batchId * Math.pow(2, 128) + batchNonce
    var valueBn = new web3.utils.BN(value1)
    var nonce = await web3.eth.abi.encodeParameter('uint256', valueBn)
    // var decoded = await web3.eth.abi.decodeParameter("uint256", nonce);
    // console.log(decoded);
    var data = _data
    var innerMessageHash =
        '0x0000000000000000000000000000000000000000000000000000000000000000'
    var forwardMessage = {
        from: from,
        to: to,
        value: 0,
        chainId,
        replayProtection: replayProtection,
        nonce: nonce,
        data,
        innerMessageHash: innerMessageHash,
    }
    var signatureData = {
        types: {
            EIP712Domain: domainTypeEIP2585,
            MetaTransaction: MetaTransactionType,
        },
        domain: domainData,
        primaryType: 'MetaTransaction',
        message: forwardMessage,
    }

    var sigString = JSON.stringify(signatureData)
    web3.providers.HttpProvider.prototype.sendAsync =
        web3.providers.HttpProvider.prototype.send

    web3.currentProvider.sendAsync(
        {
            method: 'eth_signTypedData_v4',
            params: [signer, sigString],
            from: signer,
        },
        function (err, result) {
            if (err) {
                return console.error(err)
            }

            var signatureType = {
                SignatureType: 0,
            }

            // var signatureType = 2;
            const signature = result.result
            let tx = EIP712ForwarderContract.methods
                .forward(forwardMessage, 0, signature)
                .send({ from: signer }, (err, res) => {
                    if (err) console.log(err)
                    else console.log(res)
                })

            tx.on('transactionHash', function (hash) {
                console.log(`Transaction hash is ${hash}`)
                var a = document.createElement('a')
                let tempString
                if (networkName == 'rinkeby') {
                    tempString = 'https://rinkeby.etherscan.io/tx/' + hash
                }
                a.href = tempString
                a.title = tempString
                var link = document.createTextNode(tempString)
                a.appendChild(link)
                // document.body.prepend(a)
                // var br = document.createElement('br')
                // a.appendChild(br)
                alert(a)
            }).once('confirmation', function (confirmationNumber, receipt) {
                console.log(receipt)
            })
        }
    )
}

const connectWallet = async function () {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        // Ethereum user detected. You can now use the provider.
        const provider = window['ethereum']
        let accounts = await provider.enable()
        document.getElementById('toWhom').value = accounts[0]
        var _chainId = provider.networkVersion

        //var chainId = parseInt(_chainId);
        domainDataERC20.chainId = _chainId

        if (_chainId == 4) {
          networkName = 'rinkeby'
        } else {
          alert("Please switch to Rinkeby network!")
          return
        }

        showFaucetLink()
        web3 = new Web3(provider)
        if (networkName === 'rinkeby') {
          biconomy = new Biconomy(window.ethereum, {
            apiKey: 'sdLlgS_TO.8a399db4-82ec-410c-897b-c77faab1ad1d',
            debug: 'true',
        })
          web3 = new Web3(biconomy)
          biconomy
          .onEvent(biconomy.READY, async () => {
              //await justTrying();
          })
          .onEvent(biconomy.ERROR, (error, message) => {
              console.log(error, message)
          })
        }

        contract = new web3.eth.Contract(
            config.contract.routerABI,
            config[networkName].routerAddress
        )
    } else {
        alert('Install Metamask first:  https://metamask.io/ ')
    }
}

const getSignatureParameters = (signature) => {
    if (!web3.utils.isHexStrict(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        )
    }
    var r = signature.slice(0, 66)
    var s = '0x'.concat(signature.slice(66, 130))
    var v = '0x'.concat(signature.slice(130, 132))
    v = web3.utils.hexToNumber(v)
    if (![27, 28].includes(v)) v += 27
    return {
        r: r,
        s: s,
        v: v,
    }
}

const sendPermitTransaction = async (
    owner,
    spender,
    value,
    deadline,
    v,
    r,
    s
) => {
    if (web3 && erc20Contract) {
        try {
            let gasLimit = await erc20Contract.methods
                .permit(owner, spender, value, deadline, v, r, s)
                .estimateGas({ from: owner })
            let gasPrice = await web3.eth.getGasPrice()
            let tx = erc20Contract.methods
                .permit(owner, spender, value, deadline, v, r, s)
                .send({
                    from: owner,
                    gasPrice: web3.utils.toHex(gasPrice),
                    gasLimit: web3.utils.toHex(gasLimit),
                })

            tx.on('transactionHash', function (hash) {
                console.log(`Transaction hash is ${hash}`)
            }).once('confirmation', function (confirmationNumber, receipt) {
                let elements = document.getElementsByClassName('loader')
                elements[0].style.display = 'none'
                alert('tokens unlocked')
            })
        } catch (error) {
            console.log(error)
        }
    }
}

const getPermit = async function (token, _value) {
    let value = web3.utils.toWei(_value)
    erc20Contract = new web3.eth.Contract(
        config.contract.erc20ABI,
        config[networkName][token]
    )

    let message = {}
    var userAddress = ethereum.selectedAddress
    var owner = userAddress
    var spender = config[networkName].routerAddress
    var now = await getNow()
    var deadline = now + 60 * 60
    var nonce = await erc20Contract.methods.nonces(userAddress).call()

    message.owner = userAddress
    message.spender = spender
    message.value = value
    message.nonce = parseInt(nonce)
    message.deadline = deadline

    domainDataERC20.name = token
    domainDataERC20.verifyingContract = config[networkName][token]

    const dataToSign = {
        types: {
            EIP712Domain: domainType,
            Permit: permitType,
        },
        domain: domainDataERC20,
        primaryType: 'Permit',
        message: message,
    }
    const sigString = JSON.stringify(dataToSign)

    web3.currentProvider.send(
        {
            jsonrpc: '2.0',
            id: 999999999999,
            method: 'eth_signTypedData_v4',
            params: [userAddress, sigString],
        },
        function (error, response) {
            let elements = document.getElementsByClassName('loader')
            elements[0].style.display = 'inline-block'
            let { r, s, v } = getSignatureParameters(response.result)
            sendPermitTransaction(owner, spender, value, deadline, v, r, s)
        }
    )
}

const getNow = async function () {
    var latestBlock = await web3.eth.getBlock('latest')
    var now = latestBlock.timestamp
    return parseInt(now)
}

// function getAmountWithDecimals(_tokenAmount) {
//     var decimals = web3.utils.toBN(18)
//     var tokenAmount = web3.utils.toBN(_tokenAmount)
//     var tokenAmountHex = tokenAmount.mul(web3.utils.toBN(10).pow(decimals))
//     return web3.utils.toHex(tokenAmountHex)
// }

const getAmountOut = async function (
    inputAmount,
    inputTokenName,
    outputTokenName
) {
    if (web3 && contract) {
        let path = [
            config[networkName][inputTokenName],
            config[networkName][outputTokenName],
        ]
        // let inputAmountDecimals = getAmountWithDecimals(inputAmount)
        // console.log(inputAmountDecimals)

        let amountsOut = await contract.methods
            .getAmountsOut(inputAmount, path)
            .call()
        let outputString = amountsOut[1].toString()
        return outputString
    } else {
        alert('coninputAmountnectWallet first')
    }
}

const swapExactTokensForTokens = async function (
    amount,
    inputTokenName,
    outputTokenName,
    to
) {
    var now = await getNow()
    var deadline = now + 60 * 60
    let path = [
        config[networkName][inputTokenName],
        config[networkName][outputTokenName],
    ]
    let amountsOutMin = await getAmountOut(
        amount,
        inputTokenName,
        outputTokenName
    )
    let data = contract.methods
        .swapExactTokensForTokens(
            web3.utils.toWei(amount.toString(), 'ether'),
            amountsOutMin,
            path,
            to,
            deadline
        )
        .encodeABI()
    // web3.eth.sendTransaction({from:from,to:config[networkName].routerAddress,data:data});
    forwarderEIP2585(data)
}

const getBalanceERC20 = async function (ERC20address, wadAddress) {
    let tempERC20Contract = new web3.eth.Contract(
        config.contract.erc20ABI,
        ERC20address
    )
    let balance = await tempERC20Contract.methods.balanceOf(wadAddress).call()
    let balanceWithDecimals = web3.utils.fromWei(balance)
    return balanceWithDecimals
}

const getMax = async function (inputElementId, outputElementId) {
    let wadAddress = ethereum.selectedAddress
    let inputToken = document.getElementById(inputElementId)
    let inputTokenName = inputToken.options[inputToken.selectedIndex].value
    let inputTokenAddress = config[networkName][inputTokenName]

    let balance = await getBalanceERC20(inputTokenAddress, wadAddress)
    document.getElementById(outputElementId).value = balance
}

const swap = async function () {
    let inputToken = document.getElementById('inputToken')
    let inputTokenName = inputToken.options[inputToken.selectedIndex].value
    let outputToken = document.getElementById('outputToken')
    let outputTokenName = outputToken.options[outputToken.selectedIndex].value
    let toWhom = document.getElementById('toWhom').value

    let inputAmount = document.getElementById('input').value
    await swapExactTokensForTokens(
        inputAmount,
        inputTokenName,
        outputTokenName,
        toWhom
    )
}

const unlockToken = async function (inputSelectElementId, inputValueElementId) {
    let inputToken = document.getElementById(inputSelectElementId)
    let inputTokenName = inputToken.options[inputToken.selectedIndex].value
    let inputAmount = document.getElementById(inputValueElementId).value
    await getPermit(inputTokenName, inputAmount)
}

const getExchangeRate = async function () {
    let inputToken = document.getElementById('inputToken')
    let inputTokenName = inputToken.options[inputToken.selectedIndex].value
    let outputToken = document.getElementById('outputToken')
    let outputTokenName = outputToken.options[outputToken.selectedIndex].value

    let inputAmount = document.getElementById('input').value
    let amountsInDecimals = web3.utils.toWei(inputAmount, 'ether')

    let amountsOutDecimals = await getAmountOut(
        amountsInDecimals,
        inputTokenName,
        outputTokenName
    )
    let amountOut = web3.utils.fromWei(amountsOutDecimals, 'ether')
    document.getElementById('output').value = amountOut

    // // let amountsOut = web3.utils.fromWei(amountsOutDecimals,"ether");
}

// const addLiquidity = async function () {
//     let inputToken1 = document.getElementById('inputToken1')
//     let inputToken1Name = inputToken1.options[inputToken1.selectedIndex].value
//     let inputToken2 = document.getElementById('inputToken2')
//     let inputToken2Name = inputToken1.options[inputToken2.selectedIndex].value

//     let inputAmount1 = document.getElementById('input1').value
//     let inputAmount2 = document.getElementById('input2').value

//     let toWhom = document.getElementById('toWhom1').value
//     let now = await getNow()
//     let expiry = now + 3600
//     console.log(toWhom)

//     let data = contract.methods
//         .addLiquidity(
//             config[networkName][inputToken1Name],
//             config[networkName][inputToken2Name],
//             web3.utils.toWei(inputAmount1.toString(), 'ether'),
//             web3.utils.toWei(inputAmount2.toString(), 'ether'),
//             0,
//             0,
//             toWhom,
//             expiry
//         )
//         .encodeABI()
//     forwarderEIP2585(data)
// }

// init();

var moduleTry = {
    connectWallet,
    getExchangeRate,
    swap,
    unlockToken,
    getMax,
    // addLiquidity,
}
module.exports = moduleTry
