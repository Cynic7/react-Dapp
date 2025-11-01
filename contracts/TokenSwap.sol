pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSwap is ReentrancyGuard, Ownable {
    IERC20 public token;
    uint public exchangeRate = 10000;
    address payable myAddress;
    bool public swapKey = true;

    event TokensSwapped(
        address user,
        uint256 nativeAmount,
        uint256 tokenAmount
    );
    event SwapStatusUpdated(bool enabled);

    constructor(address tokenAddress, address _myAddress) Ownable(msg.sender) {
        token = IERC20(tokenAddress);
        myAddress = payable(_myAddress);
    }

    function swapTokens() public payable nonReentrant {
        require(swapKey, "swapTokens: swapKey error");
        require(msg.value > 0, "swapTokens: no value");

        // 0.001 ether => 100 QHY
        uint256 tokenAmount = msg.value * exchangeRate;

        require(
            token.balanceOf(address(this)) > tokenAmount,
            "swapTokens: no ERC20 balance"
        );

        require(
            token.transfer(msg.sender, tokenAmount),
            "swapTokens:ERC20 transfer fail"
        );

        myAddress.transfer(msg.value);

        emit TokensSwapped(msg.sender, msg.value, tokenAmount);
    }

    receive() external payable {
        swapTokens();
    }

    function withdrawToken(uint256 tokenAmount) public onlyOwner {
        require(tokenAmount > 0, "withdrawToken: no tokenAmount");
        token.transfer(msg.sender, tokenAmount);
    }

    function switchSwapKey(bool _key) public onlyOwner {
        swapKey = _key;
        emit SwapStatusUpdated(_key);
    }
}
