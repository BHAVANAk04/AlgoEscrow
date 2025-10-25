import React, { useState } from 'react';
import { Link, BrowserRouter } from 'react-router-dom';
import { Search, Package, DollarSign, Star, Briefcase, ChevronDown, CheckCircle, Code, ShoppingCart } from 'lucide-react';

// --- INLINE MOCK DATA (Removed isVerified property) ---
const projectData = [
    {
        "id": 1,
        "title": "Decentralized Voting DApp UI Kit",
        "author": "PixelForge Studios",
        "description": "Figma design files and React components for a complete DAO voting application interface.",
        "price": "500 USDC",
        "assetType": "UI/UX",
        "logoUrl": "https://www.vectorlogo.zone/logos/figma/figma-icon.svg",
        "tags": ["Figma", "React", "Design", "DAO"],
        "rating": 4.9
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
        "rating": 4.7
    },
    {
        "id": 3,
        "title": "Next.js Blog Starter Kit",
        "author": "WebFlow Masters",
        "description": "Full Next.js/Tailwind blog starter, ready for integration with any headless CMS.",
        "price": "350 USDC",
        "assetType": "Full Codebase",
        "logoUrl": "https://www.vectorlogo.zone/logos/nextjs/nextjs-icon.svg",
        "tags": ["Next.js", "React", "Tailwind", "Frontend"],
        "rating": 4.5
    },
    {
        "id": 4,
        "title": "NFT Gallery Frontend",
        "author": "Creative Coders",
        "description": "Responsive React component for displaying a user's collection of Algorand NFTs.",
        "price": "450 ALGO",
        "assetType": "Code Component",
        "logoUrl": "https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg",
        "tags": ["React", "NFT", "Asset", "Display"],
        "rating": 5.0
    },
    {
        "id": 5,
        "title": "Wallet Connect Module (Vue.js)",
        "author": "Protocol Integrators",
        "description": "Vue.js module for connecting to Pera and WalletConnect v2 endpoints.",
        "price": "200 USDC",
        "assetType": "Code Component",
        "logoUrl": "https://www.vectorlogo.zone/logos/vuejs/vuejs-icon.svg",
        "tags": ["Vue", "Wallet", "Integration"],
        "rating": 4.1
    },
    {
        "id": 6,
        "title": "Light/Dark Mode Theme Pack",
        "author": "Aesthetic Assets",
        "description": "Complete CSS/Tailwind theme variables for toggling dark mode support.",
        "price": "80 ALGO",
        "assetType": "UI/UX",
        "logoUrl": "https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg",
        "tags": ["CSS", "Design", "Theme"],
        "rating": 4.6
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

// Helper component for a single project card (HORIZONTAL Layout)
const ProjectCard = ({ project }) => {
    return (
        <div 
            // Main card structure: flex, items-center (vertically centers content), wide padding
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
                            <span>{project.rating}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 line-clamp-1 mt-1">{project.description}</p>
                </div>
            </div>

            {/* --- RIGHT SECTION: Metadata, Price & Action --- */}
            <div className="flex items-center space-x-6 flex-shrink-0 ml-4">
                
                {/* Metadata Column (Asset Type) */}
                <div className="hidden lg:block text-xs text-gray-600 text-right">
                    <p className="text-gray-500 mb-1">Asset Type:</p>
                    <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full font-medium">
                        <Code className="w-3 h-3 mr-1" />
                        {project.assetType}
                    </span>
                </div>

                {/* Price Tag (Larger and bolder) */}
                <span className="text-xl font-extrabold text-teal-600 flex-shrink-0">
                    {project.price}
                </span>

                <Link 
                    // Link to a detailed purchase page
                    to={`/project/${project.id}/purchase`} 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-md 
                        text-white bg-teal-600 hover:bg-teal-700 transition-colors flex-shrink-0"
                >
                    <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                </Link>
            </div>
        </div>
    );
};

// Main Component
const ProjectCatalogPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('All Categories');
    const [sortBy, setSortBy] = useState('Highest Rated');

    // Filtering Logic
    const filteredProjects = projectData
        .filter(project => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = 
                project.title.toLowerCase().includes(lowerSearch) || 
                project.author.toLowerCase().includes(lowerSearch) ||
                project.description.toLowerCase().includes(lowerSearch) ||
                project.tags.some(tag => tag.toLowerCase().includes(lowerSearch));
            
            const matchesType = selectedType === 'All Categories' || project.assetType === selectedType;

            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            // Sorting Logic
            if (sortBy === 'Highest Rated') {
                return b.rating - a.rating;
            }
            const priceA = parseFloat(a.price);
            const priceB = parseFloat(b.price);

            if (sortBy === 'Price (Low)') {
                return priceA - priceB;
            }
            if (sortBy === 'Price (High)') {
                return priceB - priceA;
            }
            return b.id - a.id; // Default sort by newest
        });


    return (
        <div className="min-h-screen bg-gray-50 py-10 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Main Header & Search Bar */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Buy Pre-Built Projects</h1>
                    <p className="text-lg text-gray-500 mb-6">Instantly purchase fixed-scope Smart Contracts, UI Kits, and Code Components using secured escrow.</p>
                    
                    {/* Centralized Search Bar */}
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
                
                {/* --- Listings Section --- */}
                <div className="w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-3">
                        <h3 className="text-lg font-medium text-gray-700 mb-3 sm:mb-0">Showing {filteredProjects.length} Projects Available</h3>
                        
                        {/* Sort/Filter Dropdowns */}
                        <div className="flex space-x-4 items-center">
                            
                            {/* Type Filter Dropdown */}
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

                            {/* Sort By Dropdown */}
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

                    {/* Changed grid to 1 column for horizontal emphasis */}
                    <div className="grid grid-cols-1 gap-6"> 
                        {filteredProjects.map(project => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                        {filteredProjects.length === 0 && (
                            <p className="text-gray-500 col-span-full py-10 text-center">No projects found matching your criteria.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};



export default ProjectCatalogPage