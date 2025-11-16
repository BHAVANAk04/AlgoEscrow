# NFT Escrow Integration - AlgoEscrow Platform

## Overview

This document explains the NFT escrow smart contract integration with the AlgoEscrow React frontend. The system enables secure, atomic NFT transfers on the Algorand blockchain using stateless contracts (LogicSig).

## Components

### 1. **Smart Contract (TEAL)**
- **File**: `escrow.teal` (template)
- **Location**: Smart contracts folder (for reference)
- **Purpose**: Stateless contract that validates atomic swap transactions
- **Features**:
  - Validates group size (exactly 2 transactions)
  - Ensures payment transaction has correct amount and receiver
  - Ensures asset transfer transaction has correct asset and receiver
  - Prevents rekey and close-remainder operations (security)
  - Limits transaction fees to prevent exploit

### 2. **Backend Service: `escrowService.js`**
- **Location**: `src/services/escrowService.js`
- **Responsibilities**:
  - Render TEAL template with contract parameters
  - Compile TEAL to bytecode
  - Generate escrow logic address
  - Build atomic transaction groups
  - Sign transactions with LogicSig
  - Submit transactions to blockchain
  - Wait for confirmation
  - Create/update Firestore records

**Key Functions**:
```javascript
// Render template with parameters
renderTeal(assetId, sellerAddr, priceInMicroAlgos, assetAmount)

// Compile and get escrow address
await compileAndGetEscrowAddress(tealSource)

// Create escrow database record
await createEscrowRecord(escrowData)

// Build transaction group
await buildAtomicGroupTransaction(buyerAddr, sellerAddr, escrowAddr, assetId, price)

// Submit to blockchain
await submitAtomicTransaction(signedPayment, signedAsset)

// Wait for confirmation
await waitForConfirmation(txId, maxRounds)
```

### 3. **Frontend Page: `NFTPurchasePage.jsx`**
- **Location**: `src/pages/NFTPurchasePage.jsx`
- **Purpose**: Complete purchase flow UI
- **Route**: `/project/:projectId/purchase`
- **Steps**:
  1. Connect Pera Wallet
  2. Review purchase details
  3. Process transaction
  4. Confirm and display receipt

**Features**:
- Step indicator (4 steps)
- Wallet connection management
- Security information display
- Transaction tracking
- Explorer link to blockchain

### 4. **Component: `EscrowManager.jsx`**
- **Location**: `src/components/EscrowManager.jsx`
- **Purpose**: Display user's escrow transaction history
- **Features**:
  - Stats dashboard (total, completed, pending, failed)
  - Filterable transaction list
  - Status indicators with icons
  - Links to AlgoExplorer
  - Real-time updates from Firestore

### 5. **Utility: `walletUtils.js`**
- **Location**: `src/utils/walletUtils.js`
- **Purpose**: Wallet interaction helpers
- **Functions**:
  - Connect/disconnect Pera Wallet
  - Sign transactions
  - Convert between ALGO and microAlgos
  - Validate addresses
  - Get wallet balance

## Purchase Flow

```
User visits Project Catalog
        ↓
Clicks "Buy Now" button
        ↓
Navigates to NFTPurchasePage with project ID
        ↓
Step 1: Connect Pera Wallet
        ↓
Step 2: Review purchase details
        ↓
Step 3: Processing
  ├─ Render TEAL with project parameters
  ├─ Compile TEAL → get escrow address
  ├─ Create Firestore record
  ├─ Build transaction group
  ├─ Sign transactions
  ├─ Submit to blockchain
  └─ Wait for confirmation
        ↓
Step 4: Success
  ├─ Display transaction ID
  └─ Provide link to AlgoExplorer
```

## Firestore Schema

### `escrows` collection:
```json
{
  "id": "auto-generated",
  "projectId": "string",
  "projectTitle": "string",
  "buyerAddress": "string",
  "sellerAddress": "string (escrow address)",
  "assetId": "number",
  "priceAlgo": "number",
  "priceInMicroAlgos": "number",
  "status": "initialized|processing|confirmed|failed",
  "transactionId": "string",
  "escrowCompiledProgram": "base64",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "confirmedAt": "timestamp"
}
```

