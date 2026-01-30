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
    ChevronRight,
    FileText
} from 'lucide-react';

interface BiosecurityDashboardProps {
    activeBreach?: string;
    logs?: any[];
    rules?: any;
    trackers?: any;
}

const BiosecurityDashboard: React.FC<BiosecurityDashboardProps> = ({ activeBreach, logs = [], rules = {}, trackers = {} }) => {
    const trackerList = Object.values(trackers);

    // Create a report based on rules and positions
    const personnelReport = trackerList.map((t: any) => {
        const rule = rules[t.name] || rules[t.id];
        return {
            id: t.id,
            name: t.name,
            role: t.type || 'Personal',
            zone: rule ? `Puesto Asignado` : 'Área Común',
            status: rule ? 'Authorized' : 'Checking...',
            battery: '90%'
        };
    });

    return (
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto text-white font-sans">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 uppercase">
                        Vanguard Sanitary Shield
                    </h1>
                    <p className="text-slate-500 text-sm font-medium italic">Control de bioseguridad y trazabilidad de contactos en tiempo real.</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-indigo-500/20">
                        <FileText className="w-4 h-4" /> EXPORTAR REPORTE PDF
                    </button>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                        <Smartphone className="text-blue-400 w-5 h-5" />
                        <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Personal Activo</span>
                            <span className="text-lg font-mono font-bold">{trackerList.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* BREACH LOG */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                        <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2 uppercase">
                            <ShieldAlert className="w-4 h-4 text-red-500" /> Historial de Alertas Sanitarias
                        </h3>
                        <Bell className="w-4 h-4 text-slate-600 animate-pulse" />
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[400px]">
                        <AnimatePresence>
                            {logs.length === 0 ? (
                                <div className="p-10 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">Sin Incidentes Detectados</div>
                            ) : (
                                logs.map((log, i) => (
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        key={i}
                                        className="p-4 border-b border-slate-800/50 flex items-center justify-between hover:bg-red-500/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-1.5 h-10 rounded-full ${log.severity === 'Critical' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-orange-500 shadow-lg shadow-orange-500/50'}`}></div>
                                            <div>
                                                <span className="block text-sm font-black group-hover:text-red-400 transition-colors uppercase tracking-tight">{log.msg}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">{log.type} • {log.time}</span>
                                            </div>
                                        </div>
                                        <button className="bg-slate-800 hover:bg-red-600 p-2 rounded-lg transition-all border border-slate-700">
                                            <Lock className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* STATS PANEL */}
                <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <UserCheck className="w-6 h-6 text-emerald-400" />
                            <div className="text-[9px] font-black bg-emerald-400 text-slate-900 px-2 py-1 rounded-lg uppercase">SCORE SANITARIO</div>
                        </div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cumplimiento Global</span>
                        <span className="text-3xl font-black font-mono">98.2%</span>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Bajo riesgo detectado en las últimas 24h.</p>
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Smartphone className="w-24 h-24" />
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-[180px] shadow-xl">
                        <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 uppercase">Ahorro Bioseguridad</span>
                            <span className="text-sm font-medium text-slate-300">Vs Control Manual:</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-blue-400">90%</span>
                            <span className="text-xs font-bold text-slate-500 italic uppercase">AUTOMATIZADO</span>
                        </div>
                        <p className="text-[10px] text-blue-400/60 font-medium font-bold italic">Shield Engine v4.0 Active</p>
                    </div>
                </div>
            </div>

            {/* ACCESS LIST */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 flex items-center gap-2 uppercase">
                        <MapIcon className="w-4 h-4 text-blue-400" /> Reporte de Ubicación y Cercos Sanitarios
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800/50 bg-slate-950/50">
                                <th className="px-6 py-4">Sujeto / Dispositivo</th>
                                <th className="px-6 py-4">Localización</th>
                                <th className="px-6 py-4">Estatus Sanitario</th>
                                <th className="px-6 py-4">Batería</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                            {personnelReport.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">No hay personal activo con GPS</td>
                                </tr>
                            ) : (
                                personnelReport.map((p) => (
                                    <tr key={p.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="block font-black uppercase text-indigo-400">{p.name}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">{p.role}</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            <span className={`px-2 py-0.5 rounded-md border ${p.zone.includes('Asignado') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                                {p.zone}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 ${p.status === 'Unauthorized' ? 'text-red-400' : 'text-emerald-400'} font-bold uppercase text-[10px]`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'Unauthorized' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-emerald-500 shadow-lg shadow-emerald-500/50'}`}></div>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-400 font-bold">{p.battery}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
                                                <ChevronRight className="w-4 h-4 cursor-pointer" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BiosecurityDashboard;
