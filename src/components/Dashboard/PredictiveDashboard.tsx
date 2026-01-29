"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Legend, ComposedChart
} from 'recharts';
import {
    BrainCircuit,
    TrendingUp,
    DollarSign,
    Box,
    Sparkles,
    Calendar,
    Target
} from 'lucide-react';

const mockProjectedData = [
    { month: 'Ene', actual: 4000, projected: 4200, revenue: 120000 },
    { month: 'Feb', actual: 4100, projected: 4300, revenue: 125000 },
    { month: 'Mar', actual: 4500, projected: 4600, revenue: 140000 },
    { month: 'Abr', actual: 4800, projected: 5000, revenue: 155000 },
    { month: 'May', actual: null, projected: 5400, revenue: 168000 },
    { month: 'Jun', actual: null, projected: 5800, revenue: 180000 },
    { month: 'Jul', actual: null, projected: 6200, revenue: 195000 },
    { month: 'Ago', actual: null, projected: 6500, revenue: 210000 },
    { month: 'Set', actual: null, projected: 6800, revenue: 220000 },
    { month: 'Oct', actual: null, projected: 7000, revenue: 235000 },
    { month: 'Nov', actual: null, projected: 7300, revenue: 250000 },
    { month: 'Dic', actual: null, projected: 7800, revenue: 280000 },
];

const PredictiveDashboard = () => {
    return (
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-white">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BrainCircuit className="w-5 h-5 text-indigo-400" />
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">IA VANGUARD ENGINE</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 uppercase">
                        Predicciones de Producción
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Modelos predictivos basados en telemetría IoT y datos históricos.</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex items-center gap-3">
                        <Sparkles className="text-indigo-400 w-5 h-5" />
                        <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Confianza IA</span>
                            <span className="text-lg font-mono font-bold">96.4%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <Box className="w-6 h-6 text-blue-400" />
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">+12% vs 2025</span>
                    </div>
                    <div className="mt-4">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Producción Anual Est.</span>
                        <span className="text-3xl font-black font-mono">72,500 <span className="text-sm">un.</span></span>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold">ROI Proyectado</span>
                    </div>
                    <div className="mt-4">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ingresos Previstos (12m)</span>
                        <span className="text-3xl font-black font-mono">S/ 2.4M</span>
                    </div>
                </div>

                <div className="bg-indigo-600 p-6 rounded-2xl flex flex-col justify-between shadow-xl shadow-indigo-500/20">
                    <div className="flex justify-between items-start">
                        <Target className="w-6 h-6 text-white" />
                        <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
                    </div>
                    <div className="mt-4">
                        <span className="block text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Estado Optimizador</span>
                        <span className="text-2xl font-black">MÁXIMA EFICIENCIA</span>
                        <p className="text-[10px] text-white/60 mt-1 font-medium italic">IA sugiriendo aumento de 5% en nutrición.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* PROJECTION CHART */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2 uppercase">
                            <TrendingUp className="w-4 h-4 text-indigo-400" /> Forecast de Saca (Cerdos/Lotes)
                        </h3>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={mockProjectedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="projected" stroke="#6366f1" strokeWidth={3} fillOpacity={0.1} fill="#6366f1" />
                                <Bar dataKey="actual" fill="#10b981" barSize={15} radius={[4, 4, 0, 0]} />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* REVENUE FORECAST */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2 uppercase">
                            <DollarSign className="w-4 h-4 text-emerald-400" /> Proyección Financiera (S/.)
                        </h3>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockProjectedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                    formatter={(value: any) => [value ? `S/ ${value.toLocaleString()}` : 'N/A', 'Ingreso']}
                                />
                                <Line type="stepAfter" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={true} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* AI STRATEGY CARD */}
            <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900/40 border border-indigo-500/30 p-8 rounded-3xl relative overflow-hidden">
                <div className="max-w-xl relative z-10">
                    <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">
                        Recomendación Estratégica
                    </div>
                    <h2 className="text-2xl font-black mb-4 tracking-tighter">OPTIMIZACIÓN DE PRODUCCIÓN Q3-Q4</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                        Basado en las variables climáticas proyectadas (Fenómeno del Niño debilatado) y el costo del maíz en el mercado internacional, la IA recomienda adelantar la saca del Galpón A-2 en <span className="text-white font-bold">4 días</span> para maximizar el margen de utilidad ante la volatilidad de precios en Mayo.
                    </p>
                    <div className="flex gap-4">
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest">
                            Aplicar Recomendación
                        </button>
                        <button className="border border-slate-700 hover:bg-slate-800 text-slate-300 px-6 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest">
                            Ver Análisis Detallado
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-10 opacity-10 select-none">
                    <BrainCircuit className="w-64 h-64 text-indigo-400 rotate-12" />
                </div>
            </div>
        </div>
    );
};

export default PredictiveDashboard;
