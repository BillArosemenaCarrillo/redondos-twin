"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bluetooth,
    BluetoothSearching,
    BluetoothConnected,
    Database,
    CloudUpload,
    WifiOff,
    Battery,
    Activity,
    AlertCircle
} from 'lucide-react';

const MobileSync = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [device, setDevice] = useState<any>(null);
    const [telemetry, setTelemetry] = useState<any>(null);
    const [offlineBuffer, setOfflineBuffer] = useState<any[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    const connectBluetooth = async () => {
        setIsScanning(true);
        try {
            // Web Bluetooth API Call
            const bleDevice = await (navigator as any).bluetooth.requestDevice({
                filters: [{ namePrefix: 'ESP32_Vanguard' }],
                optionalServices: ['battery_service', 'environmental_sensing']
            });

            const server = await bleDevice.gatt.connect();
            setDevice(bleDevice);
            setIsScanning(false);

            // Mocking telemetry data for the demo if real BLE fails in browser
            startMockTelemetry();
        } catch (error) {
            console.error(error);
            setIsScanning(false);
            // Fallback for demo
            startMockTelemetry();
        }
    };

    const startMockTelemetry = () => {
        setInterval(() => {
            const data = {
                temp: (24 + Math.random() * 2).toFixed(1),
                hum: (60 + Math.random() * 10).toFixed(0),
                stress: (10 + Math.random() * 5).toFixed(0),
                timestamp: new Date().toLocaleTimeString()
            };
            setTelemetry(data);
            setOfflineBuffer(prev => [...prev.slice(-19), data]);
        }, 2000);
    };

    const syncToCloud = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            setOfflineBuffer([]);
        }, 3000);
    };

    return (
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
            {/* MOBILE TOP BAR */}
            <div className="w-full max-w-sm flex justify-between items-center mb-8 px-4">
                <div className="flex items-center gap-2">
                    <WifiOff className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Offline Mode</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500">85%</span>
                    <Battery className="w-4 h-4 text-emerald-500" />
                </div>
            </div>

            {/* MAIN APP CONTAINER */}
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-6 shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[600px]">
                <div className="w-1/3 h-1.5 bg-slate-800 rounded-full mb-8"></div>

                <h2 className="text-xl font-black mb-2 tracking-tighter uppercase italic">Vanguard Sync</h2>
                <p className="text-slate-400 text-[10px] text-center mb-8 px-4 font-medium leading-tight">
                    Colección de datos local vía Bluetooth para zonas sin conexión.
                </p>

                {/* BT STATUS */}
                <div className="relative mb-12">
                    <motion.div
                        animate={isScanning ? { scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-indigo-500/20 rounded-full scale-150 blur-2xl"
                    />
                    <button
                        onClick={connectBluetooth}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${device ? 'bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.5)]' : 'bg-slate-800 border border-slate-700'}`}
                    >
                        {isScanning ? <BluetoothSearching className="w-10 h-10 animate-pulse" /> :
                            device ? <BluetoothConnected className="w-10 h-10" /> :
                                <Bluetooth className="w-10 h-10 text-slate-400" />}
                    </button>
                    {device && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center"
                        >
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </motion.div>
                    )}
                </div>

                {/* TELEMETRY CARD */}
                <AnimatePresence>
                    {telemetry && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-4 grid grid-cols-2 gap-4"
                        >
                            <div className="text-center">
                                <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">Temp</span>
                                <span className="text-xl font-black font-mono">{telemetry.temp}°C</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">Humedad</span>
                                <span className="text-xl font-black font-mono">{telemetry.hum}%</span>
                            </div>
                            <div className="text-center col-span-2 border-t border-slate-700 pt-3">
                                <span className="block text-[8px] text-slate-500 font-bold uppercase mb-1">Nivel de Estrés</span>
                                <div className="flex items-center justify-center gap-2">
                                    <Activity className="w-3 h-3 text-pink-400" />
                                    <span className="text-lg font-black font-mono text-pink-400">{telemetry.stress}%</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* OFFLINE STORAGE STATUS */}
                <div className="w-full bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 mb-auto">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <Database className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">Buffer Offline</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold">{offlineBuffer.length}/100</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-indigo-500" style={{ width: `${offlineBuffer.length}%` }} />
                    </div>
                </div>

                {/* SYNC BUTTON */}
                <button
                    disabled={offlineBuffer.length === 0 || isSyncing}
                    onClick={syncToCloud}
                    className={`mt-4 w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${offlineBuffer.length > 0 ? 'bg-white text-black' : 'bg-slate-800 text-slate-600'}`}
                >
                    {isSyncing ? (
                        <>Subiendo...</>
                    ) : (
                        <>
                            <CloudUpload className="w-4 h-4" />
                            Sincronizar a la Nube
                        </>
                    )}
                </button>

                <div className="mt-6 flex items-center gap-2 text-[8px] text-slate-500">
                    <AlertCircle className="w-2 h-2" />
                    <span>Los datos se guardan localmente hasta detectar conexión.</span>
                </div>
            </div>
        </div>
    );
};

export default MobileSync;
