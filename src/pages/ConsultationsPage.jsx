import React, { useState, useMemo, useEffect } from 'react';
// Import all necessary icons
import { Search, Clock, DollarSign, Star, Briefcase, ChevronDown, Calendar, Code, ArrowLeft, Link as LinkIcon, Send, X, UserPlus, Mail, Globe, Image as ImageIcon, Award, Linkedin, ExternalLink } from 'lucide-react';
// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// --- END FIREBASE IMPORTS ---


// --- ENHANCED INLINE MOCK DATA ---
const mockConsultantData = [
    {
        "id": "mock-101", 
        "name": "Dr. Elara Vance",
        "title": "Lead Smart Contract Auditor",
        "specialty": "Smart Contract Security", 
        "rate": "1000 ALGO / hr",
        "rating": 4.9,
        "experience": 8,
        "logoUrl": "https://placehold.co/120x120/3CB371/FFFFFF?text=EV",
        "description": "Dr. Vance specializes in formal verification and security analysis of Beaker and PyTeal smart contracts. With 8 years in the blockchain space, her focus is mitigating common re-entrancy and logic bugs before deployment.",
        "achievements": "Led 3 successful DeFi audits for top 10 Algorand projects. Published research on TEAL security best practices.",
        "email": "elara.vance@example.com",
        "websiteUrl": "https://elara.dev",
        "linkedinProfile": "https://linkedin.com/in/elaravance",
        "portfolioUrl": "https://elara.dev/portfolio",
    },
    {
        "id": "mock-102",
        "name": "Arjun Sharma",
        "title": "DeFi Strategy Consultant",
        "specialty": "DeFi Strategy & Tokenomics", 
        "rate": "2500 ALGO / session",
        "rating": 4.7,
        "experience": 6,
        "logoUrl": "https://placehold.co/120x120/4682B4/FFFFFF?text=AS",
        "description": "Arjun provides actionable insights into token distribution models, liquidity provisioning, and governance structure for new and existing Algorand-based DeFi projects. Maximizing capital efficiency is his goal.",
        "achievements": "Designed tokenomics for a $5M IDO. Oversaw the launch of 2 major Algorand-native DEX liquidity pools.",
        "email": "arjun.sharma@example.com",
        "websiteUrl": "https://arjunsharma.io",
        "linkedinProfile": "https://linkedin.com/in/arjunsharma",
        "portfolioUrl": "https://arjunsharma.io/portfolio",
    },
];

// Define sorting/filtering options
const EXPERT_FIELDS = [
    'All Specialties',
    'Smart Contract', 
    'DeFi Strategy',
    'DApp Architecture',
    'UX/UI Design',
    'Data Analysis',
    'Tokenomics',
    'Other'
];

// --- HELPER FUNCTION FOR ROBUST RATE COMPARISON ---
const getComparableRate = (rateString) => {
    const match = rateString.match(/(\d+)/);
    return match ? parseFloat(match[1]) : 0;
};

// --- FIREBASE CONFIGURATION AND INITIALIZATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBc7x8gddDmeCztU8S0TStIbj3VUg5I6Gk",
    authDomain: "algoescrow.firebaseapp.com",
    projectId: "algoescrow",
    storageBucket: "algoescrow.firebasestorage.app",
    messagingSenderId: "112755487139",
    appId: "1:112755487139:web:17ffd1a212ffcbe95dea16",
    measurementId: "G-XSXPX5Z2CN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = firebaseConfig.projectId;

// 🌟 GLOBAL INPUT STYLE CONSTANT 🌟
const inputStyle = "mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 text-gray-700";

// --- CSS STYLES FOR THE FORM (To replace the missing Tailwind components) ---
const FormStyles = () => (
    <style dangerouslySetInnerHTML={{
        __html: `
        .input-field {
            margin-top: 0.25rem;
            display: block;
            width: 100%;
            border-radius: 0.5rem;
            border: 1px solid #d1d5db;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            padding: 0.75rem;
            color: #4b5563;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .input-field:focus {
            border-color: #14b8a6; /* teal-500 */
            box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.5);
            outline: 2px solid transparent;
            outline-offset: 2px;
        }
    `}} />
);

