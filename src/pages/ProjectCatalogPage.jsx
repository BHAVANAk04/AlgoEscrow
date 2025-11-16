import React, { useState, useEffect } from 'react';
// Link is imported and used for the Buy Now button
import { Link, useNavigate } from 'react-router-dom';
import { Search, Package, DollarSign, Star, ChevronDown, CheckCircle, Code, ShoppingCart, Eye, X, Send, Link as LinkIcon, Image as ImageIcon, QrCode } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { db, auth } from '../firebase';
import app from '../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

const storage = getStorage(app);
const projectsCollectionRef = collection(db, "projects");

// --- INLINE INITIAL MOCK DATA ---
// Using a valid Algorand testnet address for demo
const DEMO_SELLER_ADDRESS = "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q";

const initialProjectData = [
    {
        "id": 1,
        "title": "Decentralized Voting DApp UI Kit",
        "author": "PixelForge Studios",
        "description": "Figma design files and React components for a complete DAO voting application interface.",
        "price": "500 ALGO",
        "assetType": "UI/UX",
        "logoUrl": "https://www.vectorlogo.zone/logos/figma/figma-icon.svg",
        "tags": ["Figma", "React", "Design", "DAO"],
        "rating": 4.9,
        "demoLink": "https://tailwindui.com/components",
        "qrCodeUrl": "https://placehold.co/150x150/228B22/FFFFFF?text=QR1", // Mock QR Code URL
        "sellerAddress": DEMO_SELLER_ADDRESS
    },
    {
        "id": 2,
        "title": "PyTeal Escrow Template",
        "author": "SmartContract Ninja",
        "description": "Ready-to-deploy PyTeal/Beaker template for a simple fixed-price escrow contract.",
        "price": "1200 ALGO",
        "assetType": "Smart Contract",
        "logoUrl": "https://www.vectorlogo.zone/logos/python/python-icon.svg",
        "tags": ["PyTeal", "Beaker", "Security", "Algorand"],
        "rating": 4.7,
        "demoLink": "https://algorand.com",
        "qrCodeUrl": "https://placehold.co/150x150/228B22/FFFFFF?text=QR2",
        "sellerAddress": DEMO_SELLER_ADDRESS
    },
    // ... other mock projects remain here ...
    {
        "id": 6,
        "title": "Light/Dark Mode Theme Pack",
        "author": "Aesthetic Assets",
        "description": "Complete CSS/Tailwind theme variables for toggling dark mode support.",
        "price": "80 ALGO",
        "assetType": "UI/UX",
        "logoUrl": "https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg",
        "tags": ["CSS", "Design", "Theme"],
        "rating": 4.6,
        "demoLink": "https://tailwind.com/theme/preview",
        "qrCodeUrl": "https://placehold.co/150x150/228B22/FFFFFF?text=QR6",
        "sellerAddress": DEMO_SELLER_ADDRESS
    }
];

// Define categories for sorting/filtering
const PROJECT_TYPES = [
    'All Categories',
    'UI/UX',
    'Smart Contract',
    'Full Codebase',
    'Code Component',
];

const TYPE_OPTIONS = ['UI/UX', 'Smart Contract', 'Full Codebase', 'Code Component'];

