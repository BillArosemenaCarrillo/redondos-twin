"use client";
import React, { useState, useEffect } from 'react';

interface PlacementModalProps {
    filename: string;
    fileType: 'DXF' | 'MODEL' | 'IFC';
    onConfirm: (settings: { scale: number; rotation: number }) => void;
    onCancel: () => void;
}

export const PlacementModal: React.FC<PlacementModalProps> = ({ filename, fileType, onConfirm, onCancel }) => {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-80 overflow-hidden font-sans border border-gray-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Confirm {fileType} Placement</h3>
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{fileType} file "{filename}"</p>
                    </div>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    <p className="text-xs text-gray-400">Adjust scale (S), position (G), rotation (R)</p>

                    {/* Scale Control */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Scale</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900 focus:outline-none focus:border-black transition-colors"
                            />
                            <button onClick={() => setScale(0.001)} className="px-2 py-1 text-[10px] font-medium border border-gray-200 rounded hover:bg-gray-50 text-gray-600">mm→m</button>
                            <button onClick={() => setScale(0.0254)} className="px-2 py-1 text-[10px] font-medium border border-gray-200 rounded hover:bg-gray-50 text-gray-600">in→m</button>
                        </div>
                    </div>

                    {/* Rotation Control */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Rotation (degrees)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={rotation}
                                onChange={(e) => setRotation(parseFloat(e.target.value))}
                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900 focus:outline-none focus:border-black transition-colors"
                            />
                            <button onClick={() => setRotation(90)} className="px-2 py-1 text-[10px] font-medium border border-gray-200 rounded hover:bg-gray-50 text-gray-600">90°</button>
                            <button onClick={() => setRotation(180)} className="px-2 py-1 text-[10px] font-medium border border-gray-200 rounded hover:bg-gray-50 text-gray-600">180°</button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Rotation around Y-axis (vertical)</p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => onConfirm({ scale, rotation })}
                        className="w-full bg-black text-white hover:bg-gray-800 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <span>✓</span> Confirm Placement
                    </button>
                </div>
            </div>
        </div>
    );
};
