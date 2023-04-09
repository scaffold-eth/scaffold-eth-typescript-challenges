# 🏗 scaffold-eth | 🏰 BuidlGuidl

## 🚩 Challenge 6: 🎁 SVG NFT 🎫 

### Checkpoint 0: 📦 install 📚

```bash
git clone https://github.com/scaffold-eth/scaffold-eth-typescript-challenges.git challenge-6-svg-nft

cd challenge-6-svg-nft

git checkout challenge-6-svg-nft

yarn install

```

🔏 Edit your smart contract `YourCollectible.sol` in `packages/hardhat/contracts`

---

### Checkpoint 1: 🔭 Environment 📺

You'll have three terminals up for:

`yarn chain` (hardhat backend)

`yarn deploy` (to compile, deploy, and publish your contracts to the frontend)

`yarn start` (react app frontend)

Make sure you run the commands in the above order. The contract types get generated as part of the deploy, which will be required to build and start the app.

> 💻 View your frontend at http://localhost:3000/

> 👩‍💻 Rerun `yarn deploy --reset` whenever you want to deploy new contracts to the frontend.

---

### Checkpoint 2: 🧪 Test 🙎

#### ⚠️ Test it!
-  Now is a good time to run `yarn test` to run the automated testing function. It will test that you hit the core checkpoints.  You are looking for all green checkmarks and passing tests!

---

### Checkpoint 3: 🚢 Ship it 🚁

📡 Edit the `defaultNetwork` to [your choice of public EVM networks](https://ethereum.org/en/developers/docs/networks/) in `packages/hardhat-ts/hardhat.config.ts`

👩‍🚀 You will want to run `yarn account` to see if you have a **deployer address**

🔐 If you don't have one, run `yarn generate` to create a mnemonic and save it locally for deploying.

⛽️ You will need to send ETH to your **deployer address** with your wallet.

> 🚀 Run `yarn deploy` to deploy your smart contract to a public network (selected in hardhat.config.js)

---

### Checkpoint 4: 🎚 Frontend 🧘‍♀️

> 📝 Edit the `targetNetworkInfo` in `providersConfig.ts` (in `packages/vite-app-ts/src/config`) to be the public network where you deployed your smart contract.

> 💻 View your frontend at http://localhost:3000/

📡 When you are ready to ship the frontend app...

📦 Run `yarn build` to package up your frontend.

 > 📝 If you plan on submitting this challenge, be sure to set your ```deadline``` to at least ```block.timestamp + 72 hours```

💽 Upload your app to surge with `yarn surge` (you could also `yarn s3` or maybe even `yarn ipfs`?)

> 📝 you will use this deploy URL to submit to [SpeedRun](https://speedrunethereum.com).

🚔 Traffic to your url might break the [Infura](https://infura.io/) rate limit, edit your key: `constants.ts` in `packages/vite-app-ts/src/models/constants`.

---

### Checkpoint 5: 📜 Contract Verification

Update the api-key in packages/hardhat/package.json file. You can get your key [here](https://etherscan.io/myapikey).

![Screen Shot 2021-11-30 at 10 21 01 AM](https://user-images.githubusercontent.com/9419140/144075208-c50b70aa-345f-4e36-81d6-becaa5f74857.png)

> Now you are ready to run the `yarn verify --network your_network` command to verify your contracts on etherscan 🛰

---

> 🏃 Head to your next challenge [here](https://speedrunethereum.com).

> 💬 Problems, questions, comments on the stack? Post them to the [🏗 scaffold-eth developers chat](https://t.me/+J9PRea84c1U0Mzkx)
