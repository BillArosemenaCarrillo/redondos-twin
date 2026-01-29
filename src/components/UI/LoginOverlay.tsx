"use client";
import React, { useState, useEffect } from 'react';

interface LoginProps {
    onLogin: (userData: { name: string; surname: string; role: string; phone: string }) => void;
}

export const LoginOverlay: React.FC<LoginProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [role, setRole] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');

    // Fix Hydration Error: Generate ID only on client
    useEffect(() => {
        setSessionId(Date.now().toString().slice(-6));
    }, []);

    const handleEnter = async () => {
        if (!name || !surname || !role || !phone) {
            alert("Por favor complete todos los campos (incluyendo celular) para registrar su acceso.");
            return;
        }

        setLoading(true);

        // 🚨 CONFIGURACIÓN DE EMERGENCIA: Envío directo a Discord
        // (Ya que en AWS Amplify modo estático las APIs internas no funcionan)
        const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1334589254002315354/fWwG91TscV6_7IlyvB0t2hH_5-sW9T3e970868f0868f0868f0868f0868f0868f"; // URL simulada o placeholder seguro

        try {
            const payload = {
                embeds: [{
                    title: "👤 Nueva Visita - Gemelo Digital",
                    color: 0xDC2626,
                    fields: [
                        { name: "Nombre", value: `${name} ${surname}`, inline: true },
                        { name: "Cargo", value: role, inline: true },
                        { name: "WhatsApp", value: phone, inline: false },
                        { name: "Sesión ID", value: sessionId, inline: true },
                        { name: "Plataforma", value: "AWS Cloud", inline: true }
                    ],
                    timestamp: new Date().toISOString()
                }]
            };

            await fetch("https://discord.com/api/webhooks/1334589254002315354/fWwG91TscV6_7IlyvB0t2hH_5-sW9T3e970868f0868f0868f0868f0868f0868f0868f", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error("Error sending notification", e);
        }

        // Simulate authentication delay
        setTimeout(() => {
            onLogin({ name, surname, role, phone });
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center bg-[url('https://www.redondos.com.pe/wp-content/uploads/2020/08/fondo-home.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-red-900/95 to-slate-900/95 backdrop-blur-sm" />

            <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-500 border border-gray-100">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-3xl font-black text-white">R</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Redondos Digital Twin</h1>
                    <p className="text-gray-500 text-sm mb-6 text-center">Registro de Visita (Guest Book)</p>

                    <div className="w-full space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Juan"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Apellido</label>
                                <input
                                    type="text"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    placeholder="Pérez"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cargo / Empresa</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="Ej. Gerente General"
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Celular (WhatsApp)</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+51 999..."
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>

                        <button
                            onClick={handleEnter}
                            disabled={loading || !name || !surname || !role || !phone}
                            className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    <span>🚀</span> Ingresar al Sistema
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 w-full text-center">
                        <p className="text-[10px] text-gray-400">
                            ID Auditoría: <span className="font-mono">{sessionId}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
