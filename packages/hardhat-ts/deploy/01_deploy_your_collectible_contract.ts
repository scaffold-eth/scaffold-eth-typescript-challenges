import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironmentExtended } from 'helpers/types/hardhat-type-extensions';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre as any;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy('YourCollectible', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [
    ],
    log: true,
  });

};
export default func;
func.tags = ['YourCollectible'];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
