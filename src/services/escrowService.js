import algosdk from 'algosdk';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

// Algod configuration for TestNet
const ALGOD_SERVER = "https://testnet-api.algonode.cloud";
const ALGOD_PORT = "";
const client = new algosdk.Algodv2('', ALGOD_SERVER, ALGOD_PORT);

// TEAL escrow template - embedded
const ESCROW_TEAL_TEMPLATE = `#pragma version 5

// ARC-72 style stateless escrow for atomic sale (group of 2)
// Placeholders: __ASSET_ID__, __ASSET_AMOUNT__, __SELLER_ADDR__, __PRICE__

global GroupSize
int 2
==
bnz check_tx0
err

check_tx0:
gtxn 0 TypeEnum
int 1
==
bnz check_payment
err

check_payment:
gtxn 1 TypeEnum
int 4
==
bnz check_amount
err

check_amount:
gtxn 0 Amount
int __PRICE__
>=
bnz check_receiver
err

check_receiver:
gtxn 0 Receiver
addr __SELLER_ADDR__
==
bnz check_xfer_asset
err

check_xfer_asset:
gtxn 1 XferAsset
int __ASSET_ID__
==
bnz check_asset_amount
err

check_asset_amount:
gtxn 1 AssetAmount
int __ASSET_AMOUNT__
==
bnz check_receiver_match
err

check_receiver_match:
gtxn 1 AssetReceiver
gtxn 0 Sender
==
bnz check_rekey_0
err

check_rekey_0:
gtxn 0 RekeyTo
global ZeroAddress
==
bnz check_rekey_1
err

check_rekey_1:
gtxn 1 RekeyTo
global ZeroAddress
==
bnz check_close_0
err

check_close_0:
gtxn 0 CloseRemainderTo
global ZeroAddress
==
bnz check_close_1
err

check_close_1:
gtxn 1 CloseRemainderTo
global ZeroAddress
==
bnz check_fee_0
err

check_fee_0:
gtxn 0 Fee
int 1000
<=
bnz check_fee_1
err

check_fee_1:
gtxn 1 Fee
int 1000
<=
bnz success
err

success:
int 1
return
`;

/**
 * Validate Algorand address format
 */
export const isValidAlgorandAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  // Algorand addresses are 58 characters and contain only base32 characters
  return /^[A-Z2-7]{58}$/.test(trimmed);
};

/**
 * Render TEAL template with parameters
 */
export const renderTeal = (assetId, sellerAddr, priceInMicroAlgos, assetAmount = 1) => {
  // Validate seller address
  if (!isValidAlgorandAddress(sellerAddr)) {
    throw new Error(`Invalid seller address format: ${sellerAddr}`);
  }
  
  let teal = ESCROW_TEAL_TEMPLATE;
  teal = teal.replace(/__ASSET_ID__/g, String(assetId));
  teal = teal.replace(/__ASSET_AMOUNT__/g, String(assetAmount));
  teal = teal.replace(/__SELLER_ADDR__/g, sellerAddr.trim());
  teal = teal.replace(/__PRICE__/g, String(priceInMicroAlgos));
  return teal;
};

/**
 * Compile TEAL and get escrow address
 */
export const compileAndGetEscrowAddress = async (tealSource) => {
  try {
    const compiled = await client.compile(tealSource).do();
    const programBytes = new Uint8Array(Buffer.from(compiled.result, 'base64'));
    const lsig = new algosdk.LogicSigAccount(programBytes);
    const address = lsig.address();
    // Ensure address is a string, not an object
    const addressString = typeof address === 'string' ? address : address.toString();
    return {
      escrowAddress: addressString,
      compiledProgram: compiled.result, // base64
      lsig: lsig,
      programBytes: programBytes
    };
  } catch (error) {
    console.error("Error compiling TEAL:", error);
    throw new Error(`Failed to compile escrow contract: ${error.message}`);
  }
};

/**
 * Create escrow record in Firestore
 */
export const createEscrowRecord = async (escrowData) => {
  try {
    // Ensure all addresses are strings, not objects
    const cleanData = {
      ...escrowData,
      buyerAddress: typeof escrowData.buyerAddress === 'string' 
        ? escrowData.buyerAddress 
        : escrowData.buyerAddress?.toString() || '',
      sellerAddress: typeof escrowData.sellerAddress === 'string' 
        ? escrowData.sellerAddress 
        : escrowData.sellerAddress?.toString() || '',
      createdAt: new Date(),
      status: 'initialized'
    };

    const docRef = await addDoc(collection(db, "escrows"), cleanData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating escrow record:", error);
    throw new Error(`Failed to create escrow record: ${error.message}`);
  }
};

/**
 * Update escrow status
 */
export const updateEscrowStatus = async (escrowId, status, additionalData = {}) => {
  try {
    const docRef = doc(db, "escrows", escrowId);
    await updateDoc(docRef, {
      status: status,
      updatedAt: new Date(),
      ...additionalData
    });
  } catch (error) {
    console.error("Error updating escrow:", error);
    throw new Error(`Failed to update escrow: ${error.message}`);
  }
};

/**
 * Build atomic grouped transaction for NFT purchase
 * Returns: [signedPaymentTxn, unsignedAssetTxn, groupId]
 */
export const buildAtomicGroupTransaction = async (
  buyerAddr,
  sellerAddr,
  escrowAddr,
  assetId,
  priceInMicroAlgos,
  assetAmount = 1
) => {
  try {
    // Validate all addresses are strings and not null/undefined
    console.log('Building transaction with:', {
      buyerAddr,
      sellerAddr,
      escrowAddr,
      assetId,
      priceInMicroAlgos,
      assetAmount
    });

    if (!buyerAddr || typeof buyerAddr !== 'string') {
      throw new Error(`Buyer address must be a valid string, got: ${buyerAddr}`);
    }
    if (!sellerAddr || typeof sellerAddr !== 'string') {
      throw new Error(`Seller address must be a valid string, got: ${sellerAddr}`);
    }
    if (!escrowAddr || typeof escrowAddr !== 'string') {
      throw new Error(`Escrow address must be a valid string, got: ${escrowAddr}`);
    }

    console.log('Getting transaction params...');
    const paramsRaw = await client.getTransactionParams().do();
    console.log('Raw params keys:', Object.keys(paramsRaw));
    
    // Extract the correct fields from params
    const params = {
      firstRound: paramsRaw['first-round'] || paramsRaw.firstRound,
      lastRound: paramsRaw['last-round'] || paramsRaw.lastRound,
      genesisID: paramsRaw['genesis-id'] || paramsRaw.genesisID,
      genesisHash: paramsRaw['genesis-hash'] || paramsRaw.genesisHash,
      minFee: paramsRaw['min-fee'] || paramsRaw.minFee
    };

    console.log('first-round:', params.firstRound);
    console.log('last-round:', params.lastRound);
    console.log('genesisID:', params.genesisID);
    
    if (!params.firstRound || !params.lastRound) {
      throw new Error(`Invalid transaction params: firstRound=${params.firstRound}, lastRound=${params.lastRound}`);
    }

    // Create proper suggestedParams object
    // genesisHash needs to be a Uint8Array
    const genesisHashBytes = typeof params.genesisHash === 'string' 
      ? new Uint8Array(Buffer.from(params.genesisHash, 'base64'))
      : params.genesisHash;

    const suggestedParams = {
      flatFee: true,
      fee: 1000,
      firstRound: params.firstRound,
      lastRound: params.lastRound,
      genesisID: params.genesisID,
      genesisHash: genesisHashBytes
    };

    console.log('suggestedParams:', suggestedParams);

    console.log('Creating payment transaction...');
    // Transaction 0: Buyer payment to seller
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: buyerAddr,
      to: sellerAddr,
      amount: priceInMicroAlgos,
      suggestedParams: suggestedParams
    });
    console.log('Payment transaction created successfully');

    console.log('Creating asset transfer transaction...');
    // Transaction 1: Escrow asset transfer to buyer
    const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: escrowAddr,
      to: buyerAddr,
      assetIndex: assetId,
      amount: assetAmount,
      suggestedParams: suggestedParams
    });
    console.log('Asset transfer transaction created successfully');

    // Compute group ID
    const groupId = algosdk.computeGroupID([paymentTxn, assetTransferTxn]);
    paymentTxn.group = groupId;
    assetTransferTxn.group = groupId;

    return {
      paymentTxn,
      assetTransferTxn,
      groupId: groupId.toString('base64'),
      params
    };
  } catch (error) {
    console.error("Error building atomic transaction:", error);
    throw new Error(`Failed to build transaction group: ${error.message}`);
  }
};

/**
 * Sign payment transaction with buyer's private key
 */
export const signPaymentTransaction = (paymentTxn, buyerSecretKey) => {
  try {
    const signed = paymentTxn.signTxn(buyerSecretKey);
    return signed;
  } catch (error) {
    console.error("Error signing payment:", error);
    throw new Error(`Failed to sign payment transaction: ${error.message}`);
  }
};

/**
 * Sign asset transfer with LogicSig
 */
