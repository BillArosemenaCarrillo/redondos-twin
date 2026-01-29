"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Thermometer,
    Droplets,
    Beef,
    Truck,
    BarChart3,
    ShieldCheck,
    Settings,
    CircleDot,
    Sparkles,
    Heart,
    Smartphone
} from 'lucide-react';

interface SidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
    const menuItems = [
        { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard, color: 'text-indigo-400' },
        { id: 'climate', label: 'CLIMATE', icon: Thermometer, color: 'text-cyan-400' },
        { id: 'feeding', label: 'FEEDING', icon: Beef, color: 'text-yellow-400' },
        { id: 'logistics', label: 'LOGISTICS', icon: Truck, color: 'text-emerald-400' },
        { id: 'management', label: 'GESTOR', icon: BarChart3, color: 'text-pink-400' },
        { id: 'biosecurity', label: 'BIO-SEC', icon: ShieldCheck, color: 'text-purple-400' },
        { id: 'welfare', label: 'WELFARE', icon: Heart, color: 'text-pink-500' },
        { id: 'sync', label: 'MOBILE SYNC', icon: Smartphone, color: 'text-orange-400' },
        { id: 'predictive', label: 'PREDICTIONS', icon: Sparkles, color: 'text-indigo-400' },
        { id: 'resources', label: 'RESOURCES', icon: Droplets, color: 'text-blue-400' },
    ];

    return (
        <div className="h-full w-20 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-6 gap-8 z-50">
            <div className="flex flex-col items-center gap-1 mb-4">
                <CircleDot className="w-8 h-8 text-indigo-500 animate-pulse" />
                <span className="text-[8px] font-black tracking-tighter text-slate-500">VANGUARD</span>
            </div>

            <div className="flex flex-col gap-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`group relative p-3 rounded-xl transition-all duration-300 ${isActive
                                ? 'bg-indigo-500/20 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                : 'hover:bg-slate-900 border border-transparent'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? item.color : 'text-slate-500 group-hover:text-slate-300'}`} />

                            {/* Tooltip */}
                            <div className="absolute left-full ml-4 px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-xl">
                                {item.label}
                            </div>

                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-[-4px] top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-auto flex flex-col gap-4">
                <button className="p-3 text-slate-500 hover:text-white transition-colors">
                    <Settings className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
