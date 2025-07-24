const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const NotesRegistry = await hre.ethers.getContractFactory("NotesRegistry");
  const notesRegistry = await NotesRegistry.deploy();

  await notesRegistry.deployed();

  console.log("✅ NotesRegistry deployed to:", notesRegistry.address);

  // Optional: Save contract address and ABI for frontend use
  const contractsDir = path.join(__dirname, "..", "deployed");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Save address
  fs.writeFileSync(
    path.join(contractsDir, "NotesRegistry-address.json"),
    JSON.stringify({ address: notesRegistry.address }, null, 2)
  );

  // Save ABI
  const artifact = await hre.artifacts.readArtifact("NotesRegistry");

  fs.writeFileSync(
    path.join(contractsDir, "NotesRegistry-abi.json"),
    JSON.stringify(artifact.abi, null, 2)
  );
}

main().catch((error) => {
  console.error("❌ Error deploying:", error);
  process.exitCode = 1;
});
