import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    Building2, 
    MapPin, 
    DollarSign, 
    Briefcase, 
    Calendar,
    Clock,
    Globe,
    CheckCircle,
    Send,
    Upload,
    ExternalLink,
    X, 
    FileText,
    Loader2,
    AlertTriangle
} from 'lucide-react';

// ✅ FIRESTORE IMPORTS
import { db } from '../firebase'; 
import { doc, getDoc } from 'firebase/firestore'; 

// --- Helper Component: Application Modal (Unchanged) ---
const ApplicationModal = ({ jobTitle, show, onClose }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadComplete(false);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setUploadComplete(true);
        }, 1500); 
    };

    const resetState = () => {
        setFile(null);
        setIsUploading(false);
        setUploadComplete(false);
        onClose();
    };

    if (!show) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 transition-opacity duration-300"
            onClick={resetState}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Upload className="w-6 h-6 mr-3 text-teal-600" />
                        Upload Document
                    </h3>
                    <button onClick={resetState} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    Optional: Upload your CV, Portfolio, or a supporting document for **{jobTitle}**.
                </p>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                    />
                    <label 
                        htmlFor="file-upload"
                        className="cursor-pointer text-teal-600 font-semibold hover:text-teal-700 block"
                    >
                        <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        Click to select file
                    </label>
                    <p className="text-sm text-gray-500 mt-2">PDF, DOC, or DOCX up to 5MB</p>

                    {file && (
                        <div className="mt-4 flex items-center justify-between bg-teal-50 p-3 rounded-lg border border-teal-200">
                            <span className="text-sm text-gray-700 font-medium truncate">
                                {file.name}
                            </span>
                            <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 ml-3">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Status and Action Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading || uploadComplete}
                    className={`w-full inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg transition-colors ${
                        !file
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isUploading
                            ? 'bg-teal-700 text-white cursor-wait'
                            : uploadComplete
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                >
                    {isUploading ? (
                        <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                        </>
                    ) : uploadComplete ? (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" /> Upload Complete!
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" /> Finalize Upload
                        </>
                    )}
                </button>
                <button
                    onClick={resetState}
                    className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

// --- Helper Component for Sidebar Details (Unchanged) ---
const DetailItem = ({ icon: Icon, title, value, valueColor = 'text-gray-700' }) => (
    <div className="flex items-start">
        <Icon className="w-4 h-4 mr-3 text-gray-400 mt-1 flex-shrink-0" />
        <div>
            <p className="font-medium text-gray-600">{title}</p>
            <p className={`text-base ${valueColor}`}>{value}</p>
        </div>
    </div>
);

// --- Main Component ---
const JobDetailPage = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApplicationModal, setShowApplicationModal] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // 1. Fetch the Job Document
                const jobDocRef = doc(db, "jobs", id);
                const jobSnapshot = await getDoc(jobDocRef);

                if (!jobSnapshot.exists()) {
                    setJob(null);
                    setLoading(false);
                    return;
                }
                
                const jobData = jobSnapshot.data();
                
                // 2. Fetch the Client Document (Company Info)
                const clientId = jobData.clientId; 
                let companyData = {};

                if (clientId) {
                    const clientDocRef = doc(db, "clients", clientId);
                    const clientSnapshot = await getDoc(clientDocRef);

                    if (clientSnapshot.exists()) {
                        companyData = clientSnapshot.data();
                    }
                }

                // 3. Merge data and set state
                const jobPostedAt = jobData.jobPostedAt?.toDate?.() || new Date();
                const jobDeadline = jobData.applicationDeadline?.toDate?.() || 'N/A';
                
                const finalJobData = {
                    id: jobSnapshot.id,
                    jobTitle: jobData.jobTitle || 'Untitled Job',
                    jobDescription: jobData.jobDescription || 'No description provided.',
                    
                    companyName: companyData.companyName || 'Company Name Not Provided',
                    companyBio: companyData.companyBio || 'No company biography available.',
                    companyWebsite: companyData.companyWebsite || null,
                    
                    companyLocation: jobData.companyLocation || 'Remote',
                    // Defaulting to a large image placeholder if not found
                    logoUrl: companyData.companyLogo || jobData.companyLogo || 'https://placehold.co/96x96/CCCCCC/000000?text=L',
                    employmentType: jobData.employmentType || 'Fixed Project',
                    budgetMin: jobData.budgetMin || 0,
                    budgetMax: jobData.budgetMax || 0,
                    paymentASA: jobData.paymentASA || 'ALGO',
                    
                    proposalLink: jobData.proposalLink || '#',
                    requiresFileUpload: jobData.requiresFileUpload || false,
                    
                    postedDate: jobPostedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    deadline: jobDeadline !== 'N/A' ? jobDeadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
                    
                    isFeatured: jobData.isFeatured || false,
                };

                setJob(finalJobData);
            } catch (err) {
                console.error("Error fetching job details:", err);
                setError(`Failed to load job details. Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJob();
        }
    }, [id]);

    // --- RENDER LOGIC: Loading, Error, Not Found (Omitted for brevity, kept functional) ---
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-3" />
                    <p className="text-xl text-gray-700">Loading gig details...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
                <div className="text-center p-8 bg-red-50 border border-red-300 rounded-lg max-w-lg">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-red-800 mb-2">Data Load Failed</h1>
                    <p className="text-red-700">{error}</p>
                    <Link to="/jobs" className="mt-4 inline-block text-red-600 hover:text-red-700 font-semibold">
                        ← Back to Jobs
                    </Link>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Job Not Found</h1>
                    <Link to="/jobs" className="text-teal-600 hover:text-teal-700 font-semibold">
                        ← Back to Jobs
                    </Link>
                </div>
            </div>
        );
    }
    
    // --- Job Styling ---
    let typeBadgeColor = 'bg-gray-100 text-gray-700';
    switch (job.employmentType) {
        case 'Fixed Project':
            typeBadgeColor = 'bg-red-100 text-red-700';
            break;
        case 'Hourly Contract':
            typeBadgeColor = 'bg-blue-100 text-blue-700';
            break;
        case 'Retainer':
            typeBadgeColor = 'bg-green-100 text-green-700';
            break;
        case 'Part Time':
            typeBadgeColor = 'bg-purple-100 text-purple-700';
            break;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Back Button */}
                <div className="max-w-7xl mx-auto mb-6">
                    <Link 
                        to="/jobs" 
                        className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Gigs
                    </Link>
                </div>

                {/* IMAGE CONTAINER - New Section for Full-Width Image */}
                {/* Using max-w-4xl to center it, similar to the blog post's image width */}
                <div className="max-w-4xl mx-auto px-4 mb-8">
                    <div className="w-full rounded-2xl shadow-xl overflow-hidden h-[250px] sm:h-[350px]">
                        <img 
                            src={job.logoUrl} 
                            alt={job.companyName}
                            // Using object-contain or object-cover based on what type of image it is
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.src="https://placehold.co/1200x350/CCCCCC/000000?text=LOGO+Image" }}
                        />
                    </div>
                </div>

                {/* HEADER SECTION (Centered Text/Title Block) */}
                <div className="max-w-3xl mx-auto pt-4 pb-12 text-center px-4">
                    
                    {/* Placeholder/Context Text */}
                    <p className="text-sm text-gray-500 mb-2">
                        Posted by <span className='font-medium text-teal-700'>{job.companyName}</span> on {job.postedDate}
                    </p>
                    
                    {/* Job Title */}
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                        {job.jobTitle}
                    </h1>
                    
                    {/* Quick Info Tags below Title */}
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${typeBadgeColor}`}>
                            <Briefcase className="w-4 h-4 mr-2" />
                            {job.employmentType}
                        </span>
                        <span className="px-4 py-2 rounded-full text-sm font-medium flex items-center bg-teal-50 text-teal-700">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {job.budgetMin} - {job.budgetMax} {job.paymentASA}
                        </span>
                        <span className="px-4 py-2 rounded-full text-sm font-medium flex items-center bg-gray-100 text-gray-700">
                            <MapPin className="w-4 h-4 mr-2" />
                            {job.companyLocation}
                        </span>
                    </div>

                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> 
                    
                    {/* LEFT COLUMN: Job Details and Company Info */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Job Description Card (Primary Content) */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center border-b pb-3">
                                <Briefcase className="w-6 h-6 mr-3 text-teal-600" />
                                Job Details
                            </h2>
                            <div className="prose prose-base max-w-none text-gray-700 whitespace-pre-line">
                                {job.jobDescription}
                            </div>
                        </div>

                        {/* Company Info Card (Secondary Content) */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center border-b pb-3">
                                <Building2 className="w-6 h-6 mr-3 text-teal-600" />
                                About {job.companyName}
                            </h2>
                            <p className="text-gray-700 mb-6">{job.companyBio}</p>
                            
                            {job.companyWebsite && (
                                <a 
                                    href={job.companyWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-colors bg-teal-50 p-3 rounded-lg"
                                >
                                    <Globe className="w-4 h-4 mr-2" />
                                    Visit Company Website
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Application Sidebar (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100 sticky top-10">
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-5 border-b pb-3">Apply Now</h3>
                            
                            {/* Job Metadata */}
                            <div className="space-y-4 mb-6 text-sm">
                                <DetailItem icon={Calendar} title="Posted" value={job.postedDate} />
                                <DetailItem icon={Clock} title="Deadline" value={job.deadline} />
                                <DetailItem 
                                    icon={DollarSign} 
                                    title="Budget Range" 
                                    value={`${job.budgetMin} - ${job.budgetMax} ${job.paymentASA}`} 
                                    valueColor="text-teal-600 font-semibold"
                                />
                            </div>

                            <div className="border-t pt-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Requirements Checklist</h4>
                                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                                    <li className="flex items-start">
                                        <CheckCircle className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0 mt-0.5" />
                                        <span>Submit proposal via external form</span>
                                    </li>
                                    {job.requiresFileUpload && (
                                        <li className="flex items-start">
                                            <CheckCircle className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0 mt-0.5" />
                                            <span>Upload CV/Portfolio document</span>
                                        </li>
                                    )}
                                    <li className="flex items-start">
                                        <CheckCircle className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0 mt-0.5" />
                                        <span>Connect Algorand wallet for escrow</span>
                                    </li>
                                </ul>

                                {/* Action Buttons */}
                                <a
                                    href={job.proposalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors mb-3"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Submit Proposal Form
                                </a>

                                {job.requiresFileUpload && (
                                    <button
                                        onClick={() => setShowApplicationModal(true)}
                                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Supporting Document
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Modal Integration */}
            <ApplicationModal 
                jobTitle={job.jobTitle}
                show={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
            />
        </div>
    );
};

export default JobDetailPage;