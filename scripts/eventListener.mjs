import Web3 from 'web3'
import fs from 'fs'

const DEX = fs.readFileSync('./build/contracts/DEX.json')

const dexContract = JSON.parse(DEX)
const web3 = new Web3(Web3.givenProvider || "ws://127.0.0.1:8545")

const dex = new web3.eth.Contract(dexContract.abi)
const accounts = await web3.eth.getAccounts();

dex.options.address = '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B'

const listen = () => {
    dex.events.MakeOrder()  
    .on('data', async event => {
        const currentPrice = await dex.methods.getCurrentPrice(event.returnValues.hash).call()
        console.log('current Price: ', currentPrice)    
    })
    .on('changed', changed => console.log(changed))
    .on('error', err => {console.log('errrr'); throw err})
    .on('connected', str => console.log(str))

    dex.events.allEvents()
    .on('data', event => console.log(event.event, event.returnValues))
    .on('changed', changed => console.log(changed))
    .on('error', err => {console.log('errrr'); throw err})
    .on('connected', str => console.log(str))
        
}
listen()