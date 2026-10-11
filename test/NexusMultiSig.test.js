const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NexusMultiSig Protocol Test Suite", function () {
  let owner1, owner2, owner3, nonOwner, recipient;
  let multisig;

  beforeEach(async function () {
    [owner1, owner2, owner3, nonOwner, recipient] = await ethers.getSigners();

    const NexusMultiSig = await ethers.getContractFactory("NexusMultiSig");
    multisig = await NexusMultiSig.deploy([owner1.address, owner2.address, owner3.address], 2);
    await multisig.waitForDeployment();

    // Fund the multisig with 10 ETH
    await owner1.sendTransaction({
      to: await multisig.getAddress(),
      value: ethers.parseEther("10"),
    });
  });

  it("Should deposit ETH correctly and track balance", async function () {
    const balance = await ethers.provider.getBalance(await multisig.getAddress());
    expect(balance).to.equal(ethers.parseEther("10"));
  });

  it("Should allow owners to submit and confirm a transaction", async function () {
    const tx = await multisig.connect(owner1).submitTransaction(recipient.address, ethers.parseEther("1"), "0x");
    await tx.wait();

    expect(await multisig.getTransactionCount()).to.equal(1);

    await multisig.connect(owner1).confirmTransaction(0);
    const txn = await multisig.getTransaction(0);
    expect(txn.numConfirmations).to.equal(1);
  });

  it("Should execute transaction only after reaching quorum (2 approvals)", async function () {
    await multisig.connect(owner1).submitTransaction(recipient.address, ethers.parseEther("2"), "0x");

    await multisig.connect(owner1).confirmTransaction(0);
    await expect(multisig.connect(owner1).executeTransaction(0)).to.be.revertedWith("Cannot execute: quorum not reached");

    await multisig.connect(owner2).confirmTransaction(0);
    const beforeBalance = await ethers.provider.getBalance(recipient.address);

    await multisig.connect(owner1).executeTransaction(0);
    const afterBalance = await ethers.provider.getBalance(recipient.address);

    expect(afterBalance - beforeBalance).to.equal(ethers.parseEther("2"));
  });

  it("Should reject submissions from non-owners", async function () {
    await expect(
      multisig.connect(nonOwner).submitTransaction(recipient.address, ethers.parseEther("1"), "0x")
    ).to.be.revertedWith("NexusMultiSig: caller is not an owner");
  });
});
