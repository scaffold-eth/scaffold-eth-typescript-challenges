import { ethers, run } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironmentExtended } from 'helpers/types/hardhat-type-extensions';
import '@nomiclabs/hardhat-etherscan';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, getChainId, deployments } = hre as any;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const { chainId } = await getChainId();

  const exampleExternalContract = await hre.deployments.get('ExampleExternalContract');

  await deploy('Staker', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [exampleExternalContract.address],
    log: true,
  });

  /*
    // Getting a previously deployed contract
    const YourContract = await ethers.getContract("YourContract", deployer);
    await YourContract.setPurpose("Hello");

    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

  // todo: uncomment to verify your contract
  // const Staker = await ethers.getContract('Staker', deployer);

  // if (chainId !== '31337') {
  //   try {
  //     console.log(' 🎫 Verifing Contract on Etherscan... ');
  //     await delay(3000);
  //     await run('verify:verify', {
  //       address: Staker.address,
  //       contract: 'contracts/Staker.sol:Staker',
  //       constructorArguments: [exampleExternalContract.address],
  //     });
  //     console.log(' ✅ Contract Verified! ');
  //   } catch (e) {
  //     console.log(' ⚠️ Failed to verify contract on Etherscan ');
  //     console.log(e);
  //   }
  // }
};
export default func;
func.tags = ['Staker'];

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
