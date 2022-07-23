//
// this script executes when you run 'yarn test'
//
// you can also test remote submissions like:
// CONTRACT_ADDRESS=0x43Ab1FCd430C1f20270C2470f857f7a006117bbb yarn test --network rinkeby
//
// you can even run mint commands if the tests pass like:
// yarn test && echo "PASSED" || echo "FAILED"
//
import { ethers, network } from 'hardhat';
import { use, expect } from 'chai';
import { solidity } from "ethereum-waffle";
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signers';
import { JsonRpcProvider } from '@ethersproject/providers';

use(solidity);

describe("🚩 Challenge 3: 🎲 Dice Game", () => {

  let deployer: SignerWithAddress;
  let account1: SignerWithAddress;
  let diceGame: Contract;
  let riggedRoll: Contract;
  let provider: JsonRpcProvider;

  const deployContracts = async () => {
    const DiceGame = await ethers.getContractFactory("DiceGame");
    diceGame = await DiceGame.deploy();

    const RiggedRoll = await ethers.getContractFactory("RiggedRoll");
    riggedRoll = await RiggedRoll.deploy(diceGame.address);

    [deployer, account1] = await ethers.getSigners();
    provider = ethers.provider;
  }

  const fundRiggedContract = () => {
    return deployer.sendTransaction({
      to: riggedRoll.address,
      value: ethers.utils.parseEther("1"),
    });
  }

  const changeStatesToGetRequiredRoll = async (getRollLessThanTwo: boolean) => {
    let expectedRoll;
    while (true) {
      let latestBlockNumber = await provider.getBlockNumber();
      let block = await provider.getBlock(latestBlockNumber);
      let prevHash = block.hash;
      let nonce = await diceGame.nonce();

      let hash = ethers.utils.solidityKeccak256(
        ["bytes32", "address", "uint256"],
        [prevHash, diceGame.address, nonce]
      );

      let bigNum = BigNumber.from(hash);
      expectedRoll = bigNum.mod(16);
      if (expectedRoll.lte(2) == getRollLessThanTwo) {
        break;
      }

      const options = { value: ethers.utils.parseEther("0.002") };
      await diceGame.rollTheDice(options);
    }
    return expectedRoll;
  }

  describe("⚙️ Setup contracts", () => {
    it("Should deploy contracts", async () => {
      await deployContracts();
      expect(await riggedRoll.diceGame()).to.equal(diceGame.address);
    });

    it("Should revert if balance less than .002 ethers", async () => {
      expect(riggedRoll.riggedRoll()).to.reverted;
    });

    it("Should transfer sufficient eth to RiggedRoll", async () => {
      await fundRiggedContract();
      let balance = await provider.getBalance(riggedRoll.address);
      expect(balance).to.above(ethers.utils.parseEther(".002"));
    });
  });

  describe("🔑 Rigged Rolls", () => {
    it("Should call DiceGame for a roll less than 2", async () => {
      //first change states and create the inputs required to produce a roll <= 2
      let getRollLessThanTwo = true;
      let expectedRoll = await changeStatesToGetRequiredRoll(
        getRollLessThanTwo
      );
      console.log(
        "EXPECT ROLL TO BE LESS THAN OR EQUAL TO 2: ",
        expectedRoll.toNumber()
      );

      let tx = riggedRoll.riggedRoll();

      it("Should emit Roll event!", async () => {
        expect(tx)
          .to.emit(diceGame, "Roll")
          .withArgs(riggedRoll.address, expectedRoll);
      });

      it("Should emit Winner event!", async () => {
        expect(tx).to.emit(diceGame, "Winner");
      });
    });

    it("Should not call DiceGame for a roll greater than 2", async () => {
      let getRollLessThanTwo = false;
      let expectedRoll = await changeStatesToGetRequiredRoll(
        getRollLessThanTwo
      );
      console.log(
        "EXPECTED ROLL TO BE GREATER THAN 2: ",
        expectedRoll.toNumber()
      );

      expect(riggedRoll.riggedRoll()).to.reverted;
    });

    it("Should withdraw funds", async () => {
      //deployer is the owner by default so should be able to withdraw
      await fundRiggedContract();

      let prevBalance = await deployer.getBalance();
      await riggedRoll.withdraw(
        deployer.address,
        provider.getBalance(riggedRoll.address)
      );
      let curBalance = await deployer.getBalance();
      expect(prevBalance.lt(curBalance)).to.true;
    });
  });
});
