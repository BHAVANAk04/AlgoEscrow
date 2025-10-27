import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Code, DollarSign, PenTool, Database, Users, TrendingUp, Zap, FileText } from 'lucide-react';

// Data for the 9 categories (No Change)
const categories = [
    { name: 'Web Development', jobs: 350, icon: Code, color: 'text-blue-600', iconBg: 'bg-blue-50' },
    { name: 'Blockchain/DeFi', jobs: 180, icon: LayoutGrid, color: 'text-green-600', iconBg: 'bg-green-50' },
    { name: 'Financial & Trading', jobs: 122, icon: DollarSign, color: 'text-teal-600', iconBg: 'bg-teal-50' },
    { name: 'UX/UI Design', jobs: 212, icon: PenTool, color: 'text-indigo-600', iconBg: 'bg-indigo-50' },
    { name: 'Data Science & AI', jobs: 90, icon: Database, color: 'text-red-600', iconBg: 'bg-red-50' },
    { name: 'Admin & Verification', jobs: 70, icon: FileText, color: 'text-cyan-600', iconBg: 'bg-cyan-50' }, 
    { name: 'Community Management', jobs: 65, icon: Users, color: 'text-yellow-600', iconBg: 'bg-yellow-50' },
    { name: 'Digital Marketing', jobs: 160, icon: TrendingUp, color: 'text-purple-600', iconBg: 'bg-purple-50' },
    { name: 'System Architecture', jobs: 80, icon: Zap, color: 'text-pink-600', iconBg: 'bg-pink-50' },
];

// Reusable card component for the grid
const CategoryCard = ({ name, jobs, icon: Icon, color, iconBg }) => {
    // Construct the path with a URL query string to pass the category name
    const path = `/jobs?category=${encodeURIComponent(name)}`;

    return (
        <Link 
            to={path} 
            // W-72 for width, but increased vertical padding (py-12) to make it much taller.
            className="flex flex-col items-center py-12 px-8 bg-white rounded-2xl shadow-lg border border-gray-100 transition-shadow duration-300 hover:shadow-xl cursor-pointer w-72 flex-shrink-0 group"
        >
            
            {/* Icon Area: Circle background increased in size and bottom margin for spacing */}
            <div className={`w-20 h-20 flex items-center justify-center rounded-full ${iconBg} mb-8`}> 
                <Icon className={`w-9 h-9 ${color} transition-colors duration-300 group-hover:text-teal-600`} /> {/* Icon size increased */}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center transition-colors duration-300 group-hover:text-teal-600">{name}</h3> 
            <p className="text-base text-gray-500">{jobs} Active Jobs</p> 
            
            {/* Adding vertical flex space to push content apart slightly and enforce height */}
            <div className="flex-grow"></div> 
            
        </Link>
    );
};

const ExploreCategories = () => {
    return (
        <div className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                
                {/* Header Section */}
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                    Explore Top Categories
                </h2>
                <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-16">
                    Browse hundreds of decentralized opportunities in the fastest-growing sectors secured by our escrow protocol.
                </p>

                {/* Categories Container: Uses Flexbox for horizontal layout and overflow-x-auto for scrolling */}
                <div className="flex space-x-6 pb-4 overflow-x-auto scrollbar-hide text-left">
                    {categories.map((category, index) => (
                        <CategoryCard 
                            key={index}
                            name={category.name}
                            jobs={category.jobs}
                            icon={category.icon}
                            color={category.color}
                            iconBg={category.iconBg}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExploreCategories;