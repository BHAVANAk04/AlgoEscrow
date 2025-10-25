import React, { useState } from 'react';
import { Link, BrowserRouter } from 'react-router-dom';
import { Search, Clock, DollarSign, Star, Briefcase, ChevronDown, Calendar, Code, User } from 'lucide-react';

// --- INLINE MOCK DATA ---
const consultantData = [
    {
        "id": 101,
        "name": "Dr. Elara Vance",
        "title": "Lead Smart Contract Auditor",
        "specialty": "Beaker & PyTeal Security",
        "rate": "150 USDC / hr",
        "rating": 4.9,
        "experience": 8,
        "avatarUrl": "https://placehold.co/60x60/3CB371/FFFFFF?text=EV" 
    },
    {
        "id": 102,
        "name": "Arjun Sharma",
        "title": "DeFi Strategy Consultant",
        "specialty": "Tokenomics & Liquidity Pools",
        "rate": "2500 ALGO / session",
        "rating": 4.7,
        "experience": 6,
        "avatarUrl": "https://placehold.co/60x60/4682B4/FFFFFF?text=AS" 
    },
    {
        "id": 103,
        "name": "Li Wei",
        "title": "Full-Stack DApp Architect",
        "specialty": "React & Algorand SDK Integration",
        "rate": "110 USDC / hr",
        "rating": 5.0,
        "experience": 10,
        "avatarUrl": "https://placehold.co/60x60/800080/FFFFFF?text=LW" 
    },
    {
        "id": 104,
        "name": "Maya Patel",
        "title": "UX/DAO Governance Expert",
        "specialty": "User Flow and Community Management",
        "rate": "80 USDC / hr",
        "rating": 4.5,
        "experience": 4,
        "avatarUrl": "https://placehold.co/60x60/FFA500/FFFFFF?text=MP" 
    },
    {
        "id": 105,
        "name": "Caleb Nwanze",
        "title": "Rust Developer (NEAR/AVM)",
        "specialty": "Low-Level Optimization",
        "rate": "180 USDC / hour",
        "rating": 4.8,
        "experience": 7,
        "avatarUrl": "https://placehold.co/60x60/DC143C/FFFFFF?text=CN" 
    }
];

// Define sorting/filtering options
const EXPERT_FIELDS = [
    'All Specialties',
    'Smart Contract',
    'DeFi Strategy',
    'DApp Architecture',
    'UX/UI Design',
    'Data Analysis',
    'Tokenomics'
];


// --- NEW HELPER FUNCTION FOR ROBUST RATE COMPARISON ---
// In a real app, you'd fetch live exchange rates (e.g., 1 ALGO = X USDC)
const getComparableRate = (rateString) => {
    // 1. Extract the number from the string
    const match = rateString.match(/(\d+)/);
    const numericalRate = match ? parseFloat(match[1]) : 0;

    // 2. Normalize rates to a standard unit (e.g., approximate USDC/hr equivalent)
    if (rateString.includes('USDC') && (rateString.includes('/ hr') || rateString.includes('/ hour'))) {
        return numericalRate; // Already in base unit
    }
    
    if (rateString.includes('ALGO') && rateString.includes('/ session')) {
        // MOCK CONVERSION: Assume a session is 1.5 hours, and 1 ALGO = 0.15 USDC (using mock rates)
        const ALGO_TO_USDC = 0.15; 
        const SESSION_TO_HOURS = 1.5;

        // Convert ALGO to USDC per session, then to USDC per hour
        const usdcPerSession = numericalRate * ALGO_TO_USDC;
        return usdcPerSession / SESSION_TO_HOURS;
    }

    // Default to 0 for unparsable or unknown formats
    return 0;
};


// Helper component for a single consultant card (HORIZONTAL Layout)
const ConsultantCard = ({ consultant }) => {
    return (
        <div 
            // Main card structure: flex, items-center, wide padding
            className=" block bg-white rounded-xl shadow-xl p-5 transition-all duration-300 hover:shadow-2xl hover:border-teal-400 border border-transparent flex items-center justify-between group min-h-[120px]"
        >
            
            {/* --- LEFT COLUMN (50%): Avatar, Name, Title, Specialty --- */}
            <div className="flex items-start flex-grow pr-4 max-w-[55%] min-w-0">
                
                {/* Avatar */}
                <img 
                    src={consultant.avatarUrl} 
                    alt={`${consultant.name}`} 
                    className="w-12 h-12 object-cover rounded-full border p-0.5 mr-4 flex-shrink-0 border-teal-300" 
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/48x48/CCCCCC/000000?text=U" }}
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

            {/* --- RIGHT COLUMN (50%): Experience, Rating, Rate & Action --- */}
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

                <Link 
                    // Link to a detailed booking page for this consultant
                    to={`/consultant/${consultant.id}/book`} 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-md 
                        text-white bg-teal-600 hover:bg-teal-700 transition-colors flex-shrink-0"
                >
                    <Calendar className="w-4 h-4 mr-2" /> Book Session
                </Link>
            </div>
        </div>
    );
};

// Main Component
const ConsultationsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedField, setSelectedField] = useState('All Specialties');
    const [sortBy, setSortBy] = useState('Highest Rated');

    // Filtering Logic
    const filteredConsultants = consultantData
        .filter(consultant => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = 
                consultant.name.toLowerCase().includes(lowerSearch) || 
                consultant.title.toLowerCase().includes(lowerSearch) ||
                consultant.specialty.toLowerCase().includes(lowerSearch);
            
            // Simple matching for mock data: checks if specialty includes the selected field (e.g., 'Smart Contract')
            const matchesField = selectedField === 'All Specialties' || consultant.specialty.includes(selectedField.split(' ')[0]); 

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
            // --- EDITED: Use the new helper function for reliable rate comparison ---
            if (sortBy === 'Rate (High)') {
                const rateA = getComparableRate(a.rate);
                const rateB = getComparableRate(b.rate);
                return rateB - rateA;
            }
            // --- END EDITED ---
            
            return b.id - a.id; // Default sort by newest
        });


    return (
        <div className="min-h-screen bg-gray-50 py-10 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Main Header & Search Bar */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Book Expert Consultations</h1>
                    <p className="text-lg text-gray-500 mb-6">Find certified specialists for 1:1 sessions on Algorand development, DeFi strategy, and security.</p>
                    
                    {/* Centralized Search Bar */}
                    <div className="max-w-3xl mx-auto relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search experts by name, title, or specialty..."
                            className="w-full py-4 pl-12 pr-4 border border-gray-300 rounded-full shadow-lg focus:ring-teal-500 focus:border-teal-500 text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                                    className="appearance-none py-2 pl-3 pr-10 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer"
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
                                    className="appearance-none py-2 px-4 pr-10 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer"
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

                    {/* Simple 1-column grid for maximum horizontal card size */}
                    <div className="grid grid-cols-1 gap-6"> 
                        {filteredConsultants.map(consultant => (
                            <ConsultantCard key={consultant.id} consultant={consultant} />
                        ))}
                        {filteredConsultants.length === 0 && (
                            <p className="text-gray-500 col-span-full py-10 text-center">No consultants found matching your criteria.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};


export default ConsultationsPage;