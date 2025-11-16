import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { ArrowLeft, LogOut, Briefcase, FileText, MessageSquare, TrendingUp, User, Menu, X } from 'lucide-react';

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'freelancer') {
          setUser({ uid: currentUser.uid, ...userDoc.data() });
          setLoading(false);
        } else {
          navigate('/auth');
        }
      } else {
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  const navigationItems = [
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'consultations', label: 'Consultations', icon: MessageSquare },
    { id: 'transactions', label: 'Transactions', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed md:relative w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-30 h-full`}>
        <div className="p-6 border-b border-blue-600">
          <h1 className="text-2xl font-bold">AlgoEscrow</h1>
          <p className="text-sm text-blue-200">Freelancer Dashboard</p>
        </div>

        <nav className="mt-6 space-y-2 px-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? 'bg-white text-blue-700 font-semibold'
                    : 'hover:bg-blue-600'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
          <div className="text-right">
            <p className="text-gray-800 font-semibold">{user?.username}</p>
            <p className="text-sm text-gray-600">Freelancer</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'jobs' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Available Jobs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Job #{i}</h3>
                    <p className="text-gray-600 mb-4">Build a web application with React and Node.js</p>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-bold">$500 - $2000</span>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">My Projects</h2>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600">You have no active projects yet. Browse jobs to get started!</p>
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Consultations</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">Consultation with Client #{i}</h3>
                        <p className="text-sm text-gray-600">Status: Pending</p>
                      </div>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Transaction History</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-3 text-sm text-gray-600">2025-11-15</td>
                      <td className="px-6 py-3 text-sm text-gray-600">Escrow Payment Received</td>
                      <td className="px-6 py-3 text-sm font-semibold text-green-600">+$500 ALGO</td>
                      <td className="px-6 py-3 text-sm"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Completed</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>
              <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Username</label>
                    <p className="text-gray-800">{user?.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <p className="text-gray-800">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Role</label>
                    <p className="text-gray-800 capitalize">{user?.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Wallet</label>
                    <p className="text-gray-800">{user?.walletAddress || 'Not connected'}</p>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition mt-4">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
