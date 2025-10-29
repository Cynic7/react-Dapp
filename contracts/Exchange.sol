pragma solidity ^0.8.0;

import "./Token.sol";
import "hardhat/console.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    uint256 private orderCount = 0;

    //交易所代币映射 代币地址 => 存款人地址 => 存款额
    mapping(address => mapping(address => uint256)) public balanceOf;
    //下单映射 订单id => 订单体
    mapping(uint256 => _Order) public orders;
    //取消订单映射 订单id => true
    mapping(uint256 => bool) public cancelOrders;
    //被购买的订单映射
    mapping(uint256 => bool) public fillOrders;

    struct _Order {
        uint256 orderId;
        address user;
        address tokenGet;
        uint256 getValue;
        address tokenGive;
        uint256 giveValue;
        uint256 timestamp;
    }

    event DepositToken(
        address user,
        address tokenAddress,
        uint256 value,
        uint balance
    );
    event WithdrawToken(
        address user,
        address tokenAddress,
        uint256 value,
        uint balance
    );
    event MakeOrder(
        uint256 orderId,
        address user,
        address tokenGet,
        uint256 getValue,
        address tokenGive,
        uint256 giveValue,
        uint256 timestamp
    );
    event CancelOrder(
        uint256 orderId,
        address user,
        address tokenGet,
        uint256 getValue,
        address tokenGive,
        uint256 giveValue,
        uint256 timestamp
    );
    event FillOrder(
        uint256 orderId,
        address spender,
        address user,
        address tokenGet,
        uint256 getValue,
        address tokenGive,
        uint256 giveValue,
        uint256 timestamp
    );

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //存款
    function depositToken(address tokenAddress, uint256 _value) external {
        require(tokenAddress != address(0),'depositToken: no address');

        require(
            Token(tokenAddress).transferFrom(msg.sender, address(this), _value),'depositToken: transfer error'
        );

        balanceOf[tokenAddress][msg.sender] += _value;

        emit DepositToken(
            msg.sender,
            tokenAddress,
            _value,
            balanceOf[tokenAddress][msg.sender]
        );
    }

    //取款
    function withdrawToken(address tokenAddress, uint256 _value) external {
        require(tokenAddress != address(0),'withdrawToken: no address');
        require(balanceOf[tokenAddress][msg.sender] >= _value,'withdrawToken: balanceOf error');

        require(Token(tokenAddress).transfer(msg.sender, _value),'withdrawToken: transfer error');

        balanceOf[tokenAddress][msg.sender] -= _value;

        emit WithdrawToken(
            msg.sender,
            tokenAddress,
            _value,
            balanceOf[tokenAddress][msg.sender]
        );
    }

    //下单
    function makeOrder(
        address _tokenGet,
        uint256 _getValue,
        address _tokenGive,
        uint256 _giveValue
    ) external {
        require(balanceOf[_tokenGive][msg.sender] >= _giveValue,'makeOrder: balanceOf error');

        orderCount++;
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _getValue,
            _tokenGive,
            _giveValue,
            block.timestamp
        );

        emit MakeOrder(
            orderCount,
            msg.sender,
            _tokenGet,
            _getValue,
            _tokenGive,
            _giveValue,
            block.timestamp
        );
    }

    //取消订单
    function cancelOrder(uint256 orderId) external {
        require(!cancelOrders[orderId],'cancelOrder: orderId error');

        _Order storage _order = orders[orderId];
        require(_order.user == msg.sender, 'cancelOrder: user error');

        cancelOrders[orderId] = true;

        emit CancelOrder(
            orderId,
            msg.sender,
            _order.tokenGet,
            _order.getValue,
            _order.tokenGive,
            _order.giveValue,
            block.timestamp
        );
    }

    //买下订单
    function fillOrder(uint256 orderId) external {
        //该订单不能被取消
        require(!cancelOrders[orderId],'fillOrder: cancelOrders.orderId error');

        //订单没有被买走
        require(!fillOrders[orderId],'fillOrder: fillOrders.orderId error');

        //订单存在
        _Order storage _order = orders[orderId];
        require(orderId > 0 && orderId <= orderCount);

        //小费
        uint256 feePrice = (_order.getValue * feePercent) / 100;

        //买家的钱足够
        require(
            balanceOf[_order.tokenGet][msg.sender] >= _order.getValue + feePrice,'fillOrder: balanceOf error 1'
        );

        //创建订单的人钱够
        require(balanceOf[_order.tokenGive][_order.user] >= _order.giveValue,'fillOrder: balanceOf error 2');

        //token的映射不更新，因为token都在交易所里，交易所的映射更新即可
        //买家得到这份订单的 tokenGive，失去这份订单的tokenGet
        balanceOf[_order.tokenGet][msg.sender] -= _order.getValue;
        balanceOf[_order.tokenGive][msg.sender] += _order.giveValue;

        //创建订单的人拿到这份单的 tokenGet，失去tokenGive
        balanceOf[_order.tokenGet][_order.user] += _order.getValue;
        balanceOf[_order.tokenGive][_order.user] -= _order.giveValue;

        //买家使用 tokenGet 支付小费
        balanceOf[_order.tokenGet][feeAccount] += feePrice;
        balanceOf[_order.tokenGet][msg.sender] -= feePrice;

        fillOrders[orderId] = true;

        emit FillOrder(
            orderId,
            msg.sender,
            _order.user,
            _order.tokenGet,
            _order.getValue,
            _order.tokenGive,
            _order.giveValue,
            block.timestamp
        );
    }
}
