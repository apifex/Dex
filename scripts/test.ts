import { ethers, utils } from "ethers";
import {mnemonic, infuraKey} from "../secrets.json";


async function metaMask() {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic)
    // console.log(account)

    console.log(wallet.address)
    await wallet.signMessage('hello')
    let tx = {
        to: '0x8F46CeCCA40c4bBDa75b13148D6196C74a875311',
        value: utils.parseEther('0.01')
    }
    await wallet.signTransaction(tx)
    let provider =  new ethers.providers.InfuraProvider("rinkeby", infuraKey)
    
    let defaultProvider = ethers.getDefaultProvider("rinkeby")
    let bal = await defaultProvider.getBalance(wallet.address)
    console.log(bal.toString())

    let wal = wallet.connect(provider)
    let address = await wal.getAddress()
    let ballance = await wal.getBalance()
    let chainId = await wal.getChainId()
    let gasPrice = await wal.getGasPrice()
    let count = await wal.getTransactionCount()
    console.log(address)
    console.log(ballance.toString())
    console.log(count)
    console.log(chainId)
    console.log(gasPrice.toString())

    await wal.sendTransaction(tx)

}

metaMask()