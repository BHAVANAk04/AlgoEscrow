import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, DollarSign, Wallet, Lock, TrendingUp } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const EscrowManager = ({ walletAddress }) => {
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, completed, failed

  useEffect(() => {
    fetchEscrows();
  }, [walletAddress]);

  const fetchEscrows = async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    try {
      const escrowsRef = collection(db, 'escrows');
      const q = query(
        escrowsRef,
        where('buyerAddress', '==', walletAddress),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const escrowList = [];
      
      querySnapshot.forEach((doc) => {
        escrowList.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      });
      
      setEscrows(escrowList);
    } catch (error) {
      console.error('Error fetching escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'initialized':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'processing':
        return <Clock className="w-5 h-5 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const filteredEscrows = escrows.filter(escrow => {
    if (activeTab === 'all') return true;
    return escrow.status === activeTab;
  });

  const stats = {
    total: escrows.length,
    completed: escrows.filter(e => e.status === 'confirmed').length,
    pending: escrows.filter(e => ['initialized', 'processing'].includes(e.status)).length,
    failed: escrows.filter(e => e.status === 'failed').length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-500 opacity-30" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-500 opacity-30" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500 opacity-30" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500 opacity-30" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {['all', 'initialized', 'processing', 'confirmed', 'failed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm capitalize transition ${
              activeTab === tab
                ? 'border-b-2 border-teal-600 text-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        ) : filteredEscrows.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No {activeTab !== 'all' ? activeTab : ''} transactions found</p>
          </div>
        ) : (
          filteredEscrows.map(escrow => (
            <div
              key={escrow.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{escrow.projectTitle}</h3>
                  <p className="text-sm text-gray-600 break-all">{escrow.projectId}</p>
                </div>
                <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(escrow.status)}`}>
                  {getStatusIcon(escrow.status)}
                  <span className="capitalize text-sm font-medium">{escrow.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Price</p>
                  <p className="font-semibold text-gray-900">{escrow.priceAlgo} ALGO</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{escrow.status}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Date</p>
                  <p className="font-semibold text-gray-900">
                    {escrow.createdAt?.toLocaleDateString() || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">TX ID</p>
                  {escrow.transactionId ? (
                    <a
                      href={`https://testnet.algoexplorer.io/tx/${escrow.transactionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-teal-600 hover:text-teal-700 truncate"
                    >
                      View on Explorer
                    </a>
                  ) : (
                    <p className="font-semibold text-gray-500">Pending...</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Escrow Address: {escrow.sellerAddress?.slice(0, 20)}...</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EscrowManager;
