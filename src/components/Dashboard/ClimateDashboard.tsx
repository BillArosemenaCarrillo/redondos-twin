"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    CloudRain,
    Wind,
    Thermometer,
    Droplets,
    AlertCircle,
    Activity
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

const mockClimateData = [
    { time: '00:00', temp: 22, hum: 65, nh3: 12 },
    { time: '04:00', temp: 20, hum: 70, nh3: 10 },
    { time: '08:00', temp: 24, hum: 60, nh3: 15 },
    { time: '12:00', temp: 28, hum: 55, nh3: 18 },
    { time: '16:00', temp: 27, hum: 58, nh3: 16 },
    { time: '20:00', temp: 23, hum: 63, nh3: 14 },
];

const ClimateDashboard = () => {
    return (
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-white">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        CLIMATE INTELLIGENCE
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Monitoreo ambiental crítico y control de ventilación.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                        <Thermometer className="text-orange-400 w-5 h-5" />
                        <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Temp Promedio</span>
                            <span className="text-lg font-mono font-bold text-orange-400">24.5°C</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SENSOR GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'HUMEDAD', value: '62%', icon: Droplets, color: 'text-cyan-400', status: 'Stable' },
                    { label: 'AMONIACO (NH3)', value: '14 ppm', icon: Activity, color: 'text-yellow-400', status: 'Optimal' },
                    { label: 'VEL. VIENTO', value: '2.4 m/s', icon: Wind, color: 'text-emerald-400', status: 'Active' },
                    { label: 'CO2', value: '850 ppm', icon: CloudRain, color: 'text-purple-400', status: 'Optimal' },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg bg-slate-800 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stat.status === 'Warning' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                {stat.status}
                            </span>
                        </div>
                        <span className="block text-[10px] text-slate-500 font-bold tracking-widest uppercase">{stat.label}</span>
                        <span className="text-2xl font-black font-mono">{stat.value}</span>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* NH3 CHART */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-yellow-400" /> HISTÓRICO DE GASES (NH3/CO2)
                    </h3>
                    <div className="h-64 sm:h-72 w-full" style={{ minWidth: 0, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <LineChart data={mockClimateData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                                <YAxis stroke="#475569" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                                <Line type="monotone" dataKey="nh3" stroke="#f1c40f" strokeWidth={3} dot={{ fill: '#f1c40f' }} />
                                <Line type="monotone" dataKey="temp" stroke="#e67e22" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ALERTS PANEL */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" /> ALERTAS CRÍTICAS
                    </h3>
                    <div className="space-y-4 flex-1">
                        <div className="border-l-2 border-orange-500 bg-orange-500/5 p-3 rounded-r-lg">
                            <span className="block text-[10px] font-bold text-orange-400 uppercase">Amoniaco Elevado</span>
                            <p className="text-xs text-slate-300 mt-1">Galpón A-2 presenta niveles de 18ppm. Revisar ventilación.</p>
                        </div>
                        <div className="border-l-2 border-red-500 bg-red-500/5 p-3 rounded-r-lg">
                            <span className="block text-[10px] font-bold text-red-400 uppercase">Falla Ventilador</span>
                            <p className="text-xs text-slate-300 mt-1">Ventilador #04 en Galpón A-1 fuera de línea.</p>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors">
                        HISTORIAL COMPLETO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClimateDashboard;
