"use client";
import React, { useState, useEffect } from 'react';

// --- VISUAL COMPONENTS ---

// 1. SILO GAUGE (SVG Animation)
const SiloGauge = ({ level, capacity, id }: { level: number; capacity: number; id: string }) => {
    // Level is 0-100%
    const height = 120;
    const width = 60;
    const fillHeight = (level / 100) * height;
    const y = height - fillHeight;

    // Color logic: < 20% Red, < 40% Yellow, > 40% Green
    let fillClass = "fill-green-500";
    if (level < 40) fillClass = "fill-yellow-500";
    if (level < 20) fillClass = "fill-red-600";

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-[60px] h-[120px] bg-slate-800 rounded-t-full rounded-b-lg border-2 border-slate-600 overflow-hidden shadow-inner">
                {/* Metallic Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10"></div>

                {/* Liquid Fill */}
                <div
                    className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out ${fillClass} opacity-80`}
                    style={{ height: `${level}%` }}
                >
                    {/* Bubbles / Texture */}
                    <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                </div>

                {/* Level Markers */}
                <div className="absolute w-full h-full flex flex-col justify-between py-2 px-1 z-20 pointer-events-none">
                    <div className="border-b border-white/20 h-1 w-2"></div>
                    <div className="border-b border-white/20 h-1 w-2"></div>
                    <div className="border-b border-white/20 h-1 w-4"></div>
                    <div className="border-b border-white/20 h-1 w-2"></div>
                    <div className="border-b border-white/20 h-1 w-2"></div>
                </div>
            </div>
            <div className="mt-2 text-center">
                <div className="text-xs font-bold text-gray-400">{id}</div>
                <div className={`font-mono text-sm font-bold ${level < 20 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {((level / 100) * capacity).toFixed(0)}kg
                </div>
                <div className="text-[10px] text-gray-500">{level.toFixed(1)}%</div>
            </div>
        </div>
    );
};

// 2. SPARKLINE CHART
const Sparkline = ({ data, color = "stroke-cyan-400" }: { data: number[], color?: string }) => {
    if (data.length < 2) return <div className="h-8 w-full bg-white/5 rounded"></div>;

    const height = 30;
    const width = 100;
    const max = Math.max(...data, 40);
    const min = Math.min(...data, 10);
    const range = max - min || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-8 overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <polyline
                    points={points}
                    fill="none"
                    className={`${color} stroke-[2px]`}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    );
};

// --- MAIN COMPONENT ---

