"use client";
import React, { useState } from 'react';

interface SpatialNode {
    id: string;
    label: string;
    type: 'building' | 'level' | 'category' | 'element';
    children?: SpatialNode[];
}

export const SpatialTree = ({ onSelect }: { onSelect: (id: string) => void }) => {
    // Mock Data mimicking the "VSIM BUILDING" reference
    const data: SpatialNode[] = [
        {
            id: 'b1', label: 'VSIM BUILDING', type: 'building', children: [
                { id: 'l1', label: 'LV1', type: 'level' },
                { id: 'l2', label: 'Ground floor HCI', type: 'level' },
                { id: 'l3', label: 'Second floor HCI', type: 'level' },
                {
                    id: 'l4', label: 'LV4', type: 'level', children: [
                        { id: 'c1', label: 'IFCWALL', type: 'category' },
                        {
                            id: 'c2', label: 'IFCSLAB', type: 'category', children: [
                                { id: 'e1', label: 'Floor:F2- concrete slab 200 mm', type: 'element' },
                                { id: 'e2', label: 'Floor:F3:1303182', type: 'element' }
                            ]
                        },
                        { id: 'c3', label: 'IFCCURTAINWALL', type: 'category' }
                    ]
                }
            ]
        }
    ];

    return (
        <div className="text-gray-300 text-xs font-mono">
            <div className="mb-2 px-2">
                <input type="text" placeholder="🔍 Search" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 focus:border-cyan-500 outline-none transition-colors" />
            </div>
            {data.map(node => <SpatialNodeItem key={node.id} node={node} onSelect={onSelect} />)}
        </div>
    );
};

const SpatialNodeItem = ({ node, onSelect }: { node: SpatialNode, onSelect: (id: string) => void }) => {
    const [isOpen, setIsOpen] = useState(true); // Default open for demo

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.children) {
            setIsOpen(!isOpen);
        } else {
            onSelect(node.id);
        }
    };

    return (
        <div className="select-none">
            <div
                onClick={handleClick}
                className={`
                    flex items-center gap-1.5 px-2 py-1 cursor-pointer transition-colors
                    hover:bg-cyan-900/30 rounded
                    ${node.type === 'element' ? 'pl-6' : ''}
                `}
            >
                {node.children && (
                    <span className={`text-[10px] text-gray-500 transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                )}
                {!node.children && <span className="w-2" />} {/* Indent space */}

                <span className="opacity-70 text-[10px]">
                    {node.type === 'building' && '🏢'}
                    {node.type === 'level' && '📐'}
                    {node.type === 'category' && '📦'}
                    {node.type === 'element' && '🧱'}
                </span>

                <span className={`${node.type === 'element' ? 'text-cyan-200' : 'text-gray-300'}`}>
                    {node.label}
                </span>
            </div>

            {isOpen && node.children && (
                <div className="pl-2 border-l border-white/5 ml-2">
                    {node.children.map(child => <SpatialNodeItem key={child.id} node={child} onSelect={onSelect} />)}
                </div>
            )}
        </div>
    );
};
