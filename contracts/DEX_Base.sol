// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IERC721.sol";
import "../interfaces/IERC2981.sol";
import "../interfaces/IDEX.sol";
import "./DEX_Internal.sol";
import "./DEX_Validators.sol";

abstract contract DEX_Base is DEX_Internal, DEX_Validators, IDEX {

     function _makeOrder(
        OrderType _orderType,
        IERC721 _tokenContract,
        uint256 _tokenId,
        uint256 _startPrice,
        uint256 _fixedPrice,
        uint256 _endTime
    ) internal {
        _isValidOrder(_orderType, _tokenContract, _tokenId, _startPrice, _fixedPrice, _endTime);
        
        bytes32 orderID = _makeOrderID(_tokenContract, _tokenId, msg.sender);
        
        orderBook[orderID] = Order(
            _orderType,
            OrderStatus.ACTIVE,
            msg.sender,
            _tokenContract,
            _tokenId,
            _startPrice,
            _fixedPrice,
            block.timestamp,
            _endTime,
            0,
            address(0)
        );
        
        orderIdByToken[_tokenContract][_tokenId] = orderID;
        orderIdBySeller[msg.sender].push(orderID);
        
        emit MakeOrder(_tokenContract, _tokenId, orderID, msg.sender, uint8(_orderType), _startPrice, _fixedPrice);
    }
    
    function _getCurrentPrice(bytes32 _order)
        internal
        view
        returns (uint256 price)
    {
        Order memory order = orderBook[_order];
        require(order.status == OrderStatus.ACTIVE, "This order is over or canceled");
        uint256 lastBidPrice = order.lastBidPrice;
        if (order.orderType == OrderType.FIXED) {
            return order.fixedPrice;
        } else if (order.orderType == OrderType.AUCTION) {
            return lastBidPrice == 0 ? order.startPrice : lastBidPrice;
        } else if (order.orderType == OrderType.MIXED) {
            return lastBidPrice == 0 ? order.startPrice : lastBidPrice;
        }
    }

    function _bid(bytes32 _order) internal {
        _updateOrderStatus(_order);
        require(_isValidBidOffer(_order));

        Order storage order = orderBook[_order];
        
        if (block.timestamp > order.endTime - 5 seconds) {
            order.endTime += 5 seconds;
        }

        if (order.lastBidPrice != 0) {
            payable(order.lastBidder).transfer(order.lastBidPrice);
        }

        order.lastBidder = msg.sender;
        order.lastBidPrice = msg.value;

        emit Bid(order.tokenContract, order.tokenId, _order, msg.sender, msg.value);
    }

    function _buyItNow(bytes32 _order) internal {
        _updateOrderStatus(_order);
        require(_isValidBuyItNowOffer(_order));
        
        Order storage order = orderBook[_order];
        order.status = OrderStatus.SOLD;
        
       _makePayments(order, TransactionType.BUYITNOW);
       
        order.tokenContract.safeTransferFrom(order.seller, msg.sender, order.tokenId);

        emit Claim(order.tokenContract, order.tokenId, _order, order.seller, msg.sender, order.fixedPrice);
    }

    function _claim(bytes32 _order) internal {
        _updateOrderStatus(_order);
        require(_isValidClaim(_order));

        Order storage order = orderBook[_order];
        order.status = OrderStatus.SOLD;
        
        _makePayments(order, TransactionType.AUCTION);
        
        order.tokenContract.safeTransferFrom(order.seller, order.lastBidder, order.tokenId);

        emit Claim(order.tokenContract, order.tokenId, _order, order.seller, order.lastBidder, order.lastBidPrice);
    }

    function _cancelOrder(bytes32 _order) internal {
        _updateOrderStatus(_order);
        require(_isValidCancelCall(_order));

        Order storage order = orderBook[_order];

        order.status = OrderStatus.CANCELED;

        emit CancelOrder(order.tokenContract, order.tokenId, _order, msg.sender);
    }
}
