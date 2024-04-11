pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract InheritanceContract is Ownable {
    address public heir;
    uint256 public lastWithdrawalTimestamp;
    uint256 public constant OWNERSHIP_TRANSFER_DELAY_DAYS = 30 days;

    event HeirChanged(address previousHeir, address newHeir);
    event FundsWithdrawn(address recipient, uint256 amount);

    constructor(address _heir) Ownable(msg.sender) payable {
        require(_heir != address(0), "Heir cannot be the zero address.");
        heir = _heir;
        lastWithdrawalTimestamp = block.timestamp;
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(
            address(this).balance >= amount,
            "Insufficient contract balance."
        );
        lastWithdrawalTimestamp = block.timestamp;
        payable(owner()).transfer(amount);
        emit FundsWithdrawn(owner(), amount);
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
        require(_newheir != address(0), "New heir cannot be the zero address.");
        address previousHeir = heir;
        heir = _newheir;
        lastWithdrawalTimestamp = block.timestamp;
        emit HeirChanged(previousHeir, _newheir);
    }

    function setHeir(address _heir) external onlyOwner {
        require(_heir != address(0), "Heir cannot be the zero address.");
        require(_heir != owner(), "Owner cannot be the heir.");
        address previousHeir = heir;
        heir = _heir;
        emit HeirChanged(previousHeir, _heir);
    }
}
