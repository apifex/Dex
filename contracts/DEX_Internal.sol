// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IERC721.sol";
import "../interfaces/IERC2981.sol";
import "../interfaces/IDEX.sol";

abstract contract DEX_Internal is IDEX {

    enum OrderType {
        AUCTION,
        FIXED,
        MIXED
    }

    enum OrderStatus {
        ACTIVE,
        SOLD,
        CANCELED,
        OVER
    }

    enum TransactionType {
        BUYITNOW,
        AUCTION
    }

    struct Order {
        OrderType orderType;
        OrderStatus status;
        address seller;
        IERC721 tokenContract;
        uint256 tokenId;
        uint256 startPrice;
        uint256 fixedPrice;
        uint256 startTime;
        uint256 endTime;
        uint256 lastBidPrice;
        address lastBidder;
    }

    struct RoyaltyInfo {
        address receiver;
        uint256 amount;
    }

    mapping(IERC721 => mapping(uint256 => bytes32)) public orderIdByToken;
    mapping(address => bytes32[]) public orderIdBySeller;
    mapping(bytes32 => Order) public orderInfo;

    address public admin;
    address public feeAddress;
    uint16 public feePercent;
    uint16 public royaltyFeePercent;

    constructor(uint16 _feePercent, uint16 _royaltyFeePercent) {
        require(_feePercent <= 10000, "input value is more than 100%");
        admin = msg.sender;
        feeAddress = msg.sender;
        feePercent = _feePercent;
        royaltyFeePercent = _royaltyFeePercent;
    }

    function _makeOrderID(
        IERC721 _tokenContract,
        uint256 _tokenId,
        address _seller
    ) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    _tokenContract,
                    _tokenId,
                    _seller
                )
            );
    }

    function _checkOrderStatus(bytes32 _order)
        internal
        view
        returns (OrderStatus)
    {
        require(
            orderInfo[_order].seller != address(0),
            "This order does not exists"
        );
        Order memory order = orderInfo[_order];
        if (order.endTime < block.timestamp) {
            order.status = OrderStatus.OVER;
        }
        return order.status;
    }

    function _makePayments(Order memory order, TransactionType transactionType) internal {
        RoyaltyInfo memory royalty = _checkRoyalties(address(order.tokenContract), order.tokenId, order.fixedPrice);
        uint256 price = transactionType == TransactionType.AUCTION?order.lastBidPrice:order.fixedPrice;
        uint256 fee = (price * feePercent) / 10000;
        uint256 royaltyFee = (royalty.amount * royaltyFeePercent) / 10000;
        payable(order.seller).transfer(price - fee - royalty.amount - royaltyFee);
        payable(feeAddress).transfer(fee + royaltyFee);
        payable(royalty.receiver).transfer(royalty.amount);
    }

    function _checkRoyalties(
        address tokenContract,
        uint256 tokenId,
        uint256 transactionAmount
    ) internal view returns (RoyaltyInfo memory royalty) {
        (address receiver, uint256 amount) = IERC2981(tokenContract)
            .royaltyInfo(tokenId, transactionAmount);
        royalty.receiver = receiver;
        royalty.amount = amount;
        return royalty;
    }

    event Received(address sender, uint256 value);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
