# Heaven's Gate Smart Contracts

Smart contracts for the Heaven's Gate pay-to-play game with prize pool distribution.

## 🎮 Game Overview

- **Pay-to-Play**: Players pay HG tokens to start a game
- **Prize Pool**: All entry fees go into a prize pool
- **Daily Payouts**: Top 3 scorers get paid out daily
- **Prize Distribution**: 50% / 30% / 20% for 1st/2nd/3rd place

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet
- Some ETH for gas fees (testnet or mainnet)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the example environment file and fill in your details:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Network URLs (get from Infura, Alchemy, etc.)
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
MAINNET_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Your wallet private key (keep secret!)
PRIVATE_KEY=your_private_key_here

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 3. Compile Contracts
```bash
npm run compile
```

### 4. Deploy Contracts

**Testnet (Sepolia):**
```bash
npm run deploy:sepolia
```

**Mainnet:**
```bash
npm run deploy:mainnet
```

## 📄 Contract Details

### HeavensGateToken.sol
- **Name**: Heaven's Gate
- **Symbol**: HG
- **Total Supply**: 1,000,000,000 HG
- **Decimals**: 18
- **Features**: ERC20, Burnable, Pausable, Ownable

### HeavensGateGame.sol
- **Entry Fee**: 10 HG tokens (configurable)
- **Min Prize Pool**: 100 HG tokens before payouts
- **Payout Interval**: Daily (configurable)
- **Prize Distribution**: 50% / 30% / 20%

## 🔧 Configuration

### Entry Fee
```javascript
// Update entry fee (owner only)
await gameContract.setEntryFee(ethers.utils.parseEther("5")); // 5 HG
```

### Payout Interval
```javascript
// Update payout interval (owner only)
await gameContract.setPayoutInterval(86400); // 1 day in seconds
```

## 🎯 Game Flow

1. **Player connects wallet** → MetaMask integration
2. **Player pays entry fee** → 10 HG tokens transferred to contract
3. **Player plays game** → Score tracked locally
4. **Player submits score** → Score recorded on-chain
5. **Daily payout** → Top 3 players receive prizes automatically

## 🔗 Frontend Integration

### 1. Add Web3 Script
Include the web3 integration script in your HTML:
```html
<script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>
<script src="scripts/web3-integration.js"></script>
```

### 2. Update Contract Addresses
After deployment, update the contract addresses in `scripts/web3-integration.js`:
```javascript
this.GAME_CONTRACT_ADDRESS = "YOUR_DEPLOYED_GAME_CONTRACT_ADDRESS";
this.TOKEN_CONTRACT_ADDRESS = "YOUR_DEPLOYED_TOKEN_CONTRACT_ADDRESS";
```

### 3. Connect to Game
```javascript
// Connect wallet
await heavensGateWeb3.connectWallet();

// Start game
await heavensGateWeb3.startGame();

// Submit score
await heavensGateWeb3.submitScore(150);
```

## 🧪 Testing

### Local Testing
```bash
# Start local blockchain
npm run node

# Deploy to local network
npm run deploy:local

# Run tests
npm run test
```

### Testnet Testing
1. Get testnet ETH from faucets
2. Deploy to Sepolia testnet
3. Test all functionality
4. Verify contracts on Etherscan

## 📊 Contract Functions

### Player Functions
- `startGame()` - Pay entry fee and start a game
- `submitScore(uint256 score)` - Submit final score

### View Functions
- `getPlayerInfo(address player)` - Get player stats
- `getTopScores()` - Get current top 3 scores
- `totalPrizePool()` - Get current prize pool amount
- `entryFee()` - Get current entry fee
- `isPayoutDue()` - Check if payout is due

### Owner Functions
- `setEntryFee(uint256)` - Update entry fee
- `setPayoutInterval(uint256)` - Update payout interval
- `forcePayout()` - Force immediate payout
- `pause()` / `unpause()` - Pause/unpause contract
- `emergencyWithdraw()` - Emergency token withdrawal

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Can pause contract in emergencies
- **Ownable**: Owner controls for admin functions
- **Input Validation**: All inputs validated
- **Safe Math**: Built-in overflow protection

## 🚨 Important Notes

1. **Token Launch**: Deploy token contract first, then game contract
2. **Testnet First**: Always test on testnet before mainnet
3. **Gas Optimization**: Contracts optimized for gas efficiency
4. **Backup**: Keep private keys and deployment info safe
5. **Verification**: Verify contracts on Etherscan after deployment

## 📞 Support

For issues or questions:
- Check the contract code comments
- Review the deployment logs
- Test on testnet first
- Ensure proper token approval

## 🎉 Launch Checklist

- [ ] Deploy token contract
- [ ] Deploy game contract
- [ ] Set game contract in token contract
- [ ] Verify contracts on Etherscan
- [ ] Update frontend with contract addresses
- [ ] Test all functionality
- [ ] Launch token on your preferred platform
- [ ] Connect game to live token

---

**Good luck with your Heaven's Gate launch! 🚀**
