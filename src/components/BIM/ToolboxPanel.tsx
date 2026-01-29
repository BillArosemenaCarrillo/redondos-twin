"use client";
import React, { useState, useEffect } from 'react';

export const ToolboxPanel = (props: { embedded?: boolean }) => {
    const [visible, setVisible] = useState(false);
    const [isRaining, setIsRaining] = useState(false);

    // Weather Effect
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('update-weather', { detail: isRaining }));
    }, [isRaining]);

    // Snapshot Logic
    const takeSnapshot = () => {
        const canvas = document.querySelector('canvas.maplibregl-canvas') as HTMLCanvasElement;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `obra_avance_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else {
            alert("No se pudo capturar el canvas.");
        }
    };

    if ((props as any).embedded) {
        return (
            <div className="space-y-3">
                {/* Weather Control */}
                <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                    <span className="text-sm">🌧️ Simular Lluvia</span>
                    <button
                        onClick={() => setIsRaining(!isRaining)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${isRaining ? 'bg-cyan-500' : 'bg-gray-600'}`}
                    >
                        <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRaining ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
                {/* Snapshot Control */}
                <button
                    onClick={takeSnapshot}
                    className="w-full bg-white/10 hover:bg-white/20 text-white text-sm py-2 rounded flex items-center justify-center gap-2 border border-white/10"
                >
                    📸 Tomar Foto
                </button>
            </div>
        )
    }

    if (!visible) return (
        <button onClick={() => setVisible(true)} className="absolute top-16 right-4 z-20 bg-black/60 backdrop-blur text-white p-2 rounded-lg border border-white/20 hover:bg-white/10">
            🛠️
        </button>
    );

    return (
        <div className="absolute top-16 right-4 z-20 w-64 bg-black/80 backdrop-blur-md border border-red-500/30 p-4 rounded-xl text-white shadow-2xl">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-red-400 text-sm flex items-center gap-2">
                    🛡️ Seguridad y Reportes
                </h3>
                <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
                {/* Weather Control */}
                <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                    <span className="text-sm">🌧️ Simular Lluvia</span>
                    <button
                        onClick={() => setIsRaining(!isRaining)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${isRaining ? 'bg-cyan-500' : 'bg-gray-600'}`}
                    >
                        <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRaining ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>

                {/* Snapshot Control */}
                <button
                    onClick={takeSnapshot}
                    className="w-full bg-white/10 hover:bg-white/20 text-white text-sm py-2 rounded flex items-center justify-center gap-2 border border-white/10"
                >
                    📸 Tomar Foto de Obra
                </button>
            </div>

            <p className="text-[10px] text-gray-500 mt-2 leading-tight">
                Herramientas para planificación de seguridad y reportes diarios.
            </p>
        </div>
    );
};
