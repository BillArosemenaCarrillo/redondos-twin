// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as OBC from '@thatopen/components';
import * as BUI from '@thatopen/ui';

export const BimWorkspace = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [components, setComponents] = useState<OBC.Components | null>(null);
    const [world, setWorld] = useState<OBC.SimpleWorld | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        console.log("BIM WORKSPACE: Initializing...");

        // 1. Initialize Components
        const comps = new OBC.Components();

        try {
            // 2. Create World
            const worlds = comps.get(OBC.Worlds);
            const newWorld = worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer>();

            // Setup Scene
            newWorld.scene = new OBC.SimpleScene(comps);
            newWorld.renderer = new OBC.SimpleRenderer(comps, containerRef.current);
            newWorld.camera = new OBC.OrthoPerspectiveCamera(comps);

            // Setup Lights
            newWorld.scene.setup();

            // Add Grid (Safe Mode)
            if (newWorld.scene && newWorld.scene.three) {
                const size = 100;
                const divisions = 100;
                const gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
                newWorld.scene.three.add(gridHelper);
                console.log("BIM WORKSPACE: Grid Added.");
            }

            // 3. SETUP IFC LOADER
            const loader = comps.get(OBC.IfcLoader);
            loader.settings.wasm = {
                path: "https://unpkg.com/web-ifc@0.0.66/",
                absolute: true
            };

            // Initialize
            comps.init();

            // Trigger resize
            if (newWorld.camera && newWorld.camera.controls) {
                newWorld.camera.controls.setLookAt(20, 20, 20, 0, 0, 0);
            }

            console.log("BIM WORKSPACE: Ready.");
            setComponents(comps);
            setWorld(newWorld as unknown as OBC.SimpleWorld);

            // Events
            const handleResize = () => {
                if (newWorld.renderer) newWorld.renderer.resize();
                if (newWorld.camera) newWorld.camera.updateAspect();
            };
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                comps.dispose();
            };

        } catch (error) {
            console.error("BIM WORKSPACE CRASH:", error);
        }
    }, []);

    // FILE LOADING LOGIC
    const loadIfc = async (file: File) => {
        if (!components || !world) return;
        const loader = components.get(OBC.IfcLoader);

        console.log("Loading IFC:", file.name);
        alert(`Cargando ${file.name}... (Puede tardar unos segundos)`);

        const data = await file.arrayBuffer();
        const buffer = new Uint8Array(data);

        try {
            const model = await loader.load(buffer);
            model.name = file.name;
            world.scene.three.add(model);
            console.log("IFC Loaded:", model);
        } catch (e) {
            alert("Error crítico cargando IFC: " + e);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.ifc')) {
            loadIfc(file);
        } else {
            alert("Por favor arrastra un archivo .ifc válido");
        }
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    // --- GALPON SPAWNER (WAREHOUSE LOGIC) ---
    const handleSpawnGalpon = () => {
        if (!world || !world.scene || !world.scene.three) return;

        const group = new THREE.Group();
        const width = 6;
        const height = 4;
        const length = 12;

        const wallsGeo = new THREE.BoxGeometry(width, height, length);
        const wallsMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
        const walls = new THREE.Mesh(wallsGeo, wallsMat);
        walls.position.y = height / 2;
        group.add(walls);

        const roofBoxGeo = new THREE.BoxGeometry(width + 1, 0.5, length + 1);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.3, roughness: 0.4 });
        const roofBox = new THREE.Mesh(roofBoxGeo, roofMat);
        roofBox.position.y = height + 0.25;
        group.add(roofBox);

        const doorGeo = new THREE.BoxGeometry(2, 2.5, 0.2);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 1.25, length / 2); // Front
        group.add(door);

        group.position.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
        group.rotation.y = (Math.random() > 0.5 ? 0 : Math.PI / 2);

        world.scene.three.add(group);
    };

    return (
        <div className="relative w-full h-full bg-[#111]">
            {/* 3D CANVAS CONTAINER */}
            <div ref={containerRef} className="absolute inset-0 z-0 bg-gradient-to-b from-[#1a1a1a] to-[#000]" />

            {/* TOP BAR */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-[#1a1a1a] border-b border-[#333] flex items-center px-4 z-50 shadow-md">
                <span className="text-white font-bold text-lg mr-8 flex items-center gap-2">
                    <span className="text-2xl">🏗️</span>
                    REDONDOS ENGINEERING
                </span>

                <div className="flex gap-2">
                    <button className="bg-[#333] hover:bg-[#444] text-white px-4 py-1.5 rounded text-sm transition font-medium border border-[#444] flex items-center gap-2">
                        📂 Abrir IFC
                    </button>
                    <button className="bg-[#333] hover:bg-[#444] text-white px-4 py-1.5 rounded text-sm transition font-medium border border-[#444] flex items-center gap-2">
                        📐 Medir
                    </button>
                </div>
            </div>

            {/* FLOATING TOOLBAR */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-[#222]/90 backdrop-blur border border-[#444] rounded-full px-6 py-3 flex gap-4 shadow-2xl z-50 flex-nowrap items-center">
                <button
                    onClick={handleSpawnGalpon}
                    className="flex flex-col items-center gap-1 text-gray-300 hover:text-red-500 transition group"
                >
                    <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center group-hover:bg-red-500/20 group-hover:ring-2 ring-red-500 transition">
                        🏠
                    </div>
                    <span className="text-[10px] font-bold whitespace-nowrap">Construir Galpón</span>
                </button>

                <div className="w-[1px] h-8 bg-[#444]"></div>

                <button
                    onClick={() => {
                        // Dispatch event to Main App to switch modes AND spawn
                        window.dispatchEvent(new CustomEvent('deploy-bim-to-map'));
                    }}
                    className="flex flex-col items-center gap-1 text-gray-300 hover:text-green-400 transition group"
                >
                    <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center group-hover:bg-green-500/20 group-hover:ring-2 ring-green-500 transition">
                        🚀
                    </div>
                    <span className="text-[10px] font-bold whitespace-nowrap">Enviar al Mapa</span>
                </button>
            </div>

            {/* FLOATING PANEL */}
            <div className="absolute top-20 right-4 w-80 bg-[#1a1a1a]/95 backdrop-blur-md border border-[#333] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh] z-40 transition-all hover:border-[#555]">
                <div className="p-3 bg-[#252525] border-b border-[#333] flex justify-between items-center cursor-move">
                    <span className="text-gray-200 font-bold text-xs uppercase tracking-wider">Estructura</span>
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                </div>
                <div className="p-4 overflow-y-auto flex-1 text-sm text-gray-400">
                    <p className="italic mb-4">Sistema listo. Arrastra archivos aquí.</p>

                    {/* DROP ZONE */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-[#444] rounded-xl p-8 text-center hover:bg-[#222] hover:border-yellow-500 cursor-pointer transition-all animate-in fade-in"
                    >
                        <span className="text-4xl block mb-4">📥</span>
                        <span className="font-bold text-gray-300">Arrastra tu IFC</span>
                        <p className="text-xs text-gray-500 mt-2">Soporta IFC 2x3 y IFC 4</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
