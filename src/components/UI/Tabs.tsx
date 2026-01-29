"use client";
import React, { useState } from 'react';

interface Tab {
    id: string;
    label: string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="flex border-b border-white/10 mb-4">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        px-4 py-2 text-sm font-medium transition-colors relative
                        ${activeTab === tab.id ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}
                    `}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_cyan]" />
                    )}
                </button>
            ))}
        </div>
    );
};
