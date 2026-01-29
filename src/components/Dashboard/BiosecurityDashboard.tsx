"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert,
    UserCheck,
    Map as MapIcon,
    Bell,
    Smartphone,
    Lock,
    ChevronRight
} from 'lucide-react';

const mockBreaches = [
    { id: 1, name: 'Juan P. (Operario)', zone: 'ZONA ROJA A', time: '14:20', severity: 'Critical' },
    { id: 2, name: 'Carlos R. (Mantenimiento)', zone: 'ZONA ROJA B', time: '12:05', severity: 'Warning' },
];

const mockPersonnel = [
    { id: 1, name: 'Juan P.', role: 'Operario', zone: 'Zona Roja', status: 'Unauthorized', battery: '85%' },
    { id: 2, name: 'Maria L.', role: 'Veterinaria', zone: 'Zona Verde', status: 'Authorized', battery: '92%' },
    { id: 3, name: 'Carlos R.', role: 'Mantenimiento', zone: 'Zona Amarilla', status: 'Authorized', battery: '45%' },
];

interface BiosecurityDashboardProps {
    activeBreach?: string;
}

const BiosecurityDashboard: React.FC<BiosecurityDashboardProps> = ({ activeBreach }) => {
    const currentBreaches = [
        ...(activeBreach ? [{
            id: 'ACTIVE_BREACH',
            name: activeBreach.includes("PERSONNEL") ? "INTRUSIÓN DE PERSONAL" : (activeBreach.includes("TRUCK") ? "VEHÍCULO NO AUTORIZADO" : activeBreach),
            zone: 'ZONA RESTRINGIDA',
            time: 'AHORA',
            severity: 'Critical'
        }] : []),
        ...mockBreaches
    ];

    return (
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-white">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                        BIOSECURITY & SAFETY
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Control de acceso perimetral y rastreo GPS de bajo costo.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                        <Smartphone className="text-blue-400 w-5 h-5" />
                        <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Dispositivos Activos</span>
                            <span className="text-lg font-mono font-bold">12/15</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* BREACH LOG */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" /> LOG DE INFRACCIONES (ZONA ROJA)
                        </h3>
                        <Bell className="w-4 h-4 text-slate-600 animate-pulse" />
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[400px]">
                        <AnimatePresence>
                            {currentBreaches.map((breach) => (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    key={breach.id}
                                    className="p-4 border-b border-slate-800/50 flex items-center justify-between hover:bg-red-500/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1.5 h-10 rounded-full ${breach.severity === 'Critical' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                                        <div>
                                            <span className="block text-sm font-black group-hover:text-red-400 transition-colors">{breach.name}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">{breach.zone} • {breach.time}</span>
                                        </div>
                                    </div>
                                    <button className="bg-slate-800 hover:bg-red-600 p-2 rounded-lg transition-all">
                                        <Lock className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* STATS PANEL */}
                <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <UserCheck className="w-6 h-6 text-emerald-400" />
                            <button className="text-[9px] font-black bg-emerald-400 text-slate-900 px-2 py-1 rounded-lg uppercase hover:scale-105 transition-transform">
                                SIMULAR ESCANEO QR
                            </button>
                        </div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cumplimiento Protocolo</span>
                        <span className="text-3xl font-black font-mono">92.4%</span>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Basado en escaneo de QR en puntos de control sanitarios.</p>
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Smartphone className="w-12 h-12" />
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-[180px]">
                        <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Costo de Implementación</span>
                            <span className="text-sm font-medium text-slate-300">Ahorro vs GPS dedicado:</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-blue-400">75%</span>
                            <span className="text-xs font-bold text-slate-500">REDUCCIÓN</span>
                        </div>
                        <p className="text-[10px] text-blue-400/60 font-medium">Uso de infraestructura existente (BYOD).</p>
                    </div>
                </div>
            </div>

            {/* ACCESS LIST */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2">
                        <MapIcon className="w-4 h-4 text-blue-400" /> PERSONAL EN CAMPO (LIVE GPS)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800/50">
                                <th className="px-6 py-4">Nombre / Cargo</th>
                                <th className="px-6 py-4">Zona Actual</th>
                                <th className="px-6 py-4">Status Sanitario</th>
                                <th className="px-6 py-4">Batería Móvil</th>
                                <th className="px-6 py-4 text-right">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                            {mockPersonnel.map((p) => (
                                <tr key={p.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="block font-black">{p.name}</span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{p.role}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">
                                        <span className={`px-2 py-0.5 rounded-full ${p.zone === 'Zona Roja' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'
                                            }`}>
                                            {p.zone}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1.5 ${p.status === 'Unauthorized' ? 'text-red-400' : 'text-emerald-400'
                                            }`}>
                                            <div className={`w-1 h-1 rounded-full ${p.status === 'Unauthorized' ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-400">{p.battery}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-500 hover:text-white transition-colors">
                                            <ChevronRight className="w-4 h-4 cursor-pointer" />
                                        </button>
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

export default BiosecurityDashboard;
