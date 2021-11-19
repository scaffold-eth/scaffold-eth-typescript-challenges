import React, { FC } from 'react';
import { GenericContract } from 'eth-components/ant/generic-contract';
import { Contract } from 'ethers';
import { useContractLoader } from 'eth-hooks';
import { IScaffoldAppProviders } from '~~/app/routes/main/hooks/useScaffoldAppProviders';
import { useEthersContext } from 'eth-hooks/context';
import { NETWORKS } from '~~/models/constants/networks';
import { TContractLoaderConfig } from 'eth-hooks/models';
export interface IMainPageContractsProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  mainnetContracts: Record<string, Contract>;
  appContractConfig: TContractLoaderConfig;
}

/**
 * 🎛 this scaffolding is full of commonly used components
    this <GenericContract/> component will automatically parse your ABI
    and give you a form to interact with it locally
 * @param props
 * @returns
 */
export const MainPageContracts: FC<IMainPageContractsProps> = (props) => {
  const ethersContext = useEthersContext();
  const contractList = useContractLoader(props.appContractConfig, undefined);

  if (ethersContext.account == null) {
    return <></>;
  }

  return (
    <>
      <>
        {/* **********
          ❓ this scaffolding is full of commonly used components
          this <Contract/> component will automatically parse your ABI
          and give you a form to interact with it locally
        ********** */}
        <GenericContract
          contractName="ExampleExternalContract"
          contract={contractList?.['ExampleExternalContract']}
          mainnetProvider={props.scaffoldAppProviders.mainnetProvider}
          blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
          contractConfig={props.appContractConfig}
        />

        <GenericContract
          contractName="Staker"
          contract={contractList?.['Staker']}
          mainnetProvider={props.scaffoldAppProviders.mainnetProvider}
          blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
          contractConfig={props.appContractConfig}
        />

        {/***********
         *  ❓ Uncomment to display and interact with an external contract (DAI on mainnet):
         ********** */}
        {/* <GenericContract
          contractName="DAI"
          contract={props.mainnetContracts?.['DAI']}
          mainnetProvider={props.scaffoldAppProviders.mainnetProvider}
          blockExplorer={NETWORKS['mainnet'].blockExplorer}
          contractConfig={props.appContractConfig}
        /> */}
      </>
    </>
  );
};
