import { EtherscanProvider, StaticJsonRpcProvider } from '@ethersproject/providers';
import { transactor } from 'eth-components/functions';
import { useBalance, useContractLoader, useEventListener, useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import React, { FC, useContext, useEffect, useState } from 'react';
import { Button, List } from 'antd';
import { Address, Balance } from 'eth-components/ant';
import { formatEther, parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { ethers } from 'ethers';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { useAppContracts } from '~~/config/contractContext';
import { TEthersProvider } from 'eth-hooks/models';

const langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
const humanizer: HumanizeDuration = new HumanizeDuration(langService);

export interface StakerProps {
  mainnetProvider: TEthersProvider | undefined;
}

export const Staker: FC<StakerProps> = (props) => {
  const { mainnetProvider } = props;

  const ethersContext = useEthersContext();

  const yourCurrentBalance = useBalance(ethersContext.account ?? '');

  const stakerContract = useAppContracts('Staker', ethersContext.chainId);
  const externalContract = useAppContracts('ExampleExternalContract', ethersContext.chainId);

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const [ethPrice] = useDexEthPrice(mainnetProvider);
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const [threshold, setThreshold] = useState<BigNumber>();
  useEffect(() => {
    const getThreshold = async () => {
      const threshold = await stakerContract?.threshold();
      console.log('💵 threshold:', threshold);
      setThreshold(threshold);
    };
    getThreshold();
  }, [yourCurrentBalance]);

  const [balanceStaked, setBalanceStaked] = useState<BigNumber>();
  useEffect(() => {
    const getBalanceStaked = async () => {
      const balanceStaked = await stakerContract?.balances(ethersContext?.account ?? '');
      console.log('💵 balanceStaked:', balanceStaked);
      setBalanceStaked(balanceStaked);
    };
    getBalanceStaked();
  }, [yourCurrentBalance]);

  const [timeLeft, setTimeLeft] = useState<BigNumber>();
  useEffect(() => {
    const getTimeLeft = async () => {
      const timeLeft = await stakerContract?.timeLeft();
      console.log('⏳ timeLeft:', timeLeft);
      setTimeLeft(timeLeft);
    };
    getTimeLeft();
  }, [yourCurrentBalance]);

  const [completed, setCompleted] = useState<boolean>(false);
  useEffect(() => {
    const getCompleted = async () => {
      const completed = await externalContract?.completed();
      console.log('✅ complete:', completed);
      setCompleted(completed ?? false);
    };
    getCompleted();
  }, [yourCurrentBalance]);

  // ** 📟 Listen for broadcast events
  const stakeEvents = useEventListener(stakerContract, 'Stake', 1);

  let completeDisplay = <></>;
  if (completed) {
    completeDisplay = (
      <div style={{ padding: 64, backgroundColor: '#eeffef', fontWeight: 'bolder' }}>
        🚀 🎖 👩‍🚀 - Staking App triggered `ExampleExternalContract` -- 🎉 🍾 🎊
        <Balance address={externalContract?.address} /> ETH staked!
      </div>
    );
  }
  return (
    <div>
      {completeDisplay}

      <div style={{ padding: 8, marginTop: 32 }}>
        <div>Staker Contract:</div>
        <Address address={stakerContract?.address} />
      </div>

      <div style={{ padding: 8, marginTop: 32 }}>
        <div>Timeleft:</div>
        {timeLeft && humanizer.humanize(timeLeft.toNumber() * 1000)}
      </div>

      <div style={{ padding: 8 }}>
        <div>Total staked:</div>
        <Balance address={stakerContract?.address} />/
        <Balance address={undefined} balance={threshold} />
      </div>

      <div style={{ padding: 8 }}>
        <div>You staked:</div>
        <Balance address={undefined} balance={balanceStaked} price={ethPrice} />
      </div>

      <div style={{ padding: 8 }}>
        <Button
          type={'default'}
          onClick={() => {
            if (tx) {
              tx(stakerContract?.execute());
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
              tx(stakerContract?.withdraw(ethersContext.account));
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
              tx(stakerContract?.stake({ value: ethers.utils.parseEther('0.5') }));
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
              <List.Item
                key={item.blockNumber + '_' + item.sender + '_' + item.purpose}
                style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
                  {/* <Address address={item?.args[0]} ensProvider={mainnetProvider} fontSize={16} /> */}
                  <div>→</div>
                  {/* <div>{formatEther(item.args[1])}</div> */}
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};