// --- Helper component for a single project card (HORIZONTAL Layout) ---
const ProjectCard = ({ project }) => {
    const navigate = useNavigate();

    const handleBuyNow = () => {
        navigate(`/project/${project.id}/purchase`, { state: { project } });
    };

    return (
        <div
            className="block bg-white rounded-xl shadow-xl p-4 md:p-6 transition-all duration-300 hover:shadow-2xl hover:border-teal-400 border border-transparent flex items-center justify-between group min-h-[140px]"
        >
            {/* --- LEFT SECTION: Logo, Title, Author & Description --- */}
            <div className="flex items-center flex-grow min-w-0 pr-4">

                {/* Logo */}
                <img
                    src={project.logoUrl}
                    alt={`${project.author} logo`}
                    className="w-12 h-12 object-contain rounded-lg border p-1 mr-4 flex-shrink-0"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/48x48/CCCCCC/000000?text=P" }}
                />

                {/* Title & Description Column */}
                <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                            {/* Title & Author */}
                        <div className="flex-grow min-w-0 pr-4">
                            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">{project.title}</h3>
                            <p className="text-sm text-gray-500">By {project.author}</p>
                        </div>
                            {/* Rating (Tablet/Desktop View) */}
                        <div className="hidden sm:flex items-center text-yellow-500 text-base font-semibold ml-4 flex-shrink-0">
                            <Star className="w-5 h-5 mr-1" fill="currentColor" />
                            <span>{project.rating ? project.rating.toFixed(1) : 'N/A'}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 line-clamp-1 mt-1">{project.description}</p>
                </div>
            </div>

            {/* --- RIGHT SECTION: Metadata, Price & Action --- */}
            <div className="flex items-center space-x-4 flex-shrink-0 ml-4">

                {/* Metadata Column (Type) */}
                <div className="hidden lg:block text-xs text-gray-600 text-right">
                    <p className="text-gray-500 mb-1">Type:</p>
                    <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full font-medium">
                        <Code className="w-3 h-3 mr-1" />
                        {project.assetType}
                    </span>
                </div>

                {/* Price Tag (Larger and bolder) */}
                <span className="text-xl font-extrabold text-teal-600 flex-shrink-0 mr-2">
                    {project.price}
                </span>

                {/* BUY NOW Button - Now uses navigate with state */}
                <button
                    onClick={handleBuyNow}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-md
                        text-white bg-teal-600 hover:bg-teal-700 transition-colors flex-shrink-0"
                >
                    <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                </button>

                {/* View Demo Button (Opens external site in new tab) */}
                <a
                    href={project.demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-teal-600 text-sm font-medium rounded-full shadow-md
                        text-teal-600 bg-white hover:bg-teal-50 transition-colors flex-shrink-0"
                >
                    <Eye className="w-4 h-4 mr-2" /> View Demo
                </a>
            </div>
        </div>
    );
};

// --- FIX: Helper function to handle file upload to Storage ---
const uploadFileAndGetUrl = async (file, folderName) => {
    if (!file) return null;

    // Validate file type (must be image)
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Only PNG and JPEG images are allowed. Got: ${file.type}`);
    }

    // Validate file size (max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
        throw new Error(`File size too large. Maximum 5MB allowed. Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Create a unique file name
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folderName}/${fileName}`);

    try {
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get the public URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (uploadError) {
        console.error("File upload error:", uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message || 'Unknown error'}`);
    }
};


