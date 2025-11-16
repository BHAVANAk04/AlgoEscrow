import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [role, setRole] = useState(null); // 'freelancer' or 'client'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username,
        email,
        role,
        createdAt: new Date(),
        walletConnected: false,
        walletAddress: null
      });

      setSuccessMessage(`Account created successfully as ${role}!`);
      setTimeout(() => {
        navigate(`/${role}/dashboard`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        navigate(`/${userData.role}/dashboard`);
      } else {
        setError('User profile not found');
      }
    } catch (err) {
      setError(err.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset link sent to your email!');
      setTimeout(() => {
        setIsForgotPassword(false);
        setEmail('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isForgotPassword) {
      setIsForgotPassword(false);
      setError('');
      setSuccessMessage('');
    } else if (isSignup) {
      setIsSignup(false);
      setRole(null);
      setError('');
      setSuccessMessage('');
    } else if (isLogin) {
      setIsLogin(false);
      setError('');
      setSuccessMessage('');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4 relative">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Role Selection Screen */}
        {!isLogin && !isSignup && !isForgotPassword && !role && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center text-gray-800">Welcome to AlgoEscrow</h1>
            <p className="text-center text-gray-600">Choose your role to get started</p>

            <div className="space-y-4">
              <button
                onClick={() => setRole('freelancer')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105"
              >
                I'm a Freelancer
              </button>
              <button
                onClick={() => setRole('client')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105"
              >
                I'm a Client
              </button>
            </div>

            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Login
              </button>
            </p>
          </div>
        )}

        {/* Role Selected - Login/Signup Choice */}
        {role && !isLogin && !isSignup && !isForgotPassword && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 capitalize">
              Sign up as {role}
            </h2>

            <div className="space-y-4">
              <button
                onClick={() => setIsSignup(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Create New Account
              </button>
              <button
                onClick={() => setIsLogin(true)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
              >
                Login to Existing Account
              </button>
            </div>

            <button
              onClick={() => {
                setRole(null);
                setError('');
                setSuccessMessage('');
              }}
              className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2"
            >
              ← Change Role
            </button>
          </div>
        )}

        {/* Signup Form */}
        {isSignup && role && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-800">Create Account</h2>
            <p className="text-center text-sm text-gray-600 capitalize">Signing up as {role}</p>

            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <button
              onClick={() => {
                setIsSignup(false);
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setError('');
                setSuccessMessage('');
              }}
              className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Login Form */}
        {isLogin && !isForgotPassword && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <button
              onClick={() => setIsForgotPassword(true)}
              className="w-full text-blue-600 hover:text-blue-800 font-semibold py-2 text-sm"
            >
              Forgot Password?
            </button>

            <button
              onClick={() => {
                setIsLogin(false);
                setRole(null);
                setEmail('');
                setPassword('');
                setError('');
                setSuccessMessage('');
              }}
              className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Forgot Password Form */}
        {isForgotPassword && isLogin && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-gray-800">Reset Password</h2>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <button
              onClick={() => {
                setIsForgotPassword(false);
                setEmail('');
                setError('');
                setSuccessMessage('');
              }}
              className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2"
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
