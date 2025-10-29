import React, { useState } from 'react';
import { User, Briefcase, DollarSign, GraduationCap, FileText, ArrowRight, Wallet, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// 1. Import Firebase dependencies
import { db } from '../firebase'; // Adjust path as needed
import { collection, addDoc } from 'firebase/firestore'; 


// ---- Wallet Connect UI (inline component) ----
const WalletConnect = ({ onConnect }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-white">
    <div className="bg-white rounded-xl shadow-2xl p-10 flex flex-col items-center">
      <Wallet className="w-12 h-12 text-teal-600 mb-4" />
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
        Connect Your Algorand Wallet
      </h1>
      <p className="text-md text-gray-600 mb-6">
        Secure your account with an Algo wallet to receive payments and verify your identity.
      </p>
      <button
        onClick={onConnect}
        className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-full shadow-lg hover:bg-teal-700 transition-colors text-lg"
      >
        Connect via MyAlgo Wallet
      </button>
      <p className="text-xs text-gray-400 mt-4">
        Supported wallets: MyAlgo, Pera, Fireblocks.
      </p>
    </div>
    <div className="mt-10 text-center text-sm text-gray-500">
      <CheckCircle className="inline w-5 h-5 text-green-500 mr-1" />
      Wallet connection is required for decentralized gig payments.
    </div>
  </div>
);

// ---- Education Entry Form Group ----
const EducationEntry = ({ index, education, handleChange, removeEntry }) => (
  <div className="border border-gray-200 p-4 rounded-lg space-y-4 relative bg-gray-50">
    <h4 className="font-semibold text-gray-700">Education #{index + 1}</h4>
    {index > 0 && (
      <button
        type="button"
        onClick={() => removeEntry(index)}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
      >
        Remove
      </button>
    )}
    <InputGroup
      id={`degree-${index}`}
      name="degree"
      label="Degree / Qualification"
      placeholder="e.g., MSc in Computer Science"
      value={education.degree}
      onChange={(e) => handleChange(index, e)}
      required
    />
    <div className="grid grid-cols-2 gap-4">
      <InputGroup
        id={`institution-${index}`}
        name="institution"
        label="Institution/University"
        placeholder="e.g., MIT or Oxford University"
        value={education.institution}
        onChange={(e) => handleChange(index, e)}
        required
      />
      <InputGroup
        id={`graduationYear-${index}`}
        name="graduationYear"
        label="Graduation Year"
        type="number"
        placeholder="2020"
        value={education.graduationYear}
        onChange={(e) => handleChange(index, e)}
        required
      />
    </div>
  </div>
);

// ---- Main CreateProfilePage ----
const CreateProfilePage = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    tagline: '',
    bio: '',
    age: '',
    hourlyRate: '',
    preferredASA: 'ALGO',
    skills: '',
    education: [{ degree: '', institution: '', graduationYear: '' }],
    cvFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null); // State for error messages
  const [walletStep, setWalletStep] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  // Regular field handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, cvFile: e.target.files[0] }));
  };

  // Education array handlers
  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const newEducation = [...formData.education];
    newEducation[index][name] = value;
    setFormData(prev => ({ ...prev, education: newEducation }));
  };
  const addEducationEntry = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', graduationYear: '' }]
    }));
  };
  const removeEducationEntry = (index) => {
    const newEducation = formData.education.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, education: newEducation }));
  };

  // 2. Updated Submit handler to use Firebase Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Prepare the data object for Firestore
    const profileData = {
      displayName: formData.displayName,
      tagline: formData.tagline,
      bio: formData.bio,
      age: Number(formData.age) || null,
      hourlyRate: Number(formData.hourlyRate),
      preferredASA: formData.preferredASA,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0), // Convert string to array
      education: formData.education,
      profileCreatedAt: new Date(),
      cvUrl: null, // Placeholder for the file URL
      // In a real app, include the authenticated user ID here
      // userId: auth.currentUser.uid, 
    };

    try {
      // 3. --- FILE UPLOAD LOGIC (Separate Firebase Storage implementation needed) ---
      // if (formData.cvFile) {
      //   const cvUrl = await uploadFileToFirebaseStorage(formData.cvFile); 
      //   profileData.cvUrl = cvUrl;
      // }
      // ----------------------------------------------------------------------------
        
      // 4. Save the profile data to the 'freelancers' collection
      const docRef = await addDoc(collection(db, "freelancers"), profileData);

      console.log("Profile successfully saved with ID: ", docRef.id);
      
      // Proceed to the wallet connection step
      setWalletStep(true); 
      

    } catch (error) {
      console.error("Error saving profile to Firestore:", error);
      setSubmitError(`Submission failed. Please check your network or try again. Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  // When wallet connected, show final success message
  if (walletStep && walletConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Your freelancer profile is ready, and your Algorand wallet is connected.
        </p>
        <Link to="/" className="px-6 py-3 bg-teal-600 text-white rounded-full text-lg shadow-lg hover:bg-teal-700 transition">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Wallet step UI
  if (walletStep) {
    return (
      <WalletConnect onConnect={() => setWalletConnected(true)} />
    );
  }

  // Profile setup form
  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-xl shadow-2xl">
        <div className="text-center mb-10">
          <User className="w-12 h-12 mx-auto text-teal-600 mb-3" />
          <h1 className="text-3xl font-extrabold text-gray-900">
            Create Your Freelancer Profile
          </h1>
          <p className="mt-2 text-md text-gray-500">
            Showcase your <b>full credentials</b> and expertise to start attracting top decentralized gigs.
          </p>
        </div>
        
        {/* Error Message Display */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-medium">Submission Error:</p>
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Basic Info & Personal Details */}
          <SectionTitle icon={User} title="Personal & Professional Basics" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputGroup
              id="displayName"
              name="displayName"
              label="Public Display Name"
              placeholder="e.g., Alex Johnson"
              value={formData.displayName}
              onChange={handleChange}
              required
            />
            <InputGroup
              id="age"
              name="age"
              label="Age (Optional for Verification)"
              type="number"
              placeholder="28"
              value={formData.age}
              onChange={handleChange}
            />
            <InputGroup
              id="tagline"
              name="tagline"
              label="Professional Tagline (Max 80 Chars)"
              placeholder="Senior Smart Contract Auditor specializing in Beaker."
              value={formData.tagline}
              onChange={handleChange}
              maxLength={80}
              required
            />
          </div>
          <TextAreaGroup
            id="bio"
            name="bio"
            label="Detailed Professional Bio"
            placeholder="Describe your experience, work philosophy, and ideal projects (Markdown supported)."
            value={formData.bio}
            onChange={handleChange}
            required
            rows={5}
          />

          {/* 2. Education History */}
          <SectionTitle icon={GraduationCap} title="Education History (Required)" />
          <div className="space-y-4">
            {formData.education.map((entry, index) => (
              <EducationEntry
                key={index}
                index={index}
                education={entry}
                handleChange={handleEducationChange}
                removeEntry={removeEducationEntry}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addEducationEntry}
            className="text-teal-600 flex items-center hover:text-teal-800 text-sm font-semibold transition-colors"
          >
            <GraduationCap className="w-4 h-4 mr-2" /> Add Another Degree/Certification
          </button>

          {/* 3. Rates and Currency */}
          <SectionTitle icon={DollarSign} title="Rates & Payment" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputGroup
              id="hourlyRate"
              name="hourlyRate"
              label="Hourly Rate (ALGO/Unit)"
              type="number"
              placeholder="75"
              value={formData.hourlyRate}
              onChange={handleChange}
              required
            />
            <div className="md:col-span-2">
              <label htmlFor="preferredASA" className="block text-sm font-medium text-gray-700">
                Preferred Payment Currency (ASA)
              </label>
              <select
                id="preferredASA"
                name="preferredASA"
                value={formData.preferredASA}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg shadow-sm"
              >
                <option value="ALGO">ALGO (Algorand Native Token)</option>
                <option value="USDC">USDC (ASA Asset ID: 31566704)</option>
                <option value="OTHER">Other ASA (Specify)</option>
              </select>
            </div>
          </div>

          {/* 4. Skills & Documents */}
          <SectionTitle icon={Briefcase} title="Skills & Documents" />
          <TextAreaGroup
            id="skills"
            name="skills"
            label="Key Skills (Comma Separated)"
            placeholder="e.g., Python, Beaker, PyTeal, React, Web3, DeFi Audit"
            value={formData.skills}
            onChange={handleChange}
            required
            rows={3}
          />

          {/* CV/Resume Upload */}
          <FileGroup
            id="cvFile"
            name="cvFile"
            label="Upload CV/Resume (PDF preferred)"
            onChange={handleFileChange}
            file={formData.cvFile}
          />

          <p className="text-xs text-gray-500 mt-2">
            *Note: Portfolio links should be managed directly from your Profile Dashboard after this initial setup.
          </p>

          {/* Submission Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg 
                text-white bg-teal-600 hover:bg-teal-700 
                transition-colors duration-200 ease-in-out disabled:opacity-50"
            >
              {isSubmitting ? (
                'Saving Profile...'
              ) : (
                <>
                  Save Profile & Continue to Wallet Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---- Helper Form Components (NO CHANGES HERE) ----
const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center space-x-3 pt-4 pb-2 border-t border-gray-200 mt-6">
    <Icon className="w-6 h-6 text-teal-600" />
    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
  </div>
);

const InputGroup = ({ id, label, type = 'text', ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      type={type}
      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
      {...props}
    />
  </div>
);

const TextAreaGroup = ({ id, label, rows, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      id={id}
      rows={rows}
      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 resize-none"
      {...props}
    />
  </div>
);

const FileGroup = ({ id, label, file, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="flex items-center space-x-3">
      <input
        id={id}
        type="file"
        accept=".pdf,.doc,.docx"
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-teal-50 file:text-teal-700
          hover:file:bg-teal-100"
        {...props}
      />
      {file && (
        <span className="text-sm text-teal-600 font-medium flex items-center">
          <FileText className="w-4 h-4 mr-1" /> {file.name}
        </span>
      )}
    </div>
  </div>
);

export default CreateProfilePage;