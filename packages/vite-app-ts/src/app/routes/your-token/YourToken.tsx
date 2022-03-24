import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Button, Card, Divider, Input, List } from 'antd';
import { Address, AddressInput, Balance } from 'eth-components/ant';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useEventListener,
  useGasPrice,
  useOnRepetition,
} from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { BigNumber, ethers } from 'ethers';
import { FC, useContext, useEffect, useState } from 'react';
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

  const address = ethersContext.account ?? '';

  const vendorContract = readContracts['Vendor'] as Vendor;
  const yourTokenContract = readContracts['YourToken'] as YourTokenContract;

  const vendorContractWrite = writeContracts['Vendor'] as Vendor;
  const yourTokenContractWrite = writeContracts['YourToken'] as YourTokenContract;

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const gasPrice = useGasPrice(ethersContext.chainId, 'fast');
  const ethPrice = useDexEthPrice(mainnetProvider);
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const [yourTokenBalance, setYourTokenBalance] = useState<BigNumber>();
  useOnRepetition(
    async (): Promise<void> => {
      const getyourTokenBalance = async () => {
        if (!yourTokenContract) return;

        const yourTokenBalance = await yourTokenContract.balanceOf(address);
        console.log('🏵 yourTokenBalance:', yourTokenBalance ? ethers.utils.formatEther(yourTokenBalance) : '...');
        setYourTokenBalance(yourTokenBalance);
      };
      getyourTokenBalance();
    },
    {
      provider: mainnetProvider,
    }
  );

  const [tokensPerEth, setTokensPerEth] = useState<number>();
  useEffect(() => {
    const getTokensPerEth = async () => {
      if (!vendorContract) return;

      const tokensPerEth = await vendorContract.tokensPerEth();
      console.log('🏦 tokensPerEth:', tokensPerEth ? tokensPerEth.toString() : '...');
      setTokensPerEth(tokensPerEth.toNumber());
    };
    getTokensPerEth();
  }, [vendorContract]);

  const vendorApproval = useContractReader<BigNumber[]>(yourTokenContract, {
    contractName: 'YourToken',
    functionName: 'allowance',
    functionArgs: [address, vendorContract?.address],
  });
  console.log('🤏 vendorApproval', vendorApproval);

  const [tokenSendToAddress, setTokenSendToAddress] = useState('');
  const [tokenSendAmount, setTokenSendAmount] = useState<number>();
  const [buying, setBuying] = useState(false);

  const [tokenBuyAmount, setTokenBuyAmount] = useState<number>();
  const [tokenSellAmount, setTokenSellAmount] = useState<number>();
  const [isSellAmountApproved, setIsSellAmountApproved] = useState<boolean>(false);

  useEffect(() => {
    console.log('tokenSellAmount', tokenSellAmount);
    const tokenSellAmountBN = tokenSellAmount && ethers.utils.parseEther('' + tokenSellAmount);
    if (!tokenSellAmountBN) {
      return;
    }

    console.log('tokenSellAmountBN', tokenSellAmountBN);
    if (vendorApproval && vendorApproval[0].gte(tokenSellAmountBN)) {
      setIsSellAmountApproved(true);
    } else {
      setIsSellAmountApproved(false);
    }
    console.log('isSellAmountApproved', isSellAmountApproved);
  });

  let ethCostToPurchaseTokens = BigNumber.from(0);
  if (tokenBuyAmount && tokensPerEth) {
    ethCostToPurchaseTokens = ethers.utils.parseEther('' + tokenBuyAmount / parseFloat(tokensPerEth.toString()));
  }

  console.log('ethCostToPurchaseTokens:', ethCostToPurchaseTokens);

  let ethFromSellingTokens = BigNumber.from(0);
  if (tokenSellAmount && tokensPerEth) {
    ethFromSellingTokens = ethers.utils.parseEther('' + tokenSellAmount / parseFloat(tokensPerEth.toString()));
  }

  console.log('ethCostToPurchaseTokens:', ethCostToPurchaseTokens);

  const [vendorTokenBalance, setVendorTokenBalance] = useState<BigNumber>();
  useOnRepetition(
    async (): Promise<void> => {
      const getVendorTokenBalance = async () => {
        const balance = await yourTokenContract?.balanceOf(vendorContract?.address);
        console.log('🏵 vendorTokenBalance:', balance ? ethers.utils.formatEther(balance) : '...');
        setVendorTokenBalance(balance);
      };
      getVendorTokenBalance();
    },
    {
      provider: mainnetProvider,
    }
  );

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

                tx(yourTokenContractWrite.transfer(tokenSendToAddress, ethers.utils.parseEther('' + tokenSendAmount)));
              }}>
              Send Tokens
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const buyTokensEvents = useEventListener(vendorContract, 'BuyTokens', 1);

  return (
    <>
      <div style={{ padding: 8, marginTop: 32, width: 300, margin: 'auto' }}>
        <Card title="Your Tokens" extra={<a href="#">code</a>}>
          <div style={{ padding: 8 }}>
            <Balance balance={yourTokenBalance} address={undefined} />
          </div>
        </Card>
      </div>
      {transferDisplay}
      <Divider />
      <div style={{ padding: 8, marginTop: 32, width: 300, margin: 'auto' }}>
        <Card title="Buy Tokens" extra={<a href="#">code</a>}>
          <div style={{ padding: 8 }}>{tokensPerEth && tokensPerEth} tokens per ETH</div>

          <div style={{ padding: 8 }}>
            <Input
              style={{ textAlign: 'center' }}
              placeholder={'amount of tokens to buy'}
              value={tokenBuyAmount}
              onChange={(e) => {
                setTokenBuyAmount(Number(e.target.value));
              }}
            />
            <Balance balance={ethCostToPurchaseTokens} dollarMultiplier={ethPrice} address={undefined} />
          </div>

          <div style={{ padding: 8 }}>
            <Button
              type={'primary'}
              loading={buying}
              onClick={async () => {
                if (!tx) {
                  return;
                }

                setBuying(true);
                await tx(vendorContractWrite.buyTokens({ value: ethCostToPurchaseTokens }));
                setBuying(false);
              }}>
              Buy Tokens
            </Button>
          </div>
        </Card>
      </div>
      {/* Extra UI for buying the tokens back from the user using "approve" and "sellTokens"
      <Divider />
      <div style={{ padding: 8, marginTop: 32, width: 300, margin: 'auto' }}>
        <Card title="Sell Tokens">
          <div style={{ padding: 8 }}>{tokensPerEth && tokensPerEth} tokens per ETH</div>

          <div style={{ padding: 8 }}>
            <Input
              style={{ textAlign: 'center' }}
              placeholder={'amount of tokens to sell'}
              value={tokenSellAmount}
              onChange={(e) => {
                setTokenSellAmount(Number(e.target.value));
              }}
            />
            <Balance balance={ethFromSellingTokens} dollarMultiplier={ethPrice} address={undefined} />
          </div>
          {isSellAmountApproved ? (
            <div style={{ padding: 8 }}>
              <Button
                type={'primary'}
                loading={buying}
                onClick={async () => {
                  if (!tx || !tokenSellAmount) {
                    return;
                  }

                  setBuying(true);
                  await tx(vendorContractWrite.sellTokens(ethers.utils.parseEther(tokenSellAmount.toString())));
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
                  if (!tx || !tokenSellAmount) {
                    return;
                  }

                  setBuying(true);
                  await tx(
                    yourTokenContractWrite.approve(
                      readContracts.Vendor.address,
                      ethers.utils.parseEther(tokenSellAmount.toString())
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
      */}
      <div style={{ padding: 8, marginTop: 32 }}>
        <div>Vendor Token Balance:</div>
        <Balance balance={vendorTokenBalance} address={undefined} />
      </div>
      <div style={{ padding: 8 }}>
        <div>Vendor ETH Balance:</div>
        <Balance address={vendorContract?.address} /> ETH
      </div>
      <div style={{ width: 500, margin: 'auto', marginTop: 64 }}>
        <div>Buy Token Events:</div>
        <List
          dataSource={buyTokensEvents}
          renderItem={(item) => {
            return (
              <List.Item key={item.blockNumber + item.blockHash}>
                <Address address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} /> paid
                <Balance balance={item.args[1]} address={undefined} />
                ETH to get
                <Balance balance={item.args[2]} address={undefined} />
                Tokens
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};