// --- FILE UPLOAD COMPONENT ---
const FileUploadComponent = ({ label, fieldName, file, setFile }) => (
    <div>
        <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 flex items-center mb-1">
            {label}
        </label>
        <div className="mt-1 flex items-center space-x-2">
            <label className="flex-grow inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <input
                    type="file"
                    name={fieldName}
                    id={fieldName}
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={(e) => setFile(e, fieldName)}
                    className="sr-only"
                />
                {file ? (
                    <span className="truncate">{file.name}</span>
                ) : (
                    <span>Choose Logo File</span>
                )}
            </label>
            {file && (
                <button
                    type="button"
                    onClick={() => setFile({ target: { files: [] } }, fieldName)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Remove file"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    </div>
);


// --- CONSULTANT REGISTRATION FORM COMPONENT ---
const ConsultantRegistrationForm = ({ onClose, onNewConsultant }) => {
    const [formData, setFormData] = useState({
        name: '', title: '', specialty: '', rate: '', experience: 0,
        description: '', email: '',
        websiteUrl: '',
        linkedinProfile: '',
        portfolioUrl: '',
        achievements: '',
        logoFile: null,
        otherSpecialty: '', 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [isOtherSpecialty, setIsOtherSpecialty] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'specialty') {
            setIsOtherSpecialty(value === 'Other');
        }

        setFormData(prev => ({ ...prev, [name]: name === 'experience' ? parseInt(value) || 0 : value }));
    };

    const handleFileChange = (e, field) => {
        setFormData(prev => ({ ...prev, [field]: e.target.files[0] || null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalSpecialty = (formData.specialty === 'Other' && formData.otherSpecialty)
            ? formData.otherSpecialty
            : formData.specialty;

        if (!formData.name || !formData.title || !formData.email || !formData.rate || !finalSpecialty || finalSpecialty === 'Select Specialty *' || finalSpecialty === '') {
            setMessage({ type: 'error', text: 'Please fill in all required fields (Name, Title, Email, Rate, and Specialty).' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        // FIX: Added missing backticks
        const simulatedLogoUrl = formData.logoFile
            ? `https://storage.firebase.com/logo/${formData.logoFile.name}`
            : `https://placehold.co/60x60/10B981/FFFFFF?text=${formData.name.split(' ').map(n => n[0]).join('') || 'CN'}`;

        const newConsultantData = {
            name: formData.name,
            title: formData.title,
            specialty: finalSpecialty,
            // FIX: Added missing backticks
            rate: formData.rate.includes('ALGO') ? formData.rate : `${formData.rate} ALGO / hr`,
            experience: formData.experience,
            description: formData.description,
            achievements: formData.achievements,
            email: formData.email,
            websiteUrl: formData.websiteUrl,
            linkedinProfile: formData.linkedinProfile,
            portfolioUrl: formData.portfolioUrl,
            logoUrl: simulatedLogoUrl,
            // FIX: Added missing backticks
            id: `temp-${Date.now()}`,
            rating: 5.0, 
            createdAt: new Date().toISOString(),
        };

        Object.keys(newConsultantData).forEach(key =>
            (newConsultantData[key] === '' || newConsultantData[key] === null) && delete newConsultantData[key]);


        try {
            const docRef = await addDoc(collection(db, "consultants"), newConsultantData);

            const submittedConsultant = { ...newConsultantData, id: docRef.id };
            onNewConsultant(submittedConsultant);

            setMessage({ type: 'success', text: 'Profile submitted! It will appear shortly.' });
            setTimeout(onClose, 2000);
        } catch (error) {
            console.error("Error submitting consultant profile: ", error);
            setMessage({ type: 'error', text: 'Failed to submit profile. Check console for details.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center">
                    <UserPlus className="w-6 h-6 mr-2 text-teal-600" /> Register as Consultant
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Enter your professional details to be listed in the marketplace.
                </p>

                {message && (
                    // FIX: Added missing backticks
                    <div className={`p-3 mb-4 rounded-lg ${message.type === 'success' ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row 1 & 2: Core Details (2-Column Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" type="text" placeholder="Full Name *" value={formData.name} onChange={handleChange} required className="input-field" />
                        <input name="title" type="text" placeholder="Job Title (e.g., DApp Architect) *" value={formData.title} onChange={handleChange} required className="input-field" />
                        <input name="email" type="email" placeholder="Contact Email *" value={formData.email} onChange={handleChange} required className="input-field" />

                        {/* Specialty Selector */}
                        {/* FIX: Added missing backticks */}
                        <select name="specialty" value={formData.specialty} onChange={handleChange} required className={`input-field appearance-none`}>
                            <option value="">Select Specialty *</option>
                            {EXPERT_FIELDS.map(f => (<option key={f} value={f}>{f}</option>))}
                        </select>

                        {/* Conditional Other Specialty Input */}
                        {isOtherSpecialty && (
                            <input
                                name="otherSpecialty"
                                type="text"
                                placeholder="Specify your specialty *"
                                value={formData.otherSpecialty || ''}
                                onChange={handleChange}
                                required={isOtherSpecialty}
                                className="input-field"
                            />
                        )}

                        <input name="rate" type="text" placeholder="Rate (e.g., 800 ALGO / hr) *" value={formData.rate} onChange={handleChange} required className="input-field" />
                        <input name="experience" type="number" placeholder="Years Experience (e.g., 5)" value={formData.experience || ''} min="0" onChange={handleChange} className="input-field" />
                    </div>

                    {/* FIX: Added missing backticks */}
                    <textarea name="description" placeholder="Professional Summary/Bio (Min. 50 words)" value={formData.description} onChange={handleChange} rows={3} className={`input-field w-full`} />

                    {/* Achievements Section */}
                    <div>
                        <label htmlFor="achievements" className="text-sm font-medium text-gray-700 flex items-center mb-1">
                            <Award className="w-4 h-4 mr-1 text-yellow-600" /> Key Achievements/Milestones
                        </label>
                        <textarea
                            name="achievements"
                            id="achievements"
                            placeholder="List achievements separated by periods. e.g., Led security audit for Algorand's biggest NFT project. Designed tokenomics for a DAO with $10M TVL."
                            value={formData.achievements}
                            onChange={handleChange}
                            rows={3}
                            // FIX: Added missing backticks
                            className={`input-field w-full`}
                        />
                    </div>

                    {/* Contact Links (3-Column Layout) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input name="websiteUrl" type="url" placeholder="Personal Website URL (Optional)" value={formData.websiteUrl} onChange={handleChange} className="input-field" />
                        <input name="linkedinProfile" type="url" placeholder="LinkedIn Profile URL (Optional)" value={formData.linkedinProfile} onChange={handleChange} className="input-field" />
                        <input name="portfolioUrl" type="url" placeholder="Portfolio URL (Optional)" value={formData.portfolioUrl} onChange={handleChange} className="input-field" />
                    </div>

                    {/* FILE UPLOAD OPTION */}
                    <FileUploadComponent
                        label={<><ImageIcon className="w-4 h-4 mr-1" /> Profile Logo/Avatar (PNG/JPG/SVG)</>}
                        fieldName="logoFile"
                        file={formData.logoFile}
                        setFile={handleFileChange}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-md 
                            text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Submitting...' : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                Submit Profile for Approval
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- POST CONSULTATION FORM COMPONENT (REVIEW) ---
const PostConsultationForm = ({ consultant, userId, onClose }) => {
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [userName, setUserName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userName || !feedback) {
            setMessage({ type: 'error', text: 'Please fill out your name and feedback before submitting.' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        const reviewData = {
            consultantId: consultant.id,
            consultantName: consultant.name,
            rating: rating,
            feedback: feedback,
            userName: userName,
            submittedAt: new Date().toISOString(),
            submittedBy: userId,
        };

        try {
            // FIX: Using the global 'db' variable
            await addDoc(collection(db, "consultation_reviews"), reviewData);
            
            setMessage({ type: 'success', text: 'Thank you! Your feedback has been saved successfully.' });
            setTimeout(onClose, 2000);
        } catch (error) {
            console.error("Error submitting review: ", error);
            setMessage({ type: 'error', text: 'Failed to submit feedback. Check console for details.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Post Consultation Review</h2>
                {/* FIX: Corrected template literal for string interpolation */}
                <p className="text-sm text-gray-500 mb-6">
                    Sharing your experience with **{consultant.name}** helps the community.
                </p>

                {message && (
                    // FIX: Added missing backticks
                    <div className={`p-3 mb-4 rounded-lg ${message.type === 'success' ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="text-gray-700 font-medium">Your Name:</span>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="e.g., Alex D."
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="text-gray-700 font-medium">Rating:</span>
                        <div className="flex items-center space-x-2 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    // FIX: Added missing backticks
                                    className={`w-8 h-8 cursor-pointer transition-colors ${rating >= star ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                            <span className="text-lg font-bold ml-2">{rating} / 5</span>
                        </div>
                    </label>

                    <label className="block">
                        <span className="text-gray-700 font-medium">Feedback:</span>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Share your experience..."
                            required
                        ></textarea>
                    </label>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-md 
                            text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Submitting...' : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                Submit Review
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- CONSULTANT PROFILE PAGE COMPONENT (FINAL FIXED UI) ---
const ConsultantProfilePage = ({ consultant, onBack, userId }) => {
    const defaultLogoUrl = "https://placehold.co/120x120/CCCCCC/000000?text=U";
    const logoUrl = consultant.logoUrl || defaultLogoUrl;

    // Background placeholder - Using the provided URL
    const backgroundUrl = "https://media.licdn.com/dms/image/v2/C4D12AQHMPBvE3avWzg/article-inline_image-shrink_1000_1488/article-inline_image-shrink_1000_1488/0/1616872522462?e=1762387200&v=beta&t=OPS9nEHcsB3lHcgPThhoTSHwn2mkA5If2RazkElTa0g";

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // --- Generate Dynamic Google Calendar Link ---
    const generateCalendarLink = (consultant) => {
        const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
        // FIX: Added missing backticks
        const text = encodeURIComponent(`Algorand Consultation: ${consultant.title}`);
        const details = encodeURIComponent(`Booking request for a session with ${consultant.name} (${consultant.specialty}). Please suggest a time.`);
        const add = encodeURIComponent(consultant.email);

        return `${baseUrl}&text=${text}&details=${details}&add=${add}`;
    };

    const calendarLink = generateCalendarLink(consultant);


    return (
        <>
            {/* FIX: Removed 'overflow-hidden' from max-w-4xl container to prevent logo clipping */}
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl mb-10 relative"> 
                
                {/* Header and Back Button (TOP BAR) */}
                <div className="p-4 sm:p-6 flex items-center justify-between border-b">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center text-teal-600 hover:text-teal-800 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Experts List
                    </button>
                </div>

                {/* Profile Background (THE GREEN BANNER) */}
                <div className="relative">
                    <img
                        src={backgroundUrl}
                        alt="Profile Background"
                        className="w-full h-48 object-cover object-center"
                        // NOTE: Keeping the fallback handler in case the primary image fails
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/1200x200/2C7C7C/FFFFFF?text=PROFILE+BANNER" }}
                    />
                </div>

                {/* Logo - This element is deliberately positioned outside the content flow via 'absolute' */}
                <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                    <img
                        src={logoUrl}
                        // FIX: Added missing backticks
                        alt={`${consultant.name} Logo`}
                        className="w-36 h-36 object-cover rounded-full border-4 border-white shadow-xl"
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultLogoUrl }}
                    />
                </div>
            </div>

            {/* Content Area - Adjusted pt-padding and ml-40 for name alignment */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 p-8 pt-20 space-y-8 sm:pt-24">
                
                {/* Name and Title */}
                <div className="mb-8 -mt-10 sm:-mt-12 text-left sm:ml-40">
                    <h1 className="text-3xl font-extrabold text-gray-900">{consultant.name}</h1>
                    <p className="text-xl font-medium text-gray-700">{consultant.title}</p>
                </div>

                {/* Key Metrics */}
                <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-700 border-b pb-6">
                    <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                        <DollarSign className="w-4 h-4 mr-1 text-teal-600" />
                        Rate: <span className="ml-1 font-bold text-teal-600">{consultant.rate}</span>
                    </span>
                    <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                        Rating: <span className="ml-1 font-bold">{consultant.rating}</span>
                    </span>
                    <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4 mr-1 text-gray-500" />
                        Experience: <span className="ml-1 font-bold">{consultant.experience} Years</span>
                    </span>
                    <span className="flex items-center bg-teal-100 px-3 py-1 rounded-full text-teal-800">
                        <Briefcase className="w-4 h-4 mr-1" />
                        Specialty: <span className="ml-1 font-bold">{consultant.specialty}</span>
                    </span>
                </div>

                {/* Description */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">About {consultant.name}</h2>
                    <p className="text-gray-600 leading-relaxed">
                        {consultant.description || "No detailed description provided yet. Contact the expert directly for more information."}
                    </p>
                </div>

                {/* Achievements Section */}
                {consultant.achievements && (
                    <div className="pb-4">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center">
                            <Award className="w-6 h-6 mr-2 text-yellow-600" /> Key Achievements
                        </h2>
                        <ul className="text-gray-600 list-disc list-inside space-y-1 pl-4">
                            {(consultant.achievements || '').split('. ').map((achievement, index) =>
                                achievement.trim() && (
                                    <li key={index} className="text-base">{achievement.trim().endsWith('.') ? achievement.trim() : achievement.trim() + '.'}</li>
                                )
                            )}
                        </ul>
                    </div>
                )}

                {/* Contact Links Section */}
                <div className="space-y-4 border-t pt-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Contact & Links</h2>
                    <div className="flex flex-wrap gap-4">
                        {/* Email Link (Always available) */}
                        {consultant.email && (
                            <a
                                // FIX: Added missing backticks
                                href={`mailto:${consultant.email}`}
                                className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <Mail className="w-4 h-4 mr-2 text-red-500" />
                                Email {consultant.name.split(' ')[0]}
                            </a>
                        )}

                        {/* Website Link (Optional) */}
                        {consultant.websiteUrl && (
                            <a
                                href={consultant.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <Globe className="w-4 h-4 mr-2 text-blue-500" />
                                Website
                            </a>
                        )}

                        {/* LinkedIn Link (Optional) */}
                        {consultant.linkedinProfile && (
                            <a
                                href={consultant.linkedinProfile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
                                LinkedIn Profile
                            </a>
                        )}

                        {/* Portfolio Link (Optional) */}
                        {consultant.portfolioUrl && (
                            <a
                                href={consultant.portfolioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4 mr-2 text-teal-700" />
                                Portfolio
                            </a>
                        )}
                    </div>
                </div>

                {/* Booking Line with Redirect & Review Button */}
                <div className="border-t pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-teal-600 mb-4">Book a Session Now</h2>
                        <a
                            href={calendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-full shadow-xl 
                                                         text-white bg-teal-600 hover:bg-teal-700 transition-transform duration-150 transform hover:scale-[1.01] hover:shadow-2xl"
                        >
                            <Calendar className="w-5 h-5 mr-3" />
                            Schedule on Google Calendar
                            <LinkIcon className="w-4 h-4 ml-2" />
                        </a>
                    </div>

                    {/* Post Consultation Button - Opens Review Form */}
                    <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md 
                                                         text-gray-800 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                        <Star className="w-4 h-4 mr-2" /> Post Consultation Review
                    </button>

                </div>
            </div>

            {/* Review Modal */}
            {
                isReviewModalOpen && (
                    <PostConsultationForm
                        consultant={consultant}
                        userId={userId}
                        onClose={() => setIsReviewModalOpen(false)}
                    />
                )
            }
        </>
    );
};


// --- CONSULTANT CARD COMPONENT (LIST ITEM) ---
const ConsultantCard = ({ consultant, onBook }) => {
    const defaultLogoUrl = "https://placehold.co/48x48/CCCCCC/000000?text=U";
    const logoUrl = consultant.logoUrl || defaultLogoUrl;
    return (
        <div
            className=" block bg-white rounded-xl shadow-xl p-5 transition-all duration-300 hover:shadow-2xl hover:border-teal-400 border border-transparent flex items-center justify-between group min-h-[120px]"
        >

            {/* --- LEFT COLUMN: Logo, Name, Title, Specialty --- */}
            <div className="flex items-start flex-grow pr-4 max-w-[55%] min-w-0">

                {/* Logo */}
                <img
                    src={logoUrl}
                    // FIX: Added missing backticks
                    alt={`${consultant.name} Logo`}
                    className="w-12 h-12 object-cover rounded-full border p-0.5 mr-4 flex-shrink-0 border-teal-300"
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultLogoUrl }}
                />

                {/* Name, Title & Specialty */}
                <div className="flex-grow min-w-0 text-left">
                    <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">{consultant.name}</h3>
                    <p className="text-sm text-gray-500 mb-1 truncate">{consultant.title}</p>
                    {/* Specialty Tag */}
                    <span className="flex items-center text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full w-fit">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {consultant.specialty}
                    </span>
                </div>
            </div>

            {/* --- RIGHT COLUMN: Metadata, Rate & Action --- */}
            <div className="flex items-center space-x-6 flex-shrink-0">

                {/* Metadata Column (Experience & Rating) */}
                <div className="hidden sm:block text-xs text-gray-600 text-left space-y-1 pr-4 border-r border-gray-100">
                    <div className="flex items-center text-sm font-semibold text-gray-700">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{consultant.experience} Yrs Exp.</span>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center text-yellow-500 text-sm font-semibold pt-1">
                        <Star className="w-4 h-4 mr-1" fill="currentColor" />
                        <span>{consultant.rating} Rating</span>
                    </div>
                </div>

                {/* Hourly/Session Rate */}
                <span className="text-xl font-extrabold text-teal-600 w-36 text-right flex-shrink-0">
                    {consultant.rate}
                </span>

                {/* Button to open Profile Page */}
                <button
                    onClick={() => onBook(consultant)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-md 
                        text-white bg-teal-600 hover:bg-teal-700 transition-colors flex-shrink-0"
                >
                    <Calendar className="w-4 h-4 mr-2" /> View Profile
                </button>
            </div>
        </div>
    );
};

// --- MAIN CONSULTATIONS PAGE ---
const ConsultationsPage = () => {
    // Initialize state with mock data
    const [localConsultantData, setLocalConsultantData] = useState(mockConsultantData);

    // Handler to accept new consultant and add to the local list
    const handleNewConsultant = (newConsultant) => {
        setLocalConsultantData(prev => [newConsultant, ...prev]);
    };

    // --- FIREBASE STATE ---
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        // Sign in anonymously and set up auth listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                signInAnonymously(auth)
                    .then(result => setUserId(result.user.uid))
                    .catch(error => console.error("Anonymous Sign-In Failed:", error));
            }
            setIsAuthReady(true);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // FIREBASE DATA FETCH EFFECT
    useEffect(() => {
        const fetchConsultants = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "consultants"));
                const fetchedConsultants = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    rating: doc.data().rating || 5.0,
                    experience: doc.data().experience || 0,
                }));

                setLocalConsultantData(prevMockData => {
                    const existingIds = new Set(fetchedConsultants.map(c => c.id));
                    const uniqueMockData = prevMockData.filter(mock => !existingIds.has(mock.id.toString()));

                    return [...fetchedConsultants, ...uniqueMockData];
                });

            } catch (error) {
                console.error("Error fetching consultants from Firestore:", error);
            }
        };

        if (isAuthReady) {
            fetchConsultants();
        }
    }, [isAuthReady]);

    // --- END FIREBASE STATE ---

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedField, setSelectedField] = useState('All Specialties');
    const [sortBy, setSortBy] = useState('Highest Rated');

    // --- State for View Control ---
    const [view, setView] = useState('list'); 
    const [selectedConsultant, setSelectedConsultant] = useState(null);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);


    // Handler to open the profile page
    const handleViewProfile = (consultant) => {
        setSelectedConsultant(consultant);
        setView('profile');
    };

    // Handler to return to the list view
    const handleBackToList = () => {
        setView('list');
        setSelectedConsultant(null);
    };

    // Filtering and Sorting Logic using useMemo for efficiency
    const filteredConsultants = useMemo(() => {
        return localConsultantData
            .filter(consultant => {
                const lowerSearch = searchTerm.toLowerCase();
                const matchesSearch =
                    (consultant.name && consultant.name.toLowerCase().includes(lowerSearch)) ||
                    (consultant.title && consultant.title.toLowerCase().includes(lowerSearch)) ||
                    (consultant.specialty && consultant.specialty.toLowerCase().includes(lowerSearch));

                // Corrected field matching logic to check for inclusion
                const matchesField = selectedField === 'All Specialties' || 
                                     (consultant.specialty && 
                                      consultant.specialty.toLowerCase().includes(selectedField.toLowerCase()));

                return matchesSearch && matchesField;
            })
            .sort((a, b) => {
                // Sorting Logic
                if (sortBy === 'Highest Rated') {
                    return b.rating - a.rating;
                }
                if (sortBy === 'Experience (High)') {
                    return b.experience - a.experience;
                }
                if (sortBy === 'Rate (High)') {
                    const rateA = getComparableRate(a.rate);
                    const rateB = getComparableRate(b.rate);
                    return rateB - rateA;
                }

                return 0; // Maintain current order
            });
    }, [searchTerm, selectedField, sortBy, localConsultantData]);


    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-teal-50">
                <p className="text-xl text-gray-700 flex items-center">
                    <Clock className="w-5 h-5 mr-2 animate-spin" /> Loading Authentication...
                </p>
            </div>
        );
    }


    return (
        <div
            className="min-h-screen bg-gradient-to-br from-white to-teal-50 py-10 sm:py-16 font-sans relative"
        >
            <FormStyles />

            {/* --- Conditional Rendering --- */}
            {view === 'list' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Main Header & Search Bar */}
                    <div className="mb-10 text-center">
                        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Book Expert Consultations</h1>
                        <p className="text-lg text-gray-600 mb-6">Find certified specialists for 1:1 sessions.</p>

                        {/* Centralized Search Bar */}
                        <div className="max-w-3xl mx-auto relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search experts by name, title, or specialty..."
                                className="w-full py-4 pl-12 pr-4 border border-gray-300 rounded-full shadow-lg 
                                    focus:ring-teal-500 focus:border-teal-500 text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* New Registration Button */}
                        <button
                            onClick={() => setIsRegistrationModalOpen(true)}
                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-md 
                                text-white bg-teal-500 hover:bg-teal-600 transition-colors"
                        >
                            <UserPlus className="w-4 h-4 mr-2" /> Register as a Consultant
                        </button>
                    </div>

                    {/* --- Listings Section --- */}
                    <div className="w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-3">
                            <h3 className="text-lg font-medium text-gray-700 mb-3 sm:mb-0">Showing {filteredConsultants.length} Experts Available</h3>

                            {/* Sort/Filter Dropdowns */}
                            <div className="flex space-x-4 items-center">

                                {/* Field Filter Dropdown */}
                                <div className="relative flex items-center">
                                    <Code className="w-4 h-4 text-gray-500 mr-2" />
                                    <select
                                        className="appearance-none py-2 pl-3 pr-10 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 cursor-pointer focus:ring-teal-500 focus:border-teal-500"
                                        value={selectedField}
                                        onChange={(e) => setSelectedField(e.target.value)}
                                    >
                                        {EXPERT_FIELDS.map(field => (
                                            <option key={field} value={field}>{field}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Sort By Dropdown */}
                                <div className="relative">
                                    <select
                                        className="appearance-none py-2 px-4 pr-10 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 cursor-pointer focus:ring-teal-500 focus:border-teal-500"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="Highest Rated">Sort by Rating (High)</option>
                                        <option value="Experience (High)">Sort by Experience</option>
                                        <option value="Rate (High)">Sort by Rate (High)</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Consultant Listings */}
                        <div className="grid grid-cols-1 gap-6">
                            {filteredConsultants.map(consultant => (
                                <ConsultantCard
                                    key={consultant.id}
                                    consultant={consultant}
                                    onBook={handleViewProfile}
                                />
                            ))}
                            {filteredConsultants.length === 0 && (
                                <p className="text-gray-500 col-span-full py-10 text-center">No consultants found matching your criteria.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Render Profile Page */}
            {view === 'profile' && selectedConsultant && (
                <ConsultantProfilePage
                    consultant={selectedConsultant}
                    onBack={handleBackToList}
                    userId={userId}
                />
            )}

            {/* Registration Modal */}
            {isRegistrationModalOpen && (
                <ConsultantRegistrationForm
                    onClose={() => setIsRegistrationModalOpen(false)}
                    onNewConsultant={handleNewConsultant}
                />
            )}
        </div>
    );
};


export default ConsultationsPage;