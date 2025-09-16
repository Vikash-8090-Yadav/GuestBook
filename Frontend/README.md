# Digital Guestbook Frontend

A decentralized guestbook application built with Next.js and integrated with a smart contract on Conflux eSpace testnet.

## Features

- 🔗 **Blockchain Integration**: Connect with MetaMask wallet
- 📝 **Message Posting**: Add messages to the blockchain
- 📖 **Message Viewing**: View all messages from the smart contract
- 🌐 **Network Support**: Automatically switches to Conflux eSpace testnet
- ⚡ **Real-time Updates**: Live updates when new messages are posted
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support

## Smart Contract Details

- **Contract Address**: `0x40B638A6cf23FB0F3A0B4D5C994D3338666EC37d`
- **Network**: Conflux eSpace Testnet (Chain ID: 71)
- **RPC URL**: `https://evmtestnet.confluxrpc.com`

## Getting Started

### Prerequisites

- Node.js 18+ 
- MetaMask wallet extension
- Some CFX tokens on Conflux eSpace testnet for gas fees

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Switch Network**: The app will automatically prompt you to switch to Conflux eSpace testnet
3. **Post Messages**: Type your message and click "Post Message"
4. **View Messages**: All messages are displayed in real-time

### Getting Test CFX

To get test CFX tokens for gas fees:
1. Visit [Conflux Faucet](https://faucet.confluxnetwork.org/)
2. Enter your wallet address
3. Request test tokens

## Technical Details

### Contract ABI

The application uses the following contract functions:
- `addMessage(string _content)`: Add a new message
- `getMessageCount()`: Get total number of messages
- `getMessage(uint256 _index)`: Get message details by index
- `MessageAdded` event: Emitted when a new message is added

### Network Configuration

The app automatically configures MetaMask with:
- Chain ID: 71
- Chain Name: Conflux eSpace Testnet
- RPC URL: https://evmtestnet.confluxrpc.com
- Block Explorer: https://evmtestnet.confluxscan.io

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [ethers.js](https://docs.ethers.io/) - Ethereum library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Conflux eSpace](https://confluxnetwork.org/) - Blockchain network
