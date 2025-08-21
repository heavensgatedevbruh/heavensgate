// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract HeavensGateGame is Ownable, ReentrancyGuard, Pausable {
    // Token contract for the game currency
    IERC20 public gameToken;
    
    // Game configuration
    uint256 public entryFee = 10 * 10**18; // 10 tokens (assuming 18 decimals)
    uint256 public minPrizePool = 100 * 10**18; // 100 tokens minimum to start payouts
    
    // Prize pool distribution percentages (total 100%)
    uint256 public constant FIRST_PLACE_PERCENT = 50;  // 50%
    uint256 public constant SECOND_PLACE_PERCENT = 30; // 30%
    uint256 public constant THIRD_PLACE_PERCENT = 20;  // 20%
    
    // Game state
    uint256 public totalPrizePool;
    uint256 public totalGamesPlayed;
    uint256 public lastPayoutTime;
    uint256 public payoutInterval = 1 days; // Daily payouts
    
    // Player data structure
    struct Player {
        uint256 bestScore;
        uint256 totalGames;
        uint256 totalPaid;
        bool hasActiveGame;
        uint256 lastGameTime;
    }
    
    // Score entry structure
    struct ScoreEntry {
        address player;
        uint256 score;
        uint256 timestamp;
        bool claimed;
    }
    
    // Mapping to store player data
    mapping(address => Player) public players;
    
    // Array to store all scores for the current period
    ScoreEntry[] public currentPeriodScores;
    
    // Events
    event GameStarted(address indexed player, uint256 entryFee);
    event ScoreSubmitted(address indexed player, uint256 score);
    event PrizePoolDistributed(
        address firstPlace,
        uint256 firstAmount,
        address secondPlace,
        uint256 secondAmount,
        address thirdPlace,
        uint256 thirdAmount
    );
    event EntryFeeUpdated(uint256 newEntryFee);
    event PayoutIntervalUpdated(uint256 newInterval);
    
    constructor(address _gameToken) {
        gameToken = IERC20(_gameToken);
        lastPayoutTime = block.timestamp;
    }
    
    /**
     * @dev Start a new game by paying the entry fee
     */
    function startGame() external nonReentrant whenNotPaused {
        require(!players[msg.sender].hasActiveGame, "Player already has active game");
        require(gameToken.transferFrom(msg.sender, address(this), entryFee), "Entry fee transfer failed");
        
        players[msg.sender].hasActiveGame = true;
        players[msg.sender].lastGameTime = block.timestamp;
        totalPrizePool += entryFee;
        
        emit GameStarted(msg.sender, entryFee);
    }
    
    /**
     * @dev Submit a score after completing a game
     * @param score The player's score
     */
    function submitScore(uint256 score) external nonReentrant whenNotPaused {
        require(players[msg.sender].hasActiveGame, "No active game found");
        require(score > 0, "Score must be greater than 0");
        
        // Update player stats
        players[msg.sender].hasActiveGame = false;
        players[msg.sender].totalGames++;
        
        if (score > players[msg.sender].bestScore) {
            players[msg.sender].bestScore = score;
        }
        
        // Add score to current period
        currentPeriodScores.push(ScoreEntry({
            player: msg.sender,
            score: score,
            timestamp: block.timestamp,
            claimed: false
        }));
        
        totalGamesPlayed++;
        
        emit ScoreSubmitted(msg.sender, score);
        
        // Check if it's time for payout
        if (block.timestamp >= lastPayoutTime + payoutInterval && totalPrizePool >= minPrizePool) {
            _distributePrizes();
        }
    }
    
    /**
     * @dev Distribute prizes to top 3 scorers
     */
    function _distributePrizes() internal {
        require(currentPeriodScores.length > 0, "No scores to distribute");
        
        // Sort scores in descending order
        _sortScores();
        
        uint256 firstPlaceAmount = 0;
        uint256 secondPlaceAmount = 0;
        uint256 thirdPlaceAmount = 0;
        
        address firstPlace = address(0);
        address secondPlace = address(0);
        address thirdPlace = address(0);
        
        // Determine winners
        if (currentPeriodScores.length >= 1) {
            firstPlace = currentPeriodScores[0].player;
            firstPlaceAmount = (totalPrizePool * FIRST_PLACE_PERCENT) / 100;
        }
        
        if (currentPeriodScores.length >= 2) {
            secondPlace = currentPeriodScores[1].player;
            secondPlaceAmount = (totalPrizePool * SECOND_PLACE_PERCENT) / 100;
        }
        
        if (currentPeriodScores.length >= 3) {
            thirdPlace = currentPeriodScores[2].player;
            thirdPlaceAmount = (totalPrizePool * THIRD_PLACE_PERCENT) / 100;
        }
        
        // Distribute prizes
        if (firstPlace != address(0) && firstPlaceAmount > 0) {
            gameToken.transfer(firstPlace, firstPlaceAmount);
            players[firstPlace].totalPaid += firstPlaceAmount;
        }
        
        if (secondPlace != address(0) && secondPlaceAmount > 0) {
            gameToken.transfer(secondPlace, secondPlaceAmount);
            players[secondPlace].totalPaid += secondPlaceAmount;
        }
        
        if (thirdPlace != address(0) && thirdPlaceAmount > 0) {
            gameToken.transfer(thirdPlace, thirdPlaceAmount);
            players[thirdPlace].totalPaid += thirdPlaceAmount;
        }
        
        // Reset for next period
        delete currentPeriodScores;
        totalPrizePool = 0;
        lastPayoutTime = block.timestamp;
        
        emit PrizePoolDistributed(
            firstPlace,
            firstPlaceAmount,
            secondPlace,
            secondPlaceAmount,
            thirdPlace,
            thirdPlaceAmount
        );
    }
    
    /**
     * @dev Sort scores in descending order using bubble sort
     */
    function _sortScores() internal {
        uint256 n = currentPeriodScores.length;
        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = 0; j < n - i - 1; j++) {
                if (currentPeriodScores[j].score < currentPeriodScores[j + 1].score) {
                    ScoreEntry memory temp = currentPeriodScores[j];
                    currentPeriodScores[j] = currentPeriodScores[j + 1];
                    currentPeriodScores[j + 1] = temp;
                }
            }
        }
    }
    
    /**
     * @dev Force payout (owner only, for emergency situations)
     */
    function forcePayout() external onlyOwner {
        require(currentPeriodScores.length > 0, "No scores to distribute");
        _distributePrizes();
    }
    
    /**
     * @dev Update entry fee (owner only)
     */
    function setEntryFee(uint256 _newEntryFee) external onlyOwner {
        entryFee = _newEntryFee;
        emit EntryFeeUpdated(_newEntryFee);
    }
    
    /**
     * @dev Update payout interval (owner only)
     */
    function setPayoutInterval(uint256 _newInterval) external onlyOwner {
        payoutInterval = _newInterval;
        emit PayoutIntervalUpdated(_newInterval);
    }
    
    /**
     * @dev Pause the contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw tokens (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = gameToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        gameToken.transfer(owner(), balance);
    }
    
    // View functions
    
    /**
     * @dev Get current period scores
     */
    function getCurrentPeriodScores() external view returns (ScoreEntry[] memory) {
        return currentPeriodScores;
    }
    
    /**
     * @dev Get player info
     */
    function getPlayerInfo(address player) external view returns (Player memory) {
        return players[player];
    }
    
    /**
     * @dev Get top 3 current scores
     */
    function getTopScores() external view returns (address[3] memory, uint256[3] memory) {
        address[3] memory topPlayers;
        uint256[3] memory topScores;
        
        if (currentPeriodScores.length > 0) {
            // Create a copy to sort
            ScoreEntry[] memory sortedScores = new ScoreEntry[](currentPeriodScores.length);
            for (uint256 i = 0; i < currentPeriodScores.length; i++) {
                sortedScores[i] = currentPeriodScores[i];
            }
            
            // Sort the copy
            for (uint256 i = 0; i < sortedScores.length - 1; i++) {
                for (uint256 j = 0; j < sortedScores.length - i - 1; j++) {
                    if (sortedScores[j].score < sortedScores[j + 1].score) {
                        ScoreEntry memory temp = sortedScores[j];
                        sortedScores[j] = sortedScores[j + 1];
                        sortedScores[j + 1] = temp;
                    }
                }
            }
            
            // Get top 3
            for (uint256 i = 0; i < 3 && i < sortedScores.length; i++) {
                topPlayers[i] = sortedScores[i].player;
                topScores[i] = sortedScores[i].score;
            }
        }
        
        return (topPlayers, topScores);
    }
    
    /**
     * @dev Check if payout is due
     */
    function isPayoutDue() external view returns (bool) {
        return block.timestamp >= lastPayoutTime + payoutInterval && 
               totalPrizePool >= minPrizePool && 
               currentPeriodScores.length > 0;
    }
}
