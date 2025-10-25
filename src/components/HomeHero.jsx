import React from 'react';
import Navbar from './Navbar';
import { ChevronDown } from 'lucide-react'; // Import the Chevron icon for custom dropdowns

const HomeHero = () => {
    // State and effect for scroll detection
    const ref = React.useRef(null);
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            // Check if the user has scrolled more than 100 pixels
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);

        // Cleanup function
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    return (
        <div className="min-h-screen relative overflow-x-hidden" ref={ref}>

            {/* --- 1. Navbar Integration --- */}
            {/* The Navbar component needs to have absolute/fixed positioning to float over the content */}
            <Navbar isScrolled={isScrolled} />

            {/* --- 2. Hero Background/Image --- */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://www.flexjobs.com/blog/wp-content/uploads/2025/04/What-Is-Freelancing-A-Complete-Guide-to-Freelance-Jobs.jpg"
                    className="w-full h-full object-cover"
                    alt="Freelancers working on code, symbolizing high-value contracts"
                />
                {/* Dark overlay for text visibility */}
                <div className="absolute inset-0 bg-gray-900/70"></div>
            </div>

            {/* --- 3. Content Container (Text Left, Card Right) --- */}
            <div className="relative z-10 pt-32 pb-16 md:pt-48 md:pb-32 px-4 md:px-12 lg:px-24 min-h-screen flex items-start md:items-center justify-center">
                
                <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center">
                    
                    {/* === LEFT SECTION: Main Title and Stats === */}
                    <div className="w-full text-white mb-16 md:mb-0 text-center md:text-left md:max-w-xl">
                        
                        <p className="text-teal-400 font-semibold mb-2 tracking-widest uppercase text-sm">TRUSTED ESCROW PLATFORM</p>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                            Verified Experts,
                            Global Talent,
                            <span className="text-teal-400"> Secure Payments.</span>
                        </h1>
                        <p className="text-xl font-light mb-12 max-w-2xl mx-auto md:mx-0">
                            Find the perfect freelancer or expert consultant and secure their payment instantly using our reliable, transparent escrow system.
                        </p>

                        {/* Stats Section */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-12 gap-y-6 mt-8">
                            <div>
                                <p className="text-4xl font-bold text-teal-400">12K+</p>
                                <p className="text-sm font-medium text-gray-300">Active Contracts</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-teal-400">50+</p>
                                <p className="text-sm font-medium text-gray-300">Expert Consultants</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-teal-400">1.5M</p>
                                <p className="text-sm font-medium text-gray-300">Value Secured</p>
                            </div>
                        </div>
                    </div>

                    {/* === RIGHT SECTION: Search Card (Refinements applied here) === */}
                    <div className="w-full max-w-sm lg:max-w-md mx-auto md:mx-0 p-6 md:p-10 rounded-xl bg-white shadow-2xl flex-shrink-0">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                            Find Your Next <span className="text-teal-600">Freelancer</span>
                        </h2>

                        {/* Search Form */}
                        <div className="space-y-4">
                            {/* Search Input */}
                            <div>
                                <label htmlFor="search-keywords" className="text-sm font-medium text-gray-600 mb-1 block">Search Keywords</label>
                                {/* Added focus ring for accessibility */}
                                <input id="search-keywords" type="text" placeholder="Design, Python, ASA..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:border-teal-500" />
                            </div>

                            {/* Dropdowns */}
                            <div className="flex flex-col gap-4"> 
                                {/* Service Type (Job, Project, Consultation) */}
                                <div>
                                    <label htmlFor="service-type" className="text-sm font-medium text-gray-600 mb-1 block">Service Type</label>
                                    {/* Added relative parent and chevron icon */}
                                    <div className="relative">
                                        <select id="service-type" className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:border-teal-500">
                                            <option>Job Listing</option>
                                            <option>Fixed-Price Project</option>
                                            <option>Consultation</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* ASA Type (ALGO or Specific ASA) */}
                                <div>
                                    <label htmlFor="currency-type" className="text-sm font-medium text-gray-600 mb-1 block">Currency (ASA)</label>
                                    <div className="relative">
                                        <select id="currency-type" className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:border-teal-500">
                                            <option>ALGO</option>
                                            <option>USDC (ASA)</option>
                                            <option>Other ASA...</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Budget / Rate */}
                            <div>
                                <label htmlFor="max-budget" className="text-sm font-medium text-gray-600 mb-1 block">Max Budget/Hourly Rate</label>
                                <input id="max-budget" type="number" placeholder="e.g., 500 ALGO" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:border-teal-500" />
                            </div>

                            {/* Search Button (Added interactivity and shadow) */}
                            <button className="w-full bg-teal-600 text-white font-semibold py-3 rounded-lg hover:bg-teal-700 transition-colors mt-6 cursor-pointer shadow-lg hover:shadow-xl">
                                Search Talent
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeHero;