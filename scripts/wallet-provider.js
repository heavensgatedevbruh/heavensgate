// Vanilla JavaScript Solana Wallet Provider for Heaven's Gate
// This provides wallet connection functionality for the HTML-based game

class HeavensGateWalletProvider {
    constructor() {
        this.connection = null;
        this.wallet = null;
        this.isConnected = false;
        this.userAddress = null;
        
        // Get cluster from environment or default to devnet
        this.cluster = 'devnet'; // Will be read from env in production
        this.endpoint = this.getEndpoint();
        
        this.initialize();
    }
    
    getEndpoint() {
        switch (this.cluster) {
            case 'mainnet-beta':
                return 'https://api.mainnet-beta.solana.com';
            case 'testnet':
                return 'https://api.testnet.solana.com';
            case 'devnet':
            default:
                return 'https://api.devnet.solana.com';
        }
    }
    
    async initialize() {
        try {
            // Wait for Solana Web3 to load
            await this.waitForSolanaWeb3();
            
            // Initialize Solana connection
            this.connection = new solanaWeb3.Connection(this.endpoint, 'confirmed');
            
            // Check for existing wallet connection
            await this.checkExistingConnection();
            
            // Set up wallet detection
            this.detectWallets();
            
            // Set up wallet button click handler
            this.setupWalletButton();
            
            console.log('🌐 Wallet provider initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize wallet provider:', error);
        }
    }
    
    async waitForSolanaWeb3() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds
        
        while (!window.solanaWeb3 && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.solanaWeb3) {
            throw new Error('Solana Web3 library not loaded');
        }
    }
    
    detectWallets() {
        // Detect available wallets
        const wallets = {
            phantom: window.solana,
            solflare: window.solflare,
            backpack: window.backpack
        };
        
        this.availableWallets = Object.entries(wallets)
            .filter(([name, wallet]) => wallet && wallet.isWallet)
            .map(([name, wallet]) => ({ name, wallet }));
            
        console.log('🌐 Available wallets:', this.availableWallets.map(w => w.name));
    }
    
    async checkExistingConnection() {
        // Check if wallet is already connected
        if (window.solana && window.solana.isConnected) {
            await this.connectWallet(window.solana, 'phantom');
        }
    }
    
    setupWalletButton() {
        const walletBtn = document.querySelector('.wallet-btn');
        if (walletBtn) {
            walletBtn.addEventListener('click', async () => {
                if (this.isConnected) {
                    await this.disconnectWallet();
                } else {
                    await this.connectToAvailableWallet();
                }
            });
        }
    }
    
    async connectToAvailableWallet() {
        // Try to connect to the first available wallet
        for (const { name, wallet } of this.availableWallets) {
            try {
                const result = await this.connectWallet(wallet, name);
                if (result.success) {
                    return result;
                }
            } catch (error) {
                console.error(`Failed to connect to ${name}:`, error);
            }
        }
        
        // If no wallet available, show error
        this.showNotification('No wallet found. Please install Phantom, Solflare, or Backpack.', 'error');
    }
    
    async connectWallet(wallet, walletName) {
        try {
            if (!wallet) {
                throw new Error(`${walletName} wallet not found`);
            }
            
            // Request connection
            const response = await wallet.connect();
            this.wallet = wallet;
            this.userAddress = response.publicKey.toString();
            this.isConnected = true;
            
            console.log(`✅ Connected to ${walletName}:`, this.userAddress);
            
            // Update UI
            this.updateUI();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Dispatch wallet connected event
            document.dispatchEvent(new CustomEvent('walletConnected', {
                detail: {
                    address: this.userAddress,
                    wallet: this.wallet
                }
            }));
            
            this.showNotification(`Connected to ${walletName}!`, 'success');
            
            return { success: true, address: this.userAddress };
            
        } catch (error) {
            console.error(`❌ Failed to connect to ${walletName}:`, error);
            this.showNotification(`Failed to connect: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    async disconnectWallet() {
        if (this.wallet && this.wallet.disconnect) {
            await this.wallet.disconnect();
        }
        
        this.wallet = null;
        this.userAddress = null;
        this.isConnected = false;
        
        console.log('🔌 Wallet disconnected');
        this.updateUI();
        
        // Dispatch wallet disconnected event
        document.dispatchEvent(new CustomEvent('walletDisconnected'));
        
        this.showNotification('Wallet disconnected', 'info');
    }
    
    setupEventListeners() {
        if (this.wallet) {
            // Listen for account changes
            this.wallet.on('accountChanged', (publicKey) => {
                if (publicKey) {
                    this.userAddress = publicKey.toString();
                    console.log('🔄 Account changed:', this.userAddress);
                    this.updateUI();
                } else {
                    this.disconnectWallet();
                }
            });
            
            // Listen for disconnect
            this.wallet.on('disconnect', () => {
                this.disconnectWallet();
            });
        }
    }
    
    updateUI() {
        // Update wallet button text
        const walletBtn = document.querySelector('.wallet-btn');
        if (walletBtn) {
            if (this.isConnected) {
                walletBtn.textContent = `${this.userAddress.slice(0, 4)}...${this.userAddress.slice(-4)}`;
                walletBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            } else {
                walletBtn.textContent = 'Connect Wallet';
                walletBtn.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
            }
        }
        
        // Show/hide admin controls if connected
        const adminControls = document.getElementById('adminControls');
        if (adminControls) {
            adminControls.style.display = this.isConnected ? 'block' : 'none';
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    async getBalance() {
        if (!this.isConnected || !this.userAddress) {
            return 0;
        }
        
        try {
            const balance = await this.connection.getBalance(this.userAddress);
            return balance / 1e9; // Convert lamports to SOL
        } catch (error) {
            console.error('❌ Failed to get balance:', error);
            return 0;
        }
    }
    
    // Public methods for external use
    getConnection() {
        return this.connection;
    }
    
    getWallet() {
        return this.wallet;
    }
    
    isWalletConnected() {
        return this.isConnected;
    }
    
    getAddress() {
        return this.userAddress;
    }
}

// Initialize wallet provider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.heavensGateWallet = new HeavensGateWalletProvider();
    }, 1000);
});
