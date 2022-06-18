const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');

const DEX = artifacts.require('DEX');
const NFT = artifacts.require("NFT");

contract('DEX', accounts => {
    let dex;
    let NFTContract;
    const prices = {
        startPrice: web3.utils.toWei("0.3", "ether"),
        fixedPrice: web3.utils.toWei("0.5", "ether"),
        higerPrice: web3.utils.toWei("0.8", "ether"),
        lowerPrice: web3.utils.toWei("0.1", "ether")
    }

    before(async function() {

        const initialize = async () => {
            dex = await DEX.deployed()
            NFTContract = await NFT.deployed()
            let mintArrayAccounts = []
            let mintArrayIds = []
            let mintArrayJSONs = []
            let mintArrayRoyalties = []
    
            for (let i = 0; i < 25; i++) {
                mintArrayAccounts.push(accounts[0])
                mintArrayIds.push(i)
                mintArrayJSONs.push(`${i}.json`)
                mintArrayRoyalties.push(200 * i)
            }
    
            await NFTContract.setBaseURI('https://ipfs.io/ipfs/QmcR4CPMWQ6yadhPqH3eSeU7NxMhCDyMyFGZrC8GjT2tms/')
            await NFTContract.mintMultiple(mintArrayAccounts, mintArrayIds, mintArrayJSONs, mintArrayRoyalties);
            await NFTContract.safeMint(accounts[1], 99, '99.json', 1000)
            await NFTContract.setApprovalForAll(dex.address, true)
        }

        await initialize()
    })

    it('make auction order', async function () {
        const auctionOrder = await dex.makeAuctionOrder(NFT.address, 0, prices.startPrice, 1000)
        const orderId = auctionOrder.logs[0].args.orderId

        truffleAssert.eventEmitted(auctionOrder, "MakeOrder", (event) => {
            return (
                event.tokenContract == NFT.address &&
                event.tokenId == 0 &&
                event.orderId == orderId &&
                event.seller == accounts[0] &&
                event.orderType == 0 &&
                event.startPrice == prices.startPrice &&
                event.buyItNowPrice == 0)
        })

        const sellerTotalOrder = await dex.sellerTotalOrder(accounts[0])
        const currentPrice = await dex.getCurrentPrice(orderId)
        const orderStatus = await dex.getOrderStatus(orderId);
        expect(sellerTotalOrder.toString()).to.equal('1')
        expect(currentPrice.toString()).to.equal(prices.startPrice)
        expect(orderStatus.toString()).to.equal('active')
    })

    it('revert on wrong auction order', async function () {

        await truffleAssert.reverts(
            dex.makeAuctionOrder(NFT.address, 1, 200, 0),
            "Duration must be longer than zero"
        )
        await truffleAssert.reverts(
            dex.makeAuctionOrder(NFT.address, 99, 200, 1000),
            "DEX Contract must be approved to make transaction with this token ID"
        )

        await truffleAssert.reverts(
            dex.makeAuctionOrder(NFT.address, 0, 200, 1000),
            "There is already an order for this token ID"
        )
        await truffleAssert.reverts(
            dex.makeAuctionOrder(NFT.address, 1, 0, 1000),
            "Price must be more than 0"
        )
    })


    it('make fixed order', async function () {
        const fixedOrder = await dex.makeFixedPriceOrder(NFT.address, 1, prices.fixedPrice, 2000)
        const orderId = fixedOrder.logs[0].args.orderId
        truffleAssert.eventEmitted(fixedOrder, "MakeOrder", (event) => {
            return (
                event.tokenContract == NFT.address &&
                event.tokenId == 1 &&
                event.orderId == orderId &&
                event.seller == accounts[0] &&
                event.orderType == 1 &&
                event.startPrice == 0 &&
                event.buyItNowPrice == prices.fixedPrice)

        })
        const sellerTotalOrder = await dex.sellerTotalOrder(accounts[0])
        const currentPrice = await dex.getCurrentPrice(orderId)
        const orderStatus = await dex.getOrderStatus(orderId);
        expect(sellerTotalOrder.toString()).to.equal('2')
        expect(currentPrice.toString()).to.equal(prices.fixedPrice)
        expect(orderStatus.toString()).to.equal('active')
    })


    it('revert on wrong fixed order', async function () {
        await truffleAssert.reverts(
            dex.makeFixedPriceOrder(NFT.address, 2, 200, 0),
            "Duration must be longer than zero"
        )
        await truffleAssert.reverts(
            dex.makeFixedPriceOrder(NFT.address, 99, 200, 1000),
            "DEX Contract must be approved to make transaction with this token ID"
        )
        await truffleAssert.reverts(
            dex.makeFixedPriceOrder(NFT.address, 0, 200, 1000),
            "There is already an order for this token ID"
        )
        await truffleAssert.reverts(
            dex.makeFixedPriceOrder(NFT.address, 2, 0, 1000),
            "Price must be more than 0"
        )
    })

    it('make mixed order', async function () {
        const mixedOrder = await dex.makeMixedOrder(NFT.address, 2, prices.startPrice, prices.fixedPrice, 2000)
        const orderId = mixedOrder.logs[0].args.orderId
        truffleAssert.eventEmitted(mixedOrder, "MakeOrder", (event) => {
            return (
                event.tokenContract == NFT.address &&
                event.tokenId == 2 &&
                event.orderId == orderId &&
                event.seller == accounts[0] &&
                event.orderType == 2 &&
                event.startPrice == prices.startPrice &&
                event.buyItNowPrice == prices.fixedPrice)

        })

        const sellerTotalOrder = await dex.sellerTotalOrder(accounts[0])
        const currentPrice = await dex.getCurrentPrice(orderId)
        const orderStatus = await dex.getOrderStatus(orderId);
        expect(sellerTotalOrder.toString()).to.equal('3')
        expect(currentPrice.toString()).to.equal(prices.startPrice)
        expect(orderStatus.toString()).to.equal('active')
    })


    it('revert on wrong mixed order', async function () {
        await truffleAssert.reverts(
            dex.makeMixedOrder(NFT.address, 3, 300, 400, 0),
            "Duration must be longer than zero"
        )
        await truffleAssert.reverts(
            dex.makeMixedOrder(NFT.address, 99, 300, 400, 1000),
            "DEX Contract must be approved to make transaction with this token ID"
        )
        await truffleAssert.reverts(
            dex.makeMixedOrder(NFT.address, 0, 300, 400, 1000),
            "There is already an active order for this token ID"
        )
        await truffleAssert.reverts(
            dex.makeMixedOrder(NFT.address, 3, 100, 0, 1000),
            "Price must be more than 0 and 'buyItNowPrice' must be greater than 'startPrice'"
        )
    })


    it('make bid offert', async function () {
        const auctionOrder = await dex.makeAuctionOrder(NFT.address, 4, prices.startPrice, 3)
        const auctionOrderID = auctionOrder.logs[0].args.orderId

        const bid = await dex.bid(auctionOrderID, { from: accounts[3], value: prices.startPrice })

        truffleAssert.eventEmitted(bid, "Bid", (event) => {
            return (
                event.tokenContract == NFT.address &&
                event.tokenId == 4 &&
                event.bidder == accounts[3] &&
                event.bidPrice == prices.startPrice)
        })

        const bid2 = await dex.bid(auctionOrderID, { from: accounts[4], value: prices.higerPrice })

        truffleAssert.eventEmitted(bid2, "Bid", (event) => {
            return (
                event.tokenContract == NFT.address &&
                event.tokenId == 4 &&
                event.bidder == accounts[4] &&
                event.bidPrice == prices.higerPrice)
        })
        
        const currentPrice = await dex.getCurrentPrice(auctionOrderID)

        expect(currentPrice.toString()).to.equal(prices.higerPrice)

        const orderStatus = await dex.getOrderStatus(auctionOrderID);
        expect(orderStatus.toString()).to.equal('active')
    })


    it('revert on wrong bid offert', async function () {
        const auctionOrder = await dex.makeAuctionOrder(NFT.address, 5, prices.startPrice, 3)
        const auctionOrderID = auctionOrder.logs[0].args.orderId
        const fixedOrder = await dex.makeFixedPriceOrder(NFT.address, 6, prices.fixedPrice, 2000)
        const fixedOrderID = fixedOrder.logs[0].args.orderId
        const canceled = await dex.makeMixedOrder(NFT.address, 7, prices.startPrice, prices.fixedPrice, 1000)
        const canceledID = canceled.logs[0].args.orderId
        await dex.cancelOrder(canceledID)

        await truffleAssert.reverts(
            dex.bid(fixedOrderID, { from: accounts[3], value: prices.higerPrice }),
            "Can not bid to this 'fixed price' order"
        )

        await truffleAssert.reverts(
            dex.bid(auctionOrderID, { from: accounts[0], value: prices.higerPrice }),
            "Can not bid to your order"
        )

        await truffleAssert.reverts(
            dex.bid(auctionOrderID, { from: accounts[3], value: prices.lowerPrice }),
            "Price can't be less than 'start price'"
        )

        await dex.bid(auctionOrderID, { from: accounts[3], value: prices.higerPrice })
        await truffleAssert.reverts(
            dex.bid(auctionOrderID, { from: accounts[4], value: prices.higerPrice }),
            "Price is too low (min +5% required)"
        )

        await truffleAssert.reverts(
            dex.bid(canceledID, { from: accounts[5], value: prices.higerPrice }),
            "This order is over or canceled"
        )
    })

    it('buy it now from FixedPriceOrder', async function () {
        const fixedOrder = await dex.makeFixedPriceOrder(NFT.address, 8, prices.fixedPrice, 2000)
        const fixedOrderID = fixedOrder.logs[0].args.orderId
       
        const buyItNow = await dex.buyItNow(fixedOrderID, { from: accounts[3], value: prices.fixedPrice })

        truffleAssert.eventEmitted(buyItNow, "Claim", (event) => {
            return (
                event.tokenContract == NFT.address &&
                event.tokenId == 8 &&
                event.orderId == fixedOrderID &&
                event.seller == accounts[0] &&
                event.taker == accounts[3] &&
                event.price == prices.fixedPrice)
        })

        const tokenOwner = await NFTContract.ownerOf(8)
        expect(tokenOwner.toString()).to.equal(accounts[3])

        const orderStatus = await dex.getOrderStatus(fixedOrderID);
        expect(orderStatus.toString()).to.equal('sold')

    })

    it('buy it now from MixedOrder', async function () {
        const mixedOrder = await dex.makeMixedOrder(NFT.address, 9, prices.startPrice, prices.fixedPrice, 3)
        const mixedOrderID = mixedOrder.logs[0].args.orderId

        const buyItNow = await dex.buyItNow(mixedOrderID, { from: accounts[4], value: prices.fixedPrice })

        truffleAssert.eventEmitted(buyItNow, "Claim", (event) => {
            return (
                event.tokenContract == NFT.address &&
                event.tokenId == 9 &&
                event.orderId == mixedOrderID &&
                event.seller == accounts[0] &&
                event.taker == accounts[4] &&
                event.price == prices.fixedPrice)
        })

        const tokenOwner = await NFTContract.ownerOf(9)
        expect(tokenOwner.toString()).to.equal(accounts[4])

        const orderStatus = await dex.getOrderStatus(mixedOrderID);
        expect(orderStatus.toString()).to.equal('sold')

    })


    it('revert on wrong buyItNow offert', async function () {
        const auctionOrder = await dex.makeAuctionOrder(NFT.address, 10, prices.startPrice, 3)
        const auctionOrderID = auctionOrder.logs[0].args.orderId
        const fixedOrder = await dex.makeFixedPriceOrder(NFT.address, 11, prices.fixedPrice, 2000)
        const fixedOrderID = fixedOrder.logs[0].args.orderId
        const canceled = await dex.makeMixedOrder(NFT.address, 12, prices.startPrice, prices.fixedPrice, 1000)
        const canceledID = canceled.logs[0].args.orderId
        await dex.cancelOrder(canceledID)


        await truffleAssert.reverts(
            dex.buyItNow(canceledID, { from: accounts[3], value: prices.higerPrice }),
            "This order is over or canceled"
        )

        await truffleAssert.reverts(
            dex.buyItNow(auctionOrderID, { from: accounts[3], value: prices.higerPrice }),
            "You can't 'buy it now'"
        )

        await truffleAssert.reverts(
            dex.buyItNow(fixedOrderID, { from: accounts[3], value: prices.higerPrice }),
            "Wrong price for 'Buy it now!'"
        )
    })

    it('claim', async function () {
        const auctionOrder = await dex.makeAuctionOrder(NFT.address, 13, prices.startPrice, 2)
        const auctionOrderID = auctionOrder.logs[0].args.orderId
        const mixedOrder = await dex.makeMixedOrder(NFT.address, 14, prices.startPrice, prices.fixedPrice, 2)
        const mixedOrderID = mixedOrder.logs[0].args.orderId

        await dex.bid(auctionOrderID, { from: accounts[3], value: prices.higerPrice })

        await dex.bid(mixedOrderID, { from: accounts[3], value: prices.startPrice })
        await dex.bid(mixedOrderID, { from: accounts[4], value: prices.higerPrice })


        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(8000)

        const claim_afterAuction = await dex.claim(auctionOrderID, { from: accounts[3] })

        truffleAssert.eventEmitted(claim_afterAuction, "Claim", (event) => {
            return (
                event.tokenContract == NFT.address &&
                event.tokenId == 13 &&
                event.orderId == auctionOrderID &&
                event.seller == accounts[0] &&
                event.taker == accounts[3] &&
                event.price == prices.higerPrice)
        })

        const tokenOwner = await NFTContract.ownerOf(13)
        expect(tokenOwner.toString()).to.equal(accounts[3])

        const orderStatus = await dex.getOrderStatus(auctionOrderID);
        expect(orderStatus.toString()).to.equal('sold')

        const claim_afterMixed = await dex.claim(mixedOrderID, { from: accounts[4] })

        truffleAssert.eventEmitted(claim_afterMixed, "Claim", (event) => {
            return (
                event.tokenContract == NFT.address &&
                event.tokenId == 14 &&
                event.orderId == mixedOrderID &&
                event.seller == accounts[0] &&
                event.taker == accounts[4] &&
                event.price == prices.higerPrice)
        })

        const token2Owner = await NFTContract.ownerOf(14)
        expect(token2Owner.toString()).to.equal(accounts[4])

        const order2Status = await dex.getOrderStatus(mixedOrderID);
        expect(order2Status.toString()).to.equal('sold')
    })

    
    it('revert on wrong claim', async function () {
        const auctionOrder = await dex.makeAuctionOrder(NFT.address, 15, prices.startPrice, 2)
        const auctionOrderID = auctionOrder.logs[0].args.orderId
        const fixedOrder = await dex.makeFixedPriceOrder(NFT.address, 16, prices.fixedPrice, 2)
        const fixedOrderID = fixedOrder.logs[0].args.orderId

        await dex.bid(auctionOrderID, { from: accounts[3], value: prices.higerPrice })
        await truffleAssert.reverts(
            dex.claim(auctionOrderID, { from: accounts[3] }),
            "This order is not finish yet"
        )

        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(8000)
        await truffleAssert.reverts(
            dex.claim(fixedOrderID, { from: accounts[3] }),
            "This order is not an auction"
        )

        await truffleAssert.reverts(
            dex.claim(auctionOrderID, { from: accounts[4] }),
            "Access denied"
        )
    })

    it('cancel order', async function () {
        const order = await dex.makeAuctionOrder(NFT.address, 17, prices.startPrice, 1)
        const orderId = order.logs[0].args.orderId

        const cancel = await dex.cancelOrder(orderId)

        truffleAssert.eventEmitted(cancel, "CancelOrder", (event) => {
            return (
                event.tokenContract == NFT.address &&
                event.tokenId == 17 &&
                event.orderId == orderId &&
                event.seller == accounts[0])
        })

        const orderStatus = await dex.getOrderStatus(orderId);
        expect(orderStatus.toString()).to.equal('canceled')
    })


    it('revert on wrong cancel', async function () {
        const auctionOrder = await dex.makeAuctionOrder(NFT.address, 18, prices.startPrice, 2)
        const auctionOrderID = auctionOrder.logs[0].args.orderId

        await dex.bid(auctionOrderID, { from: accounts[3], value: prices.startPrice })

        await truffleAssert.reverts(
            dex.cancelOrder(auctionOrderID, { from: accounts[4] }),
            "Access denied"
        )

        await truffleAssert.reverts(
            dex.cancelOrder(auctionOrderID),
            "Bidding exist"
        )

        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(8000)

        await truffleAssert.reverts(
            dex.cancelOrder(auctionOrderID),
            "This order is not active"
        )

    })

    it('get ordersList', async function ()   {
       const orderList_before = await dex.getOrdersList()

        const auctionOrder = await dex.makeAuctionOrder(NFT.address, 19, prices.startPrice, 3)
        const auctionOrderID = auctionOrder.logs[0].args.orderId
        const fixedOrder = await dex.makeFixedPriceOrder(NFT.address, 20, prices.fixedPrice, 2000)
        const fixedOrderID = fixedOrder.logs[0].args.orderId
        
        const orderList_after = await dex.getOrdersList()
        
        expect(orderList_before.length == orderList_after +2)
        expect(orderList_after[orderList_after.length-1] == fixedOrderID)
        expect(orderList_after[orderList_after.length-2] == auctionOrderID)
    
    })

    it('get orderInfo', async function ()   {
         const auctionOrder = await dex.makeAuctionOrder(NFT.address, 21, prices.startPrice, 30)
         const auctionOrderID = auctionOrder.logs[0].args.orderId
    
         const orderInfo = await dex.getOrderInfo(auctionOrderID)

         expect(orderInfo.tokenAddress == NFT.address)
         expect(orderInfo.tokenId == 21)
         expect(orderInfo.startPrice == prices.startPrice)
     
     })

})

