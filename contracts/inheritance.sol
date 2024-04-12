pragma solidity ^0.8.20;

/**
 * @title InheritanceContract
 * @dev A contract that allows the owner to designate an heir and transfer ownership after a certain delay.
 */
contract InheritanceContract {
    address public owner;
    address public heir;
    uint256 public lastWithdrawalTimestamp;
    uint256 public constant OWNERSHIP_TRANSFER_DELAY = 30 days;

    event HeirChanged(address previousHeir, address newHeir);
    event FundsWithdrawn(address recipient, uint256 amount);
    event OwnershipTransferred(address previousOwner, address newOwner);

    /**
     * @dev Constructor function that sets the initial owner and heir.
     * @param _heir The address of the designated heir.
     */
    constructor(address _heir) payable {
        owner = msg.sender;
        heir = _heir;
        lastWithdrawalTimestamp = block.timestamp;
    }

    /**
     * @dev Allows the owner to withdraw funds from the contract.
     * @param amount The amount of funds to withdraw.
     */
    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Only the owner can withdraw funds.");
        lastWithdrawalTimestamp = block.timestamp;
        payable(owner).transfer(amount);
        emit FundsWithdrawn(owner, amount);
    }

    /**
     * @dev Allows the designated heir to claim ownership of the contract after the specified delay.
     * @param _newHeir The address of the new heir.
     */
    function claimOwnership(address _newHeir) external {
        require(msg.sender == heir, "Only the designated heir can claim ownership.");
        require(
            block.timestamp > lastWithdrawalTimestamp + OWNERSHIP_TRANSFER_DELAY,
            "The owner still has control."
        );
        address previousOwner = owner;
        owner = heir;
        heir = _newHeir;
        lastWithdrawalTimestamp = block.timestamp;
        emit OwnershipTransferred(previousOwner, owner);
        emit HeirChanged(heir, _newHeir);
    }

    /**
     * @dev Allows the owner to set a new heir.
     * @param _heir The address of the new heir.
     */
    function setHeir(address _heir) external {
        require(msg.sender == owner, "Only the owner can set a new heir.");
        address previousHeir = heir;
        heir = _heir;
        emit HeirChanged(previousHeir, _heir);
    }
}

