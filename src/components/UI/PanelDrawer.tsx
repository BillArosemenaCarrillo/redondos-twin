"use client";
import React from 'react';

interface PanelDrawerProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const PanelDrawer: React.FC<PanelDrawerProps> = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute top-4 left-20 z-40 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-left-4 duration-300">
            {/* Header */}
            <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="font-bold text-white text-sm tracking-wide uppercase">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    ✕
                </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[80vh] overflow-y-auto custom-scrollbar text-white">
                {children}
            </div>
        </div>
    );
};
