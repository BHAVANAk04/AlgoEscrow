import React, { useState } from 'react';
// Import Firestore methods (NOT Realtime Database)
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

// 1. ADD: The 'Image' icon is now needed for the LogoUploadGroup component
import { Briefcase, Building2, MapPin, DollarSign, ArrowRight, List, Package, Link, UploadCloud, Image } from 'lucide-react';

const ClientProfilePage = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        companyBio: '',
        companyWebsite: '',
        companyLocation: '',
        jobTitle: '',
        jobDescription: '',
        employmentType: 'Fixed Project',
        budgetMin: '',
        budgetMax: '',
        paymentASA: 'ALGO',
        proposalLink: '',
        requiresFileUpload: false,
    });

    // 2. ADD: New state for the logo file and its preview URL
    const [companyLogoFile, setCompanyLogoFile] = useState(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // 3. ADD: Handles file change for the logo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCompanyLogoFile(file);
            setLogoPreviewUrl(URL.createObjectURL(file)); // Create a local URL for preview
        } else {
            setCompanyLogoFile(null);
            setLogoPreviewUrl(null);
        }
    };
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    // 4. ADD: Placeholder for image upload to Firebase Storage
    const uploadLogoToStorage = async (file) => {
        // In a real application, you would implement this logic:
        // import { storage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
        // const storageRef = ref(storage, `logos/${file.name}_${Date.now()}`);
        // await uploadBytes(storageRef, file);
        // const logoURL = await getDownloadURL(storageRef);
        
        console.log(`Simulating logo upload for file: ${file.name}`);
        // Returning a placeholder URL for a working Firestore submission.
        return "https://i.imgur.com/placeholder-logo.png";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        // 5. UPDATE: Add logo upload logic to handleSubmit
        let logoURL = '';
        try {
            if (companyLogoFile) {
                logoURL = await uploadLogoToStorage(companyLogoFile);
            }

            const clientData = {
                companyName: formData.companyName,
                companyBio: formData.companyBio,
                companyWebsite: formData.companyWebsite,
                companyLocation: formData.companyLocation,
                companyLogoUrl: logoURL, // 5.1. ADD: logo URL to clientData
                profileCreatedAt: new Date(),
            };

            const jobData = {
                jobTitle: formData.jobTitle,
                jobDescription: formData.jobDescription,
                employmentType: formData.employmentType,
                budgetMin: Number(formData.budgetMin),
                budgetMax: Number(formData.budgetMax),
                paymentASA: formData.paymentASA,
                proposalLink: formData.proposalLink,
                requiresFileUpload: formData.requiresFileUpload,
                jobPostedAt: new Date(),
                clientId: null,
            };

            // --- SAVE CLIENT PROFILE (Firestore) ---
            const clientCollectionRef = collection(db, "clients");
            const clientDocRef = await addDoc(clientCollectionRef, clientData);
            
            const clientId = clientDocRef.id;
            
            // --- SAVE JOB POST (linked to client) ---
            jobData.clientId = clientId;
            
            const jobCollectionRef = collection(db, "jobs");
            await addDoc(jobCollectionRef, jobData);

            alert("Success! Your job has been posted and your client profile is active.");
            
            // 5.2. UPDATE: Reset form and new logo states
            setFormData({
                companyName: '',
                companyBio: '',
                companyWebsite: '',
                companyLocation: '',
                jobTitle: '',
                jobDescription: '',
                employmentType: 'Fixed Project',
                budgetMin: '',
                budgetMax: '',
                paymentASA: 'ALGO',
                proposalLink: '',
                requiresFileUpload: false,
            });
            setCompanyLogoFile(null);
            setLogoPreviewUrl(null);
            
        } catch (error) {
            console.error("Error posting job and profile:", error);
            setSubmitError(`Failed to submit data: ${error.message}. Please check your connection and Firebase rules.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0e6d6] py-10 sm:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-xl shadow-2xl">
                
                <div className="text-center mb-10">
                    <Briefcase className="w-12 h-12 mx-auto text-teal-600 mb-3" />
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Post Your First Decentralized Gig
                    </h1>
                    <p className="mt-2 text-md text-gray-500">
                        Create your client profile and list a job to start securing top talent using our escrow system.
                    </p>
                </div>

                {submitError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <p className="font-medium">Submission Error:</p>
                        <p className="text-sm">{submitError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    <SectionTitle icon={Building2} title="Client & Company Information" />

                    {/* 6. ADD: Logo Upload Component */}
                    <LogoUploadGroup 
                        id="companyLogo"
                        label="Company Logo (Optional)"
                        file={companyLogoFile}
                        previewUrl={logoPreviewUrl}
                        onChange={handleFileChange}
                    />

                    <InputGroup 
                        id="companyName"
                        name="companyName"
                        label="Company / Project Name"
                        placeholder="e.g., SecureChain Inc."
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            id="companyWebsite"
                            name="companyWebsite"
                            label="Company Website (Optional)"
                            placeholder="https://www.yourdao.com"
                            value={formData.companyWebsite}
                            onChange={handleChange}
                        />
                        <InputGroup 
                            id="companyLocation"
                            name="companyLocation"
                            label="Location"
                            placeholder="e.g., Remote, San Francisco, or Berlin"
                            value={formData.companyLocation}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <TextAreaGroup
                        id="companyBio"
                        name="companyBio"
                        label="Brief Company Description"
                        placeholder="Describe what your company does and why talent should work with you."
                        value={formData.companyBio}
                        onChange={handleChange}
                        rows={3}
                        required
                    />
                    
                    <SectionTitle icon={List} title="Job / Gig Details" />
                    <InputGroup 
                        id="jobTitle"
                        name="jobTitle"
                        label="Job Title"
                        placeholder="e.g., PyTeal Smart Contract Auditor or DeFi Analyst"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        required
                    />
                    <TextAreaGroup
                        id="jobDescription"
                        name="jobDescription"
                        label="Detailed Job Description & Requirements"
                        placeholder="Outline the scope, deliverables, and required skills for this gig."
                        value={formData.jobDescription}
                        onChange={handleChange}
                        rows={7}
                        required
                    />

                    <SectionTitle icon={DollarSign} title="Budget & Payment Terms" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
                                Gig Type
                            </label>
                            <select
                                id="employmentType"
                                name="employmentType"
                                value={formData.employmentType}
                                onChange={handleChange}
                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg shadow-sm"
                            >
                                <option value="Fixed Project">Fixed Project (Lump Sum)</option>
                                <option value="Hourly Contract">Hourly Contract (Time Tracking)</option>
                                <option value="Consultation">Consultation (Session)</option>
                                <option value="Retainer">Retainer (Monthly)</option>
                            </select>
                        </div>
                        
                        <InputGroup 
                            id="budgetMin"
                            name="budgetMin"
                            label="Min Budget (ALGO/Unit)"
                            type="number"
                            placeholder="500"
                            value={formData.budgetMin}
                            onChange={handleChange}
                            required
                        />
                        <InputGroup 
                            id="budgetMax"
                            name="budgetMax"
                            label="Max Budget (ALGO/Unit)"
                            type="number"
                            placeholder="2000"
                            value={formData.budgetMax}
                            onChange={handleChange}
                            required
                        />

                        <div>
                            <label htmlFor="paymentASA" className="block text-sm font-medium text-gray-700">
                                Payment Currency
                            </label>
                            <select
                                id="paymentASA"
                                name="paymentASA"
                                value={formData.paymentASA}
                                onChange={handleChange}
                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg shadow-sm"
                            >
                                <option value="ALGO">ALGO</option>
                                <option value="USDC">USDC (ASA)</option>
                                <option value="OTHER">Other ASA</option>
                            </select>
                        </div>
                    </div>
                    
                    <SectionTitle icon={Package} title="Application Requirements" />
                    <InputGroup 
                        id="proposalLink"
                        name="proposalLink"
                        label="External Proposal Link (e.g., Google Form, Typeform)"
                        placeholder="https://docs.google.com/forms/d/..."
                        value={formData.proposalLink}
                        onChange={handleChange}
                        required
                    />

                    <div className="flex items-start">
                        <div className="flex items-center h-5 mt-1">
                            <input
                                id="requiresFileUpload"
                                name="requiresFileUpload"
                                type="checkbox"
                                checked={formData.requiresFileUpload}
                                onChange={handleChange}
                                className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="requiresFileUpload" className="font-medium text-gray-700">
                                Require direct file upload (CV/Proposal Document)
                            </label>
                            <p className="text-gray-500">Checking this allows candidates to attach a document directly to their proposal on our platform.</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg 
                                text-white bg-teal-600 hover:bg-teal-700 
                                transition-colors duration-200 ease-in-out disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Posting Job...
                                </div>
                            ) : (
                                <>
                                    Post Job & Secure Funds 
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
// -------------------------------------------------------------
// 7. ADD: New Logo Upload Group Component
// -------------------------------------------------------------
const LogoUploadGroup = ({ id, label, file, previewUrl, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
        </label>
        <div className="mt-1 flex items-center space-x-4">
            {/* Logo Preview */}
            <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center">
                {previewUrl ? (
                    <img src={previewUrl} alt="Company Logo Preview" className="h-full w-full object-cover" />
                ) : (
                    <Image className="h-8 w-8 text-gray-400" />
                )}
            </div>
            
            <div className="relative">
                <input
                    type="file"
                    id={id}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={onChange}
                    accept="image/*"
                />
                <button
                    type="button"
                    onClick={() => document.getElementById(id).click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                    <UploadCloud className="w-5 h-5 mr-2" />
                    {file ? 'Change Logo' : 'Upload Logo'}
                </button>
                {file && (
                    <span className="ml-3 text-sm text-gray-500 truncate max-w-xs block">
                        {file.name}
                    </span>
                )}
            </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
            JPG or PNG, max 1MB. Will be used for your profile.
        </p>
    </div>
);


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

export default ClientProfilePage;