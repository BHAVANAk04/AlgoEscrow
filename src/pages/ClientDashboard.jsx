import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { ArrowLeft, LogOut, Briefcase, FileText, MessageSquare, Plus, User, Menu, X } from 'lucide-react';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postBudget, setPostBudget] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'client') {
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

  const handlePostJob = (e) => {
    e.preventDefault();
    console.log('Job posted:', { postTitle, postDescription, postBudget });
    setPostTitle('');
    setPostDescription('');
    setPostBudget('');
    setShowPostForm(false);
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
    { id: 'escrow', label: 'Create Escrow', icon: Plus },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className={`fixed md:relative w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-30 h-full`}>
        <div className="p-6 border-b border-purple-600">
          <h1 className="text-2xl font-bold">AlgoEscrow</h1>
          <p className="text-sm text-purple-200">Client Dashboard</p>
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
                  if (item.id === 'escrow') setShowPostForm(true);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? 'bg-white text-purple-700 font-semibold'
                    : 'hover:bg-purple-600'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Section */}
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
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
          <div className="text-right">
            <p className="text-gray-800 font-semibold">{user?.username}</p>
            <p className="text-sm text-gray-600">Client</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">

          {activeTab === 'jobs' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">My Posted Jobs</h2>
            </div>
          )}

          {activeTab === 'escrow' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Escrow</h2>

              {showPostForm && (
                <form onSubmit={handlePostJob} className="bg-white p-8 rounded-lg shadow-md max-w-2xl space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title</label>
                    <input
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={postDescription}
                      onChange={(e) => setPostDescription(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg h-32"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Budget (ALGO)</label>
                    <input
                      type="number"
                      value={postBudget}
                      onChange={(e) => setPostBudget(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg">
                    Create Escrow
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>
              <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <p>Username: {user?.username}</p>
                <p>Email: {user?.email}</p>
                <p>Role: {user?.role}</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
