"use client";
import React, { useState, useEffect } from 'react';

export const SunPanel = (props: { embedded?: boolean }) => {
    const [hour, setHour] = useState(12); // Noon default
    const [visible, setVisible] = useState(false);

    const handleTimeChange = (val: number) => {
        setHour(val); // UI update logic can be throttled if needed
    };

    // Dispatch effect
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('update-sun-position', { detail: hour }));
    }, [hour]);

    if ((props as any).embedded) {
        return (
            <div className="w-full">
                <div className="mb-2 text-center text-lg font-mono font-bold text-white">
                    {hour}:00
                </div>
                <div className="relative h-6 mb-2">
                    <input
                        type="range" min="6" max="18" step="1" value={hour}
                        onChange={(e) => handleTimeChange(parseInt(e.target.value))}
                        className="w-full accent-yellow-400"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                        <span>6 AM</span><span>12 PM</span><span>6 PM</span>
                    </div>
                </div>
            </div>
        )
    }

    if (!visible) return (
        <button onClick={() => setVisible(true)} className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur text-white p-2 rounded-lg border border-white/20 hover:bg-white/10">
            ☀️
        </button>
    );

    return (
        <div className="absolute top-4 right-4 z-20 w-64 bg-black/80 backdrop-blur-md border border-yellow-500/30 p-4 rounded-xl text-white shadow-2xl">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-yellow-400 text-sm flex items-center gap-2">
                    ☀️ Análisis Solar
                </h3>
                <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="mb-2 text-center text-lg font-mono font-bold">
                {hour}:00
            </div>

            <div className="relative h-6 mb-2">
                <input
                    type="range"
                    min="6"
                    max="18"
                    step="1"
                    value={hour}
                    onChange={(e) => handleTimeChange(parseInt(e.target.value))}
                    className="w-full accent-yellow-400"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-tight">
                Simula la posición del sol para evaluar sombras en la fachada del edificio.
            </p>
        </div>
    );
};
