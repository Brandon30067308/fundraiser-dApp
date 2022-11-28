## About This Project

This is a decentralized Fundraiser application built with React.js and Solidity.

## Setup

To get a local copy of this project up and running follow these steps.

### Prerequisites

- yarn
  ```sh
  npm install yarn@latest -g
  ```
- Install Ganache [here](https://github.com/trufflesuite/ganache-ui/tags)
- Create a free Infura account [here](https://app.infura.io/register)
- Create an IPFS project on your Infura account
- Rename the `.env.example` file in the root to `.env`
- Update the enviroment variables (PROJECT_ID, API_KEY_SECRET, IPFS_API_ENDPOINT) with the credentials from your Infura IPFS project
- Setup a personal Ethereum blockchain with Ganache
- Update the `networks` property in the `truffle-config.js` file to match the network configurations of the personal blockchain

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Brandon30067308/fundraiser-dApp.git
   ```
2. Install NPM packages
   ```sh
   yarn install
   cd client && yarn install
   ```

### Run Local Blockchain and Deploy Contracts

1. Spin up a console to interact with the contracts

   ```sh
      truffle develop
   ```

2. Compile contracts

   ```sh
      compile
   ```

3. Deploy changes to the local blockchain

   ```sh
      migrate
   ```

### Run React Client

```sh
cd client && yarn start
```
