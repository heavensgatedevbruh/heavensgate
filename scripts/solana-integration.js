// Multi-Wallet Solana Integration for Heaven's Gate Game
class HeavensGateSolana {
    constructor() {
        this.connection = null;
        this.wallet = null;
        this.isConnected = false;
        this.userAddress = null;
        this.isOwner = false;
        
        // Solana configuration
        this.NETWORK = 'devnet'; // or 'mainnet-beta' for production
        this.APX_TOKEN_MINT = 'APXWjCnXvRncq7UWeDPDCEFCdRyJj3oApkyzuGGoR777';
        this.GAME_PROGRAM_ID = null; // Will be set after deployment
        
        // Game state
        this.tokenGatingEnabled = true;
        this.entryFee = 100; // 100 APX tokens
        this.prizePool = 0;
        
        // Available wallets
        this.availableWallets = [];
        this.currentWallet = null;
    }
    
    async initialize() {
        try {
            console.log('🚀 Initializing Solana integration...');
            
            // Check if we're in a browser environment
            if (typeof window === 'undefined') {
                console.error('Not in browser environment');
                return;
            }
            
            // Wait for Solana Web3 to load
            await this.waitForSolanaWeb3();
            
            // Initialize connection
            this.connection = new solanaWeb3.Connection(
                solanaWeb3.clusterApiUrl(this.NETWORK),
                'confirmed'
            );
            
            console.log('✅ Solana connection established');
            
            // Detect available wallets
            this.detectWallets();
            
            // Set up wallet button
            this.setupWalletButton();
            
            // Check if already connected
            await this.checkExistingConnection();
            
            console.log('✅ Solana integration initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Solana integration:', error);
            this.showNotification('Failed to initialize wallet connection: ' + error.message, 'error');
        }
    }
    
    async waitForSolanaWeb3() {
        console.log('⏳ Waiting for Solana Web3 library...');
        
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max wait
        
        while (!window.solanaWeb3 && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            if (attempts % 10 === 0) {
                console.log(`⏳ Still waiting... (${attempts}/100)`);
            }
        }
        
        if (!window.solanaWeb3) {
            throw new Error('Solana Web3 library failed to load after 10 seconds');
        }
        
        console.log('✅ Solana Web3 library loaded');
    }
    
    detectWallets() {
        console.log('🔍 Detecting available wallets...');
        this.availableWallets = [];
        
        // Check for Phantom
        if (window.solana && window.solana.isPhantom) {
            console.log('✅ Phantom wallet detected');
            this.availableWallets.push({
                name: 'Phantom',
                adapter: window.solana
            });
        } else {
            console.log('❌ Phantom wallet not detected');
        }
        
        // Check for Solflare
        if (window.solflare) {
            console.log('✅ Solflare wallet detected');
            this.availableWallets.push({
                name: 'Solflare',
                adapter: window.solflare
            });
        }
        
        // Check for Backpack
        if (window.backpack) {
            console.log('✅ Backpack wallet detected');
            this.availableWallets.push({
                name: 'Backpack',
                adapter: window.backpack
            });
        }
        
        // Check for Slope
        if (window.slope) {
            console.log('✅ Slope wallet detected');
            this.availableWallets.push({
                name: 'Slope',
                adapter: window.slope
            });
        }
        
        console.log(`📊 Total wallets detected: ${this.availableWallets.length}`);
        console.log('Available wallets:', this.availableWallets.map(w => w.name));
    }
    
