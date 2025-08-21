// ConnectWallet Component for Heaven's Gate
// A reusable wallet connection component for HTML-based pages

class ConnectWallet {
    constructor(containerId = 'connect-wallet-container') {
        this.containerId = containerId;
        this.container = null;
        this.isConnected = false;
        this.userAddress = null;
        this.wallet = null;
        
        this.init();
    }
    
    init() {
        // Create container if it doesn't exist
        this.createContainer();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check for existing connection
        this.checkExistingConnection();
        
        // Initial render
        this.render();
    }
    
    createContainer() {
        // Check if container already exists
        this.container = document.getElementById(this.containerId);
        
        if (!this.container) {
            // Create container
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            this.container.className = 'connect-wallet-component';
            
            // Add styles
            this.addStyles();
            
            // Insert into page header or body
            this.insertIntoPage();
        }
    }
    
    addStyles() {
        // Add component styles if not already added
        if (!document.getElementById('connect-wallet-styles')) {
            const style = document.createElement('style');
            style.id = 'connect-wallet-styles';
            style.textContent = `
                .connect-wallet-component {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-family: Arial, sans-serif;
                    position: fixed;
                    top: 1rem;
                    right: 1rem;
                    z-index: 1000;
                }
                
                .connect-wallet-btn {
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    color: #000;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: bold;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                }
                
                .connect-wallet-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
                }
                
                .wallet-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 25px;
                    padding: 8px 15px;
                    color: white;
                }
                
                .wallet-address {
                    font-weight: bold;
                    font-size: 14px;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                }
                
                .disconnect-btn {
                    background: linear-gradient(135deg, #f44336, #d32f2f);
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
                }
                
                .disconnect-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.5);
                }
                
                .wallet-status {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #4CAF50;
                    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
                }
                
                .status-indicator.disconnected {
                    background: #f44336;
                    box-shadow: 0 0 5px rgba(244, 67, 54, 0.5);
                }
                
                .wallet-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                
                .wallet-modal.show {
                    opacity: 1;
                    visibility: visible;
                }
                
                .wallet-modal-content {
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border: 1px solid rgba(255, 215, 0, 0.3);
                    border-radius: 20px;
                    padding: 30px;
                    text-align: center;
                    color: white;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                }
                
                .wallet-modal h3 {
                    margin: 0 0 20px 0;
                    color: #FFD700;
                    font-size: 24px;
                }
                
                .wallet-options {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .wallet-option {
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    color: #000;
                    border: none;
                    padding: 15px 20px;
                    border-radius: 15px;
                    font-weight: bold;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                }
                
                .wallet-option:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
                }
                
                .wallet-option:disabled {
                    background: #666;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                
                .close-modal {
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                }
                
                .close-modal:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    insertIntoPage() {
        // Insert at the top of body for fixed positioning
        document.body.insertBefore(this.container, document.body.firstChild);
    }
    
    setupEventListeners() {
        // Listen for wallet connection events from the main wallet provider
        document.addEventListener('walletConnected', (event) => {
            this.isConnected = true;
            this.userAddress = event.detail.address;
            this.wallet = event.detail.wallet;
            this.render();
        });
        
        document.addEventListener('walletDisconnected', () => {
            this.isConnected = false;
            this.userAddress = null;
            this.wallet = null;
            this.render();
        });
    }
    
    checkExistingConnection() {
        // Check if wallet is already connected via the main wallet provider
        if (window.heavensGateWallet && window.heavensGateWallet.isWalletConnected()) {
            this.isConnected = true;
            this.userAddress = window.heavensGateWallet.getAddress();
            this.wallet = window.heavensGateWallet.getWallet();
        }
    }
    
    render() {
        if (!this.container) return;
        
        if (this.isConnected && this.userAddress) {
            this.renderConnected();
        } else {
            this.renderDisconnected();
        }
    }
    
    renderConnected() {
        const shortAddress = this.getShortAddress(this.userAddress);
        
        this.container.innerHTML = `
            <div class="wallet-info">
                <div class="wallet-status">
                    <div class="status-indicator"></div>
                    <span class="wallet-address">${shortAddress}</span>
                </div>
                <button class="disconnect-btn" onclick="connectWalletComponent.disconnect()">Disconnect</button>
            </div>
        `;
    }
    
    renderDisconnected() {
        this.container.innerHTML = `
            <button class="connect-wallet-btn" onclick="connectWalletComponent.showModal()">
                Connect Wallet
            </button>
        `;
    }
    
    getShortAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }
    
    showModal() {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'wallet-modal';
        modal.id = 'wallet-modal';
        
        modal.innerHTML = `
            <div class="wallet-modal-content">
                <button class="close-modal" onclick="connectWalletComponent.hideModal()">&times;</button>
                <h3>Connect Wallet</h3>
                <div class="wallet-options">
                    <button class="wallet-option" onclick="connectWalletComponent.connectWallet('phantom')">
                        Phantom
                    </button>
                    <button class="wallet-option" onclick="connectWalletComponent.connectWallet('solflare')">
                        Solflare
                    </button>
                    <button class="wallet-option" onclick="connectWalletComponent.connectWallet('backpack')">
                        Backpack
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }
    
    hideModal() {
        const modal = document.getElementById('wallet-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }
    
    async connectWallet(walletName) {
        try {
            this.hideModal();
            
            // Use the main wallet provider to connect
            if (window.heavensGateWallet) {
                const result = await window.heavensGateWallet.connectToAvailableWallet();
                
                if (result.success) {
                    // Update local state
                    this.isConnected = true;
                    this.userAddress = result.address;
                    this.wallet = window.heavensGateWallet.getWallet();
                    
                    // Dispatch event
                    document.dispatchEvent(new CustomEvent('walletConnected', {
                        detail: {
                            address: result.address,
                            wallet: this.wallet
                        }
                    }));
                    
                    this.render();
                    this.showNotification(`Connected to ${walletName}!`, 'success');
                } else {
                    this.showNotification(`Failed to connect: ${result.error}`, 'error');
                }
            } else {
                this.showNotification('Wallet provider not available', 'error');
            }
            
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            this.showNotification(`Failed to connect: ${error.message}`, 'error');
        }
    }
    
    async disconnect() {
        try {
            if (window.heavensGateWallet) {
                await window.heavensGateWallet.disconnectWallet();
            }
            
            // Update local state
            this.isConnected = false;
            this.userAddress = null;
            this.wallet = null;
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('walletDisconnected'));
            
            this.render();
            this.showNotification('Wallet disconnected', 'info');
            
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
            this.showNotification(`Failed to disconnect: ${error.message}`, 'error');
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
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
            font-family: Arial, sans-serif;
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for wallet provider to load
    setTimeout(() => {
        window.connectWalletComponent = new ConnectWallet();
    }, 1500);
});
