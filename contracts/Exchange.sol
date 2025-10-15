pragma solidity ^0.8.0;

import './Token.sol';
import 'hardhat/console.sol';

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    //交易所代币映射 代币地址 => 存款人地址 => 存款额
    mapping(address => mapping(address => uint256)) public tokens;

    event DepositToken(address user, address tokenAddress, uint256 value, uint balance);

    constructor(
        address _feeAccount,
        uint256 _feePercent
    ) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //存款
    function depositToken(address tokenAddress, uint256 _value) public returns(bool success) {
        require(tokenAddress != address(0));

        require(Token(tokenAddress).transferFrom(msg.sender, address(this), _value));

        tokens[tokenAddress][msg.sender] += _value;

        emit DepositToken(msg.sender, tokenAddress, _value, tokens[tokenAddress][msg.sender]);

        return true;
    }

  
}
