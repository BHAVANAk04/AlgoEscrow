import React, { useState, useEffect } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

const WalletConnectModal = ({ isOpen, onClose, onConnect }) => {
  const [peraWallet, setPeraWallet] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const pera = new PeraWalletConnect({
      // Optional: specify network if needed, defaults to MainNet
      // network: 'TestNet' // Uncomment for TestNet
    });
    setPeraWallet(pera);

    // Cleanup on unmount
    return () => {
      pera.disconnect();
    };
  }, []);

  const handlePeraConnect = async () => {
    if (!peraWallet) return;
    try {
      const accounts = await peraWallet.connect();
      // Call onConnect with the first connected account
      onConnect(accounts[0]);
      onClose();
    } catch (error) {
      setConnectionError('Failed to connect with Pera Wallet. Please try again.');
      console.error('Pera Wallet connection error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Connect Wallet</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-center">
          <img
            src="https://perawallet.app/assets/images/pera-logo.png"
            alt="Pera Wallet"
            className="h-12 mx-auto mb-4"
          />
          <p className="text-gray-600 mb-6">
            Scan the QR code with your Pera Wallet app to connect securely.
          </p>
          <button
            onClick={handlePeraConnect}
            className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-full shadow-lg hover:bg-teal-700 transition-colors text-lg"
          >
            Connect with Pera Wallet
          </button>
          {connectionError && (
            <p className="text-red-500 text-sm mt-4">{connectionError}</p>
          )}
          <p className="text-xs text-gray-400 mt-4">
            Ensure you have the Pera Wallet app installed on your mobile device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectModal;