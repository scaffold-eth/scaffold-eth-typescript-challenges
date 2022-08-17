import { Balance } from 'eth-components/ant';
import { FC } from 'react';
import { useEthersContext } from 'eth-hooks/context';
import { useContractReader } from 'eth-hooks';
import { useDebounce } from 'use-debounce';
import { BigNumber, ethers } from 'ethers';
import { TokenContractBalance } from './base/TokenContractBalance';
import { DEX as DEXContract, Balloons as BalloonsContract } from '~~/generated/contract-types';


export interface IAccountInformationProps {
  readContracts: Record<string, ethers.Contract>,
}


export const AccountInformation: FC<IAccountInformationProps> = (props) => {
  const ethersContext = useEthersContext();

  const DEXContract = props.readContracts['DEX'] as DEXContract;
  const BalloonsContract = props.readContracts['Balloons'] as BalloonsContract;

  const [localAddress] = useDebounce<string | undefined>(
    ethersContext.account,
    200,
    {
      trailing: true,
    }
  );

  const liquidityArray = useContractReader<BigNumber[]>(DEXContract, {
    contractName: 'DEX',
    functionName: 'getLiquidity',
    functionArgs: [localAddress]
  });
  
  const liquidity = liquidityArray ? liquidityArray[0] : undefined;

  return (
    <>
      <TokenContractBalance img={"🎈"} contract={BalloonsContract} contractName={'Balloons'} address={localAddress} />
      <h3>
        💦💦: <Balance address={undefined} balance={liquidity} />
      </h3>
    </>
  )
};
