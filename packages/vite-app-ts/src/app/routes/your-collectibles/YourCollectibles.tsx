import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { FC, useEffect, useState } from 'react';
import { YourCollectible } from '~~/generated/contract-types';
import { useAppContracts } from '~~/app/routes/main/hooks/useAppContracts';
import { useContractLoader, useContractReader } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { BigNumber, ethers } from 'ethers';
import { create } from 'ipfs-http-client';

export interface IYourCollectibleProps {
  mainnetProvider: StaticJsonRpcProvider;
}

const ipfsAPI = create({ url: 'https://ipfs.infura.io:5001' });
const getFromIPFS = async (hashToGet: string) => {
  for await (const file of ipfsAPI.get(hashToGet)) {
    console.log('file');
    // if (!file.content) continue;
    // const content = new BufferList();
    // for await (const chunk of file.content) {
    //   content.append(chunk);
    // }
    // console.log(content);
    // return content;
  }
};

export const YourCollectibles: FC<IYourCollectibleProps> = () => {
  const ethersContext = useEthersContext();
  const appContractConfig = useAppContracts();
  const readContracts = useContractLoader(appContractConfig);

  const YourCollectible = readContracts['YourCollectible'] as YourCollectible;
  const balance = useContractReader<BigNumber>(YourCollectible, {
    contractName: 'YourCollectible',
    functionName: 'balanceOf',
  });

  //
  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  //
  const yourBalance = (balance && balance.toNumber && balance.toNumber()) ?? 0;
  const [yourCollectibles, setYourCollectibles] = useState();

  useEffect(() => {
    const updateYourCollectibles = async () => {
      //   const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < yourBalance; tokenIndex++) {
        try {
          console.log('GEtting token index', tokenIndex);
          useContractReader(YourCollectible, {
            contractName: 'YourCollectible',
            functionName: 'tokenOfOwnerByIndex',
            functionArgs: [ethersContext.account, tokenIndex],
          });
          YourCollectible.tokenOfOwnerByIndex(ethersContext.account ?? '', tokenIndex);
          const tokenId = await YourCollectible.tokenOfOwnerByIndex(ethersContext.account ?? '', tokenIndex);
          console.log('tokenId', tokenId);
          const tokenURI = await YourCollectible.tokenURI(tokenId);
          console.log('tokenURI', tokenURI);

          const ipfsHash = tokenURI.replace('https://ipfs.io/ipfs/', '');
          console.log('ipfsHash', ipfsHash);

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          //   try {
          //     const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
          //     console.log('jsonManifest', jsonManifest);
          //     collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: ethersContext.account, ...jsonManifest });
          //   } catch (e) {
          //     console.log(e);
          //   }
        } catch (e) {
          console.log(e);
        }
      }
      //   setYourCollectibles(collectibleUpdate);
    };
    updateYourCollectibles();
  }, [ethersContext.account, yourBalance]);

  return (
    <div className="YourCollectibles">
      <h1>Your Collectibles</h1>
    </div>
  );
};
