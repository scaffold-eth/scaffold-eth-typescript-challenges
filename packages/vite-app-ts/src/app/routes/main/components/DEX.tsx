import { Row, Col, Input, Divider, Card } from 'antd';
import { Address, GenericContract } from 'eth-components/ant';
import { useBalance, useContractLoader, useContractReader } from 'eth-hooks';
import { TContractLoaderConfig } from 'eth-hooks/models';
import { ethers, Contract, BigNumber } from 'ethers';
import { FC, useEffect, useState } from 'react';
import { IScaffoldAppProviders } from '../hooks/useScaffoldAppProviders';
import { Curve } from './base/Curve';
import { TokenContractBalance } from './base/TokenContractBalance';
import { Balloons } from '~~/generated/contract-types';
import { TTransactor } from 'eth-components/functions';

export interface IDEXProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  appContractConfig: TContractLoaderConfig;
  readContracts: Record<string, Contract>;
  writeContracts: Record<string, Contract>;
  tx?: TTransactor;
  address?: string
}

const contractName = "DEX";
const tokenName = "Balloons";


class FormValues {
  [fieldName: string]: string;
}

export const DEX: FC<IDEXProps> = (props) => {

  let display = [];

  const [form, setForm] = useState({});
  const [values, setValues] = useState<FormValues>();
  const tx = props.tx;
  const readContracts = props.readContracts;
  const writeContracts = props.writeContracts;

  const contractList = useContractLoader(props.appContractConfig, undefined);

  const DEXContract = props.readContracts[contractName];
  const BalloonsContract = props.readContracts[tokenName] as Balloons;
  const contractAddress = DEXContract?.address;
  const contractBalance = useBalance(contractAddress);


  const [tokenBalanceFloat, setTokenBalanceFloat] = useState<number>(0);
  useEffect(() => {
    const getBalanceStaked = async () => {
      const tokenBalance = BalloonsContract ? await BalloonsContract.balanceOf(contractAddress ?? '') : BigNumber.from(0);
      const tokenBalanceFloat = parseFloat(ethers.utils.formatEther(tokenBalance));
      // console.log('💵 token balance:', tokenBalanceFloat.toString());
      setTokenBalanceFloat(tokenBalanceFloat);
    };
    getBalanceStaked();
  }, [BalloonsContract, contractAddress]);

  const ethBalanceFloat = parseFloat(ethers.utils.formatEther(contractBalance));

  const totalLiquidityArray = useContractReader<BigNumber[]>(DEXContract, {
    contractName: 'DEX',
    functionName: 'totalLiquidity',
  });

  const liquidity = totalLiquidityArray ? totalLiquidityArray[0] : undefined;

  const rowForm = (title: string, icon: string, onClick: (value: number) => {}) => {
    return (
      <Row>
        <Col span={8} style={{ textAlign: "right", opacity: 0.333, paddingRight: 6, fontSize: 24 }}>
          {title}
        </Col>
        <Col span={16}>
          <div style={{ cursor: "pointer", margin: 2 }}>
            <Input
              onChange={e => {
                let newValues: FormValues = Object.assign(new FormValues(), values);
                newValues[title] = e.target.value;
                setValues(newValues);
              }}
              value={values ? values[title] : ''}
              addonAfter={
                <div
                  // type="default"
                  onClick={() => {
                    onClick(parseFloat(values ? values[title] : '0'));
                    let newValues = { ...values };
                    newValues[title] = '';
                    setValues(newValues);
                  }}
                >
                  {icon}
                </div>
              }
            />
          </div>
        </Col>
      </Row>
    );
  };

  if (readContracts && readContracts[contractName] && tx && props.address) {
    display.push(
      <div>
        {rowForm("ethToToken", "💸", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let valuePlusExtra = ethers.utils.parseEther("" + value * 1.03);
          console.log("valuePlusExtra", valuePlusExtra);
          let swapEthToTokenResult = await tx(writeContracts[contractName]["ethToToken"]({ value: valuePlusExtra }));
          console.log("swapEthToTokenResult:", swapEthToTokenResult);
        })}

        {rowForm("tokenToEth", "🔏", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          console.log("valueInEther", valueInEther);
          let valuePlusExtra = ethers.utils.parseEther("" + value * 1.03);
          console.log("valuePlusExtra", valuePlusExtra);
          let allowance = await props.readContracts[tokenName].allowance(
            props.address,
            readContracts[contractName].address,
          );
          console.log("allowance", allowance);

          let approveTx;
          if (allowance.lt(valuePlusExtra)) {
            approveTx = await tx(
              writeContracts[tokenName].approve(props.readContracts[contractName].address, valuePlusExtra, {
                gasLimit: 200000,
              }),
            );
          }

          let swapTx = tx(writeContracts[contractName]["tokenToEth"](valuePlusExtra, { gasLimit: 200000 }));
          if (approveTx) {
            console.log("waiting on approve to finish...");
            let approveTxResult = await approveTx;
            console.log("approveTxResult:", approveTxResult);
          }
          let swapTxResult = await swapTx;
          console.log("swapTxResult:", swapTxResult);
        })}

        <Divider> Liquidity ({liquidity ? ethers.utils.formatEther(liquidity) : "none"}):</Divider>

        {rowForm("deposit", "📥", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let allowance = await props.readContracts[tokenName].allowance(
            props.address,
            props.readContracts[contractName].address,
          );
          console.log("allowance", allowance);
          if (allowance.lt(valueInEther)) {
            await tx(
              writeContracts[tokenName].approve(props.readContracts[contractName].address, valueInEther, {
                gasLimit: 200000,
              }),
            );
          }
          await tx(writeContracts[contractName]["deposit"]({ value: valueInEther, gasLimit: 200000 }));
        })}

        {rowForm("withdraw", "📤", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let withdrawTxResult = await tx(writeContracts[contractName]["withdraw"](valueInEther));
          console.log("withdrawTxResult:", withdrawTxResult);
        })}
      </div>
    );
  }

  return (
    <Row >
      <Col span={12}>
        <Card
          title={
            <div>
              <Address address={contractAddress} />
              <div style={{ float: "right", fontSize: 24 }}>
                {parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)} ⚖️
                <TokenContractBalance img={"🎈"} contract={BalloonsContract} contractName={'Balloons'} address={DEXContract?.address} />
              </div>
            </div>
          }
          loading={false}
        >
          {display}
        </Card>
        <Card>
          <Address address={BalloonsContract?.address} />
        </Card>
        <Row>
          <GenericContract
            contractName="Balloons"
            contract={contractList?.['Balloons']}
            show={["balanceOf", "approve"]}
            mainnetProvider={props.scaffoldAppProviders.mainnetProvider}
            blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
            contractConfig={props.appContractConfig}
          />
        </Row>
      </Col>
      <Col span={12}>
        <div style={{ padding: 20 }}>
          <Curve
            addingEth={values && values["ethToToken"] ? parseFloat(values["ethToToken"]) : 0}
            addingToken={values && values["tokenToEth"] ? parseFloat(values["tokenToEth"]) : 0}
            ethReserve={ethBalanceFloat}
            tokenReserve={tokenBalanceFloat}
            width={500}
            height={500}
          />
        </div>
      </Col>
    </Row>
  );
}
