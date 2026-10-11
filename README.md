# NexusTreasury: Enterprise Multi-Signature DAO & Timelock Governance

![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue)
![Hardhat](https://img.shields.io/badge/Framework-Hardhat-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

An enterprise-grade, decentralized **M-of-N Multi-Signature Wallet and Timelock Controller** protocol engineered for robust DAO treasury management, high-value protocol parameter upgrades, and fault-tolerant fund operations.

---

## 🌟 Key Features

- **M-of-N Quorum Verification**: Dynamic threshold governance requiring configurable cryptographic approvals before transaction execution.
- **Strict Nonce & Replay Defense**: Guarantees idempotent transaction execution and eliminates double-spending vulnerabilities.
- **Timelock Delay Execution**: Integrates a time-delay controller enforcing grace periods and public transparency windows.
- **Arbitrary Calldata Invocation**: Full support for native ETH transfers and external contract interaction (e.g. interacting with Uniswap, Aave, Compound).
- **Confirmation Revocation**: Signers can revoke their confirmation prior to transaction dispatch if suspicious activity is detected.

---

## 🏗 Architecture

```text
               +-------------------------------------------+
               |  Authorized Signers (Owner 1, 2, ... N)   |
               +---------------------+---------------------+
                                     |
                             Submit & Confirm
                                     |
                                     v
                        +------------+------------+
                        |     NexusMultiSig       |  <--- Quorum Validation (M-of-N)
                        +------------+------------+
                                     |
                                   Queue
                                     v
                        +------------+------------+
                        |    TimelockExecutor     |  <--- Mandatory Delay Window
                        +------------+------------+
                                     |
                                  Execute
                                     v
                        +------------+------------+
                        |  Protocol / Target DeFi |
                        +-------------------------+
```

---

## 📂 Project Structure

```bash
├── contracts/
│   ├── NexusMultiSig.sol       # Core M-of-N multi-signature execution engine
│   ├── TimelockExecutor.sol    # Time-locked delayed execution module
│   ├── MockToken.sol           # ERC20 governance token for treasury testing
│   └── IERC20.sol              # Minimal interface
├── scripts/
│   └── deploy.js               # Deployment pipeline with multi-signer setup
├── test/
│   └── NexusMultiSig.test.js   # Unit & integration testing with Hardhat
├── hardhat.config.js           # Compiler optimization & network configs
└── package.json
```

---

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/aromaticthrif/repo-86xi7fwj.git
cd repo-86xi7fwj
npm install
```

### 2. Compile Contracts

```bash
npx hardhat compile
```

### 3. Run Automated Tests

```bash
npx hardhat test
```

### 4. Deploy

```bash
npx hardhat run scripts/deploy.js --network localhost
```

---

## 🔒 Security & Best Practices

- Explicit state verification guards (`txExists`, `notExecuted`, `notConfirmed`).
- Native low-level call return check and reentrancy mitigation.
- Timelock grace period expiration preventing stale transaction exploitation.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