export const signAssetTransferWithLogicSig = (assetTransferTxn, lsig) => {
  try {
    const signed = algosdk.signLogicSigTransactionObject(assetTransferTxn, lsig).blob;
    return signed;
  } catch (error) {
    console.error("Error signing with logic sig:", error);
    throw new Error(`Failed to sign asset transfer: ${error.message}`);
  }
};

/**
 * Submit atomic group transaction
 */
export const submitAtomicTransaction = async (signedPayment, signedAssetTransfer) => {
  try {
    const groupTxns = [
      Buffer.from(signedPayment).toString('base64'),
      Buffer.from(signedAssetTransfer).toString('base64')
    ];

    const result = await client.sendRawTransaction(groupTxns).do();
    return result.txId;
  } catch (error) {
    console.error("Error submitting transaction:", error);
    throw new Error(`Failed to submit transaction: ${error.message}`);
  }
};

/**
 * Wait for transaction confirmation
 */
export const waitForConfirmation = async (txId, maxRounds = 1000) => {
  try {
    let lastRound = (await client.status().do())['last-round'];
    while (lastRound < maxRounds) {
      const pendingInfo = await client.pendingTransactionInformation(txId).do();
      if (pendingInfo['confirmed-round'] !== undefined && pendingInfo['confirmed-round'] > 0) {
        return pendingInfo;
      }
      lastRound++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second
    }
    throw new Error('Transaction not confirmed within timeout');
  } catch (error) {
    console.error("Error waiting for confirmation:", error);
    throw new Error(`Transaction confirmation failed: ${error.message}`);
  }
};

/**
 * Get account info
 */
export const getAccountInfo = async (address) => {
  try {
    const accountInfo = await client.accountInformation(address).do();
    return accountInfo;
  } catch (error) {
    console.error("Error getting account info:", error);
    throw new Error(`Failed to get account info: ${error.message}`);
  }
};

/**
 * Check if account has opted into asset
 */
export const hasOptedIntoAsset = async (address, assetId) => {
  try {
    const accountInfo = await getAccountInfo(address);
    const assets = accountInfo.assets || [];
    return assets.some(asset => asset['asset-id'] === assetId);
  } catch (error) {
    console.error("Error checking opt-in:", error);
    return false;
  }
};

/**
 * Initialize Escrow with Seller Address
 * Creates an escrow contract configured for a specific seller
 */
export const initializeEscrowWithSeller = async (sellerAddress, assetId, priceInAlgos, assetAmount = 1) => {
  try {
    // Validate seller address format (Algorand addresses are 58 chars)
    if (!isValidAlgorandAddress(sellerAddress)) {
      throw new Error("Invalid seller address format. Algorand addresses must be 58 characters long and contain only base32 characters.");
    }

    // Validate price
    if (!Number.isFinite(priceInAlgos) || priceInAlgos <= 0) {
      throw new Error("Price must be a positive number.");
    }
    if (priceInAlgos > 1000000) {
      throw new Error("Price cannot exceed 1,000,000 ALGO.");
    }

    // Validate asset ID
    if (!Number.isInteger(assetId) || assetId < 0) {
      throw new Error("Asset ID must be a non-negative integer.");
    }

    // Validate asset amount
    if (!Number.isInteger(assetAmount) || assetAmount <= 0) {
      throw new Error("Asset amount must be a positive integer.");
    }

    // Convert ALGO to microAlgos (1 ALGO = 1,000,000 microAlgos)
    const priceInMicroAlgos = Math.floor(priceInAlgos * 1000000);

    // Render the TEAL template with seller address
    const tealSource = renderTeal(assetId, sellerAddress, priceInMicroAlgos, assetAmount);

    // Compile and get escrow address
    const escrowData = await compileAndGetEscrowAddress(tealSource);

    return {
      sellerAddress: sellerAddress,
      escrowAddress: escrowData.escrowAddress,
      assetId: assetId,
      priceInAlgos: priceInAlgos,
      priceInMicroAlgos: priceInMicroAlgos,
      assetAmount: assetAmount,
      compiledProgram: escrowData.compiledProgram,
      lsig: escrowData.lsig,
      programBytes: escrowData.programBytes,
      tealSource: tealSource
    };
  } catch (error) {
    console.error("Error initializing escrow with seller:", error);
    throw new Error(`Failed to initialize escrow: ${error.message}`);
  }
};

export default {
  renderTeal,
  compileAndGetEscrowAddress,
  createEscrowRecord,
  updateEscrowStatus,
  buildAtomicGroupTransaction,
  signPaymentTransaction,
  signAssetTransferWithLogicSig,
  submitAtomicTransaction,
  waitForConfirmation,
  getAccountInfo,
  hasOptedIntoAsset,
  initializeEscrowWithSeller,
  isValidAlgorandAddress
};
