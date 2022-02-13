import { Button, Card, List } from 'antd';
import { Address, AddressInput } from 'eth-components/ant';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useContractReader, useGasPrice, useSignerAddress } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { TEthersProvider } from 'eth-hooks/models';
import { BigNumber } from 'ethers';
import { create } from 'ipfs-http-client';
import { FC, useContext, useEffect, useState } from 'react';

import { mintJson } from './mint';

import { useAppContracts } from '~~/config/contractContext';

interface Metadata {
  descriptions: string;
  image: string;
  name: string;
}

interface Collectible extends Metadata {
  id: BigNumber | undefined;
  uri: string;
  owner: string | undefined;
}

interface TxUpdate {
  hash: string;
  gasLimit: BigNumber;
  gasUsed: BigNumber;
  gasPrice: BigNumber;
  status: number | string;
}

export interface IYourCollectibleProps {
  mainnetProvider: TEthersProvider | undefined;
  blockExplorer: string;
}

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
});

const getFromIPFS = async (cid: string): Promise<string> => {
  const decoder = new TextDecoder();
  let content = '';
  for await (const chunk of ipfs.cat(cid)) {
    content += decoder.decode(chunk);
  }
  return content;
};

export const YourCollectibles: FC<IYourCollectibleProps> = (props: IYourCollectibleProps) => {
  const { mainnetProvider, blockExplorer } = props;

  const ethersContext = useEthersContext();
  const yourCollectible = useAppContracts('YourCollectible', ethersContext.chainId);

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const [myAddress] = useSignerAddress(ethersContext.signer);
  const [balance] = useContractReader(yourCollectible, yourCollectible?.balanceOf, [myAddress ?? '']);
  console.log('balance', balance);

  const [yourCollectibles, setYourCollectibles] = useState<Collectible[]>([]);
  const [minting, setMinting] = useState<boolean>(false);
  const [transferToAddresses, setTransferToAddresses] = useState<{ [key: string]: string }>({});

  //
  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  //
  useEffect(() => {
    const getYourCollectibles = async (): Promise<Collectible[]> => {
      const collectibles: Collectible[] = [];
      if (!balance) return [];
      const yourBalance = balance?.toNumber() ?? 0;
      for (let tokenIndex = 0; tokenIndex < yourBalance; tokenIndex++) {
        try {
          console.log('Getting token index', tokenIndex);
          const tokenId = await yourCollectible?.tokenOfOwnerByIndex(ethersContext.account ?? '', tokenIndex);
          const tokenURI = await yourCollectible?.tokenURI(tokenId ?? '');
          if (!tokenURI) continue;
          const ipfsHash = tokenURI.replace('https://ipfs.io/ipfs/', '');
          const content = await getFromIPFS(ipfsHash);

          try {
            const ipfsObject = JSON.parse(content) as Metadata;
            console.log('ipfsObject', ipfsObject);
            collectibles.push({ id: tokenId, uri: tokenURI, owner: ethersContext.account, ...ipfsObject });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      return collectibles;
    };

    getYourCollectibles().then(
      (c) => setYourCollectibles(c),
      (_) => setYourCollectibles([])
    );
  }, [yourCollectible, ethersContext.account, balance]);

  const [mintCount, setMintCount] = useState<number>(0);
  const mintItem = async (): Promise<void> => {
    if (!tx || !ethersContext.account) return;

    // upload to ipfs
    const uploaded = await ipfs.add(JSON.stringify(mintJson[mintCount]));
    setMintCount(mintCount + 1);
    console.log('Uploaded Hash: ', uploaded);
    await tx(yourCollectible?.mintItem(ethersContext.account, uploaded.path), (update: TxUpdate) => {
      console.log('Update...', update);
      console.log('📡 Transaction Update:', update);
      if (update && (update.status === 'confirmed' || update.status === 1)) {
        const gas = parseFloat(update.gasPrice.toString()) / 1000000000;
        console.log(`🍾 Transaction ${update.hash} finished!`);
        console.log(`⛽️ ${update.gasUsed.toString()} / ${update.gasLimit.toString()} @ ${gas} gwei`);
      }
    });
  };

  return (
    <>
      <div style={{ width: 640, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <Button
          disabled={minting || mintCount >= mintJson.length - 1}
          shape="round"
          size="large"
          onClick={async (): Promise<void> => {
            setMinting(true);
            await mintItem();
            setMinting(false);
          }}>
          MINT NFT
        </Button>
      </div>
      <div style={{ width: 640, margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
        <List
          bordered
          dataSource={yourCollectibles}
          renderItem={(item: any): JSX.Element => {
            const id = item.id.toNumber();
            return (
              <List.Item key={`${id}_${item.uri}_${item.owner}`}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                    </div>
                  }>
                  <div>
                    <img src={item.image} style={{ maxWidth: 150 }} />
                  </div>
                  <div>{item.description}</div>
                </Card>

                <div>
                  owner:{' '}
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
                    onChange={(newValue): void => {
                      setTransferToAddresses({ ...transferToAddresses, ...{ [id]: newValue } });
                    }}
                  />
                  <Button
                    onClick={async (): Promise<void> => {
                      if (!ethersContext.account || !tx) return;
                      await tx(
                        yourCollectible?.transferFrom(ethersContext.account, transferToAddresses[id], id as BigNumber)
                      );
                    }}>
                    Transfer
                  </Button>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
};
