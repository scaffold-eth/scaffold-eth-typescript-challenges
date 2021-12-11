import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Button, Card, Divider, Input, List } from 'antd';
import { Address, AddressInput, Balance } from 'eth-components/ant';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useContractLoader, useContractReader, useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { BigNumber, ethers } from 'ethers';
import { FC, useContext, useEffect, useState } from 'react';
import { verifyInjectedProvider } from 'web3modal';
import { Vendor, YourToken as YourTokenContract } from '~~/generated/contract-types';
import { useAppContracts } from '../main/hooks/useAppContracts';

export interface IYourTokenProps {
  mainnetProvider: StaticJsonRpcProvider;
}

export const YourToken: FC<IYourTokenProps> = (props) => {
  const { mainnetProvider } = props;

  const appContractConfig = useAppContracts();
  const ethersContext = useEthersContext();
  const readContracts = useContractLoader(appContractConfig);
  const writeContracts = useContractLoader(appContractConfig, ethersContext?.signer);

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice('localhost', mainnetProvider); // TODO: get newtork

  const address = ethersContext.account ?? '';

  const vendorContract = readContracts['Vendor'] as Vendor;
  const yourTokenContract = readContracts['YourToken'] as YourTokenContract;

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const gasPrice = useGasPrice(ethersContext.chainId, 'fast');
  const ethPrice = useDexEthPrice(mainnetProvider);
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const yourTokenBalance = useContractReader<BigNumber>(yourTokenContract, {
    contractName: 'YourToken',
    functionName: 'balanceOf',
    functionArgs: [address],
  });
  console.log('🏵 yourTokenBalance:', yourTokenBalance ? ethers.utils.formatEther(yourTokenBalance) : '...');

  const tokensPerEth = useContractReader<BigNumber>(vendorContract, {
    contractName: 'Vendor',
    functionName: 'tokensPerEth',
  });
  console.log('🏦 tokensPerEth:', tokensPerEth ? tokensPerEth.toString() : '...');

  const vendorApproval = useContractReader<BigNumber>(yourTokenContract, {
    contractName: 'YourToken',
    functionName: 'allowance',
    functionArgs: [address, vendorContract.address],
  });
  console.log('🤏 vendorApproval', vendorApproval);

  useEffect(() => {
    console.log('tokenSellAmount', tokenSellAmount);
    const tokenSellAmountBN = tokenSellAmount && ethers.utils.parseEther('' + tokenSellAmount);
    console.log('tokenSellAmountBN', tokenSellAmountBN);
    setIsSellAmountApproved(vendorApproval && tokenSellAmount && vendorApproval.gte(tokenSellAmountBN));
  }, [tokenSellAmount, readContracts]);
  console.log('isSellAmountApproved', isSellAmountApproved);

  const ethCostToPurchaseTokens =
    tokenBuyAmount && tokensPerEth && ethers.utils.parseEther('' + tokenBuyAmount / parseFloat(tokensPerEth));
  console.log('ethCostToPurchaseTokens:', ethCostToPurchaseTokens);

  const [tokenSendToAddress, setTokenSendToAddress] = useState('');
  const [tokenSendAmount, setTokenSendAmount] = useState<number>();
  const [buying, setBuying] = useState(false);

  const [tokenBuyAmount, setTokenBuyAmount] = useState<number>();
  const [tokenSellAmount, setTokenSellAmount] = useState<number>();
  const [isSellAmountApproved, setIsSellAmountApproved] = useState<boolean>();

  let transferDisplay = <></>;
  if (yourTokenBalance) {
    transferDisplay = (
      <div style={{ padding: 8, marginTop: 32, width: 420, margin: 'auto' }}>
        <Card title="Transfer tokens">
          <div>
            <div style={{ padding: 8 }}>
              <AddressInput
                ensProvider={mainnetProvider}
                placeholder="to address"
                address={tokenSendToAddress}
                onChange={setTokenSendToAddress}
              />
            </div>
            <div style={{ padding: 8 }}>
              <Input
                style={{ textAlign: 'center' }}
                placeholder={'amount of tokens to send'}
                value={tokenSendAmount}
                onChange={(e) => {
                  setTokenSendAmount(Number(e.target.value));
                }}
              />
            </div>
          </div>
          <div style={{ padding: 8 }}>
            <Button
              type={'primary'}
              onClick={() => {
                if (!tx) {
                  return;
                }
                // TODO
                // tx(
                //   writeContracts.YourToken.transfer(tokenSendToAddress, ethers.utils.parseEther('' + tokenSendAmount))
                // );
              }}>
              Send Tokens
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: 8, marginTop: 32, width: 300, margin: 'auto' }}>
        <Card title="Your Tokens" extra={<a href="#">code</a>}>
          <div style={{ padding: 8 }}>
            <Balance address={vendorContract.address} />
          </div>
        </Card>
      </div>
      {transferDisplay}
      <Divider />
      <div style={{ padding: 8, marginTop: 32, width: 300, margin: 'auto' }}>
        <Card title="Buy Tokens" extra={<a href="#">code</a>}>
          <div style={{ padding: 8 }}>{tokensPerEth && tokensPerEth.toNumber()} tokens per ETH</div>

          <div style={{ padding: 8 }}>
            <Input
              style={{ textAlign: 'center' }}
              placeholder={'amount of tokens to buy'}
              value={tokenBuyAmount}
              onChange={(e) => {
                setTokenBuyAmount(Number(e.target.value));
              }}
            />
            <Balance balance={ethCostToPurchaseTokens} dollarMultiplier={price} />
          </div>

          <div style={{ padding: 8 }}>
            <Button
              type={'primary'}
              loading={buying}
              onClick={async () => {
                setBuying(true);
                await tx(writeContracts.Vendor.buyTokens({ value: ethCostToPurchaseTokens }));
                setBuying(false);
              }}>
              Buy Tokens
            </Button>
          </div>
        </Card>
      </div>
      /* //Extra UI for buying the tokens back from the user using "approve" and "sellTokens"
      <Divider />
      <div style={{ padding: 8, marginTop: 32, width: 300, margin: 'auto' }}>
        <Card title="Sell Tokens">
          <div style={{ padding: 8 }}>{tokensPerEth && tokensPerEth.toNumber()} tokens per ETH</div>

          <div style={{ padding: 8 }}>
            <Input
              style={{ textAlign: 'center' }}
              placeholder={'amount of tokens to sell'}
              value={tokenSellAmount}
              onChange={(e) => {
                setTokenSellAmount(e.target.value);
              }}
            />
            <Balance balance={ethCostToPurchaseTokens} dollarMultiplier={price} />
          </div>
          {isSellAmountApproved ? (
            <div style={{ padding: 8 }}>
              <Button
                type={'primary'}
                loading={buying}
                onClick={async () => {
                  setBuying(true);
                  await tx(
                    writeContracts.Vendor.sellTokens(tokenSellAmount && ethers.utils.parseEther(tokenSellAmount))
                  );
                  setBuying(false);
                }}>
                Sell Tokens
              </Button>
            </div>
          ) : (
            <div style={{ padding: 8 }}>
              <Button
                type={'primary'}
                loading={buying}
                onClick={async () => {
                  setBuying(true);
                  await tx(
                    writeContracts.YourToken.approve(
                      readContracts.Vendor.address,
                      tokenSellAmount && ethers.utils.parseEther(tokenSellAmount)
                    )
                  );
                  setBuying(false);
                }}>
                Approve Tokens
              </Button>
            </div>
          )}
        </Card>
      </div>
      */
      <div style={{ padding: 8, marginTop: 32 }}>
        <div>Vendor Token Balance:</div>
        <Balance balance={vendorTokenBalance} fontSize={64} />
      </div>
      <div style={{ padding: 8 }}>
        <div>Vendor ETH Balance:</div>
        <Balance balance={vendorETHBalance} fontSize={64} /> ETH
      </div>
      <div style={{ width: 500, margin: 'auto', marginTop: 64 }}>
        <div>Buy Token Events:</div>
        <List
          dataSource={buyTokensEvents}
          renderItem={(item) => {
            return (
              <List.Item key={item.blockNumber + item.blockHash}>
                <Address value={item.args[0]} ensProvider={mainnetProvider} fontSize={16} /> paid
                <Balance balance={item.args[1]} />
                ETH to get
                <Balance balance={item.args[2]} />
                Tokens
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};
function useExchangeEthPrice(targetNetwork: any, mainnetProvider: StaticJsonRpcProvider) {
  throw new Error('Function not implemented.');
}
