# 🚀 Heaven's Gate Deployment Guide

## Pre-Launch Checklist

Before deploying your smart contracts, make sure you have:

- [ ] **Token Launch Platform**: Choose your launchpad (PinkSale, DxSale, etc.)
- [ ] **Token Contract**: Ready to deploy `HeavensGateToken.sol`
- [ ] **Game Contract**: Ready to deploy `HeavensGateGame.sol`
- [ ] **Testnet Testing**: Contracts tested on Sepolia
- [ ] **Frontend Ready**: Website updated with contract addresses
- [ ] **Marketing Plan**: Ready to promote your game

## 📋 Step-by-Step Deployment

### Step 1: Token Launch (Launchpad)

1. **Choose Your Launchpad**
   - PinkSale, DxSale, or your preferred platform
   - Follow their specific deployment process

2. **Deploy Token Contract**
   ```bash
   # Deploy to mainnet
   npm run deploy:mainnet
   ```
   
3. **Token Contract Details**
   - **Name**: Heaven's Gate
   - **Symbol**: HG
   - **Total Supply**: 1,000,000,000 HG
   - **Decimals**: 18

4. **Launchpad Configuration**
   - Set your token address
   - Configure launch parameters
   - Set vesting/liquidity settings

### Step 2: Game Contract Deployment

1. **Deploy Game Contract**
   ```bash
   # After token is live, deploy game contract
   npm run deploy:mainnet
   ```

2. **Link Contracts**
   ```javascript
   // Set game contract in token contract
   await tokenContract.setGameContract(gameContractAddress);
   ```

3. **Verify Contracts**
   ```bash
   # Verify on Etherscan
   npx hardhat verify --network mainnet TOKEN_CONTRACT_ADDRESS
   npx hardhat verify --network mainnet GAME_CONTRACT_ADDRESS TOKEN_CONTRACT_ADDRESS
   ```

### Step 3: Frontend Integration

1. **Update Contract Addresses**
   ```javascript
   // In scripts/web3-integration.js
   this.GAME_CONTRACT_ADDRESS = "YOUR_DEPLOYED_GAME_CONTRACT_ADDRESS";
   this.TOKEN_CONTRACT_ADDRESS = "YOUR_DEPLOYED_TOKEN_CONTRACT_ADDRESS";
   ```

2. **Update Website**
   - Add contract addresses to your homepage
   - Test wallet connection
   - Test game functionality

3. **Add Web3 Scripts**
   ```html
   <!-- Add to your HTML files -->
   <script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>
   <script src="scripts/web3-integration.js"></script>
   ```

### Step 4: Configuration

1. **Set Entry Fee**
   ```javascript
   // Example: 5 HG tokens
   await gameContract.setEntryFee(ethers.utils.parseEther("5"));
   ```

2. **Set Payout Interval**
   ```javascript
   // Daily payouts (86400 seconds)
   await gameContract.setPayoutInterval(86400);
   ```

3. **Test All Functions**
   - Connect wallet
   - Start game
   - Submit score
   - Check prize pool

## 🎯 Launch Strategy

### Phase 1: Token Launch
- Deploy token on launchpad
- Set initial liquidity
- Begin marketing campaign

### Phase 2: Game Launch
- Deploy game contract
- Connect to live token
- Launch website with full functionality

### Phase 3: Community Building
- Promote the game
- Build player base
- Monitor and adjust parameters

## 📊 Post-Launch Monitoring

### Key Metrics to Track
- **Daily Active Players**: Number of unique players
- **Prize Pool Growth**: Total tokens in prize pool
- **Average Score**: Player performance
- **Gas Usage**: Contract efficiency

### Admin Functions
```javascript
// Check contract status
await gameContract.totalPrizePool();
await gameContract.totalGamesPlayed();
await gameContract.isPayoutDue();

// Emergency functions (owner only)
await gameContract.pause(); // Pause if needed
await gameContract.forcePayout(); // Force payout
```

## 🔧 Troubleshooting

### Common Issues

1. **Token Approval Fails**
   - Check token balance
   - Ensure proper allowance
   - Verify contract addresses

2. **Game Won't Start**
   - Check if player has active game
   - Verify entry fee amount
   - Check contract is not paused

3. **Score Submission Fails**
   - Ensure player has active game
   - Check score is greater than 0
   - Verify wallet connection

### Emergency Procedures

1. **Pause Contract**
   ```javascript
   await gameContract.pause();
   ```

2. **Force Payout**
   ```javascript
   await gameContract.forcePayout();
   ```

3. **Emergency Withdraw**
   ```javascript
   await gameContract.emergencyWithdraw();
   ```

## 📞 Support Resources

- **Contract Code**: Review Solidity comments
- **Hardhat Docs**: https://hardhat.org/docs
- **Etherscan**: Verify and monitor contracts
- **MetaMask**: Wallet connection issues

## 🎉 Launch Day Checklist

- [ ] Token contract deployed and verified
- [ ] Game contract deployed and verified
- [ ] Contracts linked properly
- [ ] Frontend updated with addresses
- [ ] Wallet connection tested
- [ ] Game functionality tested
- [ ] Marketing materials ready
- [ ] Community channels active
- [ ] Support team ready
- [ ] Monitoring tools active

---

**Ready to launch Heaven's Gate? Let's make it happen! 🚀✨**
