"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Droplets,
    Sun,
    Wind,
    Trash2,
    Zap,
    Activity,
    ArrowUpRight,
    TrendingUp,
    Waves
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

const mockSolarData = [
    { time: '06:00', kwh: 0 },
    { time: '08:00', kwh: 12 },
    { time: '10:00', kwh: 45 },
    { time: '12:00', kwh: 89 },
    { time: '14:00', kwh: 76 },
    { time: '16:00', kwh: 34 },
    { time: '18:00', kwh: 5 },
];

const mockWaterData = [
    { area: 'Galpón 01', pressure: 4.2 },
    { area: 'Galpón 02', pressure: 3.8 },
    { area: 'Galpón 03', pressure: 4.1 },
    { area: 'Silos', pressure: 3.2 },
    { area: 'Laguna 01', pressure: 1.5 },
];

const ResourceDashboard = () => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isLightOn, setIsLightOn] = useState(false);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => console.log('Connected to Hardware Bridge');
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'LIGHT_STATUS') setIsLightOn(data.value);
        };
        setWs(socket);
        return () => socket.close();
    }, []);

    const toggleLight = () => {
        const nextState = !isLightOn;
        setIsLightOn(nextState);
        if (ws) {
            ws.send(JSON.stringify({
                type: 'COMMAND',
                target: 'LIGHT',
                value: nextState ? 'ON' : 'OFF'
            }));
        }
    };
    return (
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-white">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                        SMART RESOURCES
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Gestión de sostenibilidad: Agua, Energía y Residuos.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                        <Zap className="text-yellow-400 w-5 h-5" />
                        <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Consumo Total</span>
                            <span className="text-lg font-mono font-bold text-white">450.2 <span className="text-xs">kWh</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CISTERNS MONITORING GRID */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" /> MONITOREO DE CISTERNAS (RED HÍDRICA)
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">10 Unidades Activas</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-500 mb-2 uppercase">Cisterna {String(i + 1).padStart(2, '0')}</span>
                            <div className="relative w-12 h-20 bg-slate-900 rounded-lg border-2 border-slate-700 overflow-hidden">
                                <motion.div
                                    className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-cyan-400"
                                    animate={{ height: `${Math.floor(Math.random() * 40) + 60}%` }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">
                                        {Math.floor(Math.random() * 40) + 60}%
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1">
                                <Activity className="w-3 h-3 text-emerald-400" />
                                <span className="text-[8px] text-emerald-400 font-bold uppercase">Online</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* WASTE / LAGOON STATUS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2">
                            <Trash2 className="w-4 h-4 text-orange-400" /> NIVEL DE LAGUNA
                        </h3>
                        <span className="text-[10px] font-black text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded uppercase">Alerta 85%</span>
                    </div>

                    <div className="relative h-48 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center relative overflow-hidden">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute bottom-0 w-full bg-blue-500/30"
                                style={{ height: '85%' }}
                            ></motion.div>
                            <span className="relative z-10 text-4xl font-black font-mono">85<span className="text-xl">%</span></span>
                        </div>
                        <Waves className="absolute bottom-4 text-blue-400/20 w-12 h-12" />
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Tiempo estimado para vaciado</p>
                        <p className="text-lg font-black text-white">4.2 DÍAS</p>
                    </div>
                </motion.div>

                {/* SOLAR PERFORMANCE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2">
                            <Sun className="w-4 h-4 text-yellow-400" /> GENERACIÓN SOLAR (FOTOVOLTAICA)
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400">+12% vs ayer</span>
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>

                    <div className="h-48 w-full" style={{ minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={mockSolarData}>
                                <defs>
                                    <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f1c40f" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f1c40f" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                                <YAxis stroke="#475569" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                                <Area type="monotone" dataKey="kwh" stroke="#f1c40f" fillOpacity={1} fill="url(#colorSolar)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* MAQUETA INTERACTIVE CONTROLS */}
                <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl shadow-indigo-500/5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-400" /> CONTROL MAQUETA (TIEMPO REAL)
                        </h3>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-black animate-pulse">
                            ESP32 SYNC: OK
                        </span>
                    </div>

                    <div className="space-y-4">
                        {/* POZA LEVEL MONITOR */}
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Nivel de Agua (Poza)</span>
                                <span className="font-mono text-blue-400 font-bold text-lg">75.2%</span>
                            </div>
                            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                                    animate={{ width: '75.2%' }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <p className="text-[9px] text-slate-500 mt-2 italic">* Datos vía Sensor Ultrasonido HC-SR04</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* FEEDER CONTROL */}
                            <button className="bg-slate-800 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500 p-4 rounded-xl transition-all group">
                                <Waves className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="block text-[10px] text-slate-400 font-bold uppercase">Comederos</span>
                                <span className="text-xs font-black text-white group-hover:text-indigo-400">ABRIR TOLVAS</span>
                            </button>

                            {/* DRINKER CONTROL */}
                            <button className="bg-slate-800 hover:bg-cyan-600/20 border border-slate-700 hover:border-cyan-500 p-4 rounded-xl transition-all group">
                                <Droplets className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="block text-[10px] text-slate-400 font-bold uppercase">Bebederos</span>
                                <span className="text-xs font-black text-white group-hover:text-cyan-400">INICIAR FLUJO</span>
                            </button>

                            <button
                                className={`col-span-2 border p-4 rounded-xl transition-all group flex items-center justify-between ${isLightOn ? 'bg-yellow-500/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-slate-800 border-slate-700 hover:border-yellow-500'}`}
                                onClick={toggleLight}
                            >
                                <div className="flex items-center gap-4">
                                    <Sun className={`w-8 h-8 ${isLightOn ? 'text-yellow-400 animate-pulse' : 'text-slate-500 group-hover:text-yellow-500'}`} />
                                    <div className="text-left">
                                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Iluminación Maqueta</span>
                                        <span className={`text-sm font-black ${isLightOn ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                            {isLightOn ? 'ESTADO: ENCENDIDO' : 'CONTROL INALÁMBRICO'}
                                        </span>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative p-1 transition-colors ${isLightOn ? 'bg-yellow-500' : 'bg-slate-700'}`}>
                                    <motion.div
                                        className="w-4 h-4 bg-white rounded-full shadow-lg"
                                        animate={{ x: isLightOn ? 24 : 0 }}
                                    />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* WATER PRESSURE MAP (Reduced for space) */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" /> PRESIÓN DE RED (BAR)
                    </h3>
                    <div className="h-48 w-full" style={{ minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart data={mockWaterData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="area" stroke="#475569" fontSize={8} />
                                <YAxis stroke="#475569" fontSize={8} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                                <Bar dataKey="pressure" fill="#3498db" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceDashboard;
