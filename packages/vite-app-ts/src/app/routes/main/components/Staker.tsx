import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { TTransactor } from 'eth-components/functions';
import { useContractLoader, useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import React, { FC } from 'react';
import { useAppContracts } from '../hooks/useAppContracts';
import { Staker as StakerContract } from '~~/generated/contract-types';
import { List } from 'antd';
import { Address, Balance } from 'eth-components/ant';
import { formatEther, parseEther } from '@ethersproject/units';

export interface StakerProps {
  mainnetProvider: StaticJsonRpcProvider;
  tx: TTransactor | undefined;
}

export const Staker: FC<StakerProps> = (props) => {
  const { mainnetProvider, tx } = props;

  const appContractConfig = useAppContracts();
  const ethersContext = useEthersContext();
  const readContracts = useContractLoader(appContractConfig);
  const writeContracts = useContractLoader(appContractConfig, ethersContext?.signer);

  const yourContractRead = readContracts['Staker'] as StakerContract;
  const yourContractWrite = writeContracts['Staker'] as StakerContract;

  const stakeEvents = useEventListener(yourContractRead, 'Stake', 1);
  console.log(stakeEvents);

  return (
    <div>
      <h1>Staker</h1>
      <div style={{ width: 600, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <h2>Events:</h2>
        <List
          bordered
          dataSource={stakeEvents}
          renderItem={(item: any) => {
            return (
              <List.Item key={item.blockNumber + '_' + item.sender + '_' + item.purpose}>
                <Address address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} /> =>
                {formatEther(item.args[1])}
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};