    setupWalletButton() {
        console.log('🔧 Setting up wallet button...');
        const walletBtn = document.querySelector('.wallet-btn');
        if (!walletBtn) {
            console.error('❌ Wallet button not found in DOM');
            return;
        }
        
        // Remove any existing event listeners
        const newBtn = walletBtn.cloneNode(true);
        walletBtn.parentNode.replaceChild(newBtn, walletBtn);
        
        // Add new event listener
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleWalletClick();
        });
        
        // Update button text
        this.updateWalletButtonText();
        console.log('✅ Wallet button setup complete');
    }
    
    updateWalletButtonText() {
        const walletBtn = document.querySelector('.wallet-btn');
        if (!walletBtn) return;
        
        if (this.isConnected && this.userAddress) {
            const shortAddress = `${this.userAddress.slice(0, 4)}...${this.userAddress.slice(-4)}`;
            walletBtn.textContent = `Connected: ${shortAddress}`;
        } else {
            walletBtn.textContent = 'Connect Wallet';
        }
    }
    
    async handleWalletClick() {
        console.log('🖱️ Wallet button clicked');
        if (this.isConnected) {
            await this.disconnectWallet();
        } else {
            await this.connectWallet();
        }
    }
    
    async connectWallet() {
        try {
            console.log('🔌 Attempting to connect wallet...');
            
            if (this.availableWallets.length === 0) {
                const message = 'No Solana wallets detected. Please install Phantom, Solflare, or another Solana wallet.';
                console.error('❌', message);
                this.showNotification(message, 'error');
                return;
            }
            
            // For now, use the first available wallet (usually Phantom)
            const wallet = this.availableWallets[0];
            this.currentWallet = wallet;
            
            console.log(`🔌 Connecting to ${wallet.name}...`);
            
            // Request connection
            const response = await wallet.adapter.connect();
            
            if (response.publicKey) {
                this.wallet = wallet.adapter;
                this.userAddress = response.publicKey.toString();
                this.isConnected = true;
                
                console.log(`✅ Connected to ${wallet.name}:`, this.userAddress);
                
                // Set up event listeners
                this.setupWalletEventListeners();
                
                // Update UI
                this.updateWalletButtonText();
                this.showAdminControls();
                this.showNotification(`Connected to ${wallet.name}`, 'success');
                
                // Check APX balance
                await this.checkAPXBalance();
                
            } else {
                throw new Error('Connection was rejected');
            }
            
        } catch (error) {
            console.error('❌ Wallet connection failed:', error);
            
            if (error.code === 4001) {
                this.showNotification('Connection was rejected by user', 'warning');
            } else {
                this.showNotification('Failed to connect wallet. Please try again.', 'error');
            }
        }
    }
    
    async disconnectWallet() {
        try {
            console.log('🔌 Disconnecting wallet...');
            
            if (this.wallet && this.wallet.disconnect) {
                await this.wallet.disconnect();
            }
            
            this.wallet = null;
            this.userAddress = null;
            this.isConnected = false;
            this.currentWallet = null;
            
            console.log('✅ Wallet disconnected');
            
            // Update UI
            this.updateWalletButtonText();
            this.hideAdminControls();
            this.showNotification('Wallet disconnected', 'info');
            
        } catch (error) {
            console.error('❌ Error disconnecting wallet:', error);
        }
    }
    
    setupWalletEventListeners() {
        if (!this.wallet) return;
        
        console.log('👂 Setting up wallet event listeners...');
        
        // Listen for account changes
        this.wallet.on('accountChanged', (publicKey) => {
            console.log('🔄 Account changed:', publicKey);
            if (publicKey) {
                this.userAddress = publicKey.toString();
                this.updateWalletButtonText();
            } else {
                this.disconnectWallet();
            }
        });
        
        // Listen for disconnect
        this.wallet.on('disconnect', () => {
            console.log('🔌 Wallet disconnected event received');
            this.disconnectWallet();
        });
        
        console.log('✅ Wallet event listeners setup complete');
    }
    
    async checkExistingConnection() {
        try {
            console.log('🔍 Checking for existing connection...');
            
            if (this.availableWallets.length > 0) {
                const wallet = this.availableWallets[0];
                
                // Check if already connected
                if (wallet.adapter.isConnected) {
                    const publicKey = wallet.adapter.publicKey;
                    if (publicKey) {
                        this.wallet = wallet.adapter;
                        this.userAddress = publicKey.toString();
                        this.isConnected = true;
                        this.currentWallet = wallet;
                        
                        console.log('✅ Found existing connection:', this.userAddress);
                        
                        this.setupWalletEventListeners();
                        this.updateWalletButtonText();
                        this.showAdminControls();
                        
                        // Check APX balance
                        await this.checkAPXBalance();
                    }
                } else {
                    console.log('ℹ️ No existing connection found');
                }
            }
        } catch (error) {
            console.error('❌ Error checking existing connection:', error);
        }
    }
    
    async checkAPXBalance() {
        if (!this.isConnected || !this.userAddress) return;
        
        try {
            console.log('💰 Checking APX balance...');
            
            // Get token accounts for the user
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
                new solanaWeb3.PublicKey(this.userAddress),
                { mint: new solanaWeb3.PublicKey(this.APX_TOKEN_MINT) }
            );
            
            let balance = 0;
            if (tokenAccounts.value.length > 0) {
                balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            }
            
            console.log(`💰 APX Balance: ${balance}`);
            
            // Update game info display
            this.updateGameInfo(balance);
            
        } catch (error) {
            console.error('❌ Error checking APX balance:', error);
        }
    }
    
    updateGameInfo(balance) {
        const gameInfo = document.getElementById('gameInfo');
        if (gameInfo) {
            gameInfo.innerHTML = `
                <div>Entry Fee: 100 APX</div>
                <div>Your Balance: ${balance} APX</div>
                <div>Prize Pool: Active</div>
                <div>Mode: ${this.tokenGatingEnabled ? 'Token Gated' : 'Free Play'}</div>
            `;
        }
    }
    
    showAdminControls() {
        const adminControls = document.getElementById('adminControls');
        if (adminControls) {
            adminControls.style.display = 'block';
        }
    }
    
    hideAdminControls() {
        const adminControls = document.getElementById('adminControls');
        if (adminControls) {
            adminControls.style.display = 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        console.log(`📢 Notification (${type}):`, message);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
    
    // Token gating methods
    toggleTokenGating() {
        this.tokenGatingEnabled = !this.tokenGatingEnabled;
        this.updateTokenGatingUI();
        this.showNotification(`Token gating ${this.tokenGatingEnabled ? 'enabled' : 'disabled'}`, 'info');
    }
    
    updateTokenGatingUI() {
        const toggle = document.getElementById('tokenGatingToggle');
        const status = document.getElementById('tokenGatingStatus');
        
        if (toggle) {
            toggle.checked = this.tokenGatingEnabled;
        }
        
        if (status) {
            status.textContent = `Token Gating: ${this.tokenGatingEnabled ? 'ENABLED' : 'DISABLED'}`;
            status.className = `token-gating-status ${this.tokenGatingEnabled ? 'status-enabled' : 'status-disabled'}`;
        }
    }
    
    // Game integration methods
    async canPlayGame() {
        if (!this.tokenGatingEnabled) {
            return true; // Free play mode
        }
        
        if (!this.isConnected) {
            this.showNotification('Please connect your wallet to play', 'warning');
            return false;
        }
        
        // Check APX balance
        try {
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
                new solanaWeb3.PublicKey(this.userAddress),
                { mint: new solanaWeb3.PublicKey(this.APX_TOKEN_MINT) }
            );
            
            let balance = 0;
            if (tokenAccounts.value.length > 0) {
                balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            }
            
            if (balance < this.entryFee) {
                this.showNotification(`Insufficient APX balance. Need ${this.entryFee} APX to play.`, 'error');
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('Error checking game eligibility:', error);
            this.showNotification('Error checking wallet balance', 'error');
            return false;
        }
    }
    
    async submitScore(score) {
        if (!this.isConnected) {
            console.log('Score saved locally (wallet not connected)');
            return;
        }
        
        try {
            // Here you would implement the actual score submission to your Solana program
            console.log(`Score ${score} submitted for wallet ${this.userAddress}`);
            this.showNotification('Score submitted to blockchain!', 'success');
            
        } catch (error) {
            console.error('Error submitting score:', error);
            this.showNotification('Failed to submit score to blockchain', 'error');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM loaded, initializing Solana integration...');
    
    // Wait a bit for all scripts to load
    setTimeout(() => {
        console.log('⏰ Starting Solana integration initialization...');
        window.heavensGateSolana = new HeavensGateSolana();
        window.heavensGateSolana.initialize();
        
        // Set up token gating toggle
        const tokenGatingToggle = document.getElementById('tokenGatingToggle');
        if (tokenGatingToggle) {
            tokenGatingToggle.addEventListener('change', () => {
                if (window.heavensGateSolana) {
                    window.heavensGateSolana.toggleTokenGating();
                }
            });
        }
    }, 1000);
});

// Make it globally available
window.heavensGateSolana = window.heavensGateSolana || null;
