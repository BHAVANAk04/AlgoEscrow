import React, { useState } from 'react';
// 1. ADD: Import the necessary icons for the dropdown links
import { Shield, ChevronDown, Briefcase, UserCheck, Package } from 'lucide-react'; 

// 2. ADD: Define the postLinks array
const postLinks = [
    { name: 'Post Job', path: '/post-job', icon: Briefcase },
    { name: 'Post Consultation', path: '/consultations', icon: UserCheck },
    { name: 'Post Project', path: '/catalog', icon: Package },
];

const Navbar = ({ isScrolled }) => {
    const navLinks = [
        { name: 'Jobs', path: '/jobs' },
        { name: 'Projects', path: '/catalog' },
        { name: 'Consultants', path: '/consultations' },
        { name: 'Create Escrow', path: '/create-escrow' },
        { name: 'Dashboard', path: '/dashboard' }, 
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // 3. ADD: State for the Post dropdown
    const [isPostDropdownOpen, setIsPostDropdownOpen] = useState(false); 

    // Base color is TRANSPARENT, scroll color is white/light
    const scrolledColor = "bg-white/95 shadow-lg text-gray-800 backdrop-blur-md";
    const baseTextColor = "text-white";
    const scrolledTextColor = "text-gray-700";

    return (
        <nav
            // 4. Update z-index from z-50 to z-20 (from the first file) for consistency, although z-50 is fine too.
            className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-12 lg:px-24 transition-all duration-500 z-20 ${
                isScrolled ? `${scrolledColor} py-3 md:py-4` : `bg-transparent py-4 md:py-6`
            }`}
        >
            {/* Logo/dApp Name */}
            <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-wider">
                <svg
                    className={`h-8 w-8 transition-all duration-500 ${isScrolled ? 'text-teal-600' : baseTextColor}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 11C10.619 11 9.5 12.119 9.5 13.5V17.5C9.5 18.881 10.619 20 12 20C13.381 20 14.5 18.881 14.5 17.5V13.5C14.5 12.119 13.381 11 12 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M19 11H5C4.44772 11 4 11.4477 4 12V21C4 21.5523 4.44772 22 5 22H19C19.5523 22 20 21.5523 20 21V12C20 11.4477 19.5523 11 19 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 4V7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 2L12 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className={isScrolled ? scrolledTextColor : baseTextColor}>WorknHire</span>
            </a>

            {/* Desktop Nav Links (Center) */}
            <div className="hidden md:flex items-center gap-6 lg:gap-10">
                {navLinks.map((link, i) => (
                    <a
                        key={i}
                        href={link.path}
                        className={`group flex flex-col gap-0.5 font-medium ${isScrolled ? scrolledTextColor : baseTextColor}`}
                    >
                        {link.name}
                        <div
                            className={`${isScrolled ? 'bg-teal-600' : 'bg-white'} h-0.5 w-0 group-hover:w-full transition-all duration-300`}
                        />
                    </a>
                ))}
                
                {/* 5. REPLACE the single Post Job button with the Post Dropdown */}
                <div 
                    className="relative h-full flex items-center"
                >
                    <button
                        type="button"
                        onClick={() => setIsPostDropdownOpen(!isPostDropdownOpen)} 
                        onMouseDown={(e) => e.preventDefault()} 
                        className={`flex items-center border-2 px-4 py-1 text-sm font-semibold rounded-full cursor-pointer transition-all duration-300 ${
                            isScrolled
                                ? 'border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white'
                                : 'border-white text-white hover:bg-white hover:text-teal-600'
                        }`}
                        aria-haspopup="true"
                        aria-expanded={isPostDropdownOpen}
                    >
                        Post
                        {/* Rotate the icon when open */}
                        <ChevronDown className={`w-4 h-4 ml-1.5 transition-transform duration-200 ${isPostDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                    
                    {/* Dropdown Menu Content - Links are fully clickable <a> tags */}
                    {isPostDropdownOpen && (
                        <div
                            className="absolute top-full mt-2 w-56 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                            style={{ zIndex: 150 }} 
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="menu-button"
                        >
                            <div className="py-1" role="none">
                                {postLinks.map((item, index) => (
                                    <a
                                        key={index}
                                        href={item.path} 
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem"
                                        // Close the dropdown when a link is clicked
                                        onClick={() => setIsPostDropdownOpen(false)} 
                                    >
                                        <item.icon className="w-4 h-4 mr-2 text-teal-600" />
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Right - Sell Algo & Login */}
            <div className="hidden md:flex items-center gap-4">
                <svg
                    className={`h-6 w-6 mr-2 cursor-pointer ${isScrolled ? 'text-gray-700 hover:text-teal-600' : baseTextColor}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <a
                    href="https://www.kraken.com/learn/sell-algorand-algo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-500 ${
                        isScrolled ? 'text-white bg-teal-600 hover:bg-teal-700' : 'bg-white text-teal-600 hover:bg-gray-100'
                    }`}
                >
                    Sell Algo
                </a>
                <a
                    href="/auth"
                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-500 ${
                        isScrolled ? 'text-teal-600 border-2 border-teal-600 hover:bg-teal-600 hover:text-white' : 'border-2 border-white text-white hover:bg-white hover:text-teal-600'
                    }`}
                >
                    Login
                </a>
            </div>

            {/* Mobile Menu Button (Hamburger) */}
            <div className="flex items-center gap-3 md:hidden">
                <svg
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`h-7 w-7 cursor-pointer ${isScrolled ? 'text-teal-600' : baseTextColor}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-8 font-medium text-gray-800 transition-all duration-500 ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <button className="absolute top-6 right-6" onClick={() => setIsMenuOpen(false)}>
                    <svg className="h-7 w-7 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {navLinks.map((link, i) => (
                    <a
                        key={i}
                        href={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="text-xl hover:text-teal-600 transition-colors"
                    >
                        {link.name}
                    </a>
                ))}

                {/* 6. REPLACE the single Mobile Post Job button with the Mobile Post Links */}
                {postLinks.map((item, index) => (
                    <a
                        key={`mobile-post-${index}`}
                        href={item.path} 
                        onClick={() => setIsMenuOpen(false)}
                        className="text-lg text-teal-600 hover:text-teal-800 transition-colors"
                    >
                        {item.name}
                    </a>
                ))}

                <a
                    href="https://www.kraken.com/learn/sell-algorand-algo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-teal-600 text-white px-8 py-2.5 rounded-full font-semibold text-lg transition-all duration-500 hover:bg-teal-700 mt-2"
                    onClick={() => setIsMenuOpen(false)}
                >
                    Sell Algo
                </a>
                <a
                    href="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="border-2 border-teal-600 text-teal-600 px-8 py-2.5 rounded-full font-semibold text-lg transition-all duration-500 hover:bg-teal-600 hover:text-white"
                >
                    Login
                </a>
            </div>
        </nav>
    );
};

export default Navbar;