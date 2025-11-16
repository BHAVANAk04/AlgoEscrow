
import React from 'react'

const Footer = () => {
  return (
    <>
    
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
            
            <footer className="flex flex-wrap justify-center lg:justify-between overflow-hidden gap-10 md:gap-20 py-16 px-6 md:px-16 lg:px-24 xl:px-32 text-[13px] text-gray-500 bg-black">
                <div className="flex flex-wrap items-start gap-10 md:gap-[60px] xl:gap-[140px]">
                    
                    <div>
                        <p className="text-slate-100 font-semibold">Platform</p>
                        <ul className="mt-2 space-y-2">
                            <li><a href="/" className="hover:text-teal-400 transition">Home</a></li>
                            <li><a href="/jobs" className="hover:text-teal-400 transition">Browse Gigs</a></li>
                            <li><a href="/consultations" className="hover:text-teal-400 transition">Consultations</a></li>
                            <li><a href="/catalog" className="hover:text-teal-400 transition">Project Catalog</a></li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-slate-100 font-semibold">Resources</p>
                        <ul className="mt-2 space-y-2">
                            <li><a href="/" className="hover:text-teal-400 transition">Documentation</a></li>
                            <li><a href="/articles" className="hover:text-teal-400 transition">Blog & Articles</a></li>
                            <li><a href="/" className="hover:text-teal-400 transition">Community Discord</a></li>
                            <li><a href="/" className="hover:text-teal-400 transition">Support<span className="text-xs bg-teal-500 rounded-md ml-2 px-2 py-1">Always Here!</span></a></li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-slate-100 font-semibold">Legal</p>
                        <ul className="mt-2 space-y-2">
                            <li><a href="/" className="hover:text-teal-400 transition">Privacy Policy</a></li>
                            <li><a href="/" className="hover:text-teal-400 transition">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col max-md:items-center max-md:text-center gap-2 items-end">
                    <p className="max-w-60">Secure freelancing with trustless escrow on Algorand blockchain.</p>
                    <div className="flex items-center gap-4 mt-3">
                        <a href="https://github.com/algoescrow" target="_blank" rel="noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github size-5 hover:text-teal-400" aria-hidden="true">
                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c2.6-.4 5.3-1.1 5.3-6a4.7 4.7 0 0 0-1.3-3.2 4.4 4.4 0 0 0-.1-3.2s-1.1-.3-3.6 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.4 4.4 0 0 0-.1 3.2A4.7 4.7 0 0 0 4 9c0 4.9 2.7 5.7 5.3 6-.3.3-.6.7-.7 1.2-.6.4-2.1.7-3.2-.8-1-1.6-3-1.8-3-1.8-1.9 0-.1 1.2 0 1.6 1.2.6 2 3 2 3 1.1 3.3 6.5 2.7 6.5 2.7v4"></path>
                            </svg>
                        </a>
                        <a href="https://www.linkedin.com/company/algoescrow" target="_blank" rel="noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin size-5 hover:text-teal-400" aria-hidden="true">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                <rect width="4" height="12" x="2" y="9"></rect>
                                <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                        </a>
                        <a href="https://x.com/algoescrow" target="_blank" rel="noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter size-5 hover:text-teal-400" aria-hidden="true">
                                <path
                                    d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z">
                                </path>
                            </svg>
                        </a>
                        <a href="https://www.youtube.com/@algoescrow" target="_blank" rel="noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube size-6 hover:text-teal-400" aria-hidden="true">
                                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17">
                                </path>
                                <path d="m10 15 5-3-5-3z"></path>
                            </svg>
                        </a>
                    </div>
                    <p className="mt-3 text-center">© 2025 <a href="/" className="text-teal-400 hover:text-teal-300 transition">AlgoEscrow</a></p>
                </div>
            </footer>
        </>
    );
};
    
   

export default Footer



