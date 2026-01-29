"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    Thermometer,
    Wind,
    Zap,
    Heart,
    Brain,
    TrendingDown,
    ShieldAlert
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const mockWelfareData = [
    { subject: 'Temperatura', A: 85, fullMark: 100 },
    { subject: 'Humedad', A: 70, fullMark: 100 },
    { subject: 'Aire (NH3)', A: 90, fullMark: 100 },
    { subject: 'Agua (Imp)', A: 95, fullMark: 100 },
    { subject: 'Movimiento', A: 60, fullMark: 100 },
];

const WelfareDashboard = () => {
    const [stressLevel, setStressLevel] = useState(12);

    useEffect(() => {
        const interval = setInterval(() => {
            setStressLevel(prev => {
                const change = Math.floor(Math.random() * 5) - 2;
                const next = prev + change;
                return next < 5 ? 5 : next > 25 ? 25 : next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const getStressColor = (level: number) => {
        if (level < 15) return 'text-emerald-400';
        if (level < 40) return 'text-yellow-400';
        return 'text-red-500';
    };

    return (
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-white">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-5 h-5 text-pink-500" />
                        <span className="text-xs font-black text-pink-500 uppercase tracking-[0.2em]">ANIMAL WELFARE ENGINE</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
                        Monitor de Estrés y Salud
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Análisis Bio-Métrico avanzado vía Precision-ADC (MCP3008).</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-6">
                    <div className="text-center">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Pérdida por Estrés</span>
                        <span className="text-lg font-mono font-bold text-red-400">-S/ 0.00</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* RADIAL STRESS GAUGE */}
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className={`text-6xl font-black font-mono mb-2 transition-colors duration-500 ${getStressColor(stressLevel)}`}>
                        {stressLevel}%
                    </div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Nivel de Estrés Actual</span>
                    <div className="w-full h-2 bg-slate-800 rounded-full mt-6 overflow-hidden">
                        <motion.div
                            className={`h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500`}
                            animate={{ width: `${stressLevel}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-4 font-bold flex items-center gap-1 uppercase">
                        <ShieldAlert className="w-3 h-3" /> Estado: Óptimo para Crecimiento
                    </p>
                </div>

                {/* RADAR ANALYTICS */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                    <h3 className="text-sm font-black text-slate-400 mb-4 tracking-widest uppercase">Análisis Multivariable</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockWelfareData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Radar
                                    name="Welfare"
                                    dataKey="A"
                                    stroke="#ec4899"
                                    fill="#ec4899"
                                    fillOpacity={0.6}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MCP3008 PRECISION LOGS */}
                <div className="bg-slate-900 border border-indigo-500/20 p-6 rounded-3xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-indigo-400 tracking-widest uppercase flex items-center gap-2">
                            <Brain className="w-4 h-4" /> Laboratorio Pecuario (MCP3008)
                        </h3>
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-bold uppercase">10-bit Precision</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-800/40 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">NH3</div>
                                <span className="text-xs font-bold text-slate-300 uppercase">Amoníaco NH3</span>
                            </div>
                            <span className="font-mono font-bold text-white">12.5 ppm</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/40 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">Ω</div>
                                <span className="text-xs font-bold text-slate-300 uppercase">Impedancia Agua</span>
                            </div>
                            <span className="font-mono font-bold text-white">1.02 kΩ</span>
                        </div>
                    </div>
                </div>

                {/* AI ACTION CARD */}
                <div className="bg-gradient-to-br from-pink-600/20 to-indigo-600/10 border border-pink-500/30 p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-pink-500/5">
                    <TrendingDown className="w-12 h-12 text-pink-500 mb-4" />
                    <h2 className="text-xl font-black mb-2 uppercase italic tracking-tighter">Impacto Metabólico</h2>
                    <p className="text-slate-400 text-xs leading-relaxed font-medium">
                        La IA ha calculado que gracias a la baja impedancia detectada y el control térmico preventivo, el lote del Galpón 01 tiene un **ICA proyectado de 1.62**, un ahorro de S/ 2,400 en alimento vs el promedio de la zona.
                    </p>
                    <div className="mt-6 flex gap-2">
                        <button className="bg-white text-black px-4 py-2 rounded-lg font-black text-[10px] uppercase transition-transform active:scale-95 shadow-xl">
                            Descargar Informe de Bienestar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelfareDashboard;
