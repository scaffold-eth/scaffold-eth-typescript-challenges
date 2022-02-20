//
// this script executes when you run 'yarn test'
// and is used to execute local contract tests
//
// you can even run mint commands if the tests pass like:
// yarn test && echo "PASSED" || echo "FAILED"
//
import { expect } from 'chai';
import { ethers, deployments, network } from 'hardhat';

const CONTRACTS = {
  staker: 'Staker',
  exampleExternalContract: 'ExampleExternalContract',
};
const contractAddress = process.env.CONTRACT_ADDRESS || '';

// Setup the test fixture
const setupTest = deployments.createFixture(async ({ deployments, getNamedAccounts, ethers }, options) => {
  await deployments.fixture([CONTRACTS.staker, CONTRACTS.exampleExternalContract]); // ensure you start from a fresh deployments
  const { deployer } = await getNamedAccounts();
  const stakerContract = await ethers.getContract(CONTRACTS.staker);
  const exampleExternalContract = await ethers.getContract(CONTRACTS.exampleExternalContract);
  return {
    fixture: {
      deployer,
      stakerContract,
      exampleExternalContract,
    },
  };
});

describe('🚩 Challenge 1: 🥩 Decentralized Staking App - Local Tests', function () {
  if (contractAddress) {
    console.log('CONTRACT_ADDRESS is set, skipping local tests');
    return;
  }
  describe('Staker', function () {
    describe('mintItem()', function () {
      it('Balance should go up when you stake()', async function () {
        const { fixture } = await setupTest();

        const [owner] = await ethers.getSigners();

        console.log('\t', ' 🧑‍🏫 Tester Address: ', owner.address);

        const startingBalance = await fixture.stakerContract.balances(owner.address);
        console.log('\t', ' ⚖️ Starting balance: ', startingBalance.toNumber());

        console.log('\t', ' 🔨 Staking...');
        const stakeResult = await fixture.stakerContract.stake({ value: ethers.utils.parseEther('0.001') });
        console.log('\t', ' 🏷  stakeResult: ', stakeResult.hash);

        console.log('\t', ' ⏳ Waiting for confirmation...');
        const txResult = await stakeResult.wait();
        expect(txResult.status).to.equal(1);

        const newBalance = await fixture.stakerContract.balances(owner.address);
        console.log('\t', ' 🔎 New balance: ', ethers.utils.formatEther(newBalance));
        expect(newBalance).to.equal(startingBalance.add(ethers.utils.parseEther('0.001')));
      });

      it('If enough is staked and time has passed, you should be able to complete', async function () {
        const { fixture } = await setupTest();

        const timeLeft1 = await fixture.stakerContract.timeLeft();
        console.log('\t', '⏱ There should be some time left: ', timeLeft1.toNumber());
        expect(timeLeft1.toNumber()).to.greaterThan(0);

        console.log('\t', ' 🚀 Staking a full eth!');
        const stakeResult = await fixture.stakerContract.stake({ value: ethers.utils.parseEther('1') });
        console.log('\t', ' 🏷  stakeResult: ', stakeResult.hash);

        console.log('\t', ' ⌛️ fast forward time...');
        await network.provider.send('evm_increaseTime', [3600]);
        await network.provider.send('evm_mine');

        const timeLeft2 = await fixture.stakerContract.timeLeft();
        console.log('\t', '⏱ Time should be up now: ', timeLeft2.toNumber());
        expect(timeLeft2.toNumber()).to.equal(0);

        console.log('\t', ' 🎉 calling execute');
        const execResult = await fixture.stakerContract.execute();
        console.log('\t', ' 🏷  execResult: ', execResult.hash);

        const result = await fixture.exampleExternalContract.completed();
        console.log('\t', ' 🥁 complete: ', result);
        expect(result).to.equal(true);
      });

      it('Should redeploy Staker, stake, not get enough, and withdraw', async function () {
        const { fixture } = await setupTest();
        const [owner, secondAccount] = await ethers.getSigners();

        console.log('\t', ' 🔨 Staking...');
        const stakeResult = await fixture.stakerContract.stake({ value: ethers.utils.parseEther('0.001') });
        console.log('\t', ' 🏷  stakeResult: ', stakeResult.hash);

        console.log('\t', ' ⏳ Waiting for confirmation...');
        const txResult = await stakeResult.wait();
        expect(txResult.status).to.equal(1);

        console.log('\t', ' ⌛️ fast forward time...');
        await network.provider.send('evm_increaseTime', [3600]);
        await network.provider.send('evm_mine');

        console.log('\t', ' 🎉 calling execute');
        const execResult = await fixture.stakerContract.execute();
        console.log('\t', ' 🏷  execResult: ', execResult.hash);

        const result = await fixture.exampleExternalContract.completed();
        console.log('\t', ' 🥁 complete should be false: ', result);
        expect(result).to.equal(false);

        const startingBalance = await ethers.provider.getBalance(owner.address);
        console.log('startingBalance before withdraw', ethers.utils.formatEther(startingBalance));

        console.log('\t', ' 💵 calling withdraw');
        const withdrawResult = await fixture.stakerContract.withdraw(owner.address);
        console.log('\t', ' 🏷  withdrawResult: ', withdrawResult.hash);

        const endingBalance = await ethers.provider.getBalance(owner.address);
        console.log('endingBalance after withdraw', ethers.utils.formatEther(endingBalance));

        // Truncating the starting and ending balances so we don't have to deal with gas issues
        const startRemainder = startingBalance.mod(1e15);
        const startRounded = startingBalance.sub(startRemainder);
        const endRemainder = endingBalance.mod(1e15);
        const endRounded = endingBalance.sub(endRemainder);

        expect(endRounded).to.equal(startRounded.add(ethers.utils.parseEther('0.001')));
      });
    });
  });
});
