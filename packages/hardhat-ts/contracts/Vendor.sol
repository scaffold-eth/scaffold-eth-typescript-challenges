pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

//import "@openzeppelin/contracts/access/Ownable.sol";
import './YourToken.sol';

contract Vendor {
  YourToken yourToken;

  uint256 public constant tokensPerEth = 100;

  event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);

  constructor(address tokenAddress) public {
    yourToken = YourToken(tokenAddress);
  }

  function buyTokens() public payable {
    uint256 amountOfTokens = msg.value * tokensPerEth;

    yourToken.transfer(msg.sender, amountOfTokens);
    emit BuyTokens(msg.sender, msg.value, amountOfTokens);
  }

  function withdraw() public {}

  function sellTokens(uint256 amount) public {
    yourToken.transferFrom(msg.sender, address(this), amount);
  }
}
