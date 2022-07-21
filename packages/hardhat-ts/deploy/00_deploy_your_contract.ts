import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironmentExtended } from 'helpers/types/hardhat-type-extensions';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre as any;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy('DiceGame', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    value: ethers.utils.parseEther(".05"),
    log: true,
  });

  // Getting a previously deployed contract
  const DiceGame = await ethers.getContract("DiceGame", deployer);

};
export default func;
func.tags = ['DiceGame'];
