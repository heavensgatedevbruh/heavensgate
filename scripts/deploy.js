const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting HeavensGateGame deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // APX Token Address (Solana token)
  const APX_TOKEN_ADDRESS = "APXWjCnXvRncq7UWeDPDCEFCdRyJj3oApkyzuGGoR777";
  
  console.log("\n🎮 Deploying HeavensGateGame...");
  const HeavensGateGame = await hre.ethers.getContractFactory("HeavensGateGame");
  const game = await HeavensGateGame.deploy(APX_TOKEN_ADDRESS);
  await game.deployed();
  
  console.log("✅ HeavensGateGame deployed to:", game.address);

  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n🔍 Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: game.address,
        constructorArguments: [APX_TOKEN_ADDRESS],
      });
      console.log("✅ Game contract verified");
    } catch (error) {
      console.log("❌ Game verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("APX Token:", APX_TOKEN_ADDRESS);
  console.log("Game Contract:", game.address);
  
  console.log("\n📊 Game Configuration:");
  console.log("Entry Fee: 100 APX");
  console.log("Min Prize Pool: 1000 APX");
  console.log("Payout Interval: 1 day");
  console.log("Prize Distribution: 50% / 30% / 20%");
  
  console.log("\n🔗 Next Steps:");
  console.log("1. Update frontend with game contract address");
  console.log("2. Test token gating functionality");
  console.log("3. Deploy to mainnet when ready");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
