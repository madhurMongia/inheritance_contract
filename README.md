# Inheritance Contract: A Secure Wealth Transfer 🔒💰

The Inheritance Contract is a Solidity 0.8.20 smart contract that enables seamless, secure wealth transfer from owner to heir. Key features:

- **Ownership Transfer Delay**: 30-day delay before heir can claim ownership, preventing hasty decisions.
- **Heir Management**: Owner can update designated heir anytime, adapting to changing circumstances.
- **Withdrawal Functionality**: Owner can withdraw funds, maintaining control during their lifetime.
- **Events**: Transparent record of heir changes and fund withdrawals.
- **Inheritance and Ownership**: Inherits from OpenZeppelin's Ownable contract.

## Use cases:

- Estate planning 📜
- Secure asset management 🔒
- Generational wealth transfer 💰
- Digital "will" or testamentary provision 📝


### 🛠️ Setup

1. Clone the contract repository:

```sh
git clone https://github.com/madhurMongia/inheritance_contract
```

2. Change to the project directory:

```sh
cd inheritance_contract
```

3. Install the dependencies:

```sh
npm install
```

### 🏗️🚀 compile and Deploy

Use the following command to Deploy the contract:

```sh
npx hardhat ignition deploy .\ignition\modules\inheritance.ts --network sepolia
```

### 🧪 Testing

Test cases could be found in **[inheritanceContract.spec.ts](https://github.com/madhurMongia/inheritance_contract/blob/main/test/inheritanceContract.spec.ts)**.

Use the following command to test the smart Contact:
```sh
npx hardhat test
```