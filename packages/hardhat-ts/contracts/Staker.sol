pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import 'hardhat/console.sol';
import './ExampleExternalContract.sol';

contract Staker {
  ExampleExternalContract public exampleExternalContract;
  uint256 public deadline;
  uint256 public constant threshold = 1 ether;
  uint256 public stakedAmount;
  mapping(address => uint256) public balances;

  event Stake(address staker, uint256 amount);

  constructor(address exampleExternalContractAddress) {
    exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
    deadline = block.timestamp + 5 minutes;
  }

  function timeLeft() public view returns (uint256) {
    return deadline - block.timestamp;
  }

  function stake() public payable {
    require(msg.value > 0, 'Provide some eth to stake!');
    balances[msg.sender] += msg.value;
    stakedAmount += msg.value;
    emit Stake(msg.sender, msg.value);
  }

  function execute() public {
    require(block.timestamp >= deadline, 'Deadline has not been reached yet!');
    require(stakedAmount >= threshold, 'Not enough staked amount!');
    exampleExternalContract.complete{value: address(this).balance}();
  }

  function withdraw() public {
    require(stakedAmount < threshold, 'Cannot withdraw because the required threshold was met!');
    require(balances[msg.sender] > 0, 'Cannot withdraw because you have no staked funds!');

    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0;
    stakedAmount -= amount;
    (bool sent, ) = msg.sender.call{value: amount}('');
    require(sent, 'Failed to send Ether');
  }
}
