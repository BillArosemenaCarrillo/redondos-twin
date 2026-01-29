"use client";
import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    onClose: () => void;
}

export const GlassToast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const borderColors = {
        info: 'border-red-500',
        success: 'border-green-600',
        warning: 'border-orange-500',
        error: 'border-red-800'
    };

    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '🚨'
    };

    return (
        <div className={`
            fixed top-4 right-4 z-50 
            bg-white/95 backdrop-blur-md 
            border-l-8 ${borderColors[type]}
            text-gray-800 px-6 py-4 rounded-r-lg shadow-2xl
            flex items-center gap-4
            animate-in slide-in-from-top-full duration-300
            border-y border-r border-gray-200
        `}>
            <span className="text-2xl">{icons[type]}</span>
            <div>
                <p className="font-bold text-sm uppercase tracking-wide text-gray-500">{type}</p>
                <p className="font-bold text-lg leading-tight">{message}</p>
            </div>
            <button onClick={onClose} className="ml-4 text-gray-400 hover:text-red-600 font-bold text-xl">✕</button>
        </div>
    );
};
