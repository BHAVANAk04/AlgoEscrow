// ASSUMING you have a file: src/firebase.js
// which looks something like this:
/*
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ... config ...
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
*/


import React, { useState } from 'react';
// 1. Import your Firebase connection and Firestore methods
import { db } from '../firebase'; // Import the initialized db from your setup file
import { addDoc, collection } from 'firebase/firestore'; // Import Firestore functions

import { Briefcase, Building2, MapPin, DollarSign, ArrowRight, List, Package, Link, UploadCloud } from 'lucide-react';

const ClientProfilePage = () => {
    const [formData, setFormData] = useState({
        // Client/Company Profile Fields
        companyName: '',
        companyBio: '',
        companyWebsite: '',
        companyLocation: '',
        
        // Job Post Fields
        jobTitle: '',
        jobDescription: '',
        employmentType: 'Fixed Project',
        budgetMin: '',
        budgetMax: '',
        paymentASA: 'ALGO',
        
        // Application Requirements Fields (NEW)
        proposalLink: '',
        requiresFileUpload: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e) => { // 2. Make handleSubmit asynchronous
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null); // Clear previous errors

        // Separate data into two objects for two different collections
        const clientData = {
            companyName: formData.companyName,
            companyBio: formData.companyBio,
            companyWebsite: formData.companyWebsite,
            companyLocation: formData.companyLocation,
            // Add a timestamp
            profileCreatedAt: new Date(),
            // You should also include the user's UID here from Firebase Auth: userId: auth.currentUser.uid,
        };

        const jobData = {
            jobTitle: formData.jobTitle,
            jobDescription: formData.jobDescription,
            employmentType: formData.employmentType,
            budgetMin: Number(formData.budgetMin), // Store numbers as numbers
            budgetMax: Number(formData.budgetMax),
            paymentASA: formData.paymentASA,
            proposalLink: formData.proposalLink,
            requiresFileUpload: formData.requiresFileUpload,
            jobPostedAt: new Date(),
            // Link job to client profile (we'll update this after saving clientData)
            clientId: null, 
        };

        try {
            // --- 3. SAVE CLIENT PROFILE ---
            const clientCollectionRef = collection(db, "clients");
            const clientDocRef = await addDoc(clientCollectionRef, clientData);
            
            // --- 4. SAVE JOB POST (and link it to the new client profile) ---
            jobData.clientId = clientDocRef.id; // Use the newly created client ID
            
            const jobCollectionRef = collection(db, "jobs");
            await addDoc(jobCollectionRef, jobData);

            // Success feedback
            alert("Success! Your job has been posted and your client profile is active.");
            // navigate('/client/dashboard'); // Replace alert with navigation
            
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
                
                {/* Header */}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* 1. Company Information */}
                    <SectionTitle icon={Building2} title="Client & Company Information" />
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
                    
                    {/* 2. Job Details */}
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

                    {/* 3. Budget and Type */}
                    <SectionTitle icon={DollarSign} title="Budget & Payment Terms" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Employment Type */}
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
                        
                        {/* Budget Range */}
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

                        {/* Payment Currency */}
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
                    
                    {/* 4. Application Requirements (NEW SECTION) */}
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

// --- Helper Form Components (NO CHANGE) ---
// (SectionTitle, InputGroup, and TextAreaGroup components remain unchanged)

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