"use client";
import React, { useState } from 'react';

// Mock Property Data Structure
interface PropertyGroup {
    title: string;
    items: { label: string; value: string | number }[];
}

export const PropertiesPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    // Mock data based on the user's reference image
    const propertyGroups: PropertyGroup[] = [
        {
            title: "Identity Data",
            items: [
                { label: "LocalId", value: "98446" },
                { label: "Category", value: "IFCWALL" },
                { label: "Name", value: "Basic Wall:EW-3A 596 mm:589064" },
                { label: "ObjectType", value: "Basic Wall:EW-3A 596 mm" },
                { label: "Tag", value: "589064" },
                { label: "Workset", value: "Workset1" },
            ]
        },
        {
            title: "Dimensions",
            items: [
                { label: "Unconnected Height", value: "4688.00" },
                { label: "Area", value: "13.90 m²" },
                { label: "Length", value: "2907.25 mm" },
                { label: "Volume", value: "9.71 m³" },
            ]
        },
        {
            title: "Constraints",
            items: [
                { label: "Base Constraint", value: "LV3" },
                { label: "Top Constraint", value: "Up to level: LV4" },
            ]
        }
    ];

    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col animate-in slide-in-from-right-4 duration-300 z-40">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                    <span className="text-gray-500">🗂️</span>
                    <h2 className="font-bold text-gray-800 text-sm">Properties</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-xs text-gray-500 mb-2">Basic Wall:EW-3A 596 mm:589064</div>

                {propertyGroups.map((group, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wide flex justify-between">
                            {group.title}
                            <span className="bg-gray-200 text-gray-500 px-1.5 rounded-full text-[10px]">{group.items.length}</span>
                        </div>
                        <div className="divide-y divide-gray-100 bg-white">
                            {group.items.map((item, i) => (
                                <div key={i} className="px-3 py-2 flex justify-between text-xs hover:bg-gray-50">
                                    <span className="text-gray-500">{item.label}</span>
                                    <span className="font-medium text-gray-800 text-right truncate max-w-[120px]" title={String(item.value)}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
