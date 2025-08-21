// Web3 Integration for Heaven's Gate Game
class HeavensGateWeb3 {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.gameContract = null;
        this.userAddress = null;
        this.isConnected = false;
        this.isOwner = false;
        
        // Contract addresses - will be updated after deployment
        this.GAME_CONTRACT_ADDRESS = null; // Will be set after deployment
        this.APX_TOKEN_ADDRESS = "APXWjCnXvRncq7UWeDPDCEFCdRyJj3oApkyzuGGoR777";
        
        // Contract ABIs
        this.GAME_ABI = [
            "function startGame() external",
            "function submitScore(uint256 score) external",
            "function getPlayerInfo(address player) external view returns (uint256 bestScore, uint256 totalGames, uint256 totalPaid, bool hasActiveGame, uint256 lastGameTime)",
            "function getTopScores() external view returns (address[3] memory, uint256[3] memory)",
            "function totalPrizePool() external view returns (uint256)",
            "function entryFee() external view returns (uint256)",
            "function isPayoutDue() external view returns (bool)",
            "function tokenGatingEnabled() external view returns (bool)",
            "function toggleTokenGating() external",
            "function setTokenGating(bool enabled) external",
            "function owner() external view returns (address)",
            "event GameStarted(address indexed player, uint256 entryFee)",
            "event ScoreSubmitted(address indexed player, uint256 score)",
            "event TokenGatingToggled(bool enabled)"
        ];
        
