// src/FinanceNewsIndia.jsx

import React, { useEffect, useState } from "react";
import { Loader2, AlertTriangle, Newspaper } from "lucide-react"; 

// NOTE: Replace this with your actual GNews API Key. 
const API_KEY = "38476031c5d31bdfd4ee2404488db136"; // Get from https://gnews.io/

const NewsCard = ({ article }) => {
    // Format the publication date
    const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full bg-white rounded-xl shadow-lg border border-gray-100 p-5 
                       transition-all duration-300 hover:shadow-xl hover:scale-[1.01] flex flex-col group"
        >
            {/* Image */}
            {article.image && (
                <div className="rounded-lg overflow-hidden mb-4 h-36">
                    <img
                        alt={article.title}
                        src={article.image}
                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                    />
                </div>
            )}
            
            {/* Content Container */}
            <div className="flex flex-col flex-grow justify-between">
                <div>
                    {/* Source and Date */}
                    <div className="flex justify-between items-center text-xs text-teal-600 font-semibold mb-2 uppercase">
                        <span>{article.source?.name || "News Source"}</span>
                        <span className="text-gray-500 font-normal">{date}</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-extrabold text-gray-900 mb-2 leading-snug group-hover:text-teal-700 transition-colors">
                        {article.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {article.description}
                    </p>
                </div>
                
                {/* Read More Link */}
                <div className="mt-auto text-sm font-semibold text-teal-600 text-right">
                    Read Article &rarr;
                </div>
            </div>
        </a>
    );
};


const FinanceNewsIndia = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        
        fetch(
            `https://gnews.io/api/v4/top-headlines?token=${API_KEY}&topic=business&lang=en&country=in&max=9`
        )
        .then((res) => {
            if (!res.ok) {
                throw new Error(`API response error: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            const filteredArticles = data.articles ? data.articles.filter(a => a.title && a.description) : [];
            setArticles(filteredArticles);
        })
        .catch((err) => {
            console.error("Error fetching news:", err);
            setError("Failed to load news. Check API Key or network connection.");
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, []);

    // --- Conditional Rendering ---
    if (isLoading) {
        return (
            <div className="min-h-screen py-20 text-center bg-gradient-to-br from-teal-50 to-white via-green-50">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-600 text-lg">Loading the latest financial news...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 border border-red-300 rounded-lg max-w-xl mx-auto my-10">
                <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-3" />
                <p className="text-red-700 font-medium">⚠️ {error}</p>
            </div>
        );
    }
    
    if (articles.length === 0) {
        return (
            <div className="py-10 text-center text-gray-500 bg-gradient-to-br from-teal-50 to-white via-green-50">
                <Newspaper className="w-8 h-8 mx-auto mb-3" />
                No relevant business articles found for India.
            </div>
        );
    }

    // --- Main Content ---
    return (
        // ✅ Applied requested visible teal/green gradient background
        <div className="min-h-screen py-12 bg-gradient-to-br from-teal-50 to-white via-green-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
                {/* Header Section (Stylized and Centered) */}
                <div className="text-center mb-12 pt-8 pb-4">
                    
                    {/* ✅ Implemented requested header style (Your Food Your Story) */}
                    <h1 className='text-4xl sm:text-6xl font-extrabold sm:leading-16 text-gray-800 leading-tight'>
                        India’s <span className='text-lime-500'>Financial</span> <br className="hidden sm:inline" /> Frontier.
                    </h1>
                    
                    {/* Refined Subtitle */}
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-4">
                        “Stay Ahead with the Latest from India’s Business World — Curated for You.”.
                    </p>
                </div>
                
                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article, idx) => (
                        <NewsCard key={idx} article={article} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FinanceNewsIndia;