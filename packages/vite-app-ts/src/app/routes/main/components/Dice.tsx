import { EtherscanProvider, StaticJsonRpcProvider } from '@ethersproject/providers';
import { transactor, TTransactor } from 'eth-components/functions';
import { useBalance, useContractLoader, useEventListener, useGasPrice, useOnRepetition } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useAppContracts } from '../hooks/useAppContracts';
import { DiceGame as DiceGameContract, RiggedRoll as RiggedRollContract } from '~~/generated/contract-types';
import { Button, List } from 'antd';
import { Account, Address, Balance } from 'eth-components/ant';
import { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { NETWORKS } from '~~/models/constants/networks';
import { getImage } from '../functions/image-helper';


export interface DiceProps {
  mainnetProvider: StaticJsonRpcProvider;
}

export const Dice: FC<DiceProps> = (props) => {
  const { mainnetProvider } = props;

  const appContractConfig = useAppContracts();
  const ethersContext = useEthersContext();
  const readContracts = useContractLoader(appContractConfig);
  const writeContracts = useContractLoader(appContractConfig, ethersContext?.signer);

  const yourCurrentBalance = useBalance(ethersContext.account ?? '');

  const diceGameContractRead = readContracts['DiceGame'] as DiceGameContract;
  const diceGameContractWrite = writeContracts['DiceGame'] as DiceGameContract;
  const riggedRollContractRead = readContracts['RiggedRoll'] as RiggedRollContract;
  const riggedRollContractWrite = writeContracts['RiggedRoll'] as RiggedRollContract;

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const gasPrice = useGasPrice(ethersContext.chainId, 'fast');
  const ethPrice = useDexEthPrice(mainnetProvider);
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice, undefined, true);

  // 🔭 block explorer URL
  // const blockExplorer = props.scaffoldAppProviders.targetNetwork.blockExplorer;

  const [prize, setPrize] = useState<BigNumber>();
  useEffect(() => {
    const getPrize = async () => {
      const prize = await diceGameContractRead?.prize();
      console.log('💵 prize:', prize);
      setPrize(prize);
    };
    getPrize();
  }, [yourCurrentBalance]);

  // ** 📟 Listen for broadcast events
  const winnerEvents = useEventListener(diceGameContractRead, "Winner", 1);
  const rollEvents = useEventListener(diceGameContractRead, "Roll", 1);

  const [diceRolled, setDiceRolled] = useState(false);
  const [diceRollImage, setDiceRollImage] = useState('');

  let diceRollImg;
  if (diceRollImage) {
    diceRollImg = <img style={{ width: "300px", height: "300px" }} src={getImage(`${diceRollImage}.png`)} />;
  }

  const rollTheDice = async () => {
    setDiceRolled(true);
    setDiceRollImage("ROLL");

    if (tx) {
      try {
        await tx(diceGameContractWrite.rollTheDice({ value: ethers.utils.parseEther("0.002"), gasLimit: 500000 }), update => {
          if (update?.status === "failed") {
            setDiceRolled(false);
            //setDiceRollImage(null);
          }
        });
      }
      catch (e) {
        setDiceRolled(false);
      }
    }
  };

  /*
  const riggedRoll = async () => {
    if (!tx) {
      return;
    }
    try {
      tx(riggedRollContractWrite.riggedRoll({ gasLimit: 500000 }), update => {
        console.log("TX UPDATE", update);
        if (update?.status === "sent" || update?.status === 1) {
          setDiceRolled(true);
          setDiceRollImage("ROLL");
        }
        if (update?.status === "failed") {
          setDiceRolled(false);
          //setDiceRollImage(null);
        }
        if (update?.status == 1 || update?.status == "confirmed") {
          setTimeout(() => {
            setDiceRolled(false);
          }, 1500);
        }
      });
    }
    catch (e) {
      setDiceRolled(false);
    }
  };

  const riggedFilter = diceGameContractRead?.filters.Roll(riggedRollContractRead.address, null);
  readContracts.DiceGame?.on(riggedFilter, (_, value) => {
    if (value) {
      const numberRolled = value.toNumber().toString(16).toUpperCase();
      setDiceRollImage(numberRolled);
      setDiceRolled(false);
    }
  });
  */

  const filter = diceGameContractRead?.filters.Roll(ethersContext.account, null);

  diceGameContractRead?.on(filter, (_, value) => {
    if (value) {
      const numberRolled = value.toNumber().toString(16).toUpperCase();
      setDiceRollImage(numberRolled);
      setDiceRolled(false);
    }
  });

  const date = new Date();

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: 250, margin: "auto", marginTop: 64 }}>
        <div>Roll Events:</div>
        <List
          style={{ height: 258, overflow: "hidden" }}
          dataSource={rollEvents}
          renderItem={item => {
            return (
              <List.Item
                key={item.args[0] + " " + item.args[1] + " " + date.getTime() + " " + item.blockNumber}
              >
                <Address address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} />
                &nbsp;Roll:&nbsp;{item.args[1].toNumber().toString(16).toUpperCase()}
              </List.Item>
            );
          }}
        />
      </div>
      <div id="centerWrapper" style={{ padding: 16 }}>
        <h2>Roll a 0, 1, or 2 to win the prize!</h2>
        <Balance address={undefined} balance={prize} price={ethPrice} />
        <div style={{ padding: 16, /*format: "flex",*/ flexDirection: "row" }}>
          <Button type="primary" disabled={diceRolled} onClick={rollTheDice}>
            Roll the dice!
          </Button>
          {/*
          <div style={{ padding: 16 }}>
            <div style={{ padding: 16 }}>
              <Address address={readContracts?.RiggedRoll?.address} ensProvider={mainnetProvider} fontSize={24} />
              <div />
              <Balance address={readContracts?.RiggedRoll?.address} price={ethPrice} />
            </div>
            <Button style={{ margin: 16 }} type="primary" disabled={diceRolled} onClick={riggedRoll}>
              Rigged Roll!
            </Button>
          </div>
        */}
        </div>
        {diceRollImg}
      </div>
      <div style={{ width: 250, margin: "auto", marginTop: 32 }}>
        <div>Winner Events:</div>
        <List
          style={{ height: 258, overflow: "hidden" }}
          dataSource={winnerEvents}
          renderItem={item => {
            return (
              <List.Item
                key={item.args[0] + " " + item.args[1] + " " + date.getTime() + " " + item.blockNumber}
              >
                <Address address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} />
                <br></br>
                <Balance address={undefined} balance={item.args[1]} price={ethPrice} />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};
