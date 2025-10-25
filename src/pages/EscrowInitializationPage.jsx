import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Shield, User, DollarSign, FileText, Wallet } from 'lucide-react';
import { Buffer } from 'buffer';
import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';

window.Buffer = window.Buffer || Buffer;

const peraWallet = new PeraWalletConnect({ 
    shouldShowSignTxnToast: true,
});

const EscrowInitializationPage = () => {
    const [step, setStep] = useState(1);
    const [walletAddress, setWalletAddress] = useState('');
    const [formData, setFormData] = useState({
        companyName: '',
        escrowAmount: '',
        freelancerAddress: '',
    });
    const [loading, setLoading] = useState(false);
    const [txId, setTxId] = useState('');
    const [appId, setAppId] = useState('');
    const [error, setError] = useState('');
    
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
                console.log('Connected wallet:', accounts[0]);
            } else {
                setError('No accounts found. Please try again.');
            }
        } catch (err) {
            if (err?.message?.includes('cancelled') || err?.data?.type === 'CONNECT_CANCELLED') {
                setError('Connection cancelled by user.');
            } else {
                setError('Failed to connect wallet: ' + (err.message || 'Please try again'));
            }
            console.error('Connection error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnectWallet = async () => {
        try {
            await peraWallet.disconnect();
            setWalletAddress('');
        } catch (err) {
            console.error('Disconnect error:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const validateAlgorandAddress = (address) => {
        return address && address.length === 58 && /^[A-Z2-7]+$/.test(address);
    };

    const handleContinueStep1 = () => {
        setError('');
        
        if (!walletAddress) {
            setError('Please connect your wallet first.');
            return;
        }
        
        if (!formData.companyName.trim()) {
            setError('Please enter the Company/Client Name.');
            return;
        }
        
        if (!formData.escrowAmount || parseFloat(formData.escrowAmount) <= 0) {
            setError('Please enter a valid escrow amount (must be greater than 0).');
            return;
        }
        
        setStep(2);
    };

    const handleInitializeContract = async () => {
        setError('');
        
        if (!formData.freelancerAddress || !formData.freelancerAddress.trim()) {
            setError('Please enter the freelancer wallet address.');
            return;
        }
        
        if (!validateAlgorandAddress(formData.freelancerAddress)) {
            setError('Invalid Algorand address. Must be 58 characters (A-Z, 2-7 only).');
            return;
        }
        
        setLoading(true);
        let contractTxId = ''; 

        try {
            const algodClient = getAlgodClient();
            
            const APPROVAL_PROGRAM_B64 = 'CyAEAAEIICYGBnN0YXR1cwtjbGllbnRfYWRkcg1lc2Nyb3dfYW1vdW50CGFzc2V0X2lkD2ZyZWVsYW5jZXJfYWRkcg11bml0YXJ5X3ByaWNlgAQzs0meNhoAjgEAOzEZFEQxGEEAJIIEBMx2ADcEFXRTWgR5C/WfBAeP1Qc2GgCOBABeAHMAzQENAIAEBlO3FzYaAI4BAA0AMRmBBRIxGBBEQgEgNhoBSRUlEkQ2GgJJFSQSRBc2GgNJFSQSRBc2GgRJFSQSRBdLAzEAE0QpMQBnJwRPBGcqTwNnK08CZygiZycFTGcjQzYaAUkVJBJEFzEAMgkSRCcFTGcjQzEWIwlJOBAjEkQiKGVEFEQiKWVESTEAEkRLATgAEkRJOAcyChJEIitlRBREOAgiKmVEMgAID0QoI2ciK2VEQQAXsTIAIitlRDIKIrISshSyEYEEshCyAbMjQzEWIwk4ECMSRDYaARUkEkQiKWVEMQASRCIoZUQjEkSxMgAiJwRlREkVJRJEIiplRLIIsgcjshCyAbMogQJnI0MiKWVESTEAEkQiKGVEIxJEsTIASwEVJRJEIiplRLIITLIHI7IQsgGzKIEDZyNDIillRDEAEkQiKGVEgQISQAAKIihlRIEDEkEAHiNEsTIAIillREkVJRJESbIJIrIIsgcjshCyAbMjQyJC/98=';
            const CLEAR_PROGRAM_B64 = 'C4EBQw==';

            let params = await algodClient.getTransactionParams().do();

            const approvalProgram = Uint8Array.from(atob(APPROVAL_PROGRAM_B64), c => c.charCodeAt(0));
            const clearProgram = Uint8Array.from(atob(CLEAR_PROGRAM_B64), c => c.charCodeAt(0));

            const escrowAmountMicroAlgos = Math.floor(parseFloat(formData.escrowAmount) * 1000000);
            const freelancerAddr = formData.freelancerAddress.trim();
            
            if (freelancerAddr === walletAddress) {
                throw new Error('Freelancer address must be different from your wallet address (client address)');
            }
            
            let freelancerAddressBytes;
            try {
                const decoded = algosdk.decodeAddress(freelancerAddr);
                freelancerAddressBytes = decoded.publicKey;
            } catch (decodeErr) {
                throw new Error('Invalid address format: ' + decodeErr.message);
            }

            const createAppMethod = algosdk.ABIMethod.fromSignature('create_application(address,uint64,uint64,uint64)void');
            const methodSelector = createAppMethod.getSelector();
            
            const escrowAmountBytes = new Uint8Array(8);
            const escrowView = new DataView(escrowAmountBytes.buffer);
            escrowView.setBigUint64(0, BigInt(escrowAmountMicroAlgos), false);
            
            const assetIdBytes = new Uint8Array(8);
            const unitaryPriceBytes = new Uint8Array(8);

            const txn = algosdk.makeApplicationCreateTxnFromObject({
                sender: walletAddress,
                suggestedParams: params,
                onComplete: algosdk.OnApplicationComplete.NoOpOC,
                approvalProgram: approvalProgram,
                clearProgram: clearProgram,
                numLocalInts: 0,
                numLocalByteSlices: 0,
                numGlobalInts: 6,
                numGlobalByteSlices: 2,
                appArgs: [
                    methodSelector,
                    freelancerAddressBytes,
                    escrowAmountBytes,
                    assetIdBytes,
                    unitaryPriceBytes
                ]
            });

            const singleTxnGroups = [{ txn, signers: [walletAddress] }];
            const signedTxn = await peraWallet.signTransaction([singleTxnGroups]);
            
            try {
                const sendResult = await algodClient.sendRawTransaction(signedTxn).do();
                contractTxId = sendResult.txId || sendResult.txid;
                
                if (!contractTxId) {
                    const decodedTxn = algosdk.decodeSignedTransaction(signedTxn[0]);
                    contractTxId = decodedTxn.txn.txID();
                }
            } catch (submissionError) {
                throw new Error(`Submission rejected by network/node: ${submissionError.message}`);
            }

            let confirmedTxn;
            try {
                confirmedTxn = await algosdk.waitForConfirmation(algodClient, contractTxId, 10);
            } catch (confirmError) {
                try {
                    const txnInfo = await algodClient.pendingTransactionInformation(contractTxId).do();
                    if (txnInfo['confirmed-round']) {
                        confirmedTxn = txnInfo;
                    } else {
                        throw new Error('Transaction failed to confirm after 10 rounds.');
                    }
                } catch (fetchError) {
                    throw new Error('Transaction failed to confirm. Please check AlgoExplorer for status.');
                }
            }

            // Extract application ID with extensive debugging
            console.log('=== DEBUGGING APPLICATION ID ===');
            console.log('Full confirmation object:', confirmedTxn);
            console.log('Object constructor:', confirmedTxn.constructor.name);
            console.log('Object keys:', Object.keys(confirmedTxn));
            console.log('Object entries:', Object.entries(confirmedTxn));
            
            let contractAppId = confirmedTxn.applicationIndex;
            console.log('Attempt 1 - Direct property (applicationIndex):', contractAppId);
            
            if (contractAppId === undefined) {
                contractAppId = confirmedTxn['application-index'];
                console.log('Attempt 2 - Bracket notation (application-index):', contractAppId);
            }
            
            if (contractAppId === undefined) {
                const allProps = Object.getOwnPropertyNames(confirmedTxn);
                console.log('All property names:', allProps);
                
                for (const prop of allProps) {
                    if (prop.toLowerCase().includes('application') && prop.toLowerCase().includes('index')) {
                        contractAppId = confirmedTxn[prop];
                        console.log(`Found via property search - ${prop}:`, contractAppId);
                        break;
                    }
                }
            }
            
            console.log('Final contractAppId:', contractAppId);
            console.log('=== END DEBUGGING ===');

            if (contractAppId === undefined || contractAppId === null) {
                throw new Error('Application ID not found in confirmation response. Check browser console.');
            }

            setTxId(contractTxId);
            setAppId(contractAppId.toString());
            setStep(3);
            
        } catch (err) {
            console.error('Error:', err);
            
            let errorMessage = 'Failed to initialize contract: ';
            if (err.message?.includes('Submission rejected')) {
                errorMessage = 'Transaction rejected: ' + err.message;
            } else if (err.message?.includes('overspend')) {
                errorMessage += 'Insufficient ALGO balance.';
            } else if (err.message?.includes('logic eval error')) {
                errorMessage += 'Smart contract validation failed.';
            } else {
                errorMessage += err.message || 'Unknown error';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleFundContract = async () => {
        setLoading(true);
        setError('');
        
        try {
            console.log('=== FUND CONTRACT DEBUG ===');
            console.log('appId:', appId, 'type:', typeof appId);
            console.log('walletAddress:', walletAddress);
            console.log('formData.escrowAmount:', formData.escrowAmount);
            
            if (!appId || !walletAddress) {
                throw new Error('Missing required data: appId or walletAddress');
            }
            
            const algodClient = getAlgodClient();
            let params = await algodClient.getTransactionParams().do();
            
            const appIdNum = parseInt(appId, 10);
            const appAddress = algosdk.getApplicationAddress(appIdNum);
            const totalAmount = parseFloat(formData.escrowAmount) + 0.1; 
            const amountInMicroAlgos = Math.floor(totalAmount * 1000000);
            
            console.log('Creating payment transaction...');
            console.log('From:', walletAddress);
            console.log('To:', appAddress);
            console.log('Amount:', amountInMicroAlgos);

            // Create payment transaction the same way as in handleInitializeContract
            const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: walletAddress,
                receiver: appAddress,
                amount: amountInMicroAlgos,
                suggestedParams: params,
            });
            
            console.log('Payment txn created successfully');

            const methodSelector = algosdk.ABIMethod.fromSignature('opt_in_to_asset(pay)void').getSelector();
            
            // The app call needs to reference the payment transaction
            const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
                sender: walletAddress,
                appIndex: appIdNum,
                suggestedParams: params,
                appArgs: [methodSelector],
                // Note: The payment txn will be in the same group, so no need for foreignAssets
                // The contract will access it via gtxn (group transaction)
            });
            
            console.log('App call txn created successfully');

            // Important: Payment must be FIRST, then app call
            const txns = [paymentTxn, appCallTxn];
            algosdk.assignGroupID(txns);
            
            console.log('Transactions grouped successfully');
            console.log('=== END FUND CONTRACT DEBUG ===');

            const signedTxns = await peraWallet.signTransaction([
                [{ txn: txns[0], signers: [walletAddress] }, { txn: txns[1], signers: [walletAddress] }]
            ]);

            console.log('Sending signed transactions...');
            const sendResult = await algodClient.sendRawTransaction(signedTxns).do();
            console.log('Send result:', sendResult);
            
            let fundingTxId = sendResult.txId || sendResult.txid;
            
            if (!fundingTxId) {
                // Extract from the first transaction in the group
                const decodedTxn = algosdk.decodeSignedTransaction(signedTxns[0]);
                fundingTxId = decodedTxn.txn.txID();
            }
            
            console.log('Waiting for confirmation of txId:', fundingTxId);
            await algosdk.waitForConfirmation(algodClient, fundingTxId, 10);
            console.log('Transaction confirmed!');

            setStep(4);
            
        } catch (err) {
            console.error('Funding error:', err);
            
            let errorMessage = 'Failed to fund contract: ';
            
            if (err.message?.includes('logic eval error')) {
                errorMessage = 'Smart contract rejected the transaction. This might be because: ';
                errorMessage += 'The contract state is invalid, or the payment amount/sender doesn\'t match expectations. ';
                errorMessage += 'Error: ' + err.message;
            } else if (err.message?.includes('below min')) {
                const match = err.message.match(/balance (\d+) below min (\d+)/);
                if (match) {
                    const current = parseInt(match[1]) / 1000000;
                    const required = parseInt(match[2]) / 1000000;
                    const needed = required - current;
                    errorMessage = `Insufficient balance. You need ${needed.toFixed(3)} more ALGO. Visit https://bank.testnet.algorand.network/ to get test ALGO.`;
                } else {
                    errorMessage += 'Insufficient ALGO balance. Please add funds from the TestNet faucet.';
                }
            } else {
                errorMessage += err.message || 'Unknown error';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const StepIndicator = ({ num, label }) => {
        const isCurrent = step === num;
        const isComplete = step > num;
        
        let circleClasses = 'bg-gray-300 text-gray-600';
        let icon = num;

        if (isComplete) {
            circleClasses = 'bg-teal-600 text-white';
            icon = <CheckCircle2 className="w-5 h-5" />;
        } else if (isCurrent) {
            circleClasses = 'bg-teal-600 text-white shadow-lg shadow-teal-300/50';
        }

        return (
            <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${circleClasses}`}>
                    {icon}
                </div>
                <span className={`text-xs mt-2 text-center transition-colors duration-300 ${isCurrent ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{label}</span>
            </div>
        );
    };
    
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-lg mb-4 shadow-xl">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Initialize Escrow Contract
                    </h1>
                    <p className="text-gray-500">
                        Secure client funds on the Algorand blockchain
                    </p>
                </div>

                {!walletAddress && step === 1 && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Wallet className="w-6 h-6 text-blue-600" />
                                <div>
                                    <h3 className="font-semibold text-blue-900">Connect Your Wallet</h3>
                                    <p className="text-sm text-blue-700">Connect to get started with the escrow</p>
                                </div>
                            </div>
                            <button
                                onClick={handleConnectWallet}
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                {loading ? 'Connecting...' : 'Connect Wallet'}
                            </button>
                        </div>
                    </div>
                )}

                {walletAddress && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
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

                <div className="mb-10">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {[
                            { num: 1, label: 'Details & Budget' },
                            { num: 2, label: 'Configure Contract' },
                            { num: 3, label: 'Fund Escrow' },
                            { num: 4, label: 'Complete' }
                        ].map((item, idx) => (
                            <React.Fragment key={item.num}>
                                <StepIndicator num={item.num} label={item.label} />
                                {idx < 3 && (
                                    <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-500 ${
                                        step > item.num ? 'bg-teal-600' : 'bg-gray-300'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-2xl p-8 lg:p-10 border border-gray-100">
                    
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Project & Funding Details</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Company/Client Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Acme Solutions"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="escrowAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                        Escrow Budget (ALGO) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            id="escrowAmount"
                                            name="escrowAmount"
                                            value={formData.escrowAmount}
                                            onChange={handleInputChange}
                                            placeholder="Enter total amount to be secured"
                                            step="0.001"
                                            min="0.1"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                        />
                                        <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Minimum 0.1 ALGO required for contract operation
                                    </p>
                                </div>
                            </div>
                            
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-sm text-red-800 font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleContinueStep1}
                                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-lg"
                            >
                                Continue to Freelancer Address
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Contract Configuration</h2>
                            
                            <div className="bg-gray-50 rounded-xl p-6 mb-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-teal-600" />
                                    Contract Summary
                                </h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p className="flex justify-between items-center"><span className="font-medium">Company/Client:</span> <span className="text-gray-900 font-semibold">{formData.companyName}</span></p>
                                    <p className="flex justify-between items-center border-t pt-2"><span className="font-medium text-lg">Escrow Amount:</span> <span className="text-teal-600 font-extrabold text-xl">{formData.escrowAmount} ALGO</span></p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-lg font-bold text-gray-800 mb-2">
                                        Freelancer Algorand Wallet Address *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="freelancerAddress"
                                            value={formData.freelancerAddress}
                                            onChange={handleInputChange}
                                            placeholder="Enter 58-character Algorand address"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                            maxLength={58}
                                        />
                                        <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                    </div>
                                    <p className="text-xs text-red-500 mt-1 flex items-center pt-2">
                                        <AlertCircle className="w-4 h-4 inline mr-1" />
                                        <span className="font-semibold">CRITICAL:</span> Double-check this address. Funds will be sent here upon approval.
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-sm text-red-800 font-medium">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                    disabled={loading}
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleInitializeContract}
                                    disabled={loading}
                                    className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Initialize Contract'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Created!</h2>
                                <p className="text-gray-600">Application ID: <span className="font-mono font-bold text-teal-600">{appId}</span></p>
                                <p className="text-xs text-gray-500 mt-1">Transaction: {txId}</p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h4 className="font-semibold text-amber-900 mb-2">Next: Fund the Escrow</h4>
                                <p className="text-sm text-amber-800">
                                    You need to fund the contract with {formData.escrowAmount} ALGO + 0.1 ALGO for fees and minimum balance.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <p className="text-sm text-red-800 font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleFundContract}
                                disabled={loading}
                                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Funding...
                                    </>
                                ) : (
                                    `Fund Contract (${(parseFloat(formData.escrowAmount) + 0.1).toFixed(2)} ALGO)`
                                )}
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">Escrow Active! 🎉</h2>
                            <p className="text-gray-600">
                                Your <strong>{formData.escrowAmount} ALGO</strong> escrow for <strong>{formData.companyName}</strong> is now live on Algorand TestNet.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-mono text-gray-700">App ID: <span className="font-bold text-teal-600">{appId}</span></p>
                                <p className="text-xs text-gray-500 mt-1">Freelancer: {formData.freelancerAddress.substring(0, 10)}...{formData.freelancerAddress.substring(48)}</p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                            >
                                Create Another Escrow
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Powered by Algorand Blockchain • TestNet</p>
                </div>
            </div>
        </div>
    );
};

export default EscrowInitializationPage;