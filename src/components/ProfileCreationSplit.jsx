import React from 'react';
import { Link } from 'react-router-dom'; 
import { User, Briefcase } from 'lucide-react';

// Helper component for the split column
const SplitColumn = ({ title, description, buttonText, bgColor, textColor, path, icon: Icon }) => (
    // Content takes up the full available height of the inner container.
    <div className={`flex flex-col items-center justify-center p-10 md:p-16 text-center ${bgColor} h-full transition-all duration-300`}>
        <div className="max-w-xs md:max-w-sm">
            
            {/* Icon */}
            <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-6 shadow-xl ${textColor} border-4 border-white`}>
                <Icon className="w-8 h-8" />
            </div>

            {/* Content */}
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-3 ${textColor}`}>{title}</h2> 
            <p className={`text-base mb-6 ${textColor} opacity-80`}>{description}</p>

            {/* Action Link (Teal Button Style) */}
            <Link 
                to={path} 
                className={`inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-full shadow-lg 
                            bg-teal-600 text-white hover:bg-teal-700 
                            transition-colors duration-200 ease-in-out transform hover:scale-[1.02]`}
            >
                {buttonText}
            </Link>
        </div>
    </div>
);

const ProfileCreationSplit = () => {
    return (
        // Root container: Removed max-w-7xl and explicit padding (px-4/sm:px-6/lg:px-8) 
        // to allow the component to span the full width of its parent.
        <div className="flex justify-center items-center w-full py-20 bg-gray-50">
            {/* Inner wrapper: Changed to w-full to fill the space. 
                Removed max-w-7xl and explicit padding. 
                The content inside the SplitColumn retains internal padding (p-10 md:p-16).
            */}
            <div className="flex flex-col md:flex-row w-full rounded-xl overflow-hidden shadow-2xl mx-4 sm:mx-6 lg:mx-8">
            
                {/* === LEFT SIDE: Freelancer/User Path (Teal Green) === */}
                <div className="w-full md:w-1/2">
                    <SplitColumn
                        title="I Am a Freelancer"
                        description="Create your profile, showcase your skills, and connect your wallet to start submitting proposals and getting paid."
                        buttonText="Create Profile & Connect Wallet"
                        // Teal/Dark Green Color Palette
                        bgColor="bg-[#1f4040]"
                        textColor="text-gray-100"
                        path="/profile" 
                        icon={User}
                    />
                </div>

                {/* === RIGHT SIDE: Client/Company Path (Beige) === */}
                <div className="w-full md:w-1/2">
                    <SplitColumn
                        title="I Am a Client/Company"
                        description="Set up your company profile, post your first job, and secure funds in escrow for trusted work delivery."
                        buttonText="Post a Job"
                        // Beige Color Palette
                        bgColor="bg-[#f0e6d6]"
                        textColor="text-gray-800"
                        path="/post-job" 
                        icon={Briefcase}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfileCreationSplit;