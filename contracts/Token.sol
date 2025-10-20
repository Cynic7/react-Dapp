pragma solidity ^0.8.0;

contract Token {
    //定义代币名称、符号、总供应量、小数
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * 10 ** decimals;
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        _transfer(msg.sender, _to, _value);

        return true;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(balanceOf[_from] >= _value, "transfer:Not enough money");
        require(_to != address(0), "Invalid address");
        require(_from != address(0), "Invalid address");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "approve:Not enough money");
        require(_spender != address(0), "Invalid address");

        allowance[msg.sender][_spender] += _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    //先要经过授权，A授权给B，B调用transferFrom，从A的钱包转移给C，所以_from是A，msg.sender是B，_to是C
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(allowance[_from][msg.sender] >= _value);

        allowance[_from][msg.sender] -= _value;

        _transfer(_from, _to, _value);

        return true;
    }
}
