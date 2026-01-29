"use client";
import React, { useState, useEffect } from 'react';

// Define event detail type for typescript safety
interface TransformUpdate {
    lng: number;
    lat: number;
    alt: number;
    rot: number;
    scale: number;
}

export const GeoreferencePanel = (props: { embedded?: boolean }) => {
    // Plaza de Armas Default
    const [lng, setLng] = useState(-77.02824);
    const [lat, setLat] = useState(-12.04318);
    const [alt, setAlt] = useState(0);
    const [rot, setRot] = useState(0);
    const [scale, setScale] = useState(1);
    const [visible, setVisible] = useState(true);

    const updateTransform = (newLng: number, newLat: number, newAlt: number, newRot: number, newScale: number) => {
        // Dispatch event for ThreeLayer to catch
        window.dispatchEvent(new CustomEvent<TransformUpdate>('update-transform', {
            detail: { lng: newLng, lat: newLat, alt: newAlt, rot: newRot, scale: newScale }
        }));
    };

    const handleChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
        setter(value);
        // We defer the dispatch slightly or just send it with current state + new value
        // But for simplicity in this MVP sync, we'll rely on the effect below or direct call?
        // Let's use an effect to sync state to event.
    };

    useEffect(() => {
        // Load from LocalStorage on mount
        const saved = localStorage.getItem('bim-geo');
        if (saved) {
            try {
                const p = JSON.parse(saved);
                if (p.lng) setLng(p.lng);
                if (p.lat) setLat(p.lat);
                if (p.alt) setAlt(p.alt);
                if (p.rot) setRot(p.rot);
                if (p.scale) setScale(p.scale);
            } catch (e) { console.error(e); }
        }
    }, []);

    useEffect(() => {
        updateTransform(lng, lat, alt, rot, scale);
        // Save to LocalStorage
        localStorage.setItem('bim-geo', JSON.stringify({ lng, lat, alt, rot, scale }));
    }, [lng, lat, alt, rot, scale]);

    const [isOrbiting, setIsOrbiting] = useState(false);

    useEffect(() => {
        if (!isOrbiting) return;
        let animationFrameId: number;

        const animate = () => {
            const map = (window as any).map;
            if (map) {
                const currentBearing = map.getBearing();
                map.rotateTo(currentBearing + 0.1, { duration: 0, animate: false });
                animationFrameId = requestAnimationFrame(animate);
            }
        };
        animate();

        return () => cancelAnimationFrame(animationFrameId);
    }, [isOrbiting]);

    if (!visible) return (
        <button onClick={() => setVisible(true)} className="absolute bottom-4 right-4 bg-white/10 backdrop-blur text-white p-2 rounded">
            ⚙️ Ajustes
        </button>
    );

    return (
        <div className="absolute bottom-4 right-4 z-20 w-80 bg-black/80 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-cyan-400">📏 Georreferenciación</h3>
                <div className="flex gap-2">
                    <button onClick={() => (window as any).map?.flyTo({ pitch: 0 })} title="Top View" className="bg-white/10 hover:bg-white/20 p-1 rounded text-xs">⬆️</button>
                    <button onClick={() => (window as any).map?.flyTo({ bearing: 0 })} title="North" className="bg-white/10 hover:bg-white/20 p-1 rounded text-xs">🧭</button>
                    <button
                        onClick={() => setIsOrbiting(!isOrbiting)}
                        title="Cinematic Mode"
                        className={`p-1 rounded text-xs ${isOrbiting ? 'bg-cyan-500 text-black' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        🎬
                    </button>
                    <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white ml-2">✕</button>
                </div>
            </div>

            <div className="space-y-3 text-xs">
                <div>
                    <label className="block text-gray-400 mb-1">Longitud (X)</label>
                    <input type="number" step="0.00001" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))}
                        className="w-full bg-white/10 rounded px-2 py-1 border border-white/10" />
                    <input type="range" min="-77.10" max="-76.90" step="0.00001" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} className="w-full mt-1 accent-cyan-500" />
                </div>

                <div>
                    <label className="block text-gray-400 mb-1">Latitud (Y)</label>
                    <input type="number" step="0.00001" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))}
                        className="w-full bg-white/10 rounded px-2 py-1 border border-white/10" />
                    <input type="range" min="-12.10" max="-12.00" step="0.00001" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} className="w-full mt-1 accent-cyan-500" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-gray-400 mb-1">Altitud (Z)</label>
                        <input type="number" value={alt} onChange={(e) => setAlt(parseFloat(e.target.value))}
                            className="w-full bg-white/10 rounded px-2 py-1 border border-white/10" />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1">Escala</label>
                        <input type="number" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="w-full bg-white/10 rounded px-2 py-1 border border-white/10" />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-400 mb-1">Rotación (°)</label>
                    <input type="range" min="0" max="360" value={rot} onChange={(e) => setRot(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                    <div className="text-right text-gray-500">{rot}°</div>
                </div>
            </div>
        </div>
    );
};
