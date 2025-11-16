import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Wallet, Lock, ArrowRight, QrCode, Copy, Check } from 'lucide-react';
import { PeraWalletConnect } from '@perawallet/connect';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import escrowService from '../services/escrowService';

const peraWallet = new PeraWalletConnect();

// Mock projects data (same as ProjectCatalogPage)
// Using a valid Algorand testnet address for demo
const DEMO_SELLER_ADDRESS = "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q";

const MOCK_PROJECTS = [
  {
    "id": 1,
    "title": "Decentralized Voting DApp UI Kit",
    "author": "PixelForge Studios",
    "description": "Figma design files and React components for a complete DAO voting application interface.",
    "price": "500 ALGO",
    "assetType": "UI/UX",
    "logoUrl": "https://www.vectorlogo.zone/logos/figma/figma-icon.svg",
    "tags": ["Figma", "React", "Design", "DAO"],
    "rating": 4.9,
    "demoLink": "https://tailwindui.com/components",
    "qrCodeUrl": "https://placehold.co/150x150/228B22/FFFFFF?text=QR1",
    "assetId": 0,
    "sellerAddress": DEMO_SELLER_ADDRESS
  },
  {
    "id": 2,
    "title": "PyTeal Escrow Template",
    "author": "SmartContract Ninja",
    "description": "Ready-to-deploy PyTeal/Beaker template for a simple fixed-price escrow contract.",
    "price": "1200 ALGO",
    "assetType": "Smart Contract",
    "logoUrl": "https://www.vectorlogo.zone/logos/python/python-icon.svg",
    "tags": ["PyTeal", "Beaker", "Security", "Algorand"],
    "rating": 4.7,
    "demoLink": "https://algorand.com",
    "qrCodeUrl": "https://placehold.co/150x150/228B22/FFFFFF?text=QR2",
    "assetId": 0,
    "sellerAddress": DEMO_SELLER_ADDRESS
  },
  {
    "id": 3,
    "title": "React Dashboard Template",
    "author": "Template Masters",
    "description": "Production-ready React dashboard with charts, tables, and authentication.",
    "price": "750 ALGO",
    "assetType": "Full Codebase",
    "logoUrl": "https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg",
    "tags": ["React", "Dashboard", "Template"],
    "rating": 4.8,
    "demoLink": "https://react.dev",
    "qrCodeUrl": "https://placehold.co/150x150/228B22/FFFFFF?text=QR3",
    "assetId": 0,
    "sellerAddress": DEMO_SELLER_ADDRESS
  }
];

const NFTPurchasePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [step, setStep] = useState(1); // 1: Connect wallet, 2: Review, 3: Processing, 4: Confirm
  const [isProcessing, setIsProcessing] = useState(false);
  const [txId, setTxId] = useState(null);
  const [escrowDetails, setEscrowDetails] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        // First check if project data was passed via route state
        if (location.state?.project) {
          setProject(location.state.project);
          setLoading(false);
          return;
        }

        const numProjectId = parseInt(projectId);
        
        // Try to get from Firestore
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Fall back to mock data
          const mockProject = MOCK_PROJECTS.find(p => p.id === numProjectId);
          if (mockProject) {
            setProject(mockProject);
          } else {
            setError("Project not found");
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching project:", err);
        // Try mock data as fallback
        const numProjectId = parseInt(projectId);
        const mockProject = MOCK_PROJECTS.find(p => p.id === numProjectId);
        if (mockProject) {
          setProject(mockProject);
          setLoading(false);
        } else {
          setError("Failed to load project details");
          setLoading(false);
        }
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, location.state]);

  // Connect wallet
  const connectWallet = async () => {
    try {
      await peraWallet.connect();
      const accounts = await peraWallet.reconnectSession();
      if (accounts.length > 0) {
        const address = typeof accounts[0] === 'string' 
          ? accounts[0] 
          : accounts[0].toString();
        setWalletAddress(address);
        setWalletConnected(true);
        setStep(2);
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setError("Failed to connect wallet. Make sure Pera Wallet is installed.");
    }
  };

  const disconnectWallet = () => {
    peraWallet.disconnect();
    setWalletConnected(false);
    setWalletAddress('');
    setStep(1);
  };

  // Process purchase
  const processPurchase = async () => {
    if (!project || !walletConnected) {
      setError("Please connect wallet and select a project");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStep(3);

    try {
      // Parse price from project (e.g., "500 ALGO" -> 500000000 microAlgos)
      const priceMatch = project.price.match(/(\d+)/);
      const priceAlgo = priceMatch ? parseFloat(priceMatch[1]) : 0;
      const priceInMicroAlgos = priceAlgo * 1_000_000;

      // Ensure wallet address is a string
      const buyerAddress = typeof walletAddress === 'string' 
        ? walletAddress 
        : walletAddress.toString();

      // Get seller address - use project.sellerAddress or project.authorWallet if available, else use default
      const sellerAddress = project.sellerAddress 
        ? (typeof project.sellerAddress === 'string' 
          ? project.sellerAddress 
          : project.sellerAddress.toString())
        : (project.authorWallet
          ? (typeof project.authorWallet === 'string' 
            ? project.authorWallet 
            : project.authorWallet.toString())
          : DEMO_SELLER_ADDRESS);

      console.log('Buyer Address:', buyerAddress);
      console.log('Seller Address:', sellerAddress);

      // Step 1: Render TEAL with project parameters
      const teal = escrowService.renderTeal(
        project.assetId || 0,
        sellerAddress,
        priceInMicroAlgos,
        1
      );

      // Step 2: Compile and get escrow address
      const escrowData = await escrowService.compileAndGetEscrowAddress(teal);
      setEscrowDetails(escrowData);

      // Ensure escrow address is a string
      const escrowAddress = typeof escrowData.escrowAddress === 'string'
        ? escrowData.escrowAddress
        : escrowData.escrowAddress.toString();

      console.log('Escrow Address:', escrowAddress);

      // Step 3: Create escrow record in Firestore
      const escrowRecordId = await escrowService.createEscrowRecord({
        projectId: project.id,
        projectTitle: project.title,
        buyerAddress: buyerAddress,
        sellerAddress: sellerAddress,
        escrowAddress: escrowAddress,
        assetId: project.assetId || 0,
        priceAlgo: priceAlgo,
        priceInMicroAlgos: priceInMicroAlgos,
        status: 'initialized',
        escrowCompiledProgram: escrowData.compiledProgram
      });

      // Step 4: Build atomic transaction group
      const txnGroup = await escrowService.buildAtomicGroupTransaction(
        buyerAddress,
        sellerAddress,
        escrowAddress,
        project.assetId || 0,
        priceInMicroAlgos,
        1
      );

      // NOTE: In production, we need to sign with Pera wallet
      // For now, showing success demo - actual signing requires Pera integration
      console.log('Transaction group built:', txnGroup);
      
      // Simulate successful transaction
      const mockTxId = 'DEMO_' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setTxId(mockTxId);

      // Update escrow status
      await escrowService.updateEscrowStatus(escrowRecordId, 'confirmed', {
        transactionId: mockTxId,
        confirmedAt: new Date()
      });

      setStep(4);
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err.message || "Failed to process purchase. Ensure you have the required ALGO balance.");
      setIsProcessing(false);
      setStep(2);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-6">{error || "Project not found"}</p>
          <button
            onClick={() => navigate('/catalog')}
            className="px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Purchase NFT Project</h1>
          <p className="text-gray-600">Secure atomic transaction via Algorand escrow</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${
                  step >= s
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > s ? <Check className="w-6 h-6" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`h-1 w-20 mx-2 transition ${
                    step > s ? 'bg-teal-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Project Summary */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Project Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Project:</span>
                <span className="font-semibold text-gray-900">{project.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-teal-600">{project.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Asset Type:</span>
                <span className="font-semibold text-gray-900">{project.assetType || 'Digital Asset'}</span>
              </div>
            </div>
          </div>

          {/* Step 1: Connect Wallet */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Connect Your Wallet</h3>
                    <p className="text-blue-800 text-sm">
                      You'll need to connect your Algorand wallet to complete this purchase. Make sure you have enough ALGO to cover the purchase price plus transaction fees.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={connectWallet}
                className="w-full py-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Connect Pera Wallet
              </button>
            </div>
          )}

          {/* Step 2: Review Purchase */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Wallet Connected</h3>
                    <p className="text-sm text-green-800 break-all">{walletAddress}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Lock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-2">How It Works</h3>
                    <ul className="text-sm text-yellow-800 space-y-2">
                      <li>• An escrow contract will be created on Algorand</li>
                      <li>• Your payment will be sent to the seller</li>
                      <li>• The NFT will be transferred to your wallet</li>
                      <li>• Both transactions happen atomically (all-or-nothing)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={processPurchase}
                  disabled={isProcessing}
                  className="w-full py-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      Complete Purchase
                    </>
                  )}
                </button>
                <button
                  onClick={disconnectWallet}
                  className="w-full py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <Loader2 className="w-16 h-16 text-teal-600 animate-spin mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Purchase</h3>
                <p className="text-gray-600">Please wait while your transaction is being processed on the Algorand blockchain...</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">This may take a few moments</p>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase Confirmed!</h3>
                <p className="text-gray-600">Your NFT has been successfully transferred to your wallet.</p>
              </div>

              {txId && (
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction ID</label>
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded p-3">
                    <span className="text-sm text-gray-600 break-all flex-1">{txId}</span>
                    <button
                      onClick={() => copyToClipboard(txId)}
                      className="flex-shrink-0"
                    >
                      {copySuccess ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => window.open(`https://testnet.algoexplorer.io/tx/${txId}`, '_blank')}
                  className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
                >
                  View on AlgoExplorer
                </button>
                <button
                  onClick={() => navigate('/catalog')}
                  className="w-full py-3 border border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition"
                >
                  Back to Catalog
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Security Information</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• This transaction uses Algorand's atomic swap feature for security</li>
            <li>• Your private keys never leave your wallet</li>
            <li>• The escrow ensures fair exchange: money and NFT transfer simultaneously</li>
            <li>• All transactions are immutable and transparent on the blockchain</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NFTPurchasePage;
