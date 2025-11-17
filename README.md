WorknHire
WorknHire is a decentralized freelance marketplace that uses Algorand smart contracts to provide secure, automated, and trustless escrow between clients and freelancers. It eliminates payment fraud, unpaid work, and high commissions by replacing intermediaries with blockchain logic.

## **Core Features**

### **Escrow System**

* Smart contract–based fund locking and automated releases
* Milestone-based payments
* Multi-party roles (client, freelancer, arbitrator)
* Dispute resolution and refund logic

### **Wallet Integration**
* Supports Pera Wallet.
* Wallet-based authentication and transaction signing
* Real-time balance and escrow state tracking

### **User Experience**
* Dashboard for managing escrows, milestones, and disputes
* Job marketplace with categories
* Profile management with skills, portfolios, and ratings
* Notification system for events and approvals

### **NFT Support**
* Uses **ARC-72** for NFT-based escrow (optional)
* Enables NFT-gated jobs, NFT-based collateral, and NFT deliverables

## **Technology Stack**

### **Frontend**
* React (Vite)
* TailwindCSS

### **Blockchain / Web3**

* Algorand blockchain
* `algosdk` for all on-chain operations
* TEAL / PyTEAL smart contracts
* ARC :
  * **ARC-0003** (Atomic Transfers)
  * **ARC-0012** (Contract Deployment)
  * **ARC-0020** (Wallet Transaction Signing)
  * **ARC-007** (Wallet Connect Standard)
  * **ARC-0072 / ARC-72** (NFT Standard)

## **Project Structure**

```
Algoescrow/
│
├── src/                   → React components, pages, services, wallet logic
├── smart_contracts/       → TEAL/PyTEAL escrow smart contracts
├── dist/                  → Production build (auto-generated)
├── index.html
├── vite.config.js
└── package.json
```

## **Local Setup**

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```


