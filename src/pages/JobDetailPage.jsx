import React, { useState } from 'react';
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
    X, // Added X icon for modal close
    FileText // Added FileText icon for file representation
} from 'lucide-react';

// Mock data - In production, fetch from Firestore using job ID
const jobsDatabase = [
    {
        id: 1,
        // Client/Company Info
        companyName: "Decentralized Labs India",
        companyBio: "We're building the next generation of DeFi protocols on Algorand. Our mission is to bring transparent, secure financial services to millions across South Asia.",
        companyWebsite: "https://decentlabs.in",
        companyLocation: "Bangalore, India",
        logoUrl: "https://www.vectorlogo.zone/logos/algorand/algorand-icon.svg",
        
        // Job Details
        jobTitle: "PyTeal Smart Contract Auditor",
        jobDescription: `We are seeking an experienced blockchain security auditor with deep expertise in PyTeal and Beaker framework to conduct a comprehensive audit of our DeFi lending protocol.

**Responsibilities:**
- Review smart contract code for security vulnerabilities
- Test for common attack vectors (reentrancy, overflow, etc.)
- Provide detailed audit report with recommendations
- Collaborate with our dev team to implement fixes

**Required Skills:**
- 3+ years experience with Algorand smart contracts
- Proficiency in PyTeal and Beaker
- Understanding of DeFi protocols and lending mechanisms
- Experience with security tools and testing frameworks

**Deliverables:**
- Complete security audit report
- Test suite demonstrating vulnerability checks
- Documentation of findings and recommendations`,
        
        employmentType: "Fixed Project",
        budgetMin: "1000",
        budgetMax: "1800",
        paymentASA: "ALGO",
        
        // Application Requirements
        proposalLink: "https://forms.gle/example-audit-proposal",
        requiresFileUpload: true,
        
        // Additional metadata
        postedDate: "October 20, 2025",
        deadline: "November 15, 2025",
        isFeatured: true,
        category: "Blockchain/DeFi"
    },
    {
        id: 2,
        companyName: "TechInnovate Systems",
        companyBio: "A fast-growing SaaS company specializing in enterprise automation tools. We serve clients across India and Southeast Asia.",
        companyWebsite: "https://techinnovate.com",
        companyLocation: "Mumbai, India",
        logoUrl: "https://www.vectorlogo.zone/logos/python/python-icon.svg",
        
        jobTitle: "Backend API Developer (Python)",
        jobDescription: `Looking for a skilled Python developer to build RESTful APIs for our enterprise automation platform.

**Key Responsibilities:**
- Design and implement RESTful APIs using FastAPI/Django
- Integrate with third-party services and databases
- Write comprehensive unit and integration tests
- Optimize API performance and scalability

**Requirements:**
- Strong Python programming skills (3+ years)
- Experience with FastAPI or Django REST Framework
- Knowledge of PostgreSQL and Redis
- Understanding of OAuth2 and JWT authentication

**Nice to Have:**
- Docker and Kubernetes experience
- AWS or GCP cloud deployment
- Experience with microservices architecture`,
        
        employmentType: "Hourly Contract",
        budgetMin: "250",
        budgetMax: "400",
        paymentASA: "USDC",
        
        proposalLink: "https://forms.gle/example-backend-proposal",
        requiresFileUpload: false,
        
        postedDate: "October 18, 2025",
        deadline: "November 30, 2025",
        isFeatured: false,
        category: "Web Development"
    },
    // Add more jobs as needed...
];


// --- NEW COMPONENT: Application Modal ---
const ApplicationModal = ({ jobTitle, show, onClose }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadComplete(false); // Reset completion status on new file selection
        }
    };

    const handleUpload = () => {
        if (!file) return;

        // Simulate upload process
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setUploadComplete(true);
            // In a real app, this is where you'd send the file to your backend/storage service (e.g., AWS S3, Algorand AVM transaction, etc.)
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
            onClick={resetState} // Close modal on backdrop click
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
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
// --- END NEW COMPONENT ---


const JobDetailPage = () => {
    const { id } = useParams();
    const job = jobsDatabase.find(j => j.id === parseInt(id));
    
    // Kept for consistency, though 'proposalFile' is now managed in the modal state
    const [proposalFile, setProposalFile] = useState(null); 
    const [showApplicationModal, setShowApplicationModal] = useState(false);

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

    // Job type styling
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Back Button */}
                <Link 
                    to="/jobs" 
                    className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                </Link>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: Job Details */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Job Header Card */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            {/* Featured Badge */}
                            {job.isFeatured && (
                                <span className="inline-block px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full mb-4">
                                    ★ Featured Job
                                </span>
                            )}
                            
                            {/* Company Logo & Title */}
                            <div className="flex items-start gap-4 mb-6">
                                <img 
                                    src={job.logoUrl} 
                                    alt={job.companyName}
                                    className="w-16 h-16 object-contain rounded-lg border p-2"
                                    onError={(e) => { e.target.src="https://placehold.co/64x64/CCCCCC/000000?text=LOGO" }}
                                />
                                <div className="flex-grow">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.jobTitle}</h1>
                                    <p className="text-lg text-gray-600">{job.companyName}</p>
                                </div>
                            </div>

                            {/* Quick Info Tags */}
                            <div className="flex flex-wrap gap-3">
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

                        {/* Job Description Card */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                <Briefcase className="w-6 h-6 mr-3 text-teal-600" />
                                Job Description
                            </h2>
                            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                                {job.jobDescription}
                            </div>
                        </div>

                        {/* Company Info Card */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                <Building2 className="w-6 h-6 mr-3 text-teal-600" />
                                About {job.companyName}
                            </h2>
                            <p className="text-gray-700 mb-4">{job.companyBio}</p>
                            
                            {job.companyWebsite && (
                                <a 
                                    href={job.companyWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold"
                                >
                                    <Globe className="w-4 h-4 mr-2" />
                                    Visit Company Website
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Application Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-8">
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Apply for this Job</h3>
                            
                            {/* Job Metadata */}
                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-700">Posted</p>
                                        <p>{job.postedDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Clock className="w-4 h-4 mr-3 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-700">Deadline</p>
                                        <p>{job.deadline}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <DollarSign className="w-4 h-4 mr-3 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-700">Budget Range</p>
                                        <p className="text-teal-600 font-semibold">
                                            {job.budgetMin} - {job.budgetMax} {job.paymentASA}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Application Requirements</h4>
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

                                {/* External Proposal Link */}
                                <a
                                    href={job.proposalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors mb-3"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Submit Proposal
                                </a>

                                {/* Optional File Upload Button */}
                                {job.requiresFileUpload && (
                                    <button
                                        onClick={() => setShowApplicationModal(true)}
                                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Document
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