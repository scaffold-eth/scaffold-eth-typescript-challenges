//
// this script executes when you run 'yarn test'
//
// you can also test remote submissions like:
// CONTRACT_ADDRESS=0x43Ab1FCd430C1f20270C2470f857f7a006117bbb yarn test --network rinkeby
//
// you can even run mint commands if the tests pass like:
// yarn test && echo "PASSED" || echo "FAILED"
//
import { ethers, network, deployments } from 'hardhat';
import { use, expect } from 'chai';
import { solidity } from "ethereum-waffle";
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signers';

use(solidity);

describe("🚩 Challenge 6: SWG NFT", () => {

  let yourCollectibleContract: Contract;
  let deployer: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  const ContractDisplayName = "Loogies";
  const ContractSymbol = "LOOG";

  before(async () => {
    [deployer, user2, user3] = await ethers.getSigners();

    const YourCollectible = await ethers.getContractFactory("YourCollectible");
    yourCollectibleContract = await YourCollectible.deploy();
  });

  describe("Deploy", () => {

    it("Check name", async () => {
      expect(
        await yourCollectibleContract.name()
      ).to.equal(ContractDisplayName);
    });

    it("Check symbol", async () => {
      expect(
        await yourCollectibleContract.symbol()
      ).to.equal(ContractSymbol);
    });

  });

  describe("Mint token", () => {
    it("Check balance before mint", async () => {
      expect(
        await yourCollectibleContract.balanceOf(user2.address)
      ).to.equal(0);
    });

    it("Mint", async () => {
      const mintTokensResult = await yourCollectibleContract.connect(user2).mintItem();
      const txResult = await mintTokensResult.wait();
      expect(txResult.status).to.equal(1);
    });

    it("Check balance after mint", async () => {
      expect(
        await yourCollectibleContract.balanceOf(user2.address)
      ).to.equal(1);
    });

    it("Check token metadata", async () => {

      const tokenURI = await yourCollectibleContract.tokenURI('1');
      // console.log('\t'," 🔎 Token native tokenURI: ", tokenURI)
      const jsonManifestString = Buffer.from(tokenURI.substring(29), 'base64').toString('utf-8');
      // console.log('\t'," 🔎 Token json manifest string: ", jsonManifestString);
      const metadataObject = JSON.parse(jsonManifestString );

      expect(
        metadataObject.name
      ).to.equal('Loogie #1');
    });
  });
});
