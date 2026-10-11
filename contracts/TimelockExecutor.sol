// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TimelockExecutor
 * @notice Enforces time delays for sensitive governance actions.
 */
contract TimelockExecutor {
    event Queued(bytes32 indexed txHash, address indexed target, uint256 value, bytes data, uint256 eta);
    event Executed(bytes32 indexed txHash, address indexed target, uint256 value, bytes data, uint256 eta);
    event Cancelled(bytes32 indexed txHash);

    uint256 public constant MIN_DELAY = 1 days;
    uint256 public constant MAX_DELAY = 30 days;
    uint256 public constant GRACE_PERIOD = 14 days;

    address public admin;
    uint256 public delay;
    mapping(bytes32 => bool) public queuedTransactions;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Timelock: caller is not admin");
        _;
    }

    constructor(address _admin, uint256 _delay) {
        require(_delay >= MIN_DELAY && _delay <= MAX_DELAY, "Timelock: delay out of bounds");
        admin = _admin;
        delay = _delay;
    }

    function getTxHash(address target, uint256 value, bytes memory data, uint256 eta) public pure returns (bytes32) {
        return keccak256(abi.encode(target, value, data, eta));
    }

    function queueTransaction(address target, uint256 value, bytes memory data, uint256 eta) external onlyAdmin returns (bytes32) {
        require(eta >= block.timestamp + delay, "Timelock: ETA must satisfy delay");
        bytes32 txHash = getTxHash(target, value, data, eta);
        queuedTransactions[txHash] = true;
        emit Queued(txHash, target, value, data, eta);
        return txHash;
    }

    function cancelTransaction(address target, uint256 value, bytes memory data, uint256 eta) external onlyAdmin {
        bytes32 txHash = getTxHash(target, value, data, eta);
        require(queuedTransactions[txHash], "Timelock: not queued");
        queuedTransactions[txHash] = false;
        emit Cancelled(txHash);
    }

    function executeTransaction(address target, uint256 value, bytes memory data, uint256 eta) external payable onlyAdmin returns (bytes memory) {
        bytes32 txHash = getTxHash(target, value, data, eta);
        require(queuedTransactions[txHash], "Timelock: not queued");
        require(block.timestamp >= eta, "Timelock: lock window not open");
        require(block.timestamp <= eta + GRACE_PERIOD, "Timelock: transaction is stale");

        queuedTransactions[txHash] = false;

        (bool success, bytes memory returnData) = target.call{value: value}(data);
        require(success, "Timelock: execution failed");

        emit Executed(txHash, target, value, data, eta);
        return returnData;
    }
}
