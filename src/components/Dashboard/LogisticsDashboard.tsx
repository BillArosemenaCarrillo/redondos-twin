"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scale,
    Truck,
    AlertTriangle,
    CheckCircle2,
    Plus,
    History,
    TrendingDown,
    ShieldAlert
} from 'lucide-react';

interface WeighingRecord {
    id: string;
    truckId: string;
    initialWeight: number;
    finalWeight: number;
    merma: number;
    timestamp: number;
    status: 'Safe' | 'Warning' | 'Critical';
}

const LogisticsDashboard = () => {
    const [initialWeight, setInitialWeight] = useState<number>(0);
    const [finalWeight, setFinalWeight] = useState<number>(0);
    const [truckId, setTruckId] = useState<string>('CONSEC-001');
    const [records, setRecords] = useState<WeighingRecord[]>([
        { id: '1', truckId: 'CONSEC-045', initialWeight: 15000, finalWeight: 14650, merma: 2.33, timestamp: Date.now() - 3600000, status: 'Safe' },
        { id: '2', truckId: 'CONSEC-012', initialWeight: 15000, finalWeight: 14400, merma: 4.00, timestamp: Date.now() - 7200000, status: 'Critical' },
    ]);

    const calculateMerma = () => {
        if (initialWeight <= 0) return 0;
        return ((initialWeight - finalWeight) / initialWeight) * 100;
    };

    const merma = calculateMerma();
    const isCritical = merma > 3;

    const addRecord = () => {
        if (initialWeight <= 0 || finalWeight <= 0) return;

        const newRecord: WeighingRecord = {
            id: Date.now().toString(),
            truckId,
            initialWeight,
            finalWeight,
            merma,
            timestamp: Date.now(),
            status: merma > 3 ? 'Critical' : (merma > 2 ? 'Warning' : 'Safe')
        };

        setRecords([newRecord, ...records]);
        setInitialWeight(0);
        setFinalWeight(0);
    };

    return (
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-white">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 uppercase italic">
                        Logistics & Weight Control
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Control anti-robo de tara y mitigación de mermas críticas.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                    <ShieldAlert className="text-red-500 w-5 h-5 animate-pulse" />
                    <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Alertas de Robo</span>
                        <span className="text-lg font-mono font-bold text-red-500">{records.filter(r => r.status === 'Critical').length} Activas</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* WEIGHING INTERFACE */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Scale className="w-32 h-32" />
                    </div>

                    <h3 className="text-sm font-bold tracking-[0.2em] text-indigo-400 mb-6 flex items-center gap-2 uppercase">
                        <Truck className="w-4 h-4" /> Nuevo Registro de Pesaje
                    </h3>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Vehículo</label>
                                <input
                                    type="text"
                                    value={truckId}
                                    onChange={(e) => setTruckId(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm font-mono focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2 text-right">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tolerancia Max.</label>
                                <div className="text-xl font-black text-white font-mono">3.00%</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400">Peso Inicial (Entrada)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={initialWeight || ''}
                                        onChange={(e) => setInitialWeight(Number(e.target.value))}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-2xl font-black font-mono focus:border-blue-500 outline-none transition-all pr-12"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">KG</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400">Peso Final (Salida)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={finalWeight || ''}
                                        onChange={(e) => setFinalWeight(Number(e.target.value))}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-2xl font-black font-mono focus:border-blue-500 outline-none transition-all pr-12"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">KG</span>
                                </div>
                            </div>
                        </div>

                        {/* CALCULATION DISPLAY */}
                        <div className={`p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between ${isCritical ? 'bg-red-500/10 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' :
                                (merma > 0 ? 'bg-indigo-500/10 border-indigo-500' : 'bg-slate-800 border-slate-700')
                            }`}>
                            <div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] block mb-1 ${isCritical ? 'text-red-400' : 'text-slate-400'}`}>
                                    Merma Calculada
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-black font-mono ${isCritical ? 'text-red-500' : 'text-white'}`}>
                                        {merma.toFixed(2)}%
                                    </span>
                                    {isCritical && <TrendingDown className="text-red-500 w-6 h-6 animate-bounce" />}
                                </div>
                            </div>

                            <button
                                onClick={addRecord}
                                disabled={initialWeight <= 0 || finalWeight <= 0}
                                className={`px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${initialWeight > 0 && finalWeight > 0 ? 'bg-white text-black hover:scale-105 active:scale-95' : 'bg-slate-800 text-slate-600'
                                    }`}
                            >
                                <Plus className="inline-block mr-2 w-4 h-4" /> Registrar
                            </button>
                        </div>

                        <AnimatePresence>
                            {isCritical && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-red-600 p-4 rounded-xl flex items-center gap-4 border-2 border-white/20"
                                >
                                    <div className="bg-white/20 p-2 rounded-full">
                                        <AlertTriangle className="text-white w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-white uppercase italic tracking-tighter">ALERTA CRÍTICA: ROBO DE TARA DETECTADO</h4>
                                        <p className="text-white/80 text-[10px] font-bold">La merma supera el 3%. Se ha notificado al jefe de seguridad y planta.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RECENT HISTORY */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-xs font-black tracking-widest text-slate-400 flex items-center gap-2">
                            <History className="w-4 h-4" /> Historial de Pesajes (Últimas 24h)
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50">
                                <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800/50">
                                    <th className="px-6 py-4">Vehículo</th>
                                    <th className="px-6 py-4">Merma %</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Hora</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-medium">
                                {records.map((r) => (
                                    <motion.tr
                                        layout
                                        key={r.id}
                                        className={`border-b border-slate-800/30 transition-colors ${r.status === 'Critical' ? 'bg-red-500/5' : 'hover:bg-slate-800/30'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <span className="block font-black font-mono">{r.truckId}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-black font-mono ${r.status === 'Critical' ? 'text-red-500' : 'text-white'}`}>
                                                {r.merma.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${r.status === 'Critical' ? 'text-red-500' :
                                                    (r.status === 'Warning' ? 'text-yellow-500' : 'text-emerald-500')
                                                }`}>
                                                {r.status === 'Critical' ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-500 text-[10px] font-bold">
                                            {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* LOGISTICS TIPS / INFO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">Optimización de Carga</h4>
                    <p className="text-xs text-slate-400 font-medium">Mantener la merma bajo el 1.5% puede ahorrar hasta $12,000 mensuales en transporte de mermas muertas.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Integración API</h4>
                    <p className="text-xs text-slate-500 font-medium">Balanza Avery Weigh-Tronix detectada. Los datos se envían automáticamente al Twin Digital.</p>
                </div>
                <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <p className="text-[10px] text-red-100 font-black uppercase italic tracking-tighter">Protocolo Anti-Robo de Tara V2 Activado</p>
                </div>
            </div>
        </div>
    );
};

export default LogisticsDashboard;
