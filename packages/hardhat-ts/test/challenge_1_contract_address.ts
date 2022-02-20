//
// this script executes when you run 'yarn test'
// and is used to test contracts at an external address like so:
//
// CONTRACT_ADDRESS=0x43Ab1FCd430C1f20270C2470f857f7a006117bbb yarn test --network rinkeby
//
// you can even run mint commands if the tests pass like:
// yarn test && echo "PASSED" || echo "FAILED"
//
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

const contractAddress = process.env.CONTRACT_ADDRESS || '';
let stakerContract: Contract;

describe('🚩 Challenge 1: 🥩 Decentralized Staking App - External tests', function () {
  if (!contractAddress) {
    console.log('CONTRACT_ADDRESS is not set, skipping external tests');
    return;
  }
  describe('Staker', function () {
    it('Should connect to external contract', async function () {
      stakerContract = await ethers.getContractAt('Staker', contractAddress);
      console.log('     🛰 Connected to external contract', stakerContract.address);
      expect(stakerContract).to.not.be.undefined;
    });
  });
});
