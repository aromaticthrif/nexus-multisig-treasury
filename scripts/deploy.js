const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  const owners = [signers[0].address, signers[1].address, signers[2].address];
  const quorum = 2; // 2-of-3

  console.log("Deploying NexusMultiSig Treasury with owners:", owners);
  console.log("Quorum requirement:", quorum);

  const NexusMultiSig = await hre.ethers.getContractFactory("NexusMultiSig");
  const multisig = await NexusMultiSig.deploy(owners, quorum);
  await multisig.waitForDeployment();
  console.log("NexusMultiSig deployed to:", await multisig.getAddress());

  // Deploy Timelock (2 days delay)
  const Timelock = await hre.ethers.getContractFactory("TimelockExecutor");
  const delay = 2 * 24 * 60 * 60; // 2 days in seconds
  const timelock = await Timelock.deploy(await multisig.getAddress(), delay);
  await timelock.waitForDeployment();
  console.log("TimelockExecutor deployed to:", await timelock.getAddress());

  // Deploy Mock Treasury ERC20 Token
  const MockToken = await hre.ethers.getContractFactory("MockToken");
  const token = await MockToken.deploy("Nexus Governance Token", "NEXUS", 18);
  await token.waitForDeployment();
  console.log("Mock Token deployed to:", await token.getAddress());

  console.log("--- Deployment Completed Successfully ---");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
