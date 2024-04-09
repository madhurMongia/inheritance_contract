
pragma solidity ^0.8.0;

contract InheritanceContract {
    address public owner;
    address public heir;
    uint256 public lastWithdrawalTimestamp;
    uint256 public constant OWNERSHIP_TRANSFER_DELAY_DAYS = 30 days;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event HeirChanged(address indexed previousHeir, address indexed newHeir);
    event FundsWithdrawn(address indexed recipient, uint256 amount);

    constructor(address _heir) {
        require(_heir != address(0), "Heir cannot be the zero address.");
        owner = msg.sender;
        heir = _heir;
        lastWithdrawalTimestamp = block.timestamp;
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Only the owner can withdraw funds.");
        require(
            address(this).balance >= amount,
            "Insufficient contract balance."
        );

        lastWithdrawalTimestamp = block.timestamp;
        payable(owner).transfer(amount);
        emit FundsWithdrawn(owner, amount);
    }

    function claimOwnership(address _newheir) external {
        require(
            msg.sender == heir,
            "Only the designated heir can claim ownership."
        );
        require(
            block.timestamp >
                lastWithdrawalTimestamp + OWNERSHIP_TRANSFER_DELAY_DAYS,
            "The owner still has control."
        );
         require(_newheir != address(0), " new Heir cannot be the zero address.");

        address previousOwner = owner;
        owner = heir;
        heir = _newheir;
        lastWithdrawalTimestamp = block.timestamp;
        emit OwnershipTransferred(previousOwner, owner);
    }

    function setHeir(address _heir) external {
        require(msg.sender == owner, "Only the owner can set the heir.");
        require(_heir != address(0), "Heir cannot be the zero address.");
        require(_heir != owner, "Owner cannot be the heir.");

        address previousHeir = heir;
        heir = _heir;
        emit HeirChanged(previousHeir, heir);
    }
}
