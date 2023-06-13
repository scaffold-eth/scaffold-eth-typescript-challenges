import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { transactor } from 'eth-components/functions';
import { useBalance, useContractLoader, useContractReader, useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useAppContracts } from '../hooks/useAppContracts';
import { YourCollectible as YourCollectibleContract } from '~~/generated/contract-types';
import { Button, Card, List } from 'antd';
import { Address, AddressInput } from 'eth-components/ant';
import { BigNumber } from 'ethers';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useDexEthPrice } from 'eth-hooks/dapps';

export interface YourCollectibleProps {
  mainnetProvider: StaticJsonRpcProvider;
  blockExplorer: string;
}

interface TokenMetadata {
  id: BigNumber;
  name: string;
  description: string;
  uri: string;
  image: string;
  owner: string;
}

export const YourCollectible: FC<YourCollectibleProps> = (props) => {
  const { mainnetProvider, blockExplorer } = props;

  const appContractConfig = useAppContracts();
  const ethersContext = useEthersContext();
  const readContracts = useContractLoader(appContractConfig);
  const writeContracts = useContractLoader(appContractConfig, ethersContext?.signer);

  const yourCurrentBalance = useBalance(ethersContext.account ?? '');

  const YourCollectibleContractRead = readContracts['YourCollectible'] as YourCollectibleContract;
  const YourCollectibleContractWrite = writeContracts['YourCollectible'] as YourCollectibleContract;

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const gasPrice = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const isSigner = mainnetProvider.getSigner && mainnetProvider.getSigner()._isSigner;

  const accountAddress = ethersContext.account ?? '';

  const balance = useContractReader<BigNumber[]>(YourCollectibleContractRead, {
    contractName: 'YourCollectible',
    functionName: 'balanceOf',
    functionArgs: [accountAddress],
  });

  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  const [transferToAddresses, setTransferToAddresses] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateYourCollectibles = async () => {
      const collectibleUpdate = [];
      if (!balance) return;
      const yourBalance = balance[0]?.toNumber() ?? 0;
      for (let tokenIndex = 0; tokenIndex < yourBalance; tokenIndex++) {
        try {
          console.log("Getting token index", tokenIndex);
          const tokenId = await YourCollectibleContractRead.tokenOfOwnerByIndex(accountAddress, tokenIndex);
          console.log("tokenId", tokenId);
          const tokenURI = await YourCollectibleContractRead.tokenURI(tokenId);
          const jsonManifestString = Buffer.from(tokenURI.substring(29), 'base64').toString('utf-8');
          console.log("jsonManifestString", jsonManifestString);
          /*
                    const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
                    console.log("ipfsHash", ipfsHash);
          
                    const jsonManifestBuffer = await getFromIPFS(ipfsHash);
          
                  */
          try {
            const jsonManifest = JSON.parse(jsonManifestString);
            console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: accountAddress, ...jsonManifest });
          } catch (e) {
            console.log(e);
          }

        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate.reverse());
    };
    updateYourCollectibles();
  }, [accountAddress, balance]);


  return (
    <div>
      <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        {isSigner ? (
          <Button type={"primary"} onClick={() => {
            if (tx) {
              tx(YourCollectibleContractWrite.mintItem());
            }
          }}>MINT</Button>
        ) : (
          <></>
        )}

      </div>

      <div style={{ width: 820, margin: "auto", paddingBottom: 256 }}>
        <List
          bordered
          dataSource={yourCollectibles}
          renderItem={(item: TokenMetadata) => {
            const id = item.id.toNumber();

            console.log("IMAGE", item.image)

            return (
              <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
                    </div>
                  }
                >
                  <a href={"https://opensea.io/assets/" + (readContracts && readContracts.YourCollectible && readContracts.YourCollectible.address) + "/" + item.id} target="_blank">
                    <img src={item.image} />
                  </a>
                  <div>{item.description}</div>
                </Card>

                <div>
                  owner:{" "}
                  <Address
                    address={item.owner}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={16}
                  />
                  <AddressInput
                    ensProvider={mainnetProvider}
                    placeholder="transfer to address"
                    address={transferToAddresses[id]}
                    onChange={(newValue) => {
                      setTransferToAddresses({ ...transferToAddresses, ...{ [id]: newValue } });
                    }}
                  />
                  <Button
                    onClick={() => {
                      console.log("writeContracts", writeContracts);
                      if (tx) {
                        tx(YourCollectibleContractWrite.transferFrom(accountAddress, transferToAddresses[id], id));
                      }
                    }}
                  >
                    Transfer
                  </Button>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
      <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 256 }}>

        🛠 built with <a href="https://github.com/scaffold-eth/scaffold-eth" target="_blank">🏗 scaffold-eth</a>

        🍴 <a href="https://github.com/scaffold-eth/scaffold-eth" target="_blank">Fork this repo</a> and build a cool SVG NFT!

      </div>
    </div>
  );
};
