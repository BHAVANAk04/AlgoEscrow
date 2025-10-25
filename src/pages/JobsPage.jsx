import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, MapPin, DollarSign, Briefcase, ChevronDown, Filter, Loader2, AlertTriangle } from 'lucide-react';

// ======================================================================
// ✅ RTDB IMPORTS: Correctly using Realtime Database functions
import { ref, query, orderByChild, get } from 'firebase/database';
import { db } from '../firebase'; // <-- RTDB instance imported
// ❌ CONFLICTING FIRESTORE IMPORTS REMOVED: 
// The line 'import { collection, getDocs, query, orderBy } from 'firebase/firestore';' 
// has been removed to fix the 500 Internal Server Error.
// ======================================================================

const ALL_CATEGORIES = [
    'All Categories',
    'Web Development',
    'Blockchain/DeFi',
    'Financial & Trading',
    'UX/UI Design',
    'Data Science & AI',
    'Admin & Verification',
    'Digital Marketing',
    'System Architecture',
    'Community Management',
];

// ---- JobListingCard (No change needed) ----
const JobListingCard = ({ job }) => {
    let typeColor = 'text-gray-600';
    let typeBg = 'bg-gray-100';

    switch (job.type) {
        case 'Fixed Project':
            typeColor = 'text-red-700'; typeBg = 'bg-red-100'; break;
        case 'Hourly Contract':
            typeColor = 'text-blue-700'; typeBg = 'bg-blue-100'; break;
        case 'Retainer':
            typeColor = 'text-green-700'; typeBg = 'bg-green-100'; break;
        default: // Part Time
            typeColor = 'text-purple-700'; typeBg = 'bg-purple-100';
    }

    return (
        <Link to={`/job/${job.id}`} className="block bg-white rounded-xl shadow-md border border-gray-100 p-5 transition-all duration-200 hover:shadow-xl relative group">
            {job.isFeatured && (
                <span className="absolute top-0 right-0 px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-bl-lg rounded-tr-xl">Featured</span>
            )}
            <div className="flex items-start space-x-4 mb-4">
                <img src={job.logoUrl} alt={`${job.company} logo`} className="w-10 h-10 object-contain rounded-full border p-1 flex-shrink-0" onError={e => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/CCCCCC/000000?text=L" }} />
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company}</p>
                </div>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700">
                    <DollarSign className="w-4 h-4 mr-2 text-teal-500" />
                    <span className="font-semibold">{job.rate}</span>
                </div>
                <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{job.location}</span>
                </div>
            </div>
            <div className="mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeBg} ${typeColor} flex items-center w-fit`}>
                    <Briefcase className="w-3 h-3 mr-1" />
                    {job.type}
                </span>
            </div>
        </Link>
    );
};

const JobsPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const initialCategory = searchParams.get('category') || 'All Categories';

    // 2. States for data and status
    const [jobsData, setJobsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [sortBy, setSortBy] = useState('Date (Newest)');
    
    // 3. useEffect for Firebase data fetching (RTDB)
    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            setError(null);
            try {
                // ✅ RTDB Logic
                const gigsRef = ref(db, "gigs"); 
                // We order by the 'createdAt' child field
                const rtdbQuery = query(gigsRef, orderByChild("createdAt"));
                
                const snapshot = await get(rtdbQuery); 

                let loadedJobs = [];
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        loadedJobs.push({
                            id: childSnapshot.key,
                            ...childSnapshot.val()
                        });
                    });
                }

                // RTDB's orderByChild is ascending. Reverse for "Newest" first.
                loadedJobs.reverse(); 

                setJobsData(loadedJobs);
                
            } catch (err) {
                console.error("Error fetching jobs from Realtime Database:", err);
                // Provide specific error feedback for the user
                setError(`Failed to load jobs: ${err.message || "Check your Realtime Database reference and security rules."}`);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []); 

    // Sync category from URL param on load
    useEffect(() => {
        if (initialCategory !== selectedCategory) setSelectedCategory(initialCategory);
    }, [initialCategory]);

    // --- Filter and Sort (Client-Side) ---
    const filteredJobs = useMemo(() => {
        return jobsData
            .filter(job => {
                // Ensure job data exists and filter out non-job types
                if (job.type === 'Consultation' || job.type === 'Project Catalogue') {
                    return false; // Skip types that are not considered 'Gigs'
                }
                
                const rateString = String(job.rate || '').toLowerCase(); 

                const matchesSearch =
                    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    rateString.includes(searchTerm.toLowerCase());

                const matchesCategory =
                    selectedCategory === 'All Categories' ||
                    (job.category &&
                        job.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
                    
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                if (sortBy === 'Date (Newest)') {
                    // ✅ CORRECTED for standard RTDB numeric/string timestamp
                    // Use new Date() to safely convert timestamp/string to milliseconds
                    const dateA = new Date(a.createdAt).getTime() || 0; 
                    const dateB = new Date(b.createdAt).getTime() || 0;
                    return dateB - dateA; // Descending (Newest first)
                }
                if (sortBy === 'Featured') return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
                if (sortBy === 'Rate (High)') {
                    const parseRate = (rateString) => parseFloat(rateString?.match(/\d+/)) || 0;
                    const rateA = parseRate(a.rate);
                    const rateB = parseRate(b.rate);
                    return rateB - rateA;
                }
                return 0;
            });
    }, [jobsData, searchTerm, selectedCategory, sortBy]);

    // --- Render Logic (No change needed) ---
    const renderContent = () => {
        if (loading) {
            return (
                <div className="py-20 text-center col-span-full">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600">Loading decentralized gigs...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="py-10 text-center col-span-full p-4 bg-red-50 border border-red-300 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700 font-medium">Error Fetching Data: {error}</p>
                </div>
            );
        }

        if (filteredJobs.length === 0) {
            return (
                <p className="text-gray-500 col-span-full py-10 text-center">
                    No jobs found matching your criteria. Try adjusting your filters or search term.
                </p>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => <JobListingCard key={job.id} job={job} />)}
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Decentralized Freelancing Gigs</h1>
                    <p className="text-lg text-gray-500 mb-6">Find your next crypto-paid contract in the Indian Web3 ecosystem.</p>
                    <div className="max-w-3xl mx-auto relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search for gig title, company, or location in India..."
                            className="w-full py-4 pl-12 pr-4 border border-gray-300 rounded-full shadow-lg focus:ring-teal-500 focus:border-teal-500 text-base"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-3">
                        <h3 className="text-lg font-medium text-gray-700 mb-3 sm:mb-0">Showing {filteredJobs.length} Gigs Available</h3>
                        <div className="flex space-x-4 items-center">
                            <div className="relative flex items-center">
                                <Filter className="w-4 h-4 text-gray-500 mr-2" />
                                <select
                                    className="appearance-none py-2 pl-3 pr-10 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                >
                                    {ALL_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    className="appearance-none py-2 px-4 pr-10 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                >
                                    <option value="Date (Newest)">Sort by Date (Newest)</option>
                                    <option value="Featured">Sort by Featured</option>
                                    <option value="Rate (High)">Sort by Rate (High)</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    
                    {/* 4. Render content based on loading/error/data status */}
                    {renderContent()}

                </div>
            </div>
        </div>
    );
};

export default JobsPage;