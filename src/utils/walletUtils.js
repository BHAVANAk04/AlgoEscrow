import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';

const peraWallet = new PeraWalletConnect();

/**
 * Connect to Pera Wallet
 */
export const connectPeraWallet = async () => {
  try {
    await peraWallet.connect();
    const accounts = await peraWallet.reconnectSession();
    return {
      success: true,
      accounts: accounts,
      address: accounts[0] || null
    };
  } catch (error) {
    console.error('Error connecting to Pera Wallet:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Disconnect Pera Wallet
 */
export const disconnectPeraWallet = async () => {
  try {
    await peraWallet.disconnect();
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Pera Wallet:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign transactions with Pera Wallet
 */
export const signTransactionGroup = async (txnGroup) => {
  try {
    const signed = await peraWallet.signTransaction([txnGroup]);
    return {
      success: true,
      signed: signed
    };
  } catch (error) {
    console.error('Error signing with Pera Wallet:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign multiple transactions
 */
export const signTransactionGroupMultiple = async (txnGroup) => {
  try {
    const signed = await peraWallet.signTransaction(txnGroup);
    return {
      success: true,
      signed: signed
    };
  } catch (error) {
    console.error('Error signing multiple transactions:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get accounts from Pera Wallet
 */
export const getPeraAccounts = async () => {
  try {
    const accounts = await peraWallet.reconnectSession();
    return {
      success: true,
      accounts: accounts
    };
  } catch (error) {
    console.error('Error getting Pera accounts:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Format ALGO to microAlgos
 */
export const algoToMicroAlgos = (algo) => {
  return Math.floor(algo * 1_000_000);
};

/**
 * Format microAlgos to ALGO
 */
export const microAlgosToAlgo = (microAlgos) => {
  return microAlgos / 1_000_000;
};

/**
 * Validate Algorand address
 */
export const isValidAlgorandAddress = (address) => {
  try {
    algosdk.decodeAddress(address);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get wallet balance
 */
export const getWalletBalance = async (address, client) => {
  try {
    const accountInfo = await client.accountInformation(address).do();
    return {
      success: true,
      balance: microAlgosToAlgo(accountInfo.amount),
      microBalance: accountInfo.amount
    };
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  connectPeraWallet,
  disconnectPeraWallet,
  signTransactionGroup,
  signTransactionGroupMultiple,
  getPeraAccounts,
  algoToMicroAlgos,
  microAlgosToAlgo,
  isValidAlgorandAddress,
  getWalletBalance
};
