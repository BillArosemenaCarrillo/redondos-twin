"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import {
    TrendingUp,
    AlertTriangle,
    PieChart as PieIcon,
    Table as TableIcon,
    ChevronRight
} from 'lucide-react';

const mockPerformanceData = [
    { day: 'Lun', gms: 750, target: 800, fci: 1.8 },
    { day: 'Mar', gms: 780, target: 800, fci: 1.75 },
    { day: 'Mie', gms: 810, target: 800, fci: 1.72 },
    { day: 'Jue', gms: 740, target: 800, fci: 1.85 },
    { day: 'Vie', gms: 820, target: 800, fci: 1.68 },
    { day: 'Sab', gms: 850, target: 800, fci: 1.65 },
    { day: 'Dom', gms: 830, target: 800, fci: 1.67 },
];

const mockInventory = [
    { id: 1, name: 'Galpon A-1', type: 'Cerdos', age: '20w', count: 80, stage: 'Engorde', status: 'Optimal' },
    { id: 2, name: 'Galpon A-2', type: 'Cerdos', age: '50w', count: 20, stage: 'Recria', status: 'Warning' },
    { id: 3, name: 'Silo Principal', type: 'Alimento', level: '75%', capacity: '20k kg', status: 'Optimal' },
    { id: 4, name: 'Galpon B-1', type: 'Pollos', age: '3w', count: 2500, stage: 'Crecimiento', status: 'Optimal' },
];

const GestorDashboard = () => {
    return (
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-white">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">
                        CENTRO DE GESTIÓN (GESTOR)
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Análisis de productividad y control administrativo global.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                        <TrendingUp className="text-emerald-400 w-5 h-5" />
                        <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Eficiencia Global</span>
                            <span className="text-lg font-mono font-bold">94.2%</span>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                        <AlertTriangle className="text-yellow-400 w-5 h-5" />
                        <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Alertas Activas</span>
                            <span className="text-lg font-mono font-bold text-yellow-400">02</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* CHART 1: GMS vs Target */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-400" /> CURVA G.M.S (GR/DÍA)
                        </h3>
                    </div>
                    <div className="h-64 sm:h-72 w-full" style={{ minWidth: 0, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={mockPerformanceData}>
                                <defs>
                                    <linearGradient id="colorGms" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="gms" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorGms)" />
                                <Line type="monotone" dataKey="target" stroke="#475569" strokeDasharray="5 5" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CHART 2: FCI Efficiency */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2">
                            <PieIcon className="w-4 h-4 text-emerald-400" /> ÍNDICE CONVERSIÓN (ICA)
                        </h3>
                    </div>
                    <div className="h-64 sm:h-72 w-full" style={{ minWidth: 0, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart data={mockPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                />
                                <Bar dataKey="fci" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* INVENTORY TABLE */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-pink-400" /> INVENTARIO GENERAL
                    </h3>
                    <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                        EXPORTAR CSV <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800/50">
                                <th className="px-6 py-4">ID / Nombre</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Etapa / Edad</th>
                                <th className="px-6 py-4">Cantidad / Nivel</th>
                                <th className="px-6 py-4 text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {mockInventory.map((item) => (
                                <tr key={item.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-200">{item.name}</td>
                                    <td className="px-6 py-4 text-slate-400">{item.type}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-indigo-400 uppercase">
                                            {item.stage || 'N/A'}
                                        </span>
                                        <span className="ml-2 text-slate-500 text-xs">{item.age || ''}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-slate-300">
                                        {item.count ? `${item.count} un.` : item.level}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Optimal' ? 'bg-emerald-400' : 'bg-yellow-400 animate-pulse'}`}></div>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GestorDashboard;