        this.APX_ABI = [
            "function balanceOf(address owner) external view returns (uint256)",
            "function allowance(address owner, address spender) external view returns (uint256)",
            "function approve(address spender, uint256 amount) external returns (bool)",
            "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
        ];
    }
    
    async initialize() {
        if (typeof window.ethereum !== 'undefined') {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
            window.ethereum.on('chainChanged', () => window.location.reload());
            
            return true;
        } else {
            console.error('MetaMask not found!');
            this.showError('Please install MetaMask to use blockchain features');
            return false;
        }
    }
    
    async setGameContractAddress(address) {
        this.GAME_CONTRACT_ADDRESS = address;
        if (this.provider) {
            this.gameContract = new ethers.Contract(address, this.GAME_ABI, this.signer);
        }
        console.log('Game contract address set to:', address);
    }
    
    async connectWallet() {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            await this.handleAccountsChanged(accounts);
            return true;
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            this.showError('Failed to connect wallet: ' + error.message);
            return false;
        }
    }
    
    async handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.userAddress = null;
            this.isConnected = false;
            this.isOwner = false;
            this.updateUI();
        } else {
            this.userAddress = accounts[0];
            this.isConnected = true;
            
            // Initialize game contract if address is set
            if (this.GAME_CONTRACT_ADDRESS && !this.gameContract) {
                this.gameContract = new ethers.Contract(this.GAME_CONTRACT_ADDRESS, this.GAME_ABI, this.signer);
            }
            
            await this.checkOwnerStatus();
            await this.loadPlayerData();
            await this.loadTokenGatingStatus();
            this.updateUI();
        }
    }
    
    async checkOwnerStatus() {
        if (!this.isConnected || !this.gameContract) return;
        
        try {
            const owner = await this.gameContract.owner();
            this.isOwner = (owner.toLowerCase() === this.userAddress.toLowerCase());
        } catch (error) {
            console.error('Failed to check owner status:', error);
            this.isOwner = false;
        }
    }
    
    async loadTokenGatingStatus() {
        if (!this.gameContract) {
            this.updateTokenGatingUI(true); // Default to enabled
            return;
        }
        
        try {
            const tokenGatingEnabled = await this.gameContract.tokenGatingEnabled();
            this.updateTokenGatingUI(tokenGatingEnabled);
        } catch (error) {
            console.error('Failed to load token gating status:', error);
            this.updateTokenGatingUI(true); // Default to enabled
        }
    }
    
    async toggleTokenGating() {
        if (!this.isConnected || !this.isOwner) {
            throw new Error('Only contract owner can toggle token gating');
        }
        
        try {
            const tx = await this.gameContract.toggleTokenGating();
            await tx.wait();
            
            await this.loadTokenGatingStatus();
            this.showSuccess('Token gating toggled successfully!');
            return true;
        } catch (error) {
            this.showError('Failed to toggle token gating: ' + error.message);
            throw error;
        }
    }
    
    async setTokenGating(enabled) {
        if (!this.isConnected || !this.isOwner) {
            throw new Error('Only contract owner can set token gating');
        }
        
        try {
            const tx = await this.gameContract.setTokenGating(enabled);
            await tx.wait();
            
            await this.loadTokenGatingStatus();
            this.showSuccess(`Token gating ${enabled ? 'enabled' : 'disabled'} successfully!`);
            return true;
        } catch (error) {
            this.showError('Failed to set token gating: ' + error.message);
            throw error;
        }
    }
    
    async startGame() {
        if (!this.isConnected) {
            throw new Error('Wallet not connected');
        }
        
        if (!this.gameContract) {
            throw new Error('Game contract not deployed yet');
        }
        
        try {
            const tokenGatingEnabled = await this.gameContract.tokenGatingEnabled();
            
            if (tokenGatingEnabled) {
                // Check APX balance and allowance
                const apxContract = new ethers.Contract(this.APX_TOKEN_ADDRESS, this.APX_ABI, this.signer);
                const balance = await apxContract.balanceOf(this.userAddress);
                const allowance = await apxContract.allowance(this.userAddress, this.GAME_CONTRACT_ADDRESS);
                const entryFee = await this.gameContract.entryFee();
                
                if (balance.lt(entryFee)) {
                    throw new Error('Insufficient APX balance');
                }
                
                if (allowance.lt(entryFee)) {
                    // Approve tokens
                    const approveTx = await apxContract.approve(this.GAME_CONTRACT_ADDRESS, entryFee);
                    await approveTx.wait();
                }
            }
            
            // Start game
            const tx = await this.gameContract.startGame();
            await tx.wait();
            
            const message = tokenGatingEnabled ? 'Game started! Entry fee paid.' : 'Game started! (Free play mode)';
            this.showSuccess(message);
            return true;
        } catch (error) {
            this.showError('Failed to start game: ' + error.message);
            throw error;
        }
    }
    
    async submitScore(score) {
        if (!this.isConnected) {
            throw new Error('Wallet not connected');
        }
        
        if (!this.gameContract) {
            throw new Error('Game contract not deployed yet');
        }
        
        try {
            const tx = await this.gameContract.submitScore(score);
            await tx.wait();
            
            this.showSuccess('Score submitted successfully!');
            await this.loadPlayerData();
            return true;
        } catch (error) {
            this.showError('Failed to submit score: ' + error.message);
            throw error;
        }
    }
    
    async loadPlayerData() {
        if (!this.isConnected || !this.userAddress || !this.gameContract) return;
        
        try {
            const playerInfo = await this.gameContract.getPlayerInfo(this.userAddress);
            this.updatePlayerData({
                bestScore: playerInfo.bestScore.toString(),
                totalGames: playerInfo.totalGames.toString(),
                totalPaid: ethers.utils.formatEther(playerInfo.totalPaid),
                hasActiveGame: playerInfo.hasActiveGame
            });
        } catch (error) {
            console.error('Failed to load player data:', error);
        }
    }
    
    async getTopScores() {
        if (!this.gameContract) {
            return { players: [], scores: [] };
        }
        
        try {
            const [players, scores] = await this.gameContract.getTopScores();
            return { players, scores };
        } catch (error) {
            console.error('Failed to get top scores:', error);
            return { players: [], scores: [] };
        }
    }
    
    async getPrizePool() {
        if (!this.gameContract) {
            return '0';
        }
        
        try {
            const prizePool = await this.gameContract.totalPrizePool();
            return ethers.utils.formatEther(prizePool);
        } catch (error) {
            console.error('Failed to get prize pool:', error);
            return '0';
        }
    }
    
    updateUI() {
        const connectBtn = document.querySelector('.wallet-btn');
        if (connectBtn) {
            if (this.isConnected) {
                connectBtn.textContent = `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`;
                connectBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            } else {
                connectBtn.textContent = 'Connect Wallet';
                connectBtn.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
            }
        }
        
        // Show/hide admin controls
        this.updateAdminUI();
    }
    
    updateAdminUI() {
        const adminControls = document.getElementById('adminControls');
        if (adminControls) {
            adminControls.style.display = this.isOwner ? 'block' : 'none';
        }
    }
    
    updateTokenGatingUI(enabled) {
        const tokenGatingStatus = document.getElementById('tokenGatingStatus');
        const tokenGatingToggle = document.getElementById('tokenGatingToggle');
        
        if (tokenGatingStatus) {
            tokenGatingStatus.textContent = enabled ? 'Token Gating: ENABLED' : 'Token Gating: DISABLED';
            tokenGatingStatus.className = enabled ? 'status-enabled' : 'status-disabled';
        }
        
        if (tokenGatingToggle) {
            tokenGatingToggle.checked = enabled;
        }
        
        // Update game info display
        const gameInfo = document.getElementById('gameInfo');
        if (gameInfo) {
            if (enabled) {
                gameInfo.innerHTML = `
                    <div>Entry Fee: 100 APX</div>
                    <div>Prize Pool: Active</div>
                    <div>Mode: Token Gated</div>
                `;
            } else {
                gameInfo.innerHTML = `
                    <div>Entry Fee: FREE</div>
                    <div>Prize Pool: Disabled</div>
                    <div>Mode: Free Play</div>
                `;
            }
        }
    }
    
    updatePlayerData(data) {
        // Update UI with player data
        const playerStats = document.getElementById('playerStats');
        if (playerStats) {
            playerStats.innerHTML = `
                <div>Best Score: ${data.bestScore}</div>
                <div>Total Games: ${data.totalGames}</div>
                <div>Total Paid: ${data.totalPaid} APX</div>
                <div>Active Game: ${data.hasActiveGame ? 'Yes' : 'No'}</div>
            `;
        }
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Initialize Web3 integration
const heavensGateWeb3 = new HeavensGateWeb3();

document.addEventListener('DOMContentLoaded', function() {
    heavensGateWeb3.initialize();
    
    // Connect wallet button
    const connectBtn = document.querySelector('.wallet-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', async () => {
            if (!heavensGateWeb3.isConnected) {
                await heavensGateWeb3.connectWallet();
            }
        });
    }
    
    // Token gating toggle
    const tokenGatingToggle = document.getElementById('tokenGatingToggle');
    if (tokenGatingToggle) {
        tokenGatingToggle.addEventListener('change', async (e) => {
            try {
                await heavensGateWeb3.setTokenGating(e.target.checked);
            } catch (error) {
                // Revert the toggle if it failed
                e.target.checked = !e.target.checked;
            }
        });
    }
});

// Make it globally available
window.heavensGateWeb3 = heavensGateWeb3;