// --- UPDATED: Post Project Form Component (Modal) ---
const PostProjectForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        assetType: '',
        tags: '',
        projectUrl: '',
        logoFile: null,
        // 🌟 NEW STATE FIELD 🌟
        qrCodeImage: null,
        sellerAddress: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Trim whitespace for address fields
        const finalValue = name === 'sellerAddress' ? value.trim() : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    // Validate Algorand address format (58 characters, base32)
    const isValidAlgorandAddress = (address) => {
        if (!address) return false;
        const trimmed = address.trim();
        // Algorand addresses are 58 characters and contain only base32 characters
        return /^[A-Z2-7]{58}$/.test(trimmed);
    };

    const handleFileChange = (e, field) => {
        // Correctly read the file from the event target
        setFormData(prev => ({ ...prev, [field]: e.target.files[0] }));
    };

    // 🚀 FIX: Updated handleSubmit to handle file uploads to Storage 🚀
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // --- 1. Validate Required QR Code and other fields ---
            if (!formData.qrCodeImage || !formData.assetType || !formData.price || !formData.title || !formData.description) {
                 throw new Error("Missing required fields (Title, Description, Price, Type, or QR Code).");
            }
            if (!formData.projectUrl) {
                // Technically required in the form, but let's be explicit
                throw new Error("Missing required field: Project/Demo URL.");
            }
            if (!formData.sellerAddress) {
                throw new Error("Missing required field: Seller Address.");
            }
            
            // Validate seller address format
            if (!isValidAlgorandAddress(formData.sellerAddress)) {
                throw new Error("Invalid seller address format. Must be a valid 58-character Algorand address (e.g., 7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q).");
            }
            
            // Validate price is positive
            const price = parseFloat(formData.price);
            if (isNaN(price) || price <= 0) {
                throw new Error("Price must be a positive number.");
            }
            if (price > 1000000) {
                throw new Error("Price cannot exceed 1,000,000 ALGO.");
            }

            // --- 2. UPLOAD FILES TO FIREBASE STORAGE ---

            // 2a. Upload QR Code (Required for purchase)
            const qrCodeUrl = await uploadFileAndGetUrl(formData.qrCodeImage, "qr_codes");

            // 2b. Upload Project Logo (Optional)
            const logoFile = formData.logoFile;
            const logoUrl = logoFile ? await uploadFileAndGetUrl(logoFile, "project_logos") : null;

            const finalLogoUrl = logoUrl || 'https://placehold.co/48x48/CCCCCC/000000?text=NEW';


            // --- 3. PREPARE FIRESTORE DATA ---
            const projectDataToSave = {
                title: formData.title,
                description: formData.description,
                price: `${formData.price} ALGO`,
                assetType: formData.assetType,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
                demoLink: formData.projectUrl,
                // 🌟 FIX: Use the actual URLs from storage 🌟
                logoUrl: finalLogoUrl,
                qrCodeUrl: qrCodeUrl, // This will be the actual hosted image URL
                author: 'New Community Post',
                rating: 5.0,
                createdAt: new Date(),
                sellerAddress: formData.sellerAddress,
            };

            // --- 4. WRITE DOCUMENT TO FIRESTORE ---
            await addDoc(projectsCollectionRef, projectDataToSave);

            console.log('Project Data Sent to Firestore with Storage URLs:', projectDataToSave);
            alert(`Project "${formData.title}" submitted successfully! Real-time list update pending.`);
            onClose();
        } catch (e) {
            console.error("Error adding document or uploading file: ", e);
            setError(`Failed to post project. Reason: ${e.message || 'Check console for details.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const FileUploadComponent = ({ label, fieldName, file, setFile }) => (
        <div>
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 flex items-center">
                {label}
            </label>
            <div className="mt-1 flex items-center space-x-2">
                <label className="flex-grow inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <input
                        type="file"
                        name={fieldName}
                        id={fieldName}
                        accept=".png,.jpg,.jpeg"
                        // ✅ CORRECTION: Removed the erroneous third argument
                        onChange={(e) => setFile(e, fieldName)}
                        className="sr-only"
                    />
                    {file ? (
                        <span className="truncate">{file.name}</span>
                    ) : (
                        <span>Choose file</span>
                    )}
                </label>
                {file && (
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, [fieldName]: null }))}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Remove file"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        // Modal Backdrop
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 transition-opacity duration-300 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Package className="w-6 h-6 mr-3 text-teal-600" />
                        Post a New Project
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-400 rounded-lg">
                            {error}
                        </div>
                    )}
                    {/* Project Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Project Title</label>
                        <input type="text" name="title" id="title" required value={formData.title} onChange={handleChange} placeholder="e.g., PyTeal Automated Vesting Contract" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"/>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" id="description" rows="3" required value={formData.description} onChange={handleChange} placeholder="A brief, compelling summary of your project and what it includes." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"></textarea>
                    </div>

                    {/* Price (ALGO Only) & Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Price (ALGO) */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (in ALGO)</label>
                            <input type="number" name="price" id="price" required min="0.01" step="any" value={formData.price} onChange={handleChange} placeholder="e.g., 500" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"/>
                        </div>

                        {/* Type Dropdown */}
                        <div>
                            <label htmlFor="assetType" className="block text-sm font-medium text-gray-700">Type</label>
                            <select name="assetType" id="assetType" required value={formData.assetType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white pr-10">
                                <option value="" disabled>Select Type</option>
                                {TYPE_OPTIONS.map(type => (<option key={type} value={type}>{type}</option>))}
                            </select>
                        </div>
                    </div>

                    {/* Tags & Project URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (Comma Separated)</label>
                            <input type="text" name="tags" id="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., React, Tailwind, Frontend" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                        <div>
                            <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-700 flex items-center">
                                <LinkIcon className="w-4 h-4 mr-1" /> Project/Demo URL (Required)
                            </label>
                            <input type="url" name="projectUrl" id="projectUrl" required value={formData.projectUrl} onChange={handleChange} placeholder="https://live-demo.com/my-project" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"/>
                        </div>
                    </div>

                    {/* Seller Address */}
                    <div>
                        <label htmlFor="sellerAddress" className="block text-sm font-medium text-gray-700">Seller Address (Algorand Wallet Address)</label>
                        <input type="text" name="sellerAddress" id="sellerAddress" required value={formData.sellerAddress} onChange={handleChange} placeholder="e.g., 7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 font-mono text-xs"/>
                        <p className="mt-1 text-xs text-gray-500">
                            Your 58-character Algorand wallet address where payments will be received. Get this from your Pera Wallet or Algorand KMD client.
                        </p>
                    </div>

                    {/* --- 🌟 NEW: QR Code Upload & Logo Upload --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">

                        {/* 🌟 NEW QR CODE INPUT 🌟 */}
                        <FileUploadComponent
                            label={<><QrCode className="w-4 h-4 mr-1" /> ALGO Receive QR Code (Required)</>}
                            fieldName="qrCodeImage"
                            file={formData.qrCodeImage}
                            setFile={handleFileChange}
                        />

                        {/* Logo Upload */}
                        <FileUploadComponent
                            label={<><ImageIcon className="w-4 h-4 mr-1" /> Project Logo (Optional)</>}
                            fieldName="logoFile"
                            file={formData.logoFile}
                            setFile={handleFileChange}
                        />
                    </div>
                    {/* --- END NEW FIELDS --- */}


                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-medium text-white transition-colors ${
                                isSubmitting ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                            }`}
                        >
                            {isSubmitting ? (<><span className="animate-spin mr-2">⚙</span> Submitting...</>) : (<><Send className="w-5 h-5 mr-2" />Submit Project for Review</>)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Component ---
const ProjectCatalogPage = () => {
    const [projects, setProjects] = useState(initialProjectData);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All Categories');
    const [sortBy, setSortBy] = useState('Highest Rated');
    const [isPostingProject, setIsPostingProject] = useState(false);

    // --- REAL-TIME SYNCING EFFECT ---
    useEffect(() => {
        // We query by 'createdAt' to show the newest posted items first
        const q = query(projectsCollectionRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedProjects = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || 'Untitled Project',
                    author: data.author || 'Community Post',
                    description: data.description || 'No description provided.',
                    price: data.price || 'N/A',
                    assetType: data.assetType || 'Full Codebase',
                    // Data from Firestore now includes the actual Storage URLs
                    logoUrl: data.logoUrl || 'https://placehold.co/48x48/CCCCCC/000000?text=P',
                    tags: data.tags || [],
                    rating: data.rating || 0.0,
                    demoLink: data.demoLink || '#',
                    qrCodeUrl: data.qrCodeUrl || 'https://placehold.co/150x150/FF0000/FFFFFF?text=MISSING_QR', // Fetch QR code URL
                    sellerAddress: data.sellerAddress || DEMO_SELLER_ADDRESS,
                };
            });

            // Merge mock data with fetched data, ensuring unique IDs (Firestore IDs are strings, mock are numbers)
            const uniqueProjects = [...initialProjectData.filter(mock => !fetchedProjects.some(fp => fp.id === mock.id.toString())), ...fetchedProjects];

            setProjects(uniqueProjects);
            setIsLoading(false);
        }, (error) => {
            console.error("Error subscribing to projects: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filtering Logic
    const filteredProjects = projects
        .filter(project => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch =
                (project.title && project.title.toLowerCase().includes(lowerSearch)) ||
                (project.author && project.author.toLowerCase().includes(lowerSearch)) ||
                (project.description && project.description.toLowerCase().includes(lowerSearch)) ||
                (project.tags && project.tags.some(tag => tag.toLowerCase().includes(lowerSearch)));

            const matchesType = selectedType === 'All Categories' || project.assetType === selectedType;

            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            if (sortBy === 'Highest Rated') {
                return (b.rating || 0) - (a.rating || 0);
            }

            // Helper to safely parse ALGO price string (e.g., "1200 ALGO" -> 1200)
            const parsePrice = (priceStr) => parseFloat(priceStr.split(' ')[0]) || 0;
            const priceA = parsePrice(a.price);
            const priceB = parsePrice(b.price);

            if (sortBy === 'Price (Low)') {
                return priceA - priceB;
            }
            if (sortBy === 'Price (High)') {
                return priceB - priceA;
            }
            if (sortBy === 'Date (Newest)') {
                // Sorting by Firestore's internal 'createdAt' field is handled by the query.
                // For initial/mock data, this will just keep the current order.
                return 0;
            }
            return 0;
        });


    return (
        <div className="min-h-screen bg-gray-50 py-10 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- Top Bar: Header, Search & Post Project Button --- */}
                <div className="mb-10 relative">
                    <div className="absolute right-0 top-0">
                        <button
                            onClick={() => setIsPostingProject(true)}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-md
                                text-white bg-teal-600 hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            <Package className="w-5 h-5 mr-2" />
                            Post Project
                        </button>
                    </div>

                    {/* Main Header & Search Bar */}
                    <div className="text-center pt-16 sm:pt-0">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Buy Pre-Built Projects</h1>
                        <p className="text-lg text-gray-500 mb-6">Instantly purchase fixed-scope Smart Contracts, UI Kits, and Code Components using secured escrow.</p>

                        <div className="max-w-3xl mx-auto relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search codebases, UI kits, smart contracts..."
                                className="w-full py-4 pl-12 pr-4 border border-gray-300 rounded-full shadow-lg focus:ring-teal-500 focus:border-teal-500 text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* --- Listings Section --- */}
                <div className="w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-3">
                        <h3 className="text-lg font-medium text-gray-700 mb-3 sm:mb-0">Showing {filteredProjects.length} Projects Available</h3>

                        <div className="flex space-x-4 items-center">

                            <div className="relative flex items-center">
                                <Code className="w-4 h-4 text-gray-500 mr-2" />
                                <select
                                    className="appearance-none py-2 pl-3 pr-10 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    {PROJECT_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select
                                    className="appearance-none py-2 px-4 pr-10 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="Highest Rated">Sort by Rating (High)</option>
                                    <option value="Price (Low)">Sort by Price (Low)</option>
                                    <option value="Price (High)">Sort by Price (High)</option>
                                    <option value="Date (Newest)">Sort by Date (Newest)</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <p className="text-center text-teal-600 py-10 flex items-center justify-center">
                            <span className="animate-spin mr-3">⚙</span>
                            Loading projects...
                        </p>
                    )}

                    {/* Project Listings */}
                    {!isLoading && (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredProjects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                            {filteredProjects.length === 0 && (
                                <p className="text-gray-500 col-span-full py-10 text-center">No projects found matching your criteria.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Conditional Rendering of the Post Project Form */}
            {isPostingProject && (
                <PostProjectForm
                    onClose={() => setIsPostingProject(false)}
                />
            )}
        </div>
    );
};


export default ProjectCatalogPage;