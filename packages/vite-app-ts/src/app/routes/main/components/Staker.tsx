import { EtherscanProvider, StaticJsonRpcProvider } from '@ethersproject/providers';
import { TTransactor } from 'eth-components/functions';
import { useBalance, useContractLoader, useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import React, { FC, useEffect, useState } from 'react';
import { useAppContracts } from '../hooks/useAppContracts';
import { Staker as StakerContract, ExampleExternalContract } from '~~/generated/contract-types';
import { Button, List } from 'antd';
import { Address, Balance } from 'eth-components/ant';
import { formatEther, parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { ethers } from 'ethers';

const langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
const humanizer: HumanizeDuration = new HumanizeDuration(langService);

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

  const yourCurrentBalance = useBalance(ethersContext.account ?? '');

  const stakeContractRead = readContracts['Staker'] as StakerContract;
  const stakeContractWrite = writeContracts['Staker'] as StakerContract;
  const externalContractRead = readContracts['ExampleExternalContract'] as ExampleExternalContract;

  const [threshold, setThreshold] = useState<BigNumber>();
  useEffect(() => {
    const getThreshold = async () => {
      const threshold = await stakeContractRead.threshold();
      console.log('💵 threshold:', threshold);
      setThreshold(threshold);
    };
    getThreshold();
  }, [yourCurrentBalance]);

  const [balanceStaked, setBalanceStaked] = useState<BigNumber>();
  useEffect(() => {
    const getBalanceStaked = async () => {
      const balanceStaked = await stakeContractRead.balances(ethersContext?.account ?? '');
      console.log('💵 balanceStaked:', balanceStaked);
      setBalanceStaked(balanceStaked);
    };
    getBalanceStaked();
  }, [yourCurrentBalance]);

  const [timeLeft, setTimeLeft] = useState<BigNumber>();
  useEffect(() => {
    const getTimeLeft = async () => {
      const timeLeft = await stakeContractRead.timeLeft();
      console.log('⏳ timeLeft:', timeLeft);
      setTimeLeft(timeLeft);
    };
    getTimeLeft();
  }, [yourCurrentBalance]);

  const [completed, setCompleted] = useState<boolean>(false);
  useEffect(() => {
    const getCompleted = async () => {
      const completed = await externalContractRead.completed();
      console.log('✅ complete:', completed);
      setCompleted(completed);
    };
    getCompleted();
  }, [yourCurrentBalance]);

  const stakerContractBalance = useBalance(stakeContractRead?.address ?? null);
  const externalContractBalance = useBalance(externalContractRead?.address ?? null);

  // ** 📟 Listen for broadcast events
  const stakeEvents = useEventListener(stakeContractRead, 'Stake', 1);

  let completeDisplay = <></>;
  if (completed) {
    completeDisplay = (
      <div style={{ padding: 64, backgroundColor: '#eeffef', fontWeight: 'bolder' }}>
        🚀 🎖 👩‍🚀 - Staking App triggered `ExampleExternalContract` -- 🎉 🍾 🎊
        <Balance address={externalContractRead?.address} balance={externalContractBalance} /> ETH staked!
      </div>
    );
  }
  return (
    <div>
      {completeDisplay}

      <div style={{ padding: 8, marginTop: 32 }}>
        <div>Staker Contract:</div>
        <Address address={stakeContractRead?.address} />
      </div>

      <div style={{ padding: 8, marginTop: 32 }}>
        <div>Timeleft:</div>
        {timeLeft && humanizer.humanize(timeLeft.toNumber() * 1000)}
      </div>

      <div style={{ padding: 8 }}>
        <div>Total staked:</div>
        <Balance address={undefined} balance={stakerContractBalance} />/
        <Balance address={undefined} balance={threshold} />
      </div>

      <div style={{ padding: 8 }}>
        <div>You staked:</div>
        <Balance address={undefined} balance={balanceStaked} />
      </div>

      <div style={{ padding: 8 }}>
        <Button
          type={'default'}
          onClick={() => {
            if (tx) {
              tx(stakeContractWrite.execute());
            }
          }}>
          📡 Execute!
        </Button>
      </div>

      <div style={{ padding: 8 }}>
        <Button
          type={'default'}
          onClick={() => {
            if (tx && ethersContext.account) {
              tx(stakeContractWrite.withdraw(ethersContext.account));
            }
          }}>
          🏧 Withdraw
        </Button>
      </div>

      <div style={{ padding: 8 }}>
        <Button
          type={balanceStaked ? 'primary' : 'default'}
          onClick={() => {
            if (tx) {
              tx(stakeContractWrite.stake({ value: ethers.utils.parseEther('0.5') }));
            }
          }}>
          🥩 Stake 0.5 ether!
        </Button>
      </div>

      <div style={{ width: 600, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <h2>Events:</h2>
        <List
          bordered
          dataSource={stakeEvents}
          renderItem={(item: any) => {
            return (
              <List.Item key={item.blockNumber + '_' + item.sender + '_' + item.purpose}>
                <Address address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} />
                {formatEther(item.args[1])}
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};
