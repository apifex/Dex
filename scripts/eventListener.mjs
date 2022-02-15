import Web3 from 'web3'
import fs from 'fs'

const DEX = fs.readFileSync('./build/contracts/DEX.json')

const dexContract = JSON.parse(DEX)
const web3 = new Web3('wss://rinkeby.infura.io/ws/v3/bd9c8ad814d242b39573260354098076')

const dex = new web3.eth.Contract(dexContract.abi)
const accounts = await web3.eth.getAccounts();

dex.options.address = '0xE705c20B5B7cEe760cCe1C86855848edfBF3cC9A'

const listen = () => {
    dex.events.allEvents()
    .on('data', event => console.log(event.event, event.returnValues))
    .on('changed', changed => console.log(changed))
    .on('error', err => {console.log('errrr'); throw err})
    .on('connected', str => console.log(str))
        
}
listen()