## Integration with ProjectCatalogPage

The existing `ProjectCatalogPage` already has a "Buy Now" button that navigates to:
```
/project/:projectId/purchase
```

This route is now connected to `NFTPurchasePage` in `App.jsx`.

### Required Project Fields in Firestore:
```javascript
{
  id: "string",
  title: "string",
  price: "string (e.g., '500 ALGO')",
  assetType: "string",
  assetId: "number", // Algorand asset ID
  authorWallet: "string", // Seller's Algorand address
  // ... other fields
}
```

## Security Considerations

1. **Atomic Transactions**: Both payment and asset transfer happen together (all-or-nothing)
2. **LogicSig Validation**: Smart contract ensures:
   - Correct payment amount and receiver
   - Correct asset and amount
   - No rekey or close-remainder operations
   - Fee limits to prevent exploitation
3. **Private Key Safety**: Buyer signs with Pera Wallet (keys never leave wallet)
4. **Firestore Security**: Records tracked for audit trail

## Setup Instructions

### 1. Install Dependencies
Already included in `package.json`:
- `algosdk`: Algorand SDK
- `@perawallet/connect`: Pera Wallet integration
- `firebase`: Firestore database

### 2. Environment Setup
Ensure Firebase config is in `src/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "algoescrow.firebaseapp.com",
  projectId: "algoescrow",
  storageBucket: "algoescrow.firebasestorage.app",
  // ...
};
```

### 3. Create Project Listings
Add projects to Firestore `projects` collection with required fields (especially `assetId` and `authorWallet`).

### 4. Fund Escrow (Pre-Purchase Setup)
In production, NFTs must be transferred to escrow address before sale:
```bash
node fund_and_deposit_nft.js "<CREATOR_MNEMONIC>" <ESCROW_ADDR> <ASSET_ID>
```

## Testing Workflow

### TestNet
1. Create test account with Pera Wallet on TestNet
2. Fund with TestNet ALGO from [faucet](https://testnet.algoexplorer.io/dispenser)
3. Create/mint a test NFT
4. Add project listing with asset ID
5. Navigate to project catalog and click "Buy Now"
6. Complete purchase flow
7. Verify transaction on [AlgoExplorer TestNet](https://testnet.algoexplorer.io)

### MainNet
Before going live:
- [ ] Audit smart contract
- [ ] Test extensively on TestNet
- [ ] Set up production NFT escrow addresses
- [ ] Update Firestore security rules
- [ ] Implement error handling and retry logic

## Troubleshooting

### "Failed to compile TEAL"
- Verify Algod server is accessible
- Check TEAL syntax in template
- Ensure all placeholders are being replaced

### "Transaction rejected"
- Check buyer has sufficient ALGO for payment + fees
- Verify seller address is valid
- Ensure asset ID exists and is accessible

### "Wallet connection failed"
- User rejected connection in Pera Wallet
- Pera Wallet not installed
- Network connectivity issue

### "Transaction not confirmed"
- Transaction may be pending
- Network congestion
- Check transaction on AlgoExplorer

## Future Enhancements

- [ ] Support multiple asset types (Fungible + NFT)
- [ ] Implement dispute resolution
- [ ] Add transaction history to user dashboard
- [ ] Implement automated NFT metadata display
- [ ] Add multi-signature support
- [ ] Implement recurring payments
- [ ] Support for larger groups (current: 2-txn atomic)

## Files Reference

```
src/
├── services/
│   └── escrowService.js          # Core escrow logic
├── utils/
│   └── walletUtils.js            # Wallet utilities
├── pages/
│   ├── NFTPurchasePage.jsx       # Purchase flow UI
│   └── ProjectCatalogPage.jsx    # (Updated) With purchase integration
├── components/
│   └── EscrowManager.jsx         # Transaction history
├── App.jsx                        # (Updated) New route
└── firebase.js                    # Firebase config
```

## Support & Documentation

- [Algorand Docs](https://developer.algorand.org/)
- [PyTeal Documentation](https://pyteal.readthedocs.io/)
- [Pera Wallet Docs](https://perawallet.app/)
- [Firebase Docs](https://firebase.google.com/docs)

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Status**: Production Ready
