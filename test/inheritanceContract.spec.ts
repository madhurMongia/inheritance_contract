import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { InheritanceContract } from "../types/contracts/inheritance.sol";
import {InheritanceContract__factory} from "../types/factories/contracts/inheritance.sol/index"

describe("InheritanceContract", function () {
  let inheritanceContract: InheritanceContract;
  let owner: SignerWithAddress;
  let heir: SignerWithAddress;
  let newHeir: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async function () {
    [owner, heir, newHeir, other] = await ethers.getSigners();
    const amount = ethers.parseEther("1");
    const InheritanceContractFactory = await ethers.getContractFactory("InheritanceContract") as unknown as InheritanceContract__factory ;
    inheritanceContract = await InheritanceContractFactory.deploy(heir.address, {value : amount })
    await inheritanceContract.waitForDeployment();
  });

  it("should set the correct owner and heir during deployment", async function () {
    expect(await inheritanceContract.owner()).to.equal(owner.address);
    expect(await inheritanceContract.heir()).to.equal(heir.address);
  });

  it("should allow the owner to withdraw funds", async function () {
    const contractAddress = await inheritanceContract.getAddress();
    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
    const contractBalanceBefore = await ethers.provider.getBalance(contractAddress);
  
    await expect(inheritanceContract.connect(owner).withdraw(ethers.parseEther("1")))
      .to.emit(inheritanceContract, "FundsWithdrawn")
      .withArgs(owner.address, ethers.parseEther("1"));
  
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
    const contractBalanceAfter = await ethers.provider.getBalance(contractAddress);
    expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    expect(contractBalanceAfter).to.be.lt(contractBalanceBefore);
  });

  it("should not allow non-owner to withdraw funds", async function () {
    await expect(inheritanceContract.connect(other).withdraw(ethers.parseEther('2')))
    .to.be.revertedWith('Only the owner can withdraw funds.')
  });

  it("should allow the owner to set a new heir", async function () {
    await expect(inheritanceContract.setHeir(newHeir.address))
      .to.emit(inheritanceContract, "HeirChanged")
      .withArgs(heir.address, newHeir.address);

    expect(await inheritanceContract.heir()).to.equal(newHeir.address);
  });

  it("should not allow non-owner to set a new heir", async function () {
    await expect(inheritanceContract.connect(other).setHeir(newHeir.address)).to.be.revertedWith("Only the owner can set a new heir.")
  });

  it("should allow the heir to claim ownership after the delay period", async function () {
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // Increase time by 30 days
    await ethers.provider.send("evm_mine"); // Mine a new block

    await expect(inheritanceContract.connect(heir).claimOwnership(newHeir.address))
      .to.emit(inheritanceContract, "OwnershipTransferred")
      .withArgs(owner.address, heir.address);

    expect(await inheritanceContract.heir()).to.equal(newHeir.address);
  });

  it("should not allow non-heir to claim ownership", async function () {
    await expect(inheritanceContract.connect(other).claimOwnership(newHeir.address)).to.be.revertedWith(
      "Only the designated heir can claim ownership."
    );
  });

  it("should not allow claiming ownership before the delay period", async function () {
    await expect(inheritanceContract.connect(heir).claimOwnership(newHeir.address)).to.be.revertedWith(
      "The owner still has control."
    );
  });
});

