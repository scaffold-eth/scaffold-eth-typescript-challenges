# 🏗 scaffold-eth | 🏰 BuidlGuidl

## 🚩 Challenge 5: 👛 Multisig Wallet


### 🏃‍♀️ Quick Start

required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)


```bash
git clone https://github.com/scaffold-eth/scaffold-eth-typescript-challenges challenge-5-multi-sig

cd challenge-5-multi-sig

git checkout challenge-5-multisig
```

```bash

yarn install

```

```bash

yarn start

```

> in a second terminal window:

```bash
cd scaffold-eth
yarn chain

```


🔏 Edit your smart contract `MetaMultiSigWallet.sol` in `packages/hardhat-ts/contracts`

📝 Edit your frontend `App.tsx` in `packages/vite-app-ts/src/app`

💼 Edit your deployment script `01_deploy_meta_multi_sig_wallet_contract.ts` in `packages/hardhat-ts/deploy`

📱 Open http://localhost:3000 to see the app

> in a third terminal window:

```bash
yarn backend

```

🔧 Configure your deployment in `packages/hardhat-ts/deploy/01_deploy_meta_multi_sig_wallet_contract.ts`

> Edit the chainid, your owner addresses, and the number of signatures required:

![image](https://user-images.githubusercontent.com/2653167/99156751-bfc59b00-2680-11eb-8d9d-e33777173209.png)



> in a fourth terminal deploy with your frontend address as one of the owners:

```bash

yarn deploy

```


> Use the faucet wallet to send your multi-sig contract some funds:

![image](https://user-images.githubusercontent.com/31567169/118389510-53315600-b63b-11eb-9daf-f0aaa479a23e.png)

> To add new owners, use the "Owners" tab:


![image](https://user-images.githubusercontent.com/31567169/118389556-896ed580-b63b-11eb-8ed6-c1e690778c8e.png)

This will take you to a populated transaction create page:

![image](https://user-images.githubusercontent.com/31567169/118389576-9986b500-b63b-11eb-8411-c227b148992a.png)




> Create & sign the new transaction:

![image](https://user-images.githubusercontent.com/31567169/118389603-ae634880-b63b-11eb-968f-ca78c2456ddb.png)


You will see the new transaction in the pool (this is all off-chain):

![image](https://user-images.githubusercontent.com/31567169/118389616-bd49fb00-b63b-11eb-82f7-f65ca2ee7e80.png)


Click on the ellipsses button [...] to read the details of the transaction


![image](https://user-images.githubusercontent.com/31567169/118389642-d6eb4280-b63b-11eb-9676-da7e7afc5614.png)



> Give your account some gas at the faucet and execute the transaction

The transction will appear as "executed" on the front page:

![image](https://user-images.githubusercontent.com/31567169/118389655-e8cce580-b63b-11eb-8428-913c6f39e48f.png)



> Create a transaction to send some funds to your frontend account:

![image](https://user-images.githubusercontent.com/31567169/118389693-0ef28580-b63c-11eb-95d9-c5f397bf5972.png)




This time we will need a second signature:

![image](https://user-images.githubusercontent.com/31567169/118389716-3cd7ca00-b63c-11eb-959e-d46ffe31e62e.png)



> Sign the transacton with enough owners:
![image](https://user-images.githubusercontent.com/31567169/118389773-90e2ae80-b63c-11eb-9658-e9c411542f33.png)


(You'll notice you don't need ⛽️gas to sign transactions.)

> Execute the transction to transfer the funds:



![image](https://user-images.githubusercontent.com/31567169/118389808-bff92000-b63c-11eb-9107-9af5b77d4e20.png)


(You might need to trigger a new block by sending yourself some faucet funds or something. HartHat blocks only get mined when there is a transaction.)

💼 Edit your deployment script `01_deploy_meta_multi_sig_wallet_contract.ts` in `packages/hardhat-ts/deploy`

🔏 Edit your contracts form, `MetaMultiSigWallet.sol` in `packages/hardhat-ts/contracts`

📝 Edit your frontend in `packages/vite-app-ts/src/app/main`

## ⚔️ Side Quests

#### 🐟 Create custom signer roles for your Wallet
You may not want every signer to create new transfers, only allow them to sign existing transactions or a mega-admin role who will be able to veto any transaction.

#### 😎 Integrate this MultiSig wallet into other branches like nifty-ink  
Make a MultiSig wallet to store your precious doodle-NFTs!? 

---

## 📡 Deploy the wallet!

🛰 Ready to deploy to a testnet?


📡 Edit the `defaultNetwork` to [your choice of public EVM networks](https://ethereum.org/en/developers/docs/networks/) in `packages/hardhat-ts/hardhat.config.ts`


### 🔶 Infura

🚔 Traffic to your url might break the [Infura](https://infura.io/) rate limit, edit your key: `constants.ts` in `packages/vite-app-ts/src/models/constants`

👩‍🚀 You will want to run `yarn account` to see if you have a **deployer address**

🔐 If you don't have one, run `yarn generate` to create a mnemonic and save it locally for deploying.

🛰 Use an [instantwallet.io](https://instantwallet.io) to fund your **deployer address** (run `yarn account` again to view balances)

📡 Edit the `export const targetNetworkInfo: TNetworkInfo = NETWORKS.localhost;` to [your choice of public EVM networks](https://ethereum.org/en/developers/docs/networks/) in `packages/vite-app-ts/src/config/providersConfig.ts`

> 🚀 Run `yarn deploy` to deploy to your public network of choice (😅 wherever you can get ⛽️ gas)

🔬 Inspect the block explorer for the network you deployed to... make sure your contract is there.

👮 Your contract source needs to be **verified**... (source code publicly available on the block explorer)

---

### ⛳️ **Checkpoint 8: 📜 Contract Verification**

Update the api-key in packages/hardhat-ts/package.json file. You can get your key [here](https://etherscan.io/myapikey).

![Screen Shot 2021-11-30 at 10 21 01 AM](https://user-images.githubusercontent.com/9419140/144075208-c50b70aa-345f-4e36-81d6-becaa5f74857.png)

> Now you are ready to run the `yarn verify --network your_network` command to verify your contracts on etherscan 🛰

---

## 🛳 Ship the app!

> ⚙️ build and upload your frontend and share the url with your friends...

```bash

# build it:

yarn build

# upload it:

yarn surge

OR

yarn s3

OR

yarn ipfs
```

![image](https://user-images.githubusercontent.com/2653167/109540985-7575f780-7a80-11eb-9ebd-39079cc2eb55.png)

> 👩‍❤️‍👨 Share your public url with friends, add signers and send some tasty ETH to a few lucky ones 😉!!
