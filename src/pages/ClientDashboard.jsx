import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Shield, DollarSign, User, XCircle, RefreshCw } from 'lucide-react';
import { Buffer } from 'buffer';
import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';

window.Buffer = window.Buffer || Buffer;

const peraWallet = new PeraWalletConnect({ 
    shouldShowSignTxnToast: true,
});

const ClientDashboard = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [appId, setAppId] = useState('');
    const [escrowDetails, setEscrowDetails] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const reconnectSession = async () => {
            try {
                const accounts = await peraWallet.reconnectSession();
                if (accounts && accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                }
            } catch (error) {
                console.log('No existing Pera session to reconnect.');
            }
        };
        reconnectSession();
    }, []);

    const getAlgodClient = () => {
        return new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
    };

    const handleConnectWallet = async () => {
        try {
            setLoading(true);
            setError('');
            
            const accounts = await peraWallet.connect(); 
            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
            } else {
                setError('No accounts found. Please try again.');
            }
        } catch (err) {
            if (err?.message?.includes('cancelled') || err?.data?.type === 'CONNECT_CANCELLED') {
                setError('Connection cancelled by user.');
            } else {
                setError('Failed to connect wallet: ' + (err.message || 'Please try again'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnectWallet = async () => {
        try {
            await peraWallet.disconnect();
            setWalletAddress('');
            setEscrowDetails(null);
            setAppId('');
        } catch (err) {
            console.error('Disconnect error:', err);
        }
    };

    const fetchEscrowDetails = async () => {
        if (!appId || !appId.trim()) {
            setError('Please enter an Application ID');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const algodClient = getAlgodClient();
            const appIdNum = parseInt(appId, 10);

            if (isNaN(appIdNum) || appIdNum <= 0) {
                throw new Error('Invalid Application ID');
            }

            const appInfo = await algodClient.getApplicationByID(appIdNum).do();
            
            console.log('=== FULL APP INFO ===');
            console.log('Raw app info:', appInfo);
            console.log('Params exists?', !!appInfo.params);
            console.log('Params keys:', Object.keys(appInfo.params));
            
            // The correct path is appInfo.params.globalState (camelCase)
            const globalState = appInfo.params?.globalState;
            
            console.log('Global state found:', globalState);
            console.log('Global state length:', globalState?.length);
            console.log('=== END APP INFO ===');
            
            if (!globalState || globalState.length === 0) {
                throw new Error('No global state found. The application exists but has no state data. This might mean:\n1. The contract was not properly initialized\n2. You\'re on the wrong network (check TestNet vs MainNet)\n3. The App ID is incorrect');
            }
            
            const decodeGlobalState = (state) => {
                const decoded = {};
                
                console.log('=== DECODING GLOBAL STATE ===');
                console.log('Raw state array:', state);
                
                // Safety check for undefined or invalid state
                if (!state || !Array.isArray(state)) {
                    console.error('Invalid global state structure:', state);
                    return decoded;
                }
                
                state.forEach((item, index) => {
                    try {
                        console.log(`Item ${index}:`, item);
                        console.log(`Item value:`, item.value);
                        
                        // Convert Uint8Array key to string
                        const keyBytes = item.key;
                        const key = new TextDecoder().decode(keyBytes);
                        console.log(`Key decoded: "${key}"`);
                        
                        // Check value structure - the value object has either bytes or uint property
                        const value = item.value;
                        
                        if (key === 'client_addr' || key === 'freelancer_addr') {
                            // Address - stored as bytes
                            if (value.bytes && value.bytes.length > 0) {
                                decoded[key] = algosdk.encodeAddress(value.bytes);
                                console.log(`  -> Decoded address: ${decoded[key]}`);
                            }
                        } else if (key === 'status' || key === 'escrow_amount' || key === 'asset_id' || key === 'unitary_price') {
                            // Numeric values - stored as uint
                            if (value.uint !== undefined && value.uint !== null) {
                                decoded[key] = Number(value.uint);
                                console.log(`  -> Uint value: ${decoded[key]}`);
                            } else if (value.bytes && value.bytes.length > 0) {
                                // Sometimes stored as bytes, need to convert
                                const view = new DataView(value.bytes.buffer);
                                decoded[key] = view.getBigUint64(0, false);
                                decoded[key] = Number(decoded[key]);
                                console.log(`  -> Converted from bytes: ${decoded[key]}`);
                            }
                        }
                    } catch (itemError) {
                        console.error('Error decoding state item:', item, itemError);
                    }
                });
                
                console.log('Final decoded state:', decoded);
                console.log('=== END DECODING ===');
                return decoded;
            };

            const decodedState = decodeGlobalState(globalState);
            
            const statusMap = {
                0: 'Initialized',
                1: 'Funded',
                2: 'Completed',
                3: 'Cancelled'
            };

            const details = {
                appId: appIdNum,
                clientAddress: decodedState.client_addr || 'N/A',
                freelancerAddress: decodedState.freelancer_addr || 'N/A',
                escrowAmount: decodedState.escrow_amount ? (decodedState.escrow_amount / 1000000).toFixed(6) : '0',
                status: statusMap[decodedState.status] || 'Unknown',
                statusCode: decodedState.status,
                assetId: decodedState.asset_id || 0,
                unitaryPrice: decodedState.unitary_price || 0
            };

            // Check if connected wallet is the client
            if (walletAddress && details.clientAddress !== walletAddress) {
                setError('⚠️ Warning: You are not the client of this escrow. You can only view details.');
            }

            setEscrowDetails(details);
            
        } catch (err) {
            console.error('Fetch error:', err);
            if (err.message?.includes('application does not exist')) {
                setError('Application ID not found. Please check the ID and try again.');
            } else {
                setError('Failed to fetch escrow details: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApproveWork = async () => {
        if (!escrowDetails) {
            setError('No escrow loaded');
            return;
        }

        if (escrowDetails.clientAddress !== walletAddress) {
            setError('Only the client can approve work');
            return;
        }

        if (escrowDetails.statusCode !== 1) {
            setError('Escrow must be in "Funded" status to approve. Current status: ' + escrowDetails.status);
            return;
        }

        setActionLoading(true);
        setError('');
        setSuccess('');

        try {
            const algodClient = getAlgodClient();
            const params = await algodClient.getTransactionParams().do();

            console.log('Creating approve transaction...');
            console.log('App ID:', escrowDetails.appId);
            console.log('Sender (client):', walletAddress);
            console.log('Freelancer:', escrowDetails.freelancerAddress);

            // Based on your EscrowInitializationPage, the method should just be approve_work()void
            // But it might need to be called with a payment transaction like opt_in_to_asset(pay)void
            const methodSig = 'approve_work()void';
            const method = algosdk.ABIMethod.fromSignature(methodSig);
            const methodSelector = method.getSelector();
            
            console.log('Method selector (hex):', Buffer.from(methodSelector).toString('hex'));

            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: walletAddress,
                appIndex: escrowDetails.appId,
                suggestedParams: params,
                appArgs: [methodSelector],
                accounts: [escrowDetails.freelancerAddress] // Freelancer account reference
            });

            console.log('Signing transaction...');
            const signedTxns = await peraWallet.signTransaction([[{ txn: appCallTxn, signers: [walletAddress] }]]);

            console.log('Sending transaction...');
            const sendResult = await algodClient.sendRawTransaction(signedTxns).do();
            const txId = sendResult.txId || sendResult.txid;

            console.log('Waiting for confirmation...', txId);
            await algosdk.waitForConfirmation(algodClient, txId, 10);

            setSuccess(`✅ Work approved! ${escrowDetails.escrowAmount} ALGO released to freelancer. Transaction ID: ${txId}`);
            
            // Refresh escrow details
            setTimeout(() => {
                fetchEscrowDetails();
            }, 2000);

        } catch (err) {
            console.error('Approve error:', err);
            console.error('Error details:', JSON.stringify(err, null, 2));
            
            let errorMessage = 'Failed to approve work: ';
            
            if (err.message?.includes('logic eval error')) {
                errorMessage = 'Smart contract rejected the approval. Possible reasons:\n';
                errorMessage += '• The escrow might not have enough balance\n';
                errorMessage += '• The contract state might be invalid\n';
                errorMessage += '• You might not be the correct client\n';
                errorMessage += 'Error: ' + err.message;
            } else if (err.message?.includes('transaction rejected')) {
                errorMessage = 'Transaction was rejected. Please ensure the escrow is properly funded.';
            } else {
                errorMessage += err.message || 'Unknown error';
            }
            
            setError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelEscrow = async () => {
        if (!escrowDetails) {
            setError('No escrow loaded');
            return;
        }

        if (escrowDetails.clientAddress !== walletAddress) {
            setError('Only the client can cancel the escrow');
            return;
        }

        if (escrowDetails.statusCode !== 1) {
            setError('Escrow must be in "Funded" status to cancel. Current status: ' + escrowDetails.status);
            return;
        }

        const confirmCancel = window.confirm(
            `Are you sure you want to cancel this escrow and refund ${escrowDetails.escrowAmount} ALGO to yourself?`
        );

        if (!confirmCancel) return;

        setActionLoading(true);
        setError('');
        setSuccess('');

        try {
            const algodClient = getAlgodClient();
            const params = await algodClient.getTransactionParams().do();

            console.log('Creating cancel transaction...');
            console.log('App ID:', escrowDetails.appId);
            console.log('Sender (client):', walletAddress);

            const methodSig = 'cancel_escrow()void';
            const method = algosdk.ABIMethod.fromSignature(methodSig);
            const methodSelector = method.getSelector();
            
            console.log('Method selector (hex):', Buffer.from(methodSelector).toString('hex'));

            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: walletAddress,
                appIndex: escrowDetails.appId,
                suggestedParams: params,
                appArgs: [methodSelector],
                accounts: [escrowDetails.clientAddress] // Client account for refund
            });

            const signedTxns = await peraWallet.signTransaction([[{ txn: appCallTxn, signers: [walletAddress] }]]);

            const sendResult = await algodClient.sendRawTransaction(signedTxns).do();
            const txId = sendResult.txId || sendResult.txid;

            await algosdk.waitForConfirmation(algodClient, txId, 10);

            setSuccess(`✅ Escrow cancelled! ${escrowDetails.escrowAmount} ALGO refunded to your wallet. Transaction ID: ${txId}`);
            
            // Refresh escrow details
            setTimeout(() => {
                fetchEscrowDetails();
            }, 2000);

        } catch (err) {
            console.error('Cancel error:', err);
            let errorMessage = 'Failed to cancel escrow: ';
            
            if (err.message?.includes('logic eval error')) {
                errorMessage = 'Smart contract rejected the cancellation. This might be because the escrow is not in the correct state.';
            } else {
                errorMessage += err.message || 'Unknown error';
            }
            
            setError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
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

                {/* Wallet Connection */}
                {!walletAddress ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect Your Wallet</h3>
                            <p className="text-gray-600 mb-6">Connect your Pera Wallet to manage escrows</p>
                            <button
                                onClick={handleConnectWallet}
                                disabled={loading}
                                className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400"
                            >
                                {loading ? 'Connecting...' : 'Connect Pera Wallet'}
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

                {/* Load Escrow Section */}
                {walletAddress && (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Load Escrow Contract</h2>
                        
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={appId}
                                onChange={(e) => setAppId(e.target.value)}
                                placeholder="Enter Application ID (e.g., 748516324)"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                            <button
                                onClick={fetchEscrowDetails}
                                disabled={loading}
                                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-5 h-5" />
                                        Load
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800">{success}</p>
                    </div>
                )}

                {/* Escrow Details */}
                {escrowDetails && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Escrow Details</h2>
                            <p className="text-teal-100">Application ID: {escrowDetails.appId}</p>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Status</span>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                    escrowDetails.statusCode === 0 ? 'bg-yellow-100 text-yellow-800' :
                                    escrowDetails.statusCode === 1 ? 'bg-blue-100 text-blue-800' :
                                    escrowDetails.statusCode === 2 ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {escrowDetails.status}
                                </span>
                            </div>

                            {/* Amount */}
                            <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Escrow Amount</span>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-6 h-6 text-teal-600" />
                                        <span className="text-3xl font-bold text-teal-600">{escrowDetails.escrowAmount}</span>
                                        <span className="text-xl text-teal-600 font-semibold">ALGO</span>
                                    </div>
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="space-y-4">
                                <div className="border-b pb-4">
                                    <label className="text-sm font-medium text-gray-600 mb-2 block">Client Address</label>
                                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="font-mono text-sm text-gray-800">{escrowDetails.clientAddress}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-2 block">Freelancer Address</label>
                                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="font-mono text-sm text-gray-800">{escrowDetails.freelancerAddress}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {walletAddress === escrowDetails.clientAddress && escrowDetails.statusCode === 1 && (
                                <div className="pt-6 border-t space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                                    
                                    <button
                                        onClick={handleApproveWork}
                                        disabled={actionLoading}
                                        className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        {actionLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                Approve Work & Release {escrowDetails.escrowAmount} ALGO
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleCancelEscrow}
                                        disabled={actionLoading}
                                        className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-5 h-5" />
                                                Cancel Escrow & Refund
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Status Messages */}
                            {escrowDetails.statusCode === 2 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-800 font-medium">✅ This escrow has been completed. Funds have been released to the freelancer.</p>
                                </div>
                            )}

                            {escrowDetails.statusCode === 3 && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-gray-800 font-medium">🚫 This escrow has been cancelled. Funds have been refunded.</p>
                                </div>
                            )}

                            {escrowDetails.statusCode === 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800 font-medium">⚠️ This escrow is initialized but not yet funded.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 mt-8">
                    <p>Powered by Algorand Blockchain • TestNet</p>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;