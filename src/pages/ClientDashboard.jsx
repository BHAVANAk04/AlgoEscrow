import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Shield, DollarSign, User, XCircle, RefreshCw, List, Award } from 'lucide-react';
import { Buffer } from 'buffer';
import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';
import { db } from '../firebase'; 
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore'; 

window.Buffer = window.Buffer || Buffer;

const peraWallet = new PeraWalletConnect({ 
    shouldShowSignTxnToast: true,
});

// ==========================================================
// 🚨 PLATFORM CONFIGURATION CONSTANTS 🚨
// ==========================================================
// REPLACE with your actual Asset ID.
const PROOF_OF_WORK_ASA_ID = 100000; 
// ==========================================================

const AddressDisplay = ({ label, address, isCurrent = false }) => (
    <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`font-mono text-sm text-gray-800 truncate`}>{address}</span>
            {isCurrent && <span className="ml-auto text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">YOU</span>}
        </div>
    </div>
);

const ClientDashboard = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [globalLoading, setGlobalLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [escrowList, setEscrowList] = useState([]);
    const [escrowLoading, setEscrowLoading] = useState(false);

    const getAlgodClient = () => {
        return new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
    };

    const fetchEscrowDetails = useCallback(async (appId) => {
        // ... (Algorand fetch logic remains the same) ...
        try {
            const algodClient = getAlgodClient();
            const appIdNum = parseInt(appId, 10);
            const appInfo = await algodClient.getApplicationByID(appIdNum).do();
            const globalState = appInfo.params?.globalState;
            
            if (!globalState || globalState.length === 0) {
                return null;
            }
            
            const decodeGlobalState = (state) => {
                const decoded = {};
                state.forEach((item) => {
                    try {
                        const key = new TextDecoder().decode(item.key);
                        const value = item.value;
                        if (key === 'client_addr' || key === 'freelancer_addr') {
                            if (value.bytes && value.bytes.length > 0) {
                                decoded[key] = algosdk.encodeAddress(value.bytes);
                            }
                        } else if (key === 'status' || key === 'escrow_amount' || key === 'asset_id' || key === 'unitary_price') {
                            if (value.uint !== undefined && value.uint !== null) {
                                decoded[key] = Number(value.uint);
                            } 
                        }
                    } catch (itemError) { /* ignore */ }
                });
                return decoded;
            };
            
            const decodedState = decodeGlobalState(globalState);
            const statusMap = { 0: 'Initialized', 1: 'Funded', 2: 'Completed', 3: 'Cancelled' };

            return {
                appId: appIdNum,
                clientAddress: decodedState.client_addr || 'N/A',
                freelancerAddress: decodedState.freelancer_addr || 'N/A',
                escrowAmount: decodedState.escrow_amount ? (decodedState.escrow_amount / 1000000).toFixed(6) : '0',
                status: statusMap[decodedState.status] || 'Unknown',
                statusCode: decodedState.status,
                assetId: decodedState.asset_id || 0,
                unitaryPrice: decodedState.unitary_price || 0
            };
            
        } catch (err) {
            return null;
        }
    }, []);


    const fetchClientEscrows = useCallback(async (address) => {
        setEscrowLoading(true);
        setError('');
        setEscrowList([]);
        
        if (!address) {
            setEscrowLoading(false);
            return;
        }

        try {
            const q = query(collection(db, 'escrows'), where('clientAddress', '==', address));
            
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                setEscrowLoading(false);
                setEscrowList([]);
                return;
            }

            const escrowPromises = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const appId = data.appId;
                if (appId) {
                    return fetchEscrowDetails(appId);
                }
                return null;
            });
            
            const results = await Promise.all(escrowPromises);
            setEscrowList(results.filter(r => r !== null));

        } catch (err) {
            console.error('Firestore/Escrow fetch error:', err);
            setError('Failed to load escrow list from database: ' + err.message);
        } finally {
            setEscrowLoading(false);
        }
    }, [fetchEscrowDetails]);
    
    useEffect(() => {
        const reconnectSession = async () => {
            try {
                const accounts = await peraWallet.reconnectSession();
                if (accounts && accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                }
            } catch (error) { /* Ignore */ }
        };
        reconnectSession();
    }, []);

    useEffect(() => {
        if (walletAddress) {
            fetchClientEscrows(walletAddress);
        } else {
            setEscrowList([]);
        }
    }, [walletAddress, fetchClientEscrows]);

    const handleConnectWallet = async () => { /* Connect Wallet Logic */
        try {
            setGlobalLoading(true);
            setError('');
            const accounts = await peraWallet.connect(); 
            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
            } else {
                setError('No accounts found.');
            }
        } catch (err) {
            if (!err?.message?.includes('cancelled')) {
                setError('Failed to connect wallet: ' + (err.message || 'Please try again'));
            }
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleDisconnectWallet = async () => { /* Disconnect Logic */
        try {
            await peraWallet.disconnect();
            setWalletAddress('');
            setEscrowList([]);
        } catch (err) {
            console.error('Disconnect error:', err);
        }
    };

    // --- FULL HANDLE APPROVE WORK WITH NFT ISSUANCE TRIGGER ---
    const handleApproveWork = async (escrowDetails, setLocalApproveLoading) => {
        if (escrowDetails.statusCode !== 1) {
            setError('Escrow must be in "Funded" status to approve.');
            return;
        }

        setLocalApproveLoading(true); 
        setError('');
        setSuccess('');

        let txId = null;

        try {
            const algodClient = getAlgodClient();
            const params = await algodClient.getTransactionParams().do();
            const appID = escrowDetails.appId;
            const freelancerAddress = escrowDetails.freelancerAddress;
            
            // --- 1. BUILD CLIENT-SIGNED TRANSACTION GROUP ---
            const clientTxnGroup = [];

            // Txn 1 (Fee Payment): Client pays 0.1 ALGO fee to App account
            const paymentAmount = 100000;
            const appAddress = algosdk.getApplicationAddress(appID);
            
            const feePaymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: walletAddress,
                receiver: appAddress,
                amount: paymentAmount,
                suggestedParams: params
            });
            clientTxnGroup.push(feePaymentTxn);

            // Txn 2 (App Call): Actual Escrow Approval
            const methodSig = 'buy(pay,uint64)void';
            const method = algosdk.ABIMethod.fromSignature(methodSig);
            const methodSelector = method.getSelector();
            const quantityArg = algosdk.encodeUint64(0);

            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: walletAddress,
                appIndex: appID,
                suggestedParams: params,
                appArgs: [methodSelector, quantityArg],
                accounts: [freelancerAddress],
                foreignAssets: escrowDetails.assetId > 0 ? [escrowDetails.assetId] : undefined
            });
            clientTxnGroup.push(appCallTxn);
            
            // --- 2. SIGN, SEND, AND CONFIRM CLIENT'S TRANSACTIONS ---
            algosdk.assignGroupID(clientTxnGroup);

            const signedClientTxns = await peraWallet.signTransaction([
                clientTxnGroup.map(txn => ({ txn, signers: [walletAddress] }))
            ]);

            const sendResult = await algodClient.sendRawTransaction(signedClientTxns).do();
            txId = sendResult.txId || sendResult.txid;

            await algosdk.waitForConfirmation(algodClient, txId, 10);
            
            // --- 3. FIRESTORE UPDATE & TRIGGER BACKEND FOR NFT ---
            
            const q = query(collection(db, 'escrows'), where('appId', '==', appID));
            const snapshot = await getDocs(q);
            const docRef = snapshot.docs.length > 0 ? snapshot.docs[0].ref : null;
            
            if (docRef) {
                // Set status to 'completed' immediately
                await updateDoc(docRef, { status: 'completed' }); 
            }

            // 🚨 NFT ISSUANCE TRIGGER 🚨
            console.log("Escrow approved on-chain. Calling backend to issue NFT...");
            const backendResponse = await fetch('/api/issue-nft', { // <<< REPLACE WITH YOUR ACTUAL ENDPOINT
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    escrowAppId: appID,
                    freelancerAddress: freelancerAddress,
                    proofOfWorkAssetId: PROOF_OF_WORK_ASA_ID,
                    clientTxId: txId 
                }),
            });

            if (!backendResponse.ok) {
                const errorData = await backendResponse.json();
                throw new Error(errorData.message || 'Failed to trigger NFT issuance via backend.');
            }
            
            // Set success message after everything is processed
            setSuccess(`✅ Work approved and funds released! NFT issuance requested for the freelancer. 🏅`);
            
            setTimeout(() => {
                fetchClientEscrows(walletAddress); // Refresh list
            }, 2000);

        } catch (err) {
            console.error('Approve error:', err);
            
            let errorMessage = 'Failed to approve work: ';
            if (err.message?.includes('status 400')) {
                errorMessage = 'Transaction rejected: App account balance is too low. Please check the App\'s minimum balance.';
            } else if (err.message?.includes('pending')) {
                 errorMessage = 'Another transaction is pending. Please clear any pending request on your mobile device.';
            } else if (err.message?.includes('cancelled')) {
                errorMessage = 'Transaction cancelled by user.';
            } else if (err.message?.includes('logic eval error')) {
                errorMessage = 'Smart contract rejected the approval. Check contract logic and current state.';
            } else {
                errorMessage += err.message || 'Unknown error';
            }
            
            setError(errorMessage);
        } finally {
            setLocalApproveLoading(false); 
        }
    };

    // --- (handleCancelEscrow remains unchanged) ---
    const handleCancelEscrow = async (escrowDetails, setLocalCancelLoading) => {
        // ... (Cancellation logic remains the same) ...
        if (escrowDetails.statusCode !== 1) {
            setError('Escrow must be in "Funded" status to cancel.');
            return;
        }

        const confirmCancel = window.confirm(
            `Are you sure you want to cancel this escrow and refund ${escrowDetails.escrowAmount} ALGO to yourself?`
        );

        if (!confirmCancel) return;

        setLocalCancelLoading(true);
        setError('');
        setSuccess('');

        try {
            const algodClient = getAlgodClient();
            const params = await algodClient.getTransactionParams();
            const appID = escrowDetails.appId;

            const methodSig = 'cancel_job()void';
            const method = algosdk.ABIMethod.fromSignature(methodSig);
            const methodSelector = method.getSelector();
            
            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: walletAddress,
                appIndex: appID,
                suggestedParams: params,
                appArgs: [methodSelector],
                accounts: [escrowDetails.clientAddress],
                foreignAssets: escrowDetails.assetId > 0 ? [escrowDetails.assetId] : undefined
            });

            const signedTxns = await peraWallet.signTransaction([[{ txn: appCallTxn, signers: [walletAddress] }]]);

            const sendResult = await algodClient.sendRawTransaction(signedTxns).do();
            const txId = sendResult.txId || sendResult.txid;

            await algosdk.waitForConfirmation(algodClient, txId, 10);
            
            const q = query(collection(db, 'escrows'), where('appId', '==', appID));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const docRef = snapshot.docs[0].ref;
                await updateDoc(docRef, { status: 'cancelled' });
            }

            setSuccess(`✅ Escrow cancelled! ${escrowDetails.escrowAmount} ALGO refunded. Transaction ID: ${txId.substring(0, 8)}...`);
            
            setTimeout(() => {
                fetchClientEscrows(walletAddress);
            }, 2000);

        } catch (err) {
            console.error('Cancel error:', err);
            let errorMessage = 'Failed to cancel escrow: ';
            
            if (err.message?.includes('logic eval error')) {
                errorMessage = 'Smart contract rejected the cancellation. Escrow might not be in the funded state.';
            } else if (err.message?.includes('cancelled')) {
                 errorMessage = 'Cancellation cancelled by user.';
            } else if (err.message?.includes('pending')) {
                errorMessage = 'Another transaction is pending. Please wait and try again.';
            } else {
                errorMessage += err.message || 'Unknown error';
            }
            
            setError(errorMessage);
        } finally {
            setLocalCancelLoading(false);
        }
    };


    // --- Escrow Card Component with Local Loading State (Unchanged) ---
    const EscrowCardWithLoading = ({ escrowDetails }) => {
        const [localApproveLoading, setLocalApproveLoading] = useState(false);
        const [localCancelLoading, setLocalCancelLoading] = useState(false);
        
        const isClient = walletAddress === escrowDetails.clientAddress;

        return (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-4">
                    <h2 className="text-xl font-bold text-white">Application ID: {escrowDetails.appId}</h2>
                    <p className="text-teal-100 text-sm">Status: {escrowDetails.status}</p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Current Status</span>
                        <span className={`px-4 py-1 rounded-full text-xs font-semibold ${
                            escrowDetails.statusCode === 0 ? 'bg-yellow-100 text-yellow-800' :
                            escrowDetails.statusCode === 1 ? 'bg-blue-100 text-blue-800' :
                            escrowDetails.statusCode === 2 ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {escrowDetails.status}
                        </span>
                    </div>

                    {/* Amount */}
                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium">Escrow Amount</span>
                            <div className="flex items-center gap-1">
                                <DollarSign className="w-5 h-5 text-teal-600" />
                                <span className="text-2xl font-bold text-teal-600">{escrowDetails.escrowAmount}</span>
                                <span className="text-lg text-teal-600 font-semibold">ALGO</span>
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="space-y-3">
                        <AddressDisplay label="Client Address" address={escrowDetails.clientAddress} isCurrent={isClient} />
                        <AddressDisplay label="Freelancer Address" address={escrowDetails.freelancerAddress} />
                    </div>

                    {/* Action Buttons */}
                    {isClient && escrowDetails.statusCode === 1 && (
                        <div className="pt-4 border-t space-y-3">
                            <h3 className="text-md font-semibold text-gray-900">Client Actions</h3>
                            
                            <button
                                onClick={() => handleApproveWork(escrowDetails, setLocalApproveLoading)}
                                disabled={localApproveLoading || localCancelLoading}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-md"
                            >
                                {localApproveLoading ? (
                                    <> <Loader2 className="w-5 h-5 animate-spin" /> Processing... </>
                                ) : (
                                    <> <Award className="w-5 h-5" /> Approve Work & Issue NFT </>
                                )}
                            </button>

                            <button
                                onClick={() => handleCancelEscrow(escrowDetails, setLocalCancelLoading)}
                                disabled={localApproveLoading || localCancelLoading}
                                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                            >
                                {localCancelLoading ? (
                                    <> <Loader2 className="w-5 h-5 animate-spin" /> Processing... </>
                                ) : (
                                    <> <XCircle className="w-5 h-5" /> Cancel Escrow & Refund </>
                                )}
                            </button>
                        </div>
                    )}
                    
                    {/* Warning for non-client viewer */}
                    {!isClient && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            You are viewing this as a spectator. Actions are disabled.
                        </div>
                    )}
                </div>
            </div>
        );
    };


    // --- Final Render (Unchanged) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header (Unchanged) */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-lg mb-4 shadow-xl">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Client Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Manage your escrow contracts on Algorand
                    </p>
                </div>

                {/* Wallet Connection (Unchanged) */}
                {!walletAddress ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect Your Wallet</h3>
                            <p className="text-gray-600 mb-6">Connect your Pera Wallet to manage escrows</p>
                            <button
                                onClick={handleConnectWallet}
                                disabled={globalLoading}
                                className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400"
                            >
                                {globalLoading ? 'Connecting...' : 'Connect Pera Wallet'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm text-green-700 font-medium">Wallet Connected</p>
                                <p className="text-xs text-green-600 font-mono">{walletAddress.substring(0, 10)}...{walletAddress.substring(48)}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDisconnectWallet}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Disconnect
                        </button>
                    </div>
                )}

                {/* --- Escrow List Display --- */}
                {walletAddress && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <List className='w-6 h-6 text-teal-600'/> My Active Escrows
                        </h2>
                        
                        {escrowLoading && (
                             <div className="p-8 text-center bg-white rounded-xl shadow-lg">
                                <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
                                <p className="text-gray-600">Loading contracts from the blockchain...</p>
                            </div>
                        )}
                        
                        {!escrowLoading && escrowList.length === 0 && (
                            <div className="p-8 text-center bg-white rounded-xl shadow-lg border border-gray-200">
                                <p className="text-gray-500">
                                    No active escrows found linked to this address in our database.
                                </p>
                            </div>
                        )}

                        {!escrowLoading && escrowList.length > 0 && (
                            <div className="space-y-6">
                                {escrowList.map((escrow) => (
                                    <EscrowCardWithLoading
                                        key={escrow.appId}
                                        escrowDetails={escrow}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {/* Error/Success Messages (Unchanged) */}
                 {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800">{success}</p>
                    </div>
                )}
                
                {/* Footer (Unchanged) */}
                <div className="text-center text-sm text-gray-500 mt-8">
                    <p>Powered by Algorand Blockchain • TestNet</p>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
