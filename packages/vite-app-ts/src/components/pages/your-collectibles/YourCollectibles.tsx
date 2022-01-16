import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { FC, useContext, useEffect, useState } from 'react';
import { YourCollectible } from '~~/generated/contract-types';
import { useContractLoader, useContractReader, useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { BigNumber, ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { Button, Card, List } from 'antd';
import { Address, AddressInput } from 'eth-components/ant';
import { transactor } from 'eth-components/functions';
import { mintJson } from './mint';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { getNetworkInfo } from '~~/functions';
import { useAppContracts } from '~~/config/contractContext';

export interface IYourCollectibleProps {
  mainnetProvider: StaticJsonRpcProvider | undefined;
  blockExplorer: string;
}

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
});
const getFromIPFS = async (cid: string) => {
  const decoder = new TextDecoder();
  let content = '';
  for await (const chunk of ipfs.cat(cid)) {
    content += decoder.decode(chunk);
  }
  return content;
};

export const YourCollectibles: FC<IYourCollectibleProps> = (props: IYourCollectibleProps) => {
  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const ethersContext = useEthersContext();
  const yourCollectible = useAppContracts('YourCollectible', ethersContext.chainId);

  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast', getNetworkInfo(ethersContext.chainId));
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const { mainnetProvider, blockExplorer } = props;

  // const YourCollectibleRead = readContracts['YourCollectible'] as YourCollectible;
  // const YourCollectibleWrite = writeContracts['YourCollectible'] as YourCollectible;
  const balance = useContractReader(yourCollectible, yourCollectible?.balanceOf, [ethersContext.account ?? '']);
  // const balance = useContractReader<BigNumber[]>(YourCollectibleRead, {
  //   contractName: 'YourCollectible',
  //   functionName: 'balanceOf',
  //   functionArgs: [ethersContext.account],
  // });
  console.log('balance', balance);
  //
  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  //
  const [yourCollectibles, setYourCollectibles] = useState<any>([]);
  const [minting, setMinting] = useState<boolean>(false);
  const [transferToAddresses, setTransferToAddresses] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateYourCollectibles = async () => {
      const collectibleUpdate = [];
      if (!balance) return;
      const yourBalance = balance[0]?.toNumber() ?? 0;
      for (let tokenIndex = 0; tokenIndex < yourBalance; tokenIndex++) {
        try {
          console.log('Getting token index', tokenIndex);
          const tokenId = await yourCollectible?.tokenOfOwnerByIndex(ethersContext.account ?? '', tokenIndex);
          console.log('tokenId', tokenId);
          const tokenURI = await yourCollectible?.tokenURI(BigNumber.from(tokenId));
          console.log('tokenURI', tokenURI);

          if (!tokenURI) continue;

          const ipfsHash = tokenURI.replace('https://ipfs.io/ipfs/', '');
          console.log('ipfsHash', ipfsHash);

          const content = await getFromIPFS(ipfsHash);

          try {
            const ipfsObject = JSON.parse(content);
            console.log('ipfsObject', ipfsObject);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: ethersContext.account, ...ipfsObject });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate);
    };
    updateYourCollectibles();
  }, [ethersContext.account, balance]);

  const [mintCount, setMintCount] = useState<number>(0);
  const mintItem = async () => {
    if (!tx || !ethersContext.account) return;

    // upload to ipfs
    const uploaded = await ipfs.add(JSON.stringify(mintJson[mintCount]));
    setMintCount(mintCount + 1);
    console.log('Uploaded Hash: ', uploaded);
    await tx(yourCollectible?.mintItem(ethersContext.account, uploaded.path), (update) => {
      console.log('📡 Transaction Update:', update);
      if (update && (update.status === 'confirmed' || update.status === 1)) {
        console.log(' 🍾 Transaction ' + update.hash + ' finished!');
        console.log(
          ' ⛽️ ' +
            update.gasUsed +
            '/' +
            (update.gasLimit || update.gas) +
            ' @ ' +
            parseFloat(update.gasPrice) / 1000000000 +
            ' gwei'
        );
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
          onClick={async () => {
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
          renderItem={(item: any) => {
            const id = item.id.toNumber();
            return (
              <List.Item key={id + '_' + item.uri + '_' + item.owner}>
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
                    onChange={(newValue) => {
                      setTransferToAddresses({ ...transferToAddresses, ...{ [id]: newValue } });
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (!ethersContext.account || !tx) return;
                      tx(yourCollectible?.transferFrom(ethersContext.account, transferToAddresses[id], id));
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
