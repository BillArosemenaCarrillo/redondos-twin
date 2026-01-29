"use client";
import React, { useState } from 'react';

// Mock Data Structure
interface TreeNode {
    id: string;
    label: string;
    type: 'model' | 'file' | 'plan' | 'folder';
    children?: TreeNode[];
}

export const LayerTree = () => {
    // Mock Data mimicking the reference image
    const initialData: TreeNode[] = [
        {
            id: 'models', label: 'Models', type: 'folder', children: [
                { id: 'm1', label: 'Estructuras_Torre_A.ifc', type: 'model' },
                { id: 'm2', label: 'Instalaciones_MEP.ifc', type: 'model' }
            ]
        },
        {
            id: 'plans', label: 'Floorplans', type: 'folder', children: [
                { id: 'f1', label: 'Nivel 1 - Lobby', type: 'plan' },
                { id: 'f2', label: 'Nivel 2 - Oficinas', type: 'plan' },
                { id: 'f3', label: 'Nivel 15 - Techo', type: 'plan' }
            ]
        }
    ];

    return (
        <div className="space-y-1">
            {initialData.map(node => <TreeNodeItem key={node.id} node={node} />)}
        </div>
    );
};

const TreeNodeItem = ({ node }: { node: TreeNode }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (node.children) {
        return (
            <div className="select-none">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 p-1 hover:bg-white/5 rounded cursor-pointer text-sm text-gray-300 transition-colors"
                >
                    <span className={`text-[10px] transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                    <span className="font-bold text-xs uppercase tracking-wide opacity-80">{node.label}</span>
                    <span className="ml-auto text-xs bg-white/10 px-1 rounded-full">{node.children.length}</span>
                </div>
                {isOpen && (
                    <div className="pl-4 border-l border-white/5 ml-2 mt-1 space-y-1">
                        {node.children.map(child => <TreeNodeItem key={child.id} node={child} />)}
                    </div>
                )}
            </div>
        );
    }

    // Leaf Node
    return (
        <div className="flex items-center gap-2 p-1 pl-2 hover:bg-white/5 rounded cursor-pointer text-sm group">
            <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">
                {node.type === 'model' ? '🧊' : node.type === 'plan' ? '📄' : '📁'}
            </span>
            <span className="truncate text-gray-400 group-hover:text-white transition-colors">{node.label}</span>
            <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-1">
                <button className="text-[10px] hover:text-cyan-400">👁️</button>
                <button className="text-[10px] hover:text-red-400">⬇️</button>
            </div>
        </div>
    );
};
