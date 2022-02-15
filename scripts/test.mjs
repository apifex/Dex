import Web3 from 'web3'
import fs from 'fs'
import HDWalletProvider from '@truffle/hdwallet-provider';

const {mnemonic, infuraRinkeby} = JSON.parse(fs.readFileSync('./secrets.json'))

const provider = new HDWalletProvider(
    mnemonic, infuraRinkeby
)

const DEX = fs.readFileSync('./build/contracts/DEX.json')
const NFT = fs.readFileSync('./build/contracts/NFT.json')

const dexContract = JSON.parse(DEX)
const nftContract = JSON.parse(NFT)

const web3 = new Web3(provider)
const accounts = await web3.eth.getAccounts();
web3.eth.defaultAccount = accounts[0]

const dex = new web3.eth.Contract(dexContract.abi, '0xE705c20B5B7cEe760cCe1C86855848edfBF3cC9A')
const nft = new web3.eth.Contract(nftContract.abi, '0xC73076248c9bbF598B2Ff0e5A3c8a576E41DD487')

console.log('accounts', accounts)

const test = async () => {     
       
        let mintArrayAccounts = []
        let mintArrayIds = []
        let mintArrayJSONs= []

        for (let i=1; i<256; i++) {
            mintArrayAccounts.push(accounts[0])
            mintArrayIds.push(i)
            mintArrayJSONs.push(`${i}.json`)
        }
    
        // await nft.methods.setBaseURI('https://ipfs.io/ipfs/QmcR4CPMWQ6yadhPqH3eSeU7NxMhCDyMyFGZrC8GjT2tms/').send({from:accounts[0]})
        await nft.methods.safeMint(accounts[0], 1, '1.json', 1000).send({from:accounts[0]})
        // await nftContract.mintMultiple(mintArrayAccounts, mintArrayIds, mintArrayJSONs);
        
        console.log('Token 0 metadata URI', await nft.methods.tokenUri(1).call())
        // console.log('Token 1 metadata URI', await nftContract.tokenUri(1))
        // console.log('Token 2 metadata URI', await nftContract.tokenUri(2))
        // console.log('Token 3 metadata URI', await nftContract.tokenUri(3))
        // console.log('Token 255 metadata URI', await nftContract.tokenUri(255))

        await nft.methods.approve('0xE705c20B5B7cEe760cCe1C86855848edfBF3cC9A' ,1).send({from: accounts[0]})
        // await nftContract.approve('0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B' ,2)

        console.log('owner of 0: ', await nft.methods.ownerOf(1).call())
        // console.log('owner of 1: ', await nft.ownerOf(1))
        // console.log('owner of 2: ', await nft.ownerOf(2))
        
        console.log('get approved 0: ', await nft.methods.getApproved(1).call())
        // console.log('get approved 1: ', await nft.getApproved(1))

        await dex.methods.makeAuctionOrder('0xc73076248c9bbf598b2ff0e5a3c8a576e41dd487', 1, 200, 10000).send({from:accounts[0]})

        console.log((await nft.methods.tokenUri(0).call()).toString())
        // console.log(('ballance of', await NFTContract.balanceOf(accounts[0])).toString())
        // console.log('seller orders', (await DEXContract.sellerTotalOrder(accounts[0])).toString())
      
    
        // // let hash = '0x96b0d546c642218e78a6a2c49d59783e946e85ef14e7014f6d6d088c127322b3'
        // await DEXContract.bid(hash, {from: accounts[1], value: web3.utils.toWei("0.8", "ether")})
        // console.log((await DEXContract.getCurrentPrice(hash)).toString())
        // await DEXContract.bid(hash, {from: accounts[2], value: web3.utils.toWei("1", "ether")})
        // console.log((await DEXContract.getCurrentPrice(hash)).toString())
        
};  

await test()