export const SensorDashboard = () => {
    const [activeTab, setActiveTab] = useState<'kpi' | 'silos' | 'env'>('kpi');

    // SIMULATED STATE
    const [data, setData] = useState({
        galpones: [
            { id: 'G-01', temp: 24.5, tempHistory: [24, 24.2, 24.5], humidity: 60, ammonia: 12, status: 'OK' },
            { id: 'G-02', temp: 25.1, tempHistory: [25, 25.1, 24.9], humidity: 62, ammonia: 15, status: 'OK' },
            { id: 'G-03', temp: 29.2, tempHistory: [28, 28.5, 29.2], humidity: 45, ammonia: 22, status: 'CRITICAL' },
            { id: 'G-04', temp: 24.8, tempHistory: [24, 24.5, 24.8], humidity: 59, ammonia: 10, status: 'OK' },
            { id: 'G-05', temp: 23.9, tempHistory: [23, 23.5, 23.9], humidity: 65, ammonia: 9, status: 'OK' },
        ],
        silos: [
            { id: 'SILO-01', level: 85, capacity: 12000 },
            { id: 'SILO-02', level: 60, capacity: 12000 },
            { id: 'SILO-03', level: 15, capacity: 12000 }, // Low
            { id: 'SILO-04', level: 92, capacity: 12000 },
            { id: 'SILO-05', level: 45, capacity: 12000 },
        ]
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                // Update Temps
                const newGalpones = prev.galpones.map(g => {
                    const jitter = (Math.random() - 0.5) * 0.5;
                    let newTemp = g.temp + jitter;
                    if (g.status === 'CRITICAL') newTemp = 29 + Math.random();

                    const newHistory = [...g.tempHistory, newTemp].slice(-20); // Keep last 20
                    return { ...g, temp: newTemp, tempHistory: newHistory };
                });

                // Update Silos (slow drain)
                const newSilos = prev.silos.map(s => ({
                    ...s,
                    level: Math.max(0, s.level - (Math.random() * 0.1)) // Drain slowly
                }));

                return { galpones: newGalpones, silos: newSilos };
            });
        }, 1000); // 1s tick
        return () => clearInterval(interval);
    }, []);

    const criticalCount = data.galpones.filter(g => g.status === 'CRITICAL').length;
    const lowSilosCount = data.silos.filter(s => s.level < 20).length;

    return (
        <div className="absolute top-24 left-4 z-30 w-[400px] animate-in slide-in-from-left duration-500">
            {/* MAIN FRAME */}
            <div className="bg-[#1a1c23]/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl text-white overflow-hidden">

                {/* HEADER */}
                <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                            <span className="text-xl">🏭</span>
                        </div>
                        <div>
                            <h2 className="text-sm font-black tracking-widest text-slate-400">HUACHO COMPLEX</h2>
                            <h1 className="text-xl font-bold text-white leading-none">CONTROL ROOM</h1>
                        </div>
                    </div>
                    {/* SYSTEM STATUS */}
                    <div className="text-right">
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${criticalCount > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-green-500/20 text-green-400'}`}>
                            {criticalCount > 0 ? 'ALERTA ACTIVA' : 'ONLINE'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Updates: Live</div>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex bg-slate-800/50 p-1 gap-1">
                    {['kpi', 'silos', 'env', 'money'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all
                            ${activeTab === tab ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab === 'kpi' && '📊 Naves'}
                            {tab === 'silos' && `📦 Silos ${lowSilosCount > 0 ? '(!)' : ''}`}
                            {tab === 'env' && '🌤️ Clima'}
                            {tab === 'money' && '💰 $$$'}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">

                    {/* TAB: NAVES (KPI) */}
                    {activeTab === 'kpi' && (
                        <div className="space-y-3">
                            {data.galpones.map(g => (
                                <div key={g.id} className={`p-3 rounded-lg border flex flex-col gap-2 transition-all ${g.status === 'CRITICAL' ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-800/50 border-slate-700'
                                    }`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${g.status === 'CRITICAL' ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                                            <span className="font-bold text-sm tracking-wide">{g.id}</span>
                                            <span className="text-xs text-slate-500">Lote 40{g.id.split('-')[1]}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-lg font-mono font-bold ${g.temp > 28 ? 'text-red-400' : 'text-cyan-400'}`}>
                                                {g.temp.toFixed(1)}°C
                                            </span>
                                        </div>
                                    </div>

                                    {/* Real-time Chart */}
                                    <div className="flex items-end gap-2 h-8">
                                        <div className="w-16 text-[10px] text-slate-500 leading-tight">
                                            H: {g.humidity}%<br />
                                            NH3: {g.ammonia}
                                        </div>
                                        <div className="flex-1 pb-1">
                                            <Sparkline data={g.tempHistory} color={g.status === 'CRITICAL' ? 'stroke-red-500' : 'stroke-cyan-500'} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB: SILOS */}
                    {activeTab === 'silos' && (
                        <div className="grid grid-cols-3 gap-y-6 gap-x-2 animate-in fade-in">
                            {data.silos.map(s => (
                                <SiloGauge key={s.id} id={s.id} level={s.level} capacity={s.capacity} />
                            ))}
                            <div className="col-span-3 mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded text-yellow-500 text-xs">
                                ⚠️ <b>Alerta de Inventario:</b> El Silo 03 requiere recarga urgente. Pedido automático programado para mañana 8:00 AM.
                            </div>
                        </div>
                    )}

                    {/* TAB: ENVIRONMENT */}
                    {activeTab === 'env' && (
                        <div className="text-center space-y-6 animate-in fade-in">
                            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                                <div className="text-4xl mb-2">☀️</div>
                                <div className="text-2xl font-bold text-white">28°C</div>
                                <div className="text-sm text-slate-400">Cielo Despejado</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                                    <div className="text-slate-400 text-xs uppercase mb-1">Viento</div>
                                    <div className="text-xl font-bold text-cyan-400">12 km/h</div>
                                    <div className="text-xs text-slate-500">NOROESTE</div>
                                </div>
                                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                                    <div className="text-slate-400 text-xs uppercase mb-1">Humedad Ext.</div>
                                    <div className="text-xl font-bold text-blue-400">65%</div>
                                </div>
                            </div>

                            <div className="text-xs text-slate-600 mt-4">
                                DarkSky Weather API Connected via AWS Lambda
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
