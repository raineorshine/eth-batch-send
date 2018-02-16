const Web3 = require('web3')
const Tx = require('ethereumjs-tx')
const config = require('./config.json')
const secureConfig = require('./secure-config.json')
const addresses = require('./addresses.json')

const web3 = new Web3(new Web3.providers.HttpProvider(secureConfig.web3Provider))

const addressFrom = secureConfig.address
const amount = web3.utils.toWei(config.amount)

// sign and send
// @param txData { nonce, gasLimit, gasPrice, to, from, value }
function sendSigned(txData, cb) {
  const privateKey = new Buffer(secureConfig.privKey, 'hex')
  const transaction = new Tx(txData)
  transaction.sign(privateKey)
  const serializedTx = transaction.serialize().toString('hex')
  web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
}

// get the nonce
web3.eth.getTransactionCount(addressFrom).then(txCount => {

  // send to each address
  addresses.forEach((addressTo, i) => {
    const txData = {
      nonce: web3.utils.toHex(txCount + i),
      gasLimit: web3.utils.toHex(config.gasLimit),
      gasPrice: web3.utils.toHex(config.gasPrice),
      to: addressTo,
      from: addressFrom,
      value: web3.utils.toHex(amount)
    }

    // sign and send
    sendSigned(txData, function(err, result) {
      if (err) return console.log('error', err)
      console.log(`Sent ${config.amount} ETH to ${txData.to} in tx #${result}`)
    })
  })

})

