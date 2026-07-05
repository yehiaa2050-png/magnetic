import React, { useState } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

export default function Tooltip({ text, children }: TooltipProps) {
    const [show, setShow] = useState(false);
    
    return (
        <div 
            className="relative inline-flex items-center cursor-help z-50 group" 
            onMouseEnter={() => setShow(true)} 
            onMouseLeave={() => setShow(false)}
        >
            {children}
            <div 
                className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[240px] bg-[#020617] border border-white/20 text-[#e2e8f0] text-[11px] p-3 rounded-lg shadow-2xl pointer-events-none text-center transform transition-all duration-200 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            >
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#020617]"></div>
            </div>
        </div>
    );
}
