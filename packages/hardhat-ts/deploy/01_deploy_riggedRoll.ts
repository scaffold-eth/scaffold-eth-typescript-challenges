import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironmentExtended } from 'helpers/types/hardhat-type-extensions';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironmentExtended) => {
    const { getNamedAccounts, getChainId, deployments } = hre as any;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const { chainId } = await getChainId();

    const DiceGameContract = await hre.deployments.get('DiceGame');

    /*
    await deploy('RiggedRoll', {
        // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
        from: deployer,
        args: [DiceGameContract.address],
        log: true,
    });
    */

    // Getting a previously deployed contract
    //const riggedRoll = await ethers.getContract("RiggedRoll", deployer);

    //const ownershipTransaction = await riggedRoll.transferOwnership("** YOUR FRONTEND ADDRESS **");

};
export default func;
func.tags = ['RiggedRoll'];
