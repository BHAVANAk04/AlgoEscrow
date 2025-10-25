import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase } from 'lucide-react';
// --- CORRECTED IMPORT PATH for reliable resolution ---
import featuredJobsData from '/src/assets/dummy.json'; 

// Helper component for the job type label
const JobTypeLabel = ({ type }) => {
    let bgColor;
    let textColor = 'text-white';
    
    // Assign colors based on freelance job type
    switch (type) {
        case 'Part Time':
        case 'Hourly Contract':
            bgColor = 'bg-blue-600';
            break;
        case 'Fixed Project':
            bgColor = 'bg-red-600';
            break;
        case 'Retainer':
            bgColor = 'bg-green-600';
            break;
        case 'Consultation':
            bgColor = 'bg-purple-600';
            break;
        default:
            bgColor = 'bg-gray-500';
            break;
    }

    return (
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${bgColor} ${textColor} text-xs font-medium`}>
            <Briefcase className="w-3 h-3" />
            <span>{type}</span>
        </div>
    );
};

const FeaturedJobs = () => {
    return (
        <div className="py-20 bg-teal-50"> {/* CHANGED: bg-gray-50 to bg-teal-50 for a light teal background */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-16">
                    Featured Gigs
                </h2>

                {/* 3x3 Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredJobsData.map((job) => (
                        // Link wraps the entire card for navigation
                        <Link 
                            key={job.id} 
                            to={`/job/${job.id}`} 
                            className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 transition-shadow duration-300 hover:shadow-xl relative flex flex-col justify-between"
                        >
                            {/* --- TOP SECTION: Title, Logo, Location --- */}
                            <div className="flex justify-between items-start mb-4">
                                {/* Logo & Featured Star Container */}
                                <div className="flex-shrink-0">
                                    <img 
                                        src={job.logoUrl} 
                                        alt={`${job.company} logo`} 
                                        // Increased size slightly for visual impact
                                        className="w-12 h-12 object-contain rounded-full border p-1" 
                                        // Placeholder for image loading error
                                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/48x48/CCCCCC/000000?text=LOGO" }}
                                    />
                                </div>
                                
                                {/* Featured Star (Blue ribbon effect) */}
                                {job.isFeatured && (
                                    <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-blue-600 rounded-bl-xl rounded-tr-xl text-white">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* --- MIDDLE SECTION: Job Details --- */}
                            <div className="mb-4 flex-grow">
                                <h3 className="text-xl font-bold text-gray-800 mb-1 leading-snug">{job.title}</h3>
                                
                                {/* Company and Location */}
                                <p className="text-sm text-gray-500 mb-2">{job.company}</p>
                                
                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                    <span>{job.location}</span>
                                </div>

                                {/* Salary / Rate */}
                                <p className="text-lg font-semibold text-teal-600">{job.rate}</p>
                            </div>

                            {/* --- BOTTOM SECTION: Job Type Label --- */}
                            <div className="mt-4">
                                <JobTypeLabel type={job.type} />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* --- EXPLORE MORE BUTTON --- */}
                <div className="mt-12 text-center">
                    <Link 
                        to="/jobs" 
                        className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg 
                            text-white bg-teal-600 hover:bg-teal-700 
                            transition-colors duration-200 ease-in-out"
                    >
                        Explore More Gigs
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FeaturedJobs;
