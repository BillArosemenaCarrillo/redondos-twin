"use client";
import React from 'react';

export const ShareModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-300 hover:text-gray-500">✕</button>

                <div className="text-center">
                    <h3 className="font-bold text-gray-800">Scan to view position</h3>
                    <p className="text-xs text-gray-400">Collaborate in real-time</p>
                </div>

                {/* QR Placeholder - In a real app we'd use 'qrcode.react' */}
                <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center text-white overflow-hidden relative group cursor-pointer">
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    {/* Overlay for "Copy Link" */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold">Click to Copy Link</span>
                    </div>
                </div>

                <div className="flex gap-2 w-full">
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold transition-colors">
                        Generate Code
                    </button>
                    <button className="flex-1 bg-black hover:bg-gray-800 text-white py-2 rounded-lg text-xs font-bold transition-colors">
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    );
};
