"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Factory,
    Zap,
    Droplets,
    Flame,
    Settings,
    ArrowUpRight,
    Container,
    Activity,
    AlertCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

const mockProduction = [
    { hour: '08:00', tons: 12, target: 15 },
    { hour: '10:00', tons: 18, target: 15 },
    { hour: '12:00', tons: 14, target: 15 },
    { hour: '14:00', tons: 22, target: 15 },
    { hour: '16:00', tons: 19, target: 15 },
    { hour: '18:00', tons: 10, target: 15 },
];

const PlantDashboard = () => {
    return (
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-white">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 uppercase italic">
                        Planta de Alimentos Hub
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Centro logístico principal - Operaciones de Manufactura.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2">
                        <Activity className="w-4 h-4" /> MODO PRODUCCIÓN
                    </button>
                </div>
            </div>

            {/* CRITICAL KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'PRODUCCIÓN DÍA', value: '114.5 T', sub: '+12% vs ayer', icon: Container, color: 'text-orange-400' },
                    { label: 'CONSUMO ELÉC.', value: '1.2 MW/h', sub: 'Estable', icon: Zap, color: 'text-blue-400' },
                    { label: 'NIVEL GAS', value: '45%', sub: 'Pedido en camino', icon: Flame, color: 'text-red-400' },
                    { label: 'EFICIENCIA', value: '94.2%', sub: 'Óptimo', icon: Settings, color: 'text-emerald-400' },
                ].map((kpi, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={kpi.label}
                        className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-xl bg-slate-800 border border-slate-700 ${kpi.color}`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</span>
                        <div className="text-2xl font-black font-mono mt-1">{kpi.value}</div>
                        <span className="text-[10px] text-slate-400 mt-2 block">{kpi.sub}</span>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PRODUCTION GRAPH */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xs font-black tracking-widest text-slate-400 flex items-center gap-2 uppercase">
                            <Activity className="w-4 h-4 text-orange-400" /> Rendimiento de Producción (Tons/H)
                        </h3>
                        <div className="flex gap-4 text-[10px] font-black">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> ACTUAL</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-600"></div> TARGET</div>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockProduction}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="hour" stroke="#475569" fontSize={10} />
                                <YAxis stroke="#475569" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                                <Bar dataKey="tons" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* STATUS & ALERTS */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden relative">
                        <h3 className="text-xs font-black tracking-widest text-slate-400 mb-6 uppercase">Estado de Líneas</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Mezcladora A', status: 'Cargando', progress: 85, color: 'bg-emerald-500' },
                                { name: 'Molienda B', status: 'En Espera', progress: 0, color: 'bg-slate-700' },
                                { name: 'Secado C', status: 'Activo', progress: 40, color: 'bg-orange-500' },
                                { name: 'Embolsado D', status: 'Error Crítico', progress: 10, color: 'bg-red-500' },
                            ].map((line) => (
                                <div key={line.name} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="text-slate-300">{line.name}</span>
                                        <span className={line.color.replace('bg-', 'text-')}>{line.status}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${line.progress}%` }}
                                            className={`h-full ${line.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-red-600/10 border border-red-500/30 p-6 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="text-red-500 w-5 h-5" />
                            <h4 className="text-[10px] font-black text-red-100 uppercase tracking-widest">Alerta de Suministro</h4>
                        </div>
                        <p className="text-xs text-red-200/60 font-medium">Bajo stock de premix de vitaminas en Silo 04. Reposición programada: 2h.</p>
                        <button className="w-full mt-4 py-2 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Ver Detalles</button>
                    </div>
                </div>
            </div>

            {/* LOGISTICS OVERVIEW (Small) */}
            <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-xs font-black tracking-widest text-slate-400 mb-6 uppercase flex items-center gap-2">
                    <Container className="w-4 h-4 text-blue-400" /> Flujo Logístico de Salida
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'CAMIONES EN COLA', value: '4' },
                        { label: 'DESPACHADOS HOY', value: '18' },
                        { label: 'TIEMPO PROM. CARGA', value: '45 min' },
                        { label: 'ERROR DE PESAJE', value: '0.2%' },
                    ].map(stat => (
                        <div key={stat.label}>
                            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</span>
                            <span className="text-xl font-black font-mono text-white">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlantDashboard;
