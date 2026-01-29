"use client";
import React from 'react';

type PanelType = 'map' | 'bim' | 'data' | 'weather' | 'settings' | null;

interface SidebarProps {
    activePanel: PanelType;
    setActivePanel: (p: PanelType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePanel, setActivePanel }) => {

    const items = [
        { id: 'map', icon: '🗺️', label: 'Mapa ID', desc: 'Capas GIS y Edificios 3D' },
        { id: 'bim', icon: '🏢', label: 'Modelo BIM', desc: 'Georreferenciación y Carga' },
        { id: 'data', icon: '📊', label: 'Sensores IoT', desc: 'InkaMonitor Live Data' },
        { id: 'weather', icon: '☀️', label: 'Entorno', desc: 'Clima, Sol y Sombras' },
        { id: 'settings', icon: '⚙️', label: 'Config', desc: 'Ajustes Generales' },
    ];

    return (
        <div className="absolute top-0 left-0 h-full w-16 bg-red-900/90 backdrop-blur-xl border-r border-red-500/30 flex flex-col items-center py-4 z-50 shadow-2xl">
            {/* Logo Placeholder - Redondos R */}
            <div className="mb-8 w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-red-600 text-xl shadow-[0_0_15px_rgba(255,255,255,0.5)] border-2 border-red-600">
                R
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-4 w-full px-2">
                {items.map((item) => {
                    const isActive = activePanel === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActivePanel(isActive ? null : item.id as PanelType)}
                            title={item.label}
                            className={`
                                relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300
                                ${isActive ? 'bg-white text-red-600 shadow-inner border border-red-500' : 'text-red-200/70 hover:bg-red-800 hover:text-white'}
                            `}
                        >
                            <span className="text-xl">{item.icon}</span>

                            {/* Tooltip (Redondos Style) */}
                            <div className="absolute left-14 bg-red-950 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-red-500/30 transition-opacity z-50">
                                <strong>{item.label}</strong>
                                <div className="text-red-200 text-[10px]">{item.desc}</div>
                            </div>

                            {/* Active Indicator */}
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full" />}
                        </button>
                    )
                })}
            </div>

            <div className="mt-auto">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-bold border-2 border-red-600 text-red-700">
                    ADM
                </div>
            </div>
        </div>
    );
};
