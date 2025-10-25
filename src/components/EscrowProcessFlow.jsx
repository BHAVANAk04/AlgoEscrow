import React from 'react';
import { Lock, CheckCircle, Briefcase, DollarSign, UserCheck, MessageSquare, History, FileText } from 'lucide-react';

// Data for the 8 core process and feature steps
const processSteps = [
    {
        id: 1,
        title: "Create Detailed Profile",
        description: "Freelancers build detailed portfolios and Clients verify credentials before starting any transaction.",
        icon: UserCheck,
        side: 'left',
        color: 'text-blue-600',
    },
    {
        id: 2,
        title: "Client Secures Funds (Lock)",
        description: "The Client initiates the contract and **funds the decentralized escrow Smart Contract (ASC1)** with the agreed-upon ALGO or ASA tokens.",
        icon: Lock,
        side: 'left',
        color: 'text-green-600',
    },
    {
        id: 3,
        title: "Real-Time Chat Integration",
        description: "Once funded, a secure, private chat channel is activated for the Client and Freelancer to discuss requirements and progress.",
        icon: MessageSquare,
        side: 'left',
        color: 'text-yellow-600',
    },
    {
        id: 4,
        title: "Freelancer Delivers Work",
        description: "The Freelancer completes the defined scope of work, confident that payment is **immutably secured** by the contract.",
        icon: Briefcase,
        side: 'left',
        color: 'text-red-600',
    },
    {
        id: 5,
        title: "Client Reviews & Approves",
        description: "The Client reviews the final delivery or confirmed consultation time, and confirms satisfaction to trigger the payment release.",
        icon: CheckCircle,
        side: 'right',
        color: 'text-teal-600',
    },
    {
        id: 6,
        title: "Instant Trustless Payment",
        description: "The secured funds are **instantly and automatically transferred** from the escrow contract to the Freelancer’s wallet via an inner transaction.",
        icon: DollarSign,
        side: 'right',
        color: 'text-indigo-600',
    },
    {
        id: 7,
        title: "Transaction History Log",
        description: "Every fund movement (lock, release, refund) is permanently logged and verifiable via the **Algorand Indexer** and displayed on the dashboard.",
        icon: History,
        side: 'right',
        color: 'text-cyan-600',
    },
    {
        id: 8,
        title: "Ratings & Portfolio Update",
        description: "Upon completion, the Client leaves a review, which immediately updates the Freelancer’s **public portfolio and professional rating**.",
        icon: FileText,
        side: 'right',
        color: 'text-purple-600',
    },
];

// Helper component for a single process step (Cleaner UI)
const ProcessStep = ({ title, description, icon: Icon, color, isRight }) => (
    // The main container uses flex-row for left steps and flex-row-reverse for right steps.
    // The text alignment must also be adjusted for the right steps to align towards the center.
    <div className={`flex items-start w-full ${isRight ? 'flex-row' : 'flex-row-reverse'}`}> 
        
        {/* Content: Text aligned right for left steps, left for right steps */}
        <div className={`flex-grow ${isRight ? 'text-left mr-8' : 'text-right ml-8'}`}> 
            <h3 className={`text-xl font-bold text-gray-900 mb-1`}>{title}</h3> 
            <p className="text-gray-700 text-sm max-w-xs inline-block">{description}</p>
        </div>
        
        {/* Icon Container: Fixed size and appearance */}
        <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full ${color} bg-gray-100 shadow-md ring-4 ring-white relative z-10`}>
            <Icon className="w-8 h-8" />
        </div>
        
    </div>
);

const EscrowProcessFlow = () => {
    // Separate steps into left and right columns
    const leftSteps = processSteps.filter(step => step.side === 'left');
    const rightSteps = processSteps.filter(step => step.side === 'right');

    return (
        <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                
                {/* Header Section */}
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                    The Trustless Escrow Process
                </h2>
                <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-16">
                    Every step, from profile creation to final payment, is secured, transparent, and built for the decentralized web.
                </p>

                {/* Process Grid: Two columns of content with a central timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-12 lg:gap-x-12 items-start">
                    
                    {/* LEFT COLUMN: Steps 1 - 4 (Content aligns to the right edge of the column) */}
                    <div className="flex flex-col items-end space-y-12"> 
                        {leftSteps.map(step => (
                            <ProcessStep 
                                key={step.id} 
                                title={step.title} 
                                description={step.description} 
                                icon={step.icon} 
                                color={step.color} 
                                isRight={false} // Renders on the left column side
                            />
                        ))}
                    </div>

                    {/* CENTER COLUMN: Central Visual and Timeline */}
                    <div className="flex justify-center items-center relative order-first lg:order-none py-12 lg:py-0">
                        {/* Vertical line connecting the steps */}
                        <div className="hidden lg:block absolute inset-y-0 left-1/2 w-1 bg-teal-100 transform -translate-x-1/2 rounded-full"></div>
                        
                        {/* Central Teal Icon/App Focus */}
                        <div className="w-48 h-48 flex items-center justify-center rounded-full bg-teal-600 shadow-2xl relative z-10 ring-8 ring-white">
                            <Lock className="w-20 h-20 text-white" />
                        </div>

                        {/* Mobile view separation line (removed, not needed with single column flow) */}
                    </div>

                    {/* RIGHT COLUMN: Steps 5 - 8 (Content aligns to the left edge of the column) */}
                    <div className="flex flex-col items-start space-y-12"> 
                        {rightSteps.map(step => (
                            <ProcessStep 
                                key={step.id} 
                                title={step.title} 
                                description={step.description} 
                                icon={step.icon} 
                                color={step.color} 
                                isRight={true} // Renders on the right column side
                            />
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EscrowProcessFlow;