import React from 'react';
import { Link } from 'react-router-dom'; // <--- IMPORTED Link

// Custom Feature Card component with modern UI
// Changed the root element from <a> to Link
const FeatureCard = ({ title, description, icon, iconBgColor, iconColor, href }) => {
    return (
        // The entire card is now a React Router Link.
        <Link 
            to={href} // <--- Using 'to' prop for React Router
            className="p-6 md:p-8 rounded-xl bg-white border border-gray-100 shadow-lg transition-all duration-500 hover:shadow-xl hover:border-teal-400 flex flex-col items-center text-center cursor-pointer group"
        >
            
            {/* Icon/Illustration Area: Soft colored circle */}
            <div className={`w-16 h-16 mb-6 rounded-full flex items-center justify-center ${iconBgColor} border-4 border-white shadow-md transition-shadow duration-500 group-hover:shadow-teal-300`}>
                <svg 
                    // Icon color changes to teal on hover
                    className={`w-8 h-8 ${iconColor} transition-colors duration-500 group-hover:text-teal-600`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Icon path from props */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path>
                </svg>
            </div>

            {/* Title text color changes to teal on hover */}
            <h3 className="text-xl font-bold text-gray-800 mb-3 transition-colors duration-500 group-hover:text-teal-600">{title}</h3>
            <p className="text-gray-500 mb-6 text-base flex-grow">{description}</p>
            
            {/* Call to action text (Teal color) */}
            <span className="text-teal-600 font-semibold text-sm transition-colors duration-500 group-hover:text-teal-800 flex items-center space-x-1">
                <span>Explore</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </span>
        </Link>
    );
};

const HomeFeatures = () => {
    // Feature List updated with the provided navigation paths
    const features = [
        {
            title: "Freelance Gigs",
            description: "Find the perfect job listing for your skills. Clients post gigs, and you submit proposals secured by our transparent escrow system.",
            icon: "M21 13.255A23.593 23.593 0 0112 15c-3.18 0-6.36-.6-9-1.745M12 21V3", // Work/Briefcase/Chart icon
            iconBgColor: "bg-blue-100",
            iconColor: "text-blue-600",
            href: "/jobs", // Matches { name: 'Jobs', path: '/jobs' }
        },
        {
            title: "Buy Pre-Built Projects",
            description: "Purchase ready-made, fixed-price digital assets and projects directly from other creators. Instant access and secure transaction.",
            icon: "M7 7h.01M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z", // Document/Project Icon
            iconBgColor: "bg-yellow-100",
            iconColor: "text-yellow-600",
            href: "/catalog", // Matches { name: 'Projects', path: '/catalog' }
        },
        {
            title: "Expert Consultations",
            description: "Book time with top industry consultants and specialists. Secure your session fee instantly using our reliable escrow system.",
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", // Clock/Time Icon
            iconBgColor: "bg-green-100",
            iconColor: "text-green-600",
            href: "/consultations", // Matches { name: 'Consultants', path: '/consultations' }
        },
        {
            title: "Career & Tech Articles",
            description: "Stay ahead of the curve with our latest articles on freelance career growth, technology trends, and industry insights.",
            icon: "M19 20h-4L14 3m-4 5a4 4 0 100 8h4m-4-8a4 4 0 110 8", // Article/Book/News Icon
            iconBgColor: "bg-purple-100",
            iconColor: "text-purple-600",
            // Assuming this leads to a general articles/blog page
            href: "/articles", 
        },
    ];

    return (
        <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                    Marketplace Features Built for You
                </h2>
                <p className="text-xl text-gray-500 mb-16 max-w-3xl mx-auto">
                    A comprehensive platform to find work, sell projects, book experts, and grow your career, all in one place.
                </p>

                {/* Grid Layout (4 columns on large screens, 2 on medium) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard 
                            key={index}
                            title={feature.title}
                            description={feature.description}
                            icon={feature.icon}
                            iconBgColor={feature.iconBgColor}
                            iconColor={feature.iconColor}
                            href={feature.href} // Passing the path
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeFeatures;