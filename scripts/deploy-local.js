const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting local deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // For local testing, we'll use a mock APX token address
  const MOCK_APX_ADDRESS = "0x0000000000000000000000000000000000000000";
  
  console.log("\n🎮 Deploying HeavensGateGame...");
  const HeavensGateGame = await hre.ethers.getContractFactory("HeavensGateGame");
  const game = await HeavensGateGame.deploy(MOCK_APX_ADDRESS);
  await game.deployed();
  
  console.log("✅ HeavensGateGame deployed to:", game.address);
  
  console.log("\n🎉 Local deployment completed!");
  console.log("\n📋 Contract Addresses:");
  console.log("Game Contract:", game.address);
  console.log("Mock APX Token:", MOCK_APX_ADDRESS);
  
  console.log("\n🔗 To use this contract:");
  console.log("1. Copy the game contract address above");
  console.log("2. Open your website");
  console.log("3. Open browser console and run:");
  console.log(`   window.heavensGateWeb3.setGameContractAddress("${game.address}")`);
  console.log("4. Connect your wallet");
  
  console.log("\n📊 Game Configuration:");
  console.log("Entry Fee: 100 APX");
  console.log("Min Prize Pool: 1000 APX");
  console.log("Payout Interval: 1 day");
  console.log("Prize Distribution: 50% / 30% / 20%");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
