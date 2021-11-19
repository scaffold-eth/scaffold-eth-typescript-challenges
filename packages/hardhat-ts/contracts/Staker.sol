pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import 'hardhat/console.sol';
import './ExampleExternalContract.sol';

contract Staker {
  ExampleExternalContract public exampleExternalContract;
  uint256 public deadline;
  uint256 public constant threshold = 1 ether;
  uint256 public stakedAmount;
  bool public openForWithdraw = false;
  mapping(address => uint256) public balances;

  event Stake(address staker, uint256 amount);

  constructor(address exampleExternalContractAddress) {
    exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
    deadline = block.timestamp + 1 minutes;
  }

  modifier notCompleted() {
    require(!exampleExternalContract.completed(), 'The contract has already been completed');
    _;
  }

  modifier deadlinePassed() {
    require(block.timestamp >= deadline, 'The deadline has not been passed yet');
    _;
  }

  function timeLeft() public view returns (uint256) {
    if (block.timestamp >= deadline) {
      return 0;
    }

    return deadline - block.timestamp;
  }

  function stake() public payable {
    require(block.timestamp < deadline, 'The deadline has passed');
    require(msg.value > 0, 'Provide some eth to stake!');

    balances[msg.sender] += msg.value;
    stakedAmount += msg.value;
    emit Stake(msg.sender, msg.value);
  }

  function execute() public notCompleted deadlinePassed {
    if (address(this).balance > threshold) {
      exampleExternalContract.complete{value: address(this).balance}();
    } else {
      openForWithdraw = true;
    }
  }

  function withdraw(address payable) public notCompleted deadlinePassed {
    require(openForWithdraw, 'Not open for withdraw');
    require(balances[msg.sender] > 0, 'Cannot withdraw because you have no staked funds!');

    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0;
    stakedAmount -= amount;
    (bool sent, ) = msg.sender.call{value: amount}('');
    require(sent, 'Failed to send Ether');
  }

  receive() external payable {
    stake();
  }
}
