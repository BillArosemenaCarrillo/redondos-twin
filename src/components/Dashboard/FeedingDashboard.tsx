"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Beef,
    Package,
    TrendingDown,
    BarChart3,
    Calendar,
    Layers
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const mockFeedData = [
    { stage: 'Silo 01 (Engorde)', value: 8500, color: '#6366f1' },
    { stage: 'Silo 02 (Inicio)', value: 4200, color: '#10b981' },
    { stage: 'Silo 03 (Recria)', value: 2100, color: '#f59e0b' },
];

const mockEfficiency = [
    { day: 'Lun', fci: 1.82, target: 1.70 },
    { day: 'Mar', fci: 1.78, target: 1.70 },
    { day: 'Mie', fci: 1.75, target: 1.70 },
    { day: 'Jue', fci: 1.72, target: 1.70 },
    { day: 'Vie', fci: 1.69, target: 1.70 },
    { day: 'Sab', fci: 1.67, target: 1.70 },
];

const FeedingDashboard = () => {
    return (
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-white">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        FEEDING ANALYTICS
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Gestión de silos, optimización de conversión y costos.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                        <Beef className="text-yellow-400 w-5 h-5" />
                        <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Consumo Diario</span>
                            <span className="text-lg font-mono font-bold">12,450 kg</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* SILO STATUS CARDS */}
                {mockFeedData.map((silo, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={silo.stage}
                        className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden"
                    >
                        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent to-current opacity-30`} style={{ color: silo.color, width: '100%' }}></div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{silo.stage}</span>
                            <Package className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black font-mono">{silo.value.toLocaleString()}</span>
                            <span className="text-xs text-slate-500 font-bold">KG</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="h-1.5 flex-1 bg-slate-800 rounded-full mr-4 overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${(silo.value / 10000) * 100}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{Math.round((silo.value / 10000) * 100)}%</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* EFFICIENCY CHART */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-400" /> EFICIENCIA DE CONVERSIÓN (ICA)
                    </h3>
                    <div className="h-64 sm:h-72 w-full" style={{ minWidth: 0, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={mockEfficiency}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="day" stroke="#475569" fontSize={10} />
                                <YAxis stroke="#475569" fontSize={10} domain={[1.5, 2]} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                                <Area type="monotone" dataKey="fci" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
                                <Area type="monotone" dataKey="target" stroke="#475569" strokeDasharray="5 5" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 flex items-center gap-3">
                        <TrendingDown className="text-emerald-400 w-5 h-5" />
                        <p className="text-xs text-emerald-100 font-medium">La eficiencia ha mejorado un **4.2%** en los últimos 5 días.</p>
                    </div>
                </div>

                {/* FEED DISTRIBUTION */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center shadow-xl">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 mb-6 self-start flex items-center gap-2">
                        <Layers className="w-4 h-4 text-yellow-400" /> DISTRIBUCIÓN DE INVENTARIO
                    </h3>
                    <div className="h-64 sm:h-72 w-full" style={{ minWidth: 0, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={mockFeedData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {mockFeedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-8 mt-4 w-full px-4 text-center">
                        {mockFeedData.map((item) => (
                            <div key={item.stage} className="text-center">
                                <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{item.stage.split(' ')[2]}</span>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-black font-mono">{Math.round((item.value / 14800) * 100)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedingDashboard;
