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
    Smartphone,
    Factory
} from 'lucide-react';

interface SidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
    const menuItems = [
        { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard, color: 'text-indigo-400' },
        { id: 'plant', label: 'PLANTA ALIM.', icon: Factory, color: 'text-orange-500' },
        { id: 'logistics', label: 'LOGISTICS', icon: Truck, color: 'text-emerald-400' },
        { id: 'feeding', label: 'FEEDING', icon: Beef, color: 'text-yellow-400' },
        { id: 'climate', label: 'CLIMATE', icon: Thermometer, color: 'text-cyan-400' },
        { id: 'management', label: 'GESTOR', icon: BarChart3, color: 'text-pink-400' },
        { id: 'biosecurity', label: 'BIO-SEC', icon: ShieldCheck, color: 'text-purple-400' },
        { id: 'welfare', label: 'WELFARE', icon: Heart, color: 'text-pink-500' },
        { id: 'sync', label: 'MOBILE SYNC', icon: Smartphone, color: 'text-orange-400' },
        { id: 'predictive', label: 'PREDICTIONS', icon: Sparkles, color: 'text-indigo-400' },
        { id: 'resources', label: 'RESOURCES', icon: Droplets, color: 'text-blue-400' },
    ];

    return (
        <div className="h-full w-full bg-slate-950 border-t md:border-t-0 md:border-r border-slate-800 flex flex-row md:flex-col items-center py-2 md:py-6 px-4 md:px-0 gap-4 md:gap-8 z-50 overflow-x-auto md:overflow-x-visible hide-scrollbar">
            <div className="hidden md:flex flex-col items-center gap-1 mb-4">
                <CircleDot className="w-8 h-8 text-indigo-500 animate-pulse" />
                <span className="text-[8px] font-black tracking-tighter text-slate-500">VANGUARD</span>
            </div>

            <div className="flex flex-row md:flex-col gap-2 md:gap-4 flex-1 md:flex-none justify-around md:justify-start w-full md:w-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`group relative p-2 md:p-3 rounded-xl transition-all duration-300 ${isActive
                                ? 'bg-indigo-500/20 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                : 'hover:bg-slate-900 border border-transparent'
                                }`}
                        >
                            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? item.color : 'text-slate-500 group-hover:text-slate-300'}`} />

                            {/* Tooltip - Hide on mobile */}
                            <div className="hidden md:block absolute left-full ml-4 px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-xl">
                                {item.label}
                            </div>

                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute md:left-[-4px] bottom-[-4px] md:bottom-auto md:top-1/4 md:bottom-1/4 left-1/4 right-1/4 md:right-auto md:w-1 md:h-auto h-1 bg-indigo-500 rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="hidden md:flex mt-auto flex flex-col gap-4">
                <button className="p-3 text-slate-500 hover:text-white transition-colors">
                    <Settings className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
