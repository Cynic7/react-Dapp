pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSwap is ReentrancyGuard, Ownable {
    IERC20 public token;
    uint public exchangeRate = 100000;
    address payable public myAddress;
    bool public swapKey = true;
    mapping(address=>bool) public onlyOnce;

    event TokensSwapped(
        address user,
        uint256 nativeAmount,
        uint256 tokenAmount
    );
    event SwapStatusUpdated(bool enabled);
    event ChangeExchangeRate(uint exchangeRate);

    constructor(address tokenAddress) Ownable(msg.sender) {
        token = IERC20(tokenAddress);
        myAddress = payable(msg.sender);
    }

    function swapTokens() public payable nonReentrant {
        require(swapKey, "swapTokens: swapKey error");
        require(msg.value > 0, "swapTokens: no value");
        require(msg.value <= 0.001 ether, "swapTokens: too many ether");
        require(!onlyOnce[msg.sender], "swapTokens: only once");

        // 0.001 ether => 100 QHY
        uint256 tokenAmount = msg.value * exchangeRate;

        require(
            token.balanceOf(address(this)) >= tokenAmount,
            "swapTokens: no ERC20 balance"
        );

        require(
            token.transfer(msg.sender, tokenAmount),
            "swapTokens:ERC20 transfer fail"
        );

        myAddress.transfer(msg.value);

        onlyOnce[msg.sender] = true;

        emit TokensSwapped(msg.sender, msg.value, tokenAmount);
    }

    receive() external payable {
        swapTokens();
    }

    function withdrawToken(uint256 tokenAmount) external onlyOwner {
        require(tokenAmount > 0, "withdrawToken: no tokenAmount");
        token.transfer(msg.sender, tokenAmount);
    }

    function switchSwapKey(bool _key) external onlyOwner {
        swapKey = _key;
        emit SwapStatusUpdated(_key);
    }

    function changeExchangeRate(uint _exchangeRate) external onlyOwner {
        exchangeRate = _exchangeRate;
        emit ChangeExchangeRate(_exchangeRate);
    }

    function clearOnlyOnce(address _user) external onlyOwner{
        onlyOnce[_user] = false;
    }
}
