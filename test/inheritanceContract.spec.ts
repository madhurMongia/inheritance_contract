import { expect } from 'chai';
import { BN, expectEvent, expectRevert, time } from '@openzeppelin/test-helpers';
import { ethers } from 'hardhat';
import { InheritanceContract__factory } from '../typechain-types/factories/InheritanceContract__factory';

describe('InheritanceContract', () => {
    const oneMonth = time.duration.days(30);

    let inheritanceContract: ethers.Contract;
    let owner: ethers.Wallet;
    let heir: string;
    let newHeir: string;
    let other: ethers.Wallet;

    before(async () => {
        [owner, other] = await ethers.getSigners();
        heir = '0xDC708d851361f1F8905bB6fb10D6868b8d010810';
        newHeir = '0xDC708d851361f1F8905bB6fb10D6868b8d010811'; // an example address for testing

        const inheritanceContractFactory = new InheritanceContract__factory(owner);
        inheritanceContract = await inheritanceContractFactory.deploy(heir);
        await inheritanceContract.deployed();
    });

    it('should set the correct owner and heir upon deployment', async () => {
        expect(await inheritanceContract.owner()).to.equal(owner.address);
        expect(await inheritanceContract.heir()).to.equal(heir);
    });

    it('should allow the owner to withdraw funds', async () => {
        const amount = ethers.utils.parseEther('1');
        await inheritanceContract.send(amount);

        const initialBalance = await inheritanceContract.provider.getBalance(inheritanceContract.address);
        const initialOwnerBalance = await owner.getBalance();

        const tx = await inheritanceContract.withdraw(amount);

        const newBalance = await inheritanceContract.provider.getBalance(inheritanceContract.address);
        const newOwnerBalance = await owner.getBalance();

        expect(newBalance).to.be.eq(initialBalance.sub(amount));
        expect(newOwnerBalance).to.be.gt(initialOwnerBalance);

        expectEvent(tx, 'FundsWithdrawn', { recipient: owner.address, amount: new BN(amount) });
    });

    it('should not allow non-owner to withdraw funds', async () => {
        await expectRevert(
            inheritanceContract.connect(other).withdraw(ethers.utils.parseEther('1')),
            'Only the owner can withdraw funds.'
        );
    });

    it('should not allow withdrawing more than the contract balance', async () => {
        const amount = ethers.utils.parseEther('1');
        await inheritanceContract.send(amount);

        await expectRevert(
            inheritanceContract.withdraw(ethers.utils.parseEther('2')),
            'Insufficient contract balance.'
        );
    });

    it('should allow the heir to claim ownership after one month of inactivity', async () => {
        await time.increase(oneMonth.add(time.duration.seconds(1)));

        const tx = await inheritanceContract.claimOwnership(newHeir);

        expect(await inheritanceContract.owner()).to.equal(heir);
        expect(await inheritanceContract.heir()).to.equal(newHeir);

        expectEvent(tx, 'OwnershipTransferred', { previousOwner: owner.address, newOwner: newHeir });
    });

    it('should not allow non-heir to claim ownership', async () => {
        await time.increase(oneMonth.add(time.duration.seconds(1)));

        await expectRevert(
            inheritanceContract.connect(other).claimOwnership(other),
            'Only the designated heir can claim ownership.'
        );
    });

    it('should not allow heir to claim ownership before one month of inactivity', async () => {
        await expectRevert(
            inheritanceContract.claimOwnership(newHeir),
            'The owner still has control.'
        );
    });

    it('should allow the owner to set a new heir', async () => {
        const tx = await inheritanceContract.setHeir(newHeir);

        expect(await inheritanceContract.heir()).to.equal(newHeir);

        expectEvent(tx, 'HeirChanged', { previousHeir: heir, newHeir: newHeir });
    });

    it('should not allow non-owner to set a new heir', async () => {
        await expectRevert(
            inheritanceContract.connect(other).setHeir(newHeir),
            'Only the owner can set the heir.'
        );
    });

    it('should not allow setting the zero address as heir', async () => {
        await expectRevert(
            inheritanceContract.setHeir(ethers.constants.AddressZero),
            'Heir cannot be the zero address.'
        );
    });

    it('should not allow setting the owner as heir', async () => {
        await expectRevert(
            inheritanceContract.setHeir(owner.address),
            'Owner cannot be the heir.'
        );
    });
});

