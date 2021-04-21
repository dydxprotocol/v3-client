/**
 * Simple JavaScript example demonstrating authentication with private WebSockets channels.
 */

const { DydxClient } = require('@dydxprotocol/v3-client')
const Web3 = require('web3')
const WebSocket = require('ws')

const HTTP_HOST = 'https://api.dydx.exchange'
const WS_HOST = 'wss://api.dydx.exchange/v3/ws'

// NOTE: Set up web3 however your prefer to authenticate to your Ethereum account.
web3 = new Web3()
web3.eth.accounts.wallet.add(process.env.ETHEREUM_PRIVATE_KEY)

;((async () => {

  client = new DydxClient(HTTP_HOST, { web3 })
  const apiCreds = await client.onboarding.recoverDefaultApiCredentials(address)
  client.apiKeyCredentials = apiCreds

  const timestamp = new Date().toISOString()
  const signature = client.private.sign({
    requestPath: '/ws/accounts',
    method: 'GET',
    isoTimestamp: timestamp,
  })
  const msg = {
    type: 'subscribe',
    channel: 'v3_accounts',
    accountNumber: '0',
    apiKey: apiCreds.key,
    signature,
    timestamp,
    passphrase: apiCreds.passphrase
  }

  const ws = new WebSocket(WS_HOST)

  ws.on('message', (message) => {
    console.log('<', message)
  })

  ws.on('open', () => {
    console.log('>', msg)
    ws.send(JSON.stringify(msg))
  })

  ws.on('error', (error) => {
    console.log('<', error)
  })

  ws.on('close', () => {
    console.log('Connection closed')
  })

})()).then(() => console.log('Done')).catch(console.error)
