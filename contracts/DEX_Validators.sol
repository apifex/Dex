// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DEX_Internal.sol";

abstract contract DEX_Validators is DEX_Internal {

    function _isValidOrder(
        IERC721 _tokenContract, 
        uint256 _tokenId, 
        uint256 _startPrice,
        uint256 _fixedPrice,
        uint256 _endTime
        ) internal view returns(bool) {
        require(_endTime > block.timestamp, "Duration must be longer than zero");
        require(_tokenContract.getApproved(_tokenId) == address(this) || 
                 _tokenContract.isApprovedForAll(_tokenContract.ownerOf(_tokenId), address(this)) == true, 
                 "DEX Contract must be approved to make transaction with this token ID");
        require(orderIdByToken[_tokenContract][_tokenId] == 0, "There is already an order for this token ID");
        require(_startPrice > 0 || _fixedPrice > 0, "Price must be more than 0");
        return true;
    }

    function _isValidBidOffer(bytes32 _orderID) internal view returns(bool) {
        Order memory order = orderInfo[_orderID];
        require(order.status == OrderStatus.ACTIVE, "This order is over or canceled");
        require(order.orderType != OrderType.FIXED, "Can not bid to this 'fixed price' order");
        require(order.seller != msg.sender, "Can not bid to your order");

        order.lastBidPrice != 0?
            require(msg.value >= order.lastBidPrice + (order.lastBidPrice / 20), "Price is too low (min +5% required)"):
            require(msg.value >= order.startPrice && msg.value > 0, "Price can't be less than 'start price'");

        return true;
    }
        
    function _isValidBuyItNowOffer(bytes32 _orderID) internal view returns(bool) {
        Order memory order = orderInfo[_orderID];
        require(order.status == OrderStatus.ACTIVE, "This order is over or canceled");
        require(order.orderType != OrderType.AUCTION, "You can't 'buy it now'");
        require(msg.value == order.fixedPrice, "Wrong price for 'Buy it now!'");
        return true;
    }

    function _isValidClaim(bytes32 _order) internal view returns(bool) {
        Order memory order = orderInfo[_order];
        require(order.status == OrderStatus.OVER, "This order is not finish yet");
        require(order.orderType != OrderType.FIXED, "This order is not an auction");
        require(order.seller == msg.sender || order.lastBidder == msg.sender, "Access denied");
        return true;
    }

  function _isValidCancelCall(bytes32 _order) internal view returns(bool) {
        Order storage order = orderInfo[_order];
        require(order.status == OrderStatus.ACTIVE, "This order is not active");
        require(order.seller == msg.sender, "Access denied");
        require(order.lastBidPrice == 0, "Bidding exist");
        return true;
    }
}
