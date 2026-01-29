// @ts-nocheck
"use client";

import React, { useCallback } from 'react';

interface Props {
    onFileSelect: (file: File) => void;
}

export const BimInput: React.FC<Props> = ({ onFileSelect }) => {
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            if (files[0].name.endsWith('.ifc')) {
                onFileSelect(files[0]);
            } else {
                alert("Por favor sube un archivo .ifc válido");
            }
        }
    }, [onFileSelect]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            onFileSelect(files[0]);
        }
    }, [onFileSelect]);

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center cursor-pointer hover:bg-white/5 transition-colors"
        >
            <input
                type="file"
                accept=".ifc"
                onChange={handleChange}
                className="hidden"
                id="ifc-upload"
            />
            <label htmlFor="ifc-upload" className="cursor-pointer">
                <div className="text-4xl mb-2">🏗️</div>
                <p className="text-sm font-medium text-white">
                    Arrastra tu archivo IFC aquí
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    o haz clic para buscar
                </p>
            </label>
        </div>
    );
};
