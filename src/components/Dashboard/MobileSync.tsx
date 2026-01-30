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
    AlertCircle,
    Navigation,
    MapPin
} from 'lucide-react';
import { useTracker } from '../../hooks/useTracker';

interface MobileSyncProps {
    isTracking?: boolean;
    toggleTracking?: () => void;
    coords?: any;
    error?: string | null;
}

const MobileSync: React.FC<MobileSyncProps> = ({
    isTracking: externalIsTracking,
    toggleTracking: externalToggleTracking,
    coords: externalCoords,
    error: externalError
}) => {
    const [isScanning, setIsScanning] = useState(false);
    const [device, setDevice] = useState<any>(null);
    const [telemetry, setTelemetry] = useState<any>(null);
    const [offlineBuffer, setOfflineBuffer] = useState<any[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    // GPS Tracker State
    const [localIsTracking, setLocalIsTracking] = useState(false);
    const { coords: localCoords, error: localGpsError } = useTracker(localIsTracking);

    // Use external props if provided, otherwise fallback to local state
    const isTracking = externalIsTracking !== undefined ? externalIsTracking : localIsTracking;
    const coords = externalCoords !== undefined ? externalCoords : localCoords;
    const toggleTracking = externalToggleTracking !== undefined ? externalToggleTracking : () => setLocalIsTracking(!localIsTracking);
    const gpsError = externalError !== undefined ? externalError : localGpsError;

    const [userName, setUserName] = useState('Operario 01');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem('vanguard_my_name');
            if (storedName) setUserName(storedName);
        }
    }, []);

    const handleNameChange = (name: string) => {
        setUserName(name);
        localStorage.setItem('vanguard_my_name', name);
    };


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
        const interval = setInterval(() => {
            const data = {
                temp: (24 + Math.random() * 2).toFixed(1),
                hum: (60 + Math.random() * 10).toFixed(0),
                stress: (10 + Math.random() * 5).toFixed(0),
                timestamp: new Date().toLocaleTimeString()
            };
            setTelemetry(data);
            setOfflineBuffer(prev => [...prev.slice(-19), data]);
        }, 2000);
        return () => clearInterval(interval);
    };

    const syncToCloud = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            setOfflineBuffer([]);
        }, 3000);
    };

    return (
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-start md:justify-center p-0 md:p-4 text-white overflow-y-auto">
            {/* MOBILE TOP BAR - Hidden on small mobile to save space */}
            <div className="hidden md:flex w-full max-w-sm justify-between items-center mb-4 px-4">
                <div className="flex items-center gap-2">
                    <WifiOff className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Modo Híbrido</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500">85%</span>
                    <Battery className="w-4 h-4 text-emerald-500" />
                </div>
            </div>

            {/* MAIN APP CONTAINER - Fluid on mobile, fixed max-sm on desktop */}
            <div className="w-full md:max-w-sm h-full md:h-auto md:min-h-[700px] bg-slate-900 border-x-0 md:border md:border-slate-800 rounded-none md:rounded-[3rem] p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
                <div className="w-1/3 h-1.5 bg-slate-800 rounded-full mb-6"></div>

                <div className="text-center mb-6">
                    <h2 className="text-xl font-black mb-1 tracking-tighter uppercase italic">Vanguard Mobile</h2>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="bg-transparent text-center text-slate-400 text-[10px] border-b border-slate-800 focus:border-indigo-500 outline-none w-32 uppercase font-bold"
                    />
                </div>

                {/* GPS TRACKER MODULE */}
                <div className={`w-full p-4 rounded-2xl mb-4 transition-all duration-500 ${isTracking ? 'bg-indigo-600/20 border border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-slate-800/50 border border-slate-700'}`}>
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <Navigation className={`w-4 h-4 ${isTracking ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Rastreo GPS</span>
                        </div>
                        <button
                            onClick={toggleTracking}
                            className={`px-3 py-1 rounded-full text-[9px] font-black transition-all ${isTracking ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}
                        >
                            {isTracking ? 'ACTIVO' : 'INACTIVO'}
                        </button>
                    </div>

                    {isTracking && coords ? (
                        <div className="flex flex-col gap-1 p-2 bg-black/30 rounded-lg">
                            <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-slate-500">LAT:</span>
                                <span className="text-indigo-300">{coords.lat.toFixed(6)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-slate-500">LNG:</span>
                                <span className="text-indigo-300">{coords.lng.toFixed(6)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></div>
                                <span className="text-[9px] text-indigo-400 font-bold">TRANSMITIENDO EN VIVO</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-2">
                            <p className="text-[9px] text-slate-500 italic">Pulsa para iniciar transmisión de ubicación</p>
                            {gpsError && <p className="text-[9px] text-red-400 mt-1 uppercase font-bold">{gpsError}</p>}
                        </div>
                    )}
                </div>

                {/* BT / SENSOR MODULE */}
                <div className="w-full flex gap-4 mb-4">
                    {/* BT STATUS */}
                    <div className="relative flex-1 flex flex-col items-center">
                        <button
                            onClick={connectBluetooth}
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${device ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-slate-800 border border-slate-700'}`}
                        >
                            {isScanning ? <BluetoothSearching className="w-6 h-6 animate-pulse" /> :
                                device ? <BluetoothConnected className="w-6 h-6" /> :
                                    <Bluetooth className="w-6 h-6 text-slate-400" />}
                        </button>
                        <span className="text-[8px] mt-2 font-bold text-slate-500 uppercase">Bluetooth</span>
                    </div>

                    {/* TELEMETRY MINI-CARD */}
                    <div className="flex-[2] bg-slate-800/50 border border-slate-700 rounded-2xl p-3 flex flex-col justify-center">
                        {telemetry ? (
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="block text-[7px] text-slate-500 font-black uppercase">Temp</span>
                                    <span className="text-sm font-black font-mono">{telemetry.temp}°</span>
                                </div>
                                <div>
                                    <span className="block text-[7px] text-slate-500 font-black uppercase">Hum</span>
                                    <span className="text-sm font-black font-mono">{telemetry.hum}%</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-1 opacity-40">
                                <Activity className="w-4 h-4 mx-auto mb-1" />
                                <span className="text-[7px] font-bold uppercase">Sin Sensores</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* OFFLINE STORAGE STATUS */}
                <div className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <Database className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Buffer de Datos</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold">{offlineBuffer.length}/100</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-emerald-500" style={{ width: `${offlineBuffer.length}%` }} />
                    </div>
                </div>

                {/* SYNC BUTTON */}
                <button
                    disabled={offlineBuffer.length === 0 || isSyncing}
                    onClick={syncToCloud}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${offlineBuffer.length > 0 ? 'bg-white text-black' : 'bg-slate-800 text-slate-600'}`}
                >
                    {isSyncing ? (
                        <>Sincronizando...</>
                    ) : (
                        <>
                            <CloudUpload className="w-4 h-4" />
                            Enviar a Nube
                        </>
                    )}
                </button>

                <div className="mt-auto pt-6 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-[8px] text-slate-500 uppercase font-black">
                        <MapPin className="w-2 h-2" />
                        <span>Redondos S.A. Digital Twin System</span>
                    </div>
                    <div className="w-1/2 h-1 bg-slate-800 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default MobileSync;
