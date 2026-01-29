"use client";
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion } from "framer-motion";
import { ThreeLayer } from "./ThreeLayer";
import Sidebar from "../Navigation/Sidebar";
import GestorDashboard from "../Dashboard/GestorDashboard";
import ClimateDashboard from "../Dashboard/ClimateDashboard";
import FeedingDashboard from "../Dashboard/FeedingDashboard";
import BiosecurityDashboard from "../Dashboard/BiosecurityDashboard";
import ResourceDashboard from "../Dashboard/ResourceDashboard";
import PredictiveDashboard from "../Dashboard/PredictiveDashboard";
import WelfareDashboard from "../Dashboard/WelfareDashboard";
import MobileSync from "../Dashboard/MobileSync";

// --- Types ---
declare global {
    interface Window {
        _lastTruckCoords: any;
        _lastPersonnelCoords: any;
    }
}

interface SimulationState {
    temperature: number;
    humidity: number;
    ammonia: number;
    fanSpeed: number;
    lastUpdated: Date;
    // New Metrics
    pigCount: number;
    pigAge: number; // Weeks
    pigStage: 'Inicio' | 'Crecimiento' | 'Engorde' | 'Recria';
    foodConsumption: number; // kg
    ventilationOn: boolean;
    extractorOn: boolean;
    // Production/Financial Metrics
    foodPricePerKg: number; // S/
    weightPerPig: number; // kg
    totalFoodPrice: number; // S/
    totalMeatWeight: number; // kg
    // Silo Specifics
    siloCapacity: number; // kg
    siloLevel: number; // kg
    feedType: 'Inicio' | 'Crecimiento' | 'Engorde' | 'Gestacion';
}

interface Incident {
    id: number;
    lat: number;
    lng: number;
    type: "Critical" | "Warning" | "Maintenance";
    description: string;
    timestamp: Date;
}

const REDONDOS_PLANT_COORDS = {
    lat: -11.11,
    lng: -77.61,
};

export const MapLibreViewer = ({ className }: { className?: string }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [zoom, setZoom] = useState(16);
    const [pumpStatus, setPumpStatus] = useState(false); // Water Pump
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [lastSelectedName, setLastSelectedName] = useState<string>("");
    const [breachAlert, setBreachAlert] = useState<{ active: boolean; msg: string }>({ active: false, msg: "" });
    // GeoJSON State for Buildings
    const [geoJsonData, setGeoJsonData] = useState<any>({
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                id: 1,
                properties: { id: 1, type: 'galpon', height: 10, color: '#e74c3c', name: 'Galpon A-1' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [-77.6105, -11.1105],
                        [-77.6095, -11.1105],
                        [-77.6095, -11.1110],
                        [-77.6105, -11.1110],
                        [-77.6105, -11.1105]
                    ]]
                }
            },
            {
                type: 'Feature',
                id: 2,
                properties: { id: 2, type: 'galpon', height: 10, color: '#2ecc71', name: 'Galpon A-2' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [-77.6105, -11.1115],
                        [-77.6095, -11.1115],
                        [-77.6095, -11.1120],
                        [-77.6105, -11.1120],
                        [-77.6105, -11.1115]
                    ]]
                }
            },
            {
                type: 'Feature',
                id: 3,
                properties: { id: 3, type: 'silo', height: 15, color: '#f1c40f', name: 'Silo Principal' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [-77.6090, -11.1108],
                        [-77.6088, -11.1108],
                        [-77.6088, -11.1112],
                        [-77.6090, -11.1112],
                        [-77.6090, -11.1108]
                    ]]
                }
            },
            {
                type: 'Feature',
                id: 4,
                properties: { id: 4, type: 'laguna', height: 0, color: '#3498db', name: 'LAGUNA DE OXIDACIÓN 01' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [-77.6130, -11.1110],
                        [-77.6120, -11.1110],
                        [-77.6120, -11.1120],
                        [-77.6130, -11.1120],
                        [-77.6130, -11.1110]
                    ]]
                }
            },
            {
                type: 'Feature',
                id: 5,
                properties: { id: 5, type: 'solar', height: 0, color: '#f1c40f', name: 'PLANTA SOLAR GALPÓN 01' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [-77.6105, -11.1090],
                        [-77.6100, -11.1090],
                        [-77.6100, -11.1095],
                        [-77.6105, -11.1095],
                        [-77.6105, -11.1090]
                    ]]
                }
            },
            {
                type: 'Feature',
                id: 6,
                properties: { id: 6, type: 'zona_roja', height: 0, color: '#ef4444', name: 'ZONA RESTRINGIDA - CRITERIO A' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [-77.6115, -11.1105],
                        [-77.6105, -11.1105],
                        [-77.6105, -11.1115],
                        [-77.6115, -11.1115],
                        [-77.6115, -11.1105]
                    ]]
                }
            }
        ]
    });

    // Refs to avoid stale closures in animation loops
    const redZonesRef = useRef({
        type: 'FeatureCollection',
        features: geoJsonData.features.filter((f: any) => f.properties.type === 'zona_roja')
    });
    const breachAlertRef = useRef(breachAlert);

    useEffect(() => { breachAlertRef.current = breachAlert; }, [breachAlert]);

    // --- Spatial Utils ---
    const isPointInPolygon = (point: number[], polygon: number[][][]) => {
        const x = point[0], y = point[1];
        const vs = polygon[0];
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i][0], yi = vs[i][1];
            const xj = vs[j][0], yj = vs[j][1];
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };
    const [pitch, setPitch] = useState(45);
    const [environment, setEnvironment] = useState({
        time: 12, // 0-24
        isRaining: false,
    });
    const [activeTool, setActiveTool] = useState<"none" | "measure" | "incident">("none");
    const [isSaving, setIsSaving] = useState(false);

    // --- PERSISTENCE: LOAD ON MOUNT ---
    useEffect(() => {
        const loadInfrastructure = async () => {
            // 1. Try LocalStorage first (User's live modifications)
            const localData = localStorage.getItem('redondos_infrastructure');
            if (localData) {
                try {
                    const parsed = JSON.parse(localData);
                    if (parsed && parsed.type === 'FeatureCollection') {
                        setGeoJsonData(parsed);
                        geoJsonRef.current = parsed;
                        console.log('Infrastructure loaded from LOCAL STORAGE (Master Version).');
                        return; // Exit if loaded from local
                    }
                } catch (e) {
                    console.error("Local storage corrupt, falling back to API", e);
                }
            }

            // 2. Fallback to API/File (Original data)
            try {
                const res = await fetch(`/api/infrastructure?t=${Date.now()}`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.type === 'FeatureCollection') {
                        setGeoJsonData(data);
                        geoJsonRef.current = data;
                        console.log('Infrastructure loaded from server API.');
                    }
                }
            } catch (err) {
                console.error('Failed to load infrastructure from API:', err);
            }
        };
        loadInfrastructure();
    }, []);

    // --- PERSISTENCE: SAVE FUNCTION ---
    const saveMapData = async () => {
        setIsSaving(true);

        // 1. ALWAYS Save to LocalStorage first (Immediate persist)
        try {
            localStorage.setItem('redondos_infrastructure', JSON.stringify(geoJsonData));
            console.log("Data saved to Browser LocalStorage.");
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }

        // 2. Try Server API (will fail in static export, but we keep it for dev)
        try {
            const res = await fetch('/api/infrastructure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geoJsonData)
            });
            if (res.ok) {
                alert('Cambios guardados en NUBE y LOCAL! 💾✨');
            } else {
                // Silent fail for API in static mode, user only sees success if localStorage worked
                alert('¡Maqueta Guardada con Éxito! 💾 (Modo Presentación Activo)');
            }
        } catch (err) {
            console.warn('Network save failed (Expected in Amplify Static Mode). Local storage is safe.');
            alert('¡Maqueta Guardada con Éxito! 💾 (Modo Presentación Activo)');
        } finally {
            setIsSaving(false);
        }
    };

    // --- GEOMETRY HELPERS ---
    const METER_TO_DEG = 1 / 111320; // Approx degrees per meter at equator

    const createRectPolygon = (centerLng: number, centerLat: number, widthMeters: number, heightMeters: number) => {
        const halfWidth = (widthMeters / 2) * METER_TO_DEG * (1 / Math.cos(centerLat * Math.PI / 180));
        const halfHeight = (heightMeters / 2) * METER_TO_DEG;

        return [
            [centerLng - halfWidth, centerLat + halfHeight], // TL
            [centerLng + halfWidth, centerLat + halfHeight], // TR
            [centerLng + halfWidth, centerLat - halfHeight], // BR
            [centerLng - halfWidth, centerLat - halfHeight], // BL
            [centerLng - halfWidth, centerLat + halfHeight]  // Close loop
        ];
    };

    const createCirclePolygon = (centerLng: number, centerLat: number, radiusMeters: number, steps = 32) => {
        const coords = [];
        for (let i = 0; i <= steps; i++) {
            const theta = (i / steps) * 2 * Math.PI;
            const dx = radiusMeters * Math.cos(theta);
            const dy = radiusMeters * Math.sin(theta);

            const dLng = dx * METER_TO_DEG * (1 / Math.cos(centerLat * Math.PI / 180));
            const dLat = dy * METER_TO_DEG;

            coords.push([centerLng + dLng, centerLat + dLat]);
        }
        return coords;
    };

    // --- ADD ASSET FUNCTIONS ---
    const addGalpon = () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        const id = Date.now();
        const coords = createRectPolygon(center.lng, center.lat, 100, 15); // 100x15m

        const newFeature = {
            type: 'Feature',
            id: id,
            properties: { id: id, type: 'galpon', height: 6, color: '#fef3c7', name: `Galpon ${id.toString().slice(-4)}` },
            geometry: { type: 'Polygon', coordinates: [coords] }
        };
        setGeoJsonData(prev => ({ ...prev, features: [...prev.features, newFeature] }));
    };

    const addSilo = () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        const id = `silo-${Date.now()}`;
        const coords = createCirclePolygon(center.lng, center.lat, 2.5); // 5m Diameter

        const newFeature = {
            type: 'Feature',
            id: id,
            properties: { id: id, type: 'silo', height: 12, color: '#fbbf24', name: `Silo ${id.toString().slice(-4)}` },
            geometry: { type: 'Polygon', coordinates: [coords] }
        };
        setGeoJsonData(prev => ({ ...prev, features: [...prev.features, newFeature] }));
    };

    const addLaguna = () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        const id = Date.now();
        const coords = createRectPolygon(center.lng, center.lat, 50, 50); // 50x50m Initial

        const newFeature = {
            type: 'Feature',
            id: id,
            properties: { id: id, type: 'laguna', height: 0.1, color: '#0ea5e9', name: `Laguna ${id}` },
            geometry: { type: 'Polygon', coordinates: [coords] }
        };
        setGeoJsonData(prev => ({ ...prev, features: [...prev.features, newFeature] }));
    };

    const addZona = () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        const id = Date.now();
        const coords = createRectPolygon(center.lng, center.lat, 100, 100); // 100x100m Initial

        const newFeature = {
            type: 'Feature',
            id: id,
            properties: { id: id, type: 'zona_roja', height: 0, color: '#ef4444', name: `Zona ${id}` },
            geometry: { type: 'Polygon', coordinates: [coords] }
        };
        setGeoJsonData(prev => ({ ...prev, features: [...prev.features, newFeature] }));
    };

    const addEdificio = () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        const id = Date.now();
        const coords = createRectPolygon(center.lng, center.lat, 20, 20); // 20x20m Base

        const newFeature = {
            type: 'Feature',
            id: id,
            properties: { id: id, type: 'edificio', height: 12, color: '#64748b', name: `Edificio ${id}` },
            geometry: { type: 'Polygon', coordinates: [coords] }
        };
        setGeoJsonData(prev => ({ ...prev, features: [...prev.features, newFeature] }));
    };

    const addSiloGigante = () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        const id = Date.now();
        const coords = createCirclePolygon(center.lng, center.lat, 25); // 50m Diameter = 25m Radius

        const newFeature = {
            type: 'Feature',
            id: id,
            properties: { id: id, type: 'silo_gigante', height: 30, color: '#7c3aed', name: `Silo Gigante ${id.toString().slice(-4)}` }, // Purple
            geometry: { type: 'Polygon', coordinates: [coords] }
        };
        setGeoJsonData(prev => ({ ...prev, features: [...prev.features, newFeature] }));
    };

    const addPlanta = () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        const id = Date.now();

        // Building 1: Warehouse (40x30m)
        const coords1 = createRectPolygon(center.lng, center.lat, 40, 30);
        const feat1 = {
            type: 'Feature',
            id: id,
            properties: { id: id, type: 'planta_nave', height: 12, color: '#475569', name: `Almacén ${id.toString().slice(-4)}` },
            geometry: { type: 'Polygon', coordinates: [coords1] }
        };

        // Building 2: Processing Tower (15x15m), offset by 35m East
        const offsetLng = 35 * METER_TO_DEG * (1 / Math.cos(center.lat * Math.PI / 180));
        const coords2 = createRectPolygon(center.lng + offsetLng, center.lat, 15, 15);
        const feat2 = {
            type: 'Feature',
            id: id + 1,
            properties: { id: id + 1, type: 'planta_torre', height: 24, color: '#334155', name: `Torre Proc. ${id.toString().slice(-4)}` },
            geometry: { type: 'Polygon', coordinates: [coords2] }
        };

        setGeoJsonData(prev => ({ ...prev, features: [...prev.features, feat1, feat2] }));
    };

    const addPTAR = () => {
        if (!map.current) return;
        const center = map.current.getCenter();
        const id = Date.now();

        // 1. Treatment Pool (Rectangular, Low)
        const coordsPool = createRectPolygon(center.lng, center.lat, 35, 20);
        const featPool = {
            type: 'Feature',
            id: id,
            properties: { id: id, type: 'ptar_pool', height: 2, color: '#2dd4bf', name: `Poza Trat. ${id.toString().slice(-4)}` }, // Teal
            geometry: { type: 'Polygon', coordinates: [coordsPool] }
        };

        // 2. Clarifier Tank (Circular) - Offset West
        const offsetLng = -30 * METER_TO_DEG * (1 / Math.cos(center.lat * Math.PI / 180));
        const coordsTank = createCirclePolygon(center.lng + offsetLng, center.lat, 8); // 16m Diameter
        const featTank = {
            type: 'Feature',
            id: id + 1,
            properties: { id: id + 1, type: 'ptar_tank', height: 4, color: '#0f766e', name: `Clarificador ${id.toString().slice(-4)}` }, // Dark Teal
            geometry: { type: 'Polygon', coordinates: [coordsTank] }
        };

        setGeoJsonData(prev => ({ ...prev, features: [...prev.features, featPool, featTank] }));
    };

    // --- SYNC GEOJSON STATE TO MAP SOURCES ---
    useEffect(() => {
        if (!map.current || !geoJsonData) return;

        // Update References
        geoJsonRef.current = geoJsonData;
        redZonesRef.current = {
            type: 'FeatureCollection',
            features: geoJsonData.features.filter((f: any) => f.properties.type === 'zona_roja')
        };

        // Update MapLibre Sources if they exist
        const updateSource = (sourceId: string, filter?: (f: any) => boolean) => {
            const source = map.current?.getSource(sourceId) as maplibregl.GeoJSONSource;
            if (source) {
                const data = filter
                    ? { type: 'FeatureCollection', features: geoJsonData.features.filter(filter) }
                    : geoJsonData;
                source.setData(data as any);
            }
        };

        updateSource('galpones', f => ['galpon', 'silo', 'silo_gigante', 'planta_nave', 'planta_torre', 'ptar_pool', 'ptar_tank', 'edificio'].includes(f.properties.type));
        updateSource('galpones-extrusion', f => f.properties.type === 'galpon');
        updateSource('lagoons', f => f.properties.type === 'laguna');
        updateSource('solar', f => f.properties.type === 'solar');
        updateSource('biosecurity-zones', f => f.properties.type === 'zona_roja');

    }, [geoJsonData]);
    const [mapStyle, setMapStyle] = useState<'dark' | 'streets'>('dark');
    const [activeHudTab, setActiveHudTab] = useState<'operations' | 'management'>('operations');
    const [activeSection, setActiveSection] = useState('overview');
    const [isBimMode, setIsBimMode] = useState(false);
    const [isThermalMode, setIsThermalMode] = useState(false);
    const [isWelfareMode, setIsWelfareMode] = useState(false);
    const [incidents, setIncidents] = useState<Incident[]>([]);

    // Refs
    const geoJsonRef = useRef<any>(null);
    const thermalDataRef = useRef<any>({ type: 'FeatureCollection', features: [] });
    const threeLayerRef = useRef<ThreeLayer | null>(null);
    const selectedIdsRef = useRef<Set<string | number>>(new Set());

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragState = useRef<{
        isDragging: boolean;
        startLngLat: { lng: number; lat: number } | null;
        // Map of ID -> Original Coordinates (for multi-select drag)
        originalCoordsMap: Record<string | number, any> | null;
    }>({
        isDragging: false,
        startLngLat: null,
        originalCoordsMap: null
    });



    // Simulating Sensor Data (Per ID)
    const [sensorData, setSensorData] = useState<Record<string, SimulationState>>({});

    useEffect(() => {
        const interval = setInterval(() => {
            const newData: Record<string, SimulationState> = {};
            geoJsonRef.current?.features.forEach((f: any) => {
                const id = f.id;
                const existing = sensorData[id];
                const type = f.properties.type || (typeof id === 'string' && id.startsWith('silo') ? 'silo' : 'galpon');

                if (type === 'galpon') {
                    newData[id] = {
                        temperature: 24 + Math.random() * 5 * (id === 1 ? 1 : 0.5),
                        humidity: 60 + Math.random() * 5,
                        ammonia: 10 + Math.random() * 5,
                        fanSpeed: existing?.ventilationOn ? 100 : 0,
                        lastUpdated: new Date(),
                        // Persistent mocks
                        pigCount: existing ? existing.pigCount : (id === 1 ? 80 : (id === 2 ? 20 : Math.floor(500 + Math.random() * 50))),
                        pigAge: existing ? existing.pigAge : (id === 1 ? 20 : (id === 2 ? 50 : Math.floor(1 + Math.random() * 20))),
                        pigStage: existing ? existing.pigStage : (id === 1 ? 'Engorde' : (id === 2 ? 'Recria' : 'Crecimiento')),
                        foodConsumption: existing ? existing.foodConsumption : Math.floor(Math.random() * 500),
                        ventilationOn: existing ? existing.ventilationOn : false,
                        extractorOn: existing ? existing.extractorOn : false,
                        foodPricePerKg: 1.5,
                        weightPerPig: existing?.pigStage === 'Engorde' ? 105 : (existing?.pigStage === 'Recria' ? 70 : 30),
                        totalFoodPrice: (existing?.foodConsumption || 0) * 1.5,
                        totalMeatWeight: (existing?.pigCount || 0) * (existing?.pigStage === 'Engorde' ? 105 : 70),
                        siloCapacity: 10000,
                        siloLevel: 0,
                        feedType: 'Engorde'
                    };
                } else {
                    newData[id] = {
                        temperature: 20,
                        humidity: 40,
                        ammonia: 0,
                        fanSpeed: 0,
                        lastUpdated: new Date(),
                        pigCount: 0, pigAge: 0, pigStage: 'Inicio', foodConsumption: 0,
                        ventilationOn: false, extractorOn: false,
                        foodPricePerKg: 0, weightPerPig: 0, totalFoodPrice: 0, totalMeatWeight: 0,
                        siloCapacity: 20000,
                        siloLevel: existing ? existing.siloLevel - (Math.random() * 10) : 15000,
                        feedType: 'Crecimiento'
                    };
                }
            });
            setSensorData(newData);

            // --- THERMAL HEATMAP SIMULATION ---
            if (isThermalMode) {
                const thermalFeatures: any[] = [];
                geoJsonRef.current?.features.forEach((f: any) => {
                    if (f.properties.type === 'galpon') {
                        const coords = f.geometry.coordinates[0];
                        // Generate random points inside the galpon polygon for heatmap
                        for (let i = 0; i < 15; i++) {
                            const minLng = Math.min(...coords.map((c: any) => c[0]));
                            const maxLng = Math.max(...coords.map((c: any) => c[0]));
                            const minLat = Math.min(...coords.map((c: any) => c[1]));
                            const maxLat = Math.max(...coords.map((c: any) => c[1]));

                            thermalFeatures.push({
                                type: 'Feature',
                                properties: { intensity: Math.random() * 50 + 20 },
                                geometry: {
                                    type: 'Point',
                                    coordinates: [
                                        minLng + Math.random() * (maxLng - minLng),
                                        minLat + Math.random() * (maxLat - minLat)
                                    ]
                                }
                            });
                        }
                    }
                });
                const thermalFC = { type: 'FeatureCollection', features: thermalFeatures };
                thermalDataRef.current = thermalFC;
                if (map.current && map.current.getSource('thermal-source')) {
                    (map.current.getSource('thermal-source') as maplibregl.GeoJSONSource).setData(thermalFC as any);
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [geoJsonData, isThermalMode]); // Update loop if GeoJson or ThermalMode changes structure

    const toggleRain = () => {
        setEnvironment((prev: any) => ({ ...prev, isRaining: !prev.isRaining }));
    };

    const toggleMapStyle = () => {
        const newStyle = mapStyle === 'dark' ? 'streets' : 'dark';
        setMapStyle(newStyle);

        if (map.current) {
            if (newStyle === 'streets') {
                map.current.setLayoutProperty('base-layer-dark', 'visibility', 'none');
                map.current.setLayoutProperty('base-layer-streets', 'visibility', 'visible');
            } else {
                map.current.setLayoutProperty('base-layer-streets', 'visibility', 'none');
                map.current.setLayoutProperty('base-layer-dark', 'visibility', 'visible');
            }
        }
    };

    const handleTeleport = () => {
        if (map.current) {
            map.current.flyTo({
                center: [REDONDOS_PLANT_COORDS.lng, REDONDOS_PLANT_COORDS.lat],
                zoom: 15.5,
                pitch: 60,
                bearing: -20
            });
        }
    };

    // --- BIM ACTIONS (Moved to new implemention below) ---

    const deleteSelected = () => {
        if (selectedIds.size === 0) return;
        setGeoJsonData((prev: any) => ({
            ...prev,
            features: prev.features.filter((f: any) => !selectedIds.has(f.id))
        }));
        setSelectedIds(new Set());
    };

    const toggleControl = (id: string, type: 'ventilation' | 'extractor') => {
        setSensorData((prev: any) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [type === 'ventilation' ? 'ventilationOn' : 'extractorOn']: !prev[id][type === 'ventilation' ? 'ventilationOn' : 'extractorOn']
            }
        }));
    };

    const handleImportModel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && threeLayerRef.current) {
            // @ts-ignore
            if (threeLayerRef.current.loadModel) {
                // @ts-ignore
                threeLayerRef.current.loadModel(file);
            } else {
                alert("IFC Loader not ready yet. Check ThreeLayer.ts");
            }
        }
    };

    // --- DUPLICATION LOGIC ---
    const duplicateSelection = () => {
        if (selectedIds.size === 0 || !map.current) return;

        const newFeatures: any[] = [];
        const offsetLat = 0.0002; // Approx 20m
        const offsetLng = 0.0002;

        geoJsonData.features.forEach((feature: any) => {
            if (selectedIds.has(feature.id)) {
                const newId = Date.now() + Math.floor(Math.random() * 1000);
                const newCoords = feature.geometry.coordinates[0].map((coord: number[]) => [
                    coord[0] + offsetLng,
                    coord[1] - offsetLat // Offset South-East
                ]);

                newFeatures.push({
                    ...feature,
                    id: newId,
                    properties: { ...feature.properties, id: newId, name: `${feature.properties.name} (Copy)` },
                    geometry: { ...feature.geometry, coordinates: [newCoords] }
                });
            }
        });

        if (newFeatures.length > 0) {
            setGeoJsonData(prev => ({
                ...prev,
                features: [...prev.features, ...newFeatures]
            }));
            // Optional: Select the new copies
            const newIds = new Set(newFeatures.map(f => f.id));
            setSelectedIds(newIds);
            alert(`Duplicated ${newFeatures.length} items!`);
        }
    };

    // Update Source when State Changes
    useEffect(() => {
        geoJsonRef.current = geoJsonData;
        if (map.current) {
            if (map.current.getSource('galpones')) {
                (map.current.getSource('galpones') as maplibregl.GeoJSONSource).setData(geoJsonData);
            }
            if (map.current.getSource('biosecurity-zones')) {
                const redZonesData = {
                    type: 'FeatureCollection',
                    features: geoJsonData.features.filter((f: any) => f.properties.type === 'zona_roja')
                };
                (map.current.getSource('biosecurity-zones') as maplibregl.GeoJSONSource).setData(redZonesData as any);
                redZonesRef.current = redZonesData;
            }
            if (map.current.getSource('lagoons')) {
                const lagoonData = {
                    type: 'FeatureCollection',
                    features: geoJsonData.features.filter((f: any) => f.properties.type === 'laguna')
                };
                (map.current.getSource('lagoons') as maplibregl.GeoJSONSource).setData(lagoonData as any);
            }
            if (map.current.getSource('solar')) {
                const solarData = {
                    type: 'FeatureCollection',
                    features: geoJsonData.features.filter((f: any) => f.properties.type === 'solar')
                };
                (map.current.getSource('solar') as maplibregl.GeoJSONSource).setData(solarData as any);
            }
        }
    }, [geoJsonData]);

    // --- DRAG & DROP LOGIC ---
    useEffect(() => {
        if (!map.current) return;

        const onMouseDown = (e: any) => {
            if (!isBimMode) return;

            // Allow clicking specifically on editable layers
            const layers = ['galpones-extrusion', 'lagoons-fill', 'solar-fill', 'biosecurity-fill'];
            const features = map.current?.queryRenderedFeatures(e.point, { layers });

            if (features && features.length > 0) {
                e.preventDefault();
                map.current!.dragPan.disable();

                const feature = features[0];
                const clickedId = feature.id as number | string;

                // Determine which items to drag
                // If clicked item is part of selection, drag ALL selected items
                // If clicked item is NOT part of selection, just drag that one (or we could select it, but let's stick to drag logic)
                let dragIds = new Set<string | number>();
                if (clickedId !== undefined && selectedIdsRef.current.has(clickedId)) {
                    dragIds = new Set(selectedIdsRef.current);
                } else if (clickedId !== undefined) {
                    dragIds.add(clickedId);
                }

                // Capture original coordinates for ALL dragged items
                const coordsMap: Record<string | number, any> = {};
                geoJsonRef.current.features.forEach((f: any) => {
                    if (dragIds.has(f.id)) {
                        coordsMap[f.id] = JSON.parse(JSON.stringify(f.geometry.coordinates));
                    }
                });

                if (Object.keys(coordsMap).length > 0) {
                    dragState.current = {
                        isDragging: true,
                        startLngLat: e.lngLat,
                        originalCoordsMap: coordsMap
                    };
                }
            }
        };

        const onMouseMove = (e: any) => {
            if (!dragState.current.isDragging || !dragState.current.startLngLat || !dragState.current.originalCoordsMap || !map.current) return;

            const { startLngLat, originalCoordsMap } = dragState.current;
            const currentLngLat = e.lngLat;

            const deltaLng = currentLngLat.lng - startLngLat.lng;
            const deltaLat = currentLngLat.lat - startLngLat.lat;

            const newGeoJson = {
                ...geoJsonRef.current,
                features: geoJsonRef.current.features.map((f: any) => {
                    if (originalCoordsMap[f.id]) {
                        // Apply delta to cached original coords
                        return {
                            ...f,
                            geometry: {
                                ...f.geometry,
                                coordinates: originalCoordsMap[f.id].map((ring: any) =>
                                    ring.map((coord: any) => [coord[0] + deltaLng, coord[1] + deltaLat])
                                )
                            }
                        };
                    }
                    return f;
                })
            };

            // Fast Update (Unified Source update if possible, or per-source)
            // Ideally we just update the source that changed, but since we support multi-type selection, let's update all relevant sources
            const hasGalpon = newGeoJson.features.some((f: any) => originalCoordsMap[f.id] && f.properties.type === 'galpon');
            if (hasGalpon && map.current.getSource('galpones')) {
                (map.current.getSource('galpones') as maplibregl.GeoJSONSource).setData(newGeoJson);
            }

            const hasZone = newGeoJson.features.some((f: any) => originalCoordsMap[f.id] && f.properties.type === 'zona_roja');
            if (hasZone && map.current.getSource('biosecurity-zones')) {
                const redZonesData = { type: 'FeatureCollection', features: newGeoJson.features.filter((f: any) => f.properties.type === 'zona_roja') };
                (map.current.getSource('biosecurity-zones') as maplibregl.GeoJSONSource).setData(redZonesData as any);
                redZonesRef.current = redZonesData;
            }

            // Sync others... for simplicity we won't sync every single type in fast-mode unless necessary
            // But 'setGeoJsonData' will sync everything on mouseUp.
        };

        const onMouseUp = (e: any) => {
            if (dragState.current.isDragging) {
                const { startLngLat, originalCoordsMap } = dragState.current;

                // Final delta application
                const currentLngLat = e.lngLat;
                const deltaLng = currentLngLat.lng - startLngLat!.lng;
                const deltaLat = currentLngLat.lat - startLngLat!.lat;

                const newGeoJson = {
                    ...geoJsonRef.current,
                    features: geoJsonRef.current.features.map((f: any) => {
                        if (originalCoordsMap![f.id]) {
                            return {
                                ...f,
                                geometry: {
                                    ...f.geometry,
                                    coordinates: originalCoordsMap![f.id].map((ring: any) =>
                                        ring.map((coord: any) => [coord[0] + deltaLng, coord[1] + deltaLat])
                                    )
                                }
                            };
                        }
                        return f;
                    })
                };

                setGeoJsonData(newGeoJson);

                dragState.current = { isDragging: false, startLngLat: null, originalCoordsMap: null };
                map.current!.dragPan.enable();
            }
        };

        if (isBimMode) {
            map.current.on('mousedown', onMouseDown);
            map.current.on('mousemove', onMouseMove);
            map.current.on('mouseup', onMouseUp);
        } else {
            map.current.off('mousedown', onMouseDown);
            map.current.off('mousemove', onMouseMove);
            map.current.off('mouseup', onMouseUp);
        }

        return () => {
            if (map.current) {
                map.current.off('mousedown', onMouseDown);
                map.current.off('mousemove', onMouseMove);
                map.current.off('mouseup', onMouseUp);
            }
        };

    }, [isBimMode]);


    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    "osm": {
                        type: "raster",
                        tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        tileSize: 256,
                        attribution: "&copy; OpenStreetMap Contributors",
                    },
                    "carto-dark": {
                        type: 'raster',
                        tiles: [
                            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                            'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
                        ],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap &copy; CARTO'
                    }
                },
                layers: [
                    {
                        id: "base-layer-streets",
                        type: "raster",
                        source: "osm",
                        minzoom: 0,
                        maxzoom: 19,
                        layout: {
                            visibility: 'none'
                        }
                    },
                    {
                        id: "base-layer-dark",
                        type: "raster",
                        source: "carto-dark",
                        minzoom: 0,
                        maxzoom: 22,
                        layout: {
                            visibility: 'visible'
                        }
                    },
                ],
            },
            center: [REDONDOS_PLANT_COORDS.lng, REDONDOS_PLANT_COORDS.lat],
            zoom: zoom,
            pitch: pitch,
            boxZoom: false, // DISABLE BOX ZOOM TO FIX SHIFT+CLICK SELECTION
            dragRotate: true
        });

        map.current.on("load", () => {
            if (!map.current) return;

            // --- ADD THREE.JS LAYER ---
            if (!map.current.getLayer('3d-model')) {
                const threeLayer = new ThreeLayer(REDONDOS_PLANT_COORDS);
                map.current.addLayer(threeLayer as any); // Type casting for custom layer
                threeLayerRef.current = threeLayer;
            }

            map.current.addSource('galpones', {
                type: 'geojson',
                data: geoJsonData,
                promoteId: 'id'
            });

            // --- THERMAL HEATMAP SOURCE ---
            map.current.addSource('thermal-source', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            map.current.addLayer({
                id: 'thermal-heatmap',
                type: 'heatmap',
                source: 'thermal-source',
                maxzoom: 22,
                layout: {
                    visibility: isThermalMode ? 'visible' : 'none'
                },
                paint: {
                    'heatmap-weight': ['get', 'intensity'],
                    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 22, 3],
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(0,0,255,0)',
                        0.2, 'royalblue',
                        0.4, 'cyan',
                        0.6, 'lime',
                        0.8, 'yellow',
                        1, 'red'
                    ],
                    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 22, 40],
                    'heatmap-opacity': 0.8
                }
            });

            // --- TRUCK LOGISTICS ---
            const truckRoute = [
                [-77.6110, -11.1090],
                [-77.6110, -11.1130],
                [-77.6080, -11.1130],
                [-77.6080, -11.1090],
                [-77.6110, -11.1090]
            ];

            map.current.addSource('truck', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: { type: 'Point', coordinates: truckRoute[0] }
                }
            });

            map.current.addLayer({
                id: 'truck-glow',
                type: 'circle',
                source: 'truck',
                paint: {
                    'circle-radius': 12,
                    'circle-color': '#10b981',
                    'circle-opacity': 0.4,
                    'circle-blur': 1
                }
            });

            map.current.addLayer({
                id: 'truck-point',
                type: 'circle',
                source: 'truck',
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#ffffff',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#10b981'
                }
            });

            let step = 0;
            const animateTruck = () => {
                if (!map.current) return;
                const pointCount = truckRoute.length;
                const pathIndex = Math.floor(step) % (pointCount - 1);
                const fraction = step % 1;

                const start = truckRoute[pathIndex];
                const end = truckRoute[pathIndex + 1];

                const lng = start[0] + (end[0] - start[0]) * fraction;
                const lat = start[1] + (end[1] - start[1]) * fraction;

                // Breach detection is now handled in a unified useEffect below for better stability

                // Share coords for unified check
                window._lastTruckCoords = [lng, lat];

                const source = map.current.getSource('truck') as maplibregl.GeoJSONSource;
                if (source) {
                    source.setData({
                        type: 'Feature',
                        properties: { name: 'TRUCK-01', status: 'In Transit' },
                        geometry: { type: 'Point', coordinates: [lng, lat] }
                    });
                }

                step += 0.005;
                requestAnimationFrame(animateTruck);
            };

            animateTruck();

            map.current.addLayer({
                'id': 'galpones-extrusion',
                'type': 'fill-extrusion',
                'source': 'galpones',
                'paint': {
                    'fill-extrusion-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        '#6366f1',
                        ['get', 'color']
                    ],
                    'fill-extrusion-height': ['get', 'height'],
                    'fill-extrusion-base': 0,
                    'fill-extrusion-opacity': 0.85
                }
            });

            // Selection Glow Layer (Base)
            map.current.addLayer({
                'id': 'galpones-selection-glow',
                'type': 'fill',
                'source': 'galpones',
                'paint': {
                    'fill-color': '#4f46e5',
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        0.8,
                        0
                    ]
                }
            }, 'galpones-extrusion'); // Render below extrusion

            // --- LAGOON LAYERS ---
            map.current.addSource('lagoons', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: geoJsonData.features.filter((f: any) => f.properties.type === 'laguna')
                }
            });

            map.current.addLayer({
                id: 'lagoons-fill',
                type: 'fill',
                source: 'lagoons',
                paint: {
                    'fill-color': '#3498db',
                    'fill-opacity': 0.6,
                    'fill-outline-color': '#2980b9'
                }
            });

            // --- SOLAR ARRAYS ---
            map.current.addSource('solar', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: geoJsonData.features.filter((f: any) => f.properties.type === 'solar')
                }
            });

            map.current.addLayer({
                id: 'solar-fill',
                type: 'fill',
                source: 'solar',
                paint: {
                    'fill-color': '#f1c40f',
                    'fill-opacity': 0.8,
                    'fill-outline-color': '#f39c12'
                }
            });

            // --- BIOSECURITY RED ZONES ---
            map.current.addSource('biosecurity-zones', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: geoJsonData.features.filter((f: any) => f.properties.type === 'zona_roja')
                }
            });

            map.current.addLayer({
                id: 'biosecurity-fill',
                type: 'fill',
                source: 'biosecurity-zones',
                paint: {
                    'fill-color': '#ef4444',
                    'fill-opacity': 0.3,
                    'fill-outline-color': '#ef4444'
                }
            });

            // --- PERSONNEL TRACKING ---
            const personnelData = {
                type: 'FeatureCollection',
                features: [
                    { id: 1, type: 'Feature', properties: { name: 'Juan P. (Operario)', zone: 'Safe' }, geometry: { type: 'Point', coordinates: [-77.6120, -11.1100] } },
                    { id: 2, type: 'Feature', properties: { name: 'Maria L. (Vet)', zone: 'Buffer' }, geometry: { type: 'Point', coordinates: [-77.6090, -11.1120] } }
                ]
            };

            map.current.addSource('personnel', {
                type: 'geojson',
                data: personnelData as any
            });

            map.current.addLayer({
                id: 'personnel-layer',
                type: 'circle',
                source: 'personnel',
                paint: {
                    'circle-radius': 8,
                    'circle-color': '#3b82f6',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });

            // Person tracking simulation
            const animatePersonnel = () => {
                if (!map.current) return;
                const source = map.current.getSource('personnel') as maplibregl.GeoJSONSource;
                if (source) {
                    const time = Date.now() / 1000;
                    let personInRedZone = false;
                    const features = personnelData.features.map(f => {
                        const offset = f.id === 1 ? 0 : 5;
                        const newCoords = [
                            f.geometry.coordinates[0] + Math.sin(time + offset) * 0.0001,
                            f.geometry.coordinates[1] + Math.cos(time + offset) * 0.0001
                        ];

                        redZonesRef.current.features.forEach((zone: any) => {
                            if (isPointInPolygon(newCoords, zone.geometry.coordinates)) {
                                personInRedZone = true;
                            }
                        });

                        return {
                            ...f,
                            geometry: {
                                type: 'Point',
                                coordinates: newCoords
                            }
                        };
                    });

                    // Breach detection is now handled in a unified useEffect or directly in the animation loops but with better coordination
                    // We'll use a local variable to communicate with the UI state safely
                    window._lastPersonnelCoords = features.map(f => f.geometry.coordinates);

                    if (personInRedZone) {
                        if (!breachAlertRef.current.active) setBreachAlert({ active: true, msg: "ALERT: PERSONNEL DETECTED IN RED ZONE!" });
                    } else if (breachAlertRef.current.msg.includes("PERSONNEL")) {
                        setBreachAlert({ active: false, msg: "" });
                    }

                    source.setData({ type: 'FeatureCollection', features } as any);
                }
                requestAnimationFrame(animatePersonnel);
            };

            animatePersonnel();

            // Unified Click Interaction
            map.current.on('click', (e) => {
                // Prevent map click if we are clicking UI overlays (unlikely here but good practice)

                const features = map.current?.queryRenderedFeatures(e.point, { layers: ['galpones-extrusion', 'lagoons-fill', 'solar-fill'] }); // Added other layers

                if (isBimMode) {
                    // BIM PLACEMENT COLLISION DETECTION
                    if (isPointInPolygon([e.lngLat.lng, e.lngLat.lat], redZonesRef.current.features[0].geometry.coordinates as any)) {
                        setBreachAlert({ active: true, msg: "DENIED: CANNOT PLACE BIM OBJECTS IN RED ZONE!" });
                        setTimeout(() => setBreachAlert({ active: false, msg: "" }), 3000);
                        return;
                    }
                }

                if (features && features.length > 0) {
                    const feature = features[0];
                    const id = feature.id as number;

                    if (id !== undefined && id !== null) {
                        const isShiftHeld = e.originalEvent.shiftKey;

                        let newSet: Set<string | number>;

                        if (isShiftHeld) {
                            // ADDITIVE / TOGGLE
                            newSet = new Set(selectedIdsRef.current);
                            if (newSet.has(id)) {
                                newSet.delete(id);
                            } else {
                                newSet.add(id);
                            }
                        } else {
                            // REPLACE SELECTION (Standard behavior)
                            // If it's already selected and we are NOT holding shift, we usually just keep it selected
                            // unless we want to deselect others. 
                            newSet = new Set([id]);
                        }

                        if (feature.properties?.name) {
                            setLastSelectedName(feature.properties.name);
                        }

                        setSelectedIds(newSet);
                        selectedIdsRef.current = newSet;
                    }
                } else {
                    // Clicked on background
                    if (!e.originalEvent.shiftKey) {
                        setSelectedIds(new Set());
                        selectedIdsRef.current = new Set();
                    }
                }
            });

            // Change cursor on hover
            map.current.on('mouseenter', 'galpones-extrusion', () => {
                if (map.current) map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'galpones-extrusion', () => {
                if (map.current) map.current.getCanvas().style.cursor = '';
            });
        });

        // The cleanup function for the map initialization effect
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []); // Run only once



    // Trigger map resize when switching back to Overview to fix black screen/canvas issues
    useEffect(() => {
        if (activeSection === 'overview' && map.current) {
            setTimeout(() => {
                map.current?.resize();
            }, 100);
        }
    }, [activeSection]);

    // Update visual selection state on the map using Feature State
    useEffect(() => {
        if (!map.current) return;

        if (map.current.isStyleLoaded()) {
            // Clear previous states (cheap for small datasets)
            geoJsonRef.current?.features.forEach((f: any) => {
                map.current?.setFeatureState(
                    { source: 'galpones', id: f.id },
                    { selected: false }
                );
            });

            // Set new selected states
            selectedIds.forEach(id => {
                map.current?.setFeatureState(
                    { source: 'galpones', id: id },
                    { selected: true }
                );
            });
        }
    }, [selectedIds]);

    // --- UNIFIED BREACH DETECTION ENGINE ---
    useEffect(() => {
        const checkInterval = setInterval(() => {
            if (!map.current) return;

            let currentBreach: string | null = null;

            // 1. Check Personnel (using window._lastPersonnelCoords if available)
            if (window._lastPersonnelCoords) {
                window._lastPersonnelCoords.forEach((coords: any) => {
                    redZonesRef.current.features.forEach((zone: any) => {
                        if (isPointInPolygon(coords, zone.geometry.coordinates)) {
                            currentBreach = "ALERT: PERSONNEL DETECTED IN RED ZONE!";
                        }
                    });
                });
            }

            // 2. Check Truck (if not already breached by person)
            if (!currentBreach) {
                // Get current truck coords from Map source if possible, 
                // but let's just stick to the animation internal state for now.
                // For simplicity, we'll re-implement the truck path check here too
                // or use a shared variable like we did for personnel.
                if (window._lastTruckCoords) {
                    redZonesRef.current.features.forEach((zone: any) => {
                        if (isPointInPolygon(window._lastTruckCoords, zone.geometry.coordinates)) {
                            currentBreach = "CRITICAL: TRUCK-01 UNER IN RESTRICTED RED ZONE!";
                        }
                    });
                }
            }

            // Sync with state
            if (currentBreach) {
                if (!breachAlert.active || breachAlert.msg !== currentBreach) {
                    setBreachAlert({ active: true, msg: currentBreach });
                }
            } else if (breachAlert.active) {
                setBreachAlert({ active: false, msg: "" });
            }
        }, 500); // Check every 500ms for stability
        return () => clearInterval(checkInterval);
    }, [breachAlert]);

    // --- WELFARE MODE VISUAL ENGINE ---
    useEffect(() => {
        if (!map.current) return;

        const updateWelfareColors = () => {
            if (!map.current || !map.current.getLayer('galpones-extrusion')) return;
            if (isWelfareMode) {
                map.current.setPaintProperty('galpones-extrusion', 'fill-extrusion-color', [
                    'case',
                    ['==', ['get', 'type'], 'galpon'], // Only apply welfare colors to actual Galpones
                    [
                        'interpolate',
                        ['linear'],
                        ['get', 'id'],
                        1, '#10b981', // Galpón 1: Verde (Feliz)
                        2, '#f59e0b', // Galpón 2: Naranja (Estrés)
                        6, '#10b981'  // Galpón 6: Verde (Feliz)
                    ],
                    // For everything else (silos, factories, ptar), keep original color
                    ['get', 'color']
                ]);
            } else {
                map.current.setPaintProperty('galpones-extrusion', 'fill-extrusion-color', [
                    'case',
                    ['boolean', ['feature-state', 'selected'], false],
                    '#6366f1',
                    ['get', 'color']
                ]);
            }
        };

        if (map.current.isStyleLoaded()) {
            updateWelfareColors();
        } else {
            map.current.once('styledata', updateWelfareColors);
        }
    }, [isWelfareMode]);

    // TOOL EFFECT (measure/incident)
    useEffect(() => {
        if (!map.current) return;

        const onIncidentClick = (e: any) => {
            if (activeTool === 'incident') {
                const newIncident: Incident = {
                    id: Date.now(),
                    lat: e.lngLat.lat,
                    lng: e.lngLat.lng,
                    type: 'Warning',
                    description: 'Incident Reported',
                    timestamp: new Date()
                };
                setIncidents(prev => [...prev, newIncident]);
                setActiveTool('none');

                new maplibregl.Marker({ color: 'orange' })
                    .setLngLat([e.lngLat.lng, e.lngLat.lat])
                    .setPopup(new maplibregl.Popup().setText('Incident Reported'))
                    .addTo(map.current!);
            }
        };

        map.current.on('click', onIncidentClick);

        return () => {
            map.current?.off('click', onIncidentClick);
        };
    }, [activeTool]);

    return (
        <div className="flex h-screen bg-black overflow-hidden font-sans">
            {/* Modular Sidebar */}
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

            <main className="flex-1 relative overflow-hidden flex flex-col">
                <div className={`relative w-full h-full ${className} ${activeSection !== 'overview' ? 'hidden' : ''}`}>
                    <div ref={mapContainer} className="w-full h-full" />

                    {/* --- BREACH ALERT OVERLAY --- */}
                    {breachAlert.active && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[100]">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.1, opacity: 1 }}
                                transition={{ repeat: Infinity, duration: 0.5, repeatType: 'reverse' }}
                                className="bg-red-600/20 border-4 border-red-500 p-8 rounded-full backdrop-blur-xl flex flex-col items-center justify-center text-center shadow-[0_0_100px_rgba(239,68,68,0.5)]"
                            >
                                <span className="text-6xl mb-2">🚨</span>
                                <h2 className="text-3xl font-black text-white drop-shadow-lg">BREACH DETECTED</h2>
                                <p className="text-red-100 font-bold uppercase tracking-widest">{breachAlert.msg}</p>
                            </motion.div>
                        </div>
                    )}

                    {/* --- HUD: ENVIRONMENT --- */}
                    <div className="absolute top-4 right-4 bg-slate-900/90 p-4 rounded-lg border border-slate-700 text-white shadow-xl backdrop-blur-md">
                        <h3 className="font-bold text-xs text-blue-400 mb-2 tracking-wider">ENVIRONMENT CONTROL</h3>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-sm">
                                <span>Time:</span>
                                <span className="font-mono text-yellow-400">{environment.time}:00 Hrs</span>
                            </div>
                            <input
                                type="range" min="0" max="24"
                                value={environment.time}
                                onChange={(e) => setEnvironment({ ...environment, time: parseInt(e.target.value) })}
                                className="w-32 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                            />
                            <button
                                onClick={toggleRain}
                                className={`mt-2 px-3 py-1 rounded text-xs font-bold transition-all ${environment.isRaining ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                            >
                                {environment.isRaining ? 'RAIN: ON' : 'RAIN: OFF'}
                            </button>
                            <button
                                onClick={toggleMapStyle}
                                className={`mt-1 px-3 py-1 rounded text-xs font-bold transition-all ${mapStyle === 'dark' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'}`}
                            >
                                {mapStyle === 'dark' ? 'SWITCH TO STREETS' : 'SWITCH TO DARK'}
                            </button>
                        </div>
                    </div>

                    {/* --- HUD: SENSOR DATA (Live) --- */}
                    <div className="absolute top-4 left-4 bg-slate-900/90 p-4 rounded-lg border border-slate-700 text-white shadow-xl backdrop-blur-md w-64 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${selectedIds.size > 0 ? 'bg-indigo-500' : 'bg-green-500'}`}></div>
                            <div className="flex-1 flex justify-between items-center">
                                <span className="font-bold text-sm tracking-wider uppercase">
                                    {selectedIds.size === 0 ? 'PLANT OVERVIEW' : (selectedIds.size === 1 ? lastSelectedName : `SELECTED (${selectedIds.size})`)}
                                </span>
                                {selectedIds.size > 0 && (
                                    <span className="text-[9px] text-slate-500 font-mono">ID: {String(Array.from(selectedIds)[0]).substring(0, 8)}</span>
                                )}
                            </div>
                        </div>

                        {selectedIds.size > 0 ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-left-4">
                                {/* AGGREGATE CALCULATIONS */}
                                {(() => {
                                    // Calculate aggregates
                                    let totalPigs = 0;
                                    let totalFood = 0;
                                    let avgTemp = 0;
                                    const count = selectedIds.size;

                                    selectedIds.forEach(id => {
                                        if (sensorData[id]) {
                                            totalPigs += sensorData[id].pigCount;
                                            totalFood += sensorData[id].foodConsumption;
                                            avgTemp += sensorData[id].temperature;
                                        }
                                    });
                                    avgTemp = avgTemp / count;

                                    return (
                                        <>
                                            {/* --- AGGREGATE METRICS --- */}
                                            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-700">
                                                <div className="bg-slate-800 p-2 rounded text-center">
                                                    <span className="block text-[10px] text-slate-400">TOTAL PIGS</span>
                                                    <span className="text-xl font-mono text-pink-400 font-bold">{totalPigs}</span>
                                                </div>
                                                <div className="bg-slate-800 p-2 rounded text-center">
                                                    <span className="block text-[10px] text-slate-400">TOTAL FOOD</span>
                                                    <span className="text-xl font-mono text-yellow-400 font-bold">{totalFood} <span className="text-xs">kg</span></span>
                                                </div>
                                            </div>

                                            {/* SHOW INDIVIDUAL DETAILS ONLY IF 1 SELECTED */}
                                            {selectedIds.size === 1 && Array.from(selectedIds).map(id => {
                                                const isSilo = String(id).startsWith('silo') || (sensorData[id] && 'siloCapacity' in sensorData[id] && sensorData[id].siloCapacity > 15000);
                                                const data = sensorData[id];

                                                if (!data) {
                                                    return (
                                                        <div key={id} className="py-8 text-center animate-pulse">
                                                            <div className="text-indigo-400 text-xs mb-1">CONNECTING TO SENSORS...</div>
                                                            <div className="text-[10px] text-slate-500 italic">Waiting for data stream for {id}</div>
                                                        </div>
                                                    );
                                                }

                                                if (isSilo) {
                                                    const missing = data.siloCapacity - data.siloLevel;
                                                    const percent = (data.siloLevel / data.siloCapacity) * 100;
                                                    // Mock consumption rate of 500kg/day for calculation
                                                    const daysRemaining = (data.siloLevel / 500).toFixed(1);

                                                    return (
                                                        <div key={id} className="mt-2">
                                                            <div className="flex justify-between items-center group mb-2">
                                                                <span className="text-slate-400 text-xs">FEED TYPE</span>
                                                                <span className="text-sm font-bold text-yellow-400 uppercase tracking-widest">{data.feedType}</span>
                                                            </div>

                                                            {/* LEVEL BAR */}
                                                            <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-600 mb-1">
                                                                <div className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md">
                                                                    {(data.siloLevel / 1000).toFixed(1)}k / {(data.siloCapacity / 1000).toFixed(1)}k kg
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                                <div className="text-center bg-slate-800/50 rounded p-1">
                                                                    <span className="block text-[10px] text-slate-500">MISSING</span>
                                                                    <span className="font-mono text-xs text-red-300">{(missing / 1000).toFixed(1)}k kg</span>
                                                                </div>
                                                                <div className="text-center bg-slate-800/50 rounded p-1">
                                                                    <span className="block text-[10px] text-slate-500">DAYS LEFT</span>
                                                                    <span className="font-mono text-xs text-white">{daysRemaining} d</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // DEFAULT GALPON VIEW (Tabbed)
                                                return (
                                                    <div key={id} className="mt-2 text-white">
                                                        {/* Tab Switcher */}
                                                        <div className="flex border-b border-slate-800 mb-4 bg-slate-800/50 rounded-t overflow-hidden">
                                                            <button
                                                                onClick={() => setActiveHudTab('operations')}
                                                                className={`flex-1 py-1.5 text-[10px] font-bold tracking-tighter transition-all ${activeHudTab === 'operations' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                                                            >
                                                                OPERACIONES
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveHudTab('management')}
                                                                className={`flex-1 py-1.5 text-[10px] font-bold tracking-tighter transition-all ${activeHudTab === 'management' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                                                            >
                                                                GESTIÓN
                                                            </button>
                                                        </div>

                                                        {activeHudTab === 'operations' ? (
                                                            /* --- OPERATIONS PANEL --- */
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                                                {/* Telemetry Grid */}
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div className="bg-slate-800/80 p-2 rounded border border-slate-700 text-center">
                                                                        <span className="block text-[9px] text-slate-500 uppercase">Temp</span>
                                                                        <span className="text-sm font-mono text-blue-400">{data.temperature.toFixed(1)}°</span>
                                                                    </div>
                                                                    <div className="bg-slate-800/80 p-2 rounded border border-slate-700 text-center">
                                                                        <span className="block text-[9px] text-slate-500 uppercase">Humid</span>
                                                                        <span className="text-sm font-mono text-cyan-400">{data.humidity.toFixed(0)}%</span>
                                                                    </div>
                                                                    <div className="bg-slate-800/80 p-2 rounded border border-slate-700 text-center">
                                                                        <span className="block text-[9px] text-slate-500 uppercase">NH3</span>
                                                                        <span className="text-sm font-mono text-yellow-500">{data.ammonia.toFixed(1)}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-pink-900/10 border border-pink-500/20 p-3 rounded-lg text-center backdrop-blur-sm">
                                                                    <span className="text-[10px] text-pink-400 font-bold tracking-widest block mb-1">PESO TOTAL CARNE</span>
                                                                    <span className="text-2xl font-mono text-white font-black">{data.totalMeatWeight.toLocaleString()} <span className="text-xs">kg</span></span>
                                                                </div>

                                                                {/* Main Controls */}
                                                                <div className="space-y-2 pt-2">
                                                                    <button
                                                                        onClick={() => toggleControl(id.toString(), 'ventilation')}
                                                                        className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-between px-4 ${data.ventilationOn ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
                                                                    >
                                                                        <span>VENTILADOR</span>
                                                                        <span className="text-[10px]">{data.ventilationOn ? 'ENCENDIDO 🟢' : 'APAGADO'}</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => toggleControl(id.toString(), 'extractor')}
                                                                        className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-between px-4 ${data.extractorOn ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
                                                                    >
                                                                        <span>EXTRACTOR</span>
                                                                        <span className="text-[10px]">{data.extractorOn ? 'ENCENDIDO 🟢' : 'APAGADO'}</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* --- MANAGEMENT PANEL --- */
                                                            <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                                                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg">
                                                                    <span className="text-[10px] text-emerald-400 font-bold block mb-1">FINANZAS: COSTO ALIMENTO</span>
                                                                    <div className="flex justify-between items-end">
                                                                        <span className="text-2xl font-bold text-white font-mono">S/ {data.totalFoodPrice.toLocaleString()}</span>
                                                                        <span className="text-[10px] text-slate-500">F.C.I: {(data.foodConsumption / (data.pigCount || 1)).toFixed(2)}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="bg-slate-800/50 p-2 rounded">
                                                                        <span className="block text-[9px] text-slate-500">PIG COUNT</span>
                                                                        <span className="text-lg font-bold text-white">{data.pigCount}</span>
                                                                    </div>
                                                                    <div className="bg-slate-800/50 p-2 rounded">
                                                                        <span className="block text-[9px] text-slate-500">AGE (WEEKS)</span>
                                                                        <span className="text-lg font-bold text-white">{data.pigAge}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="p-2 border border-slate-700 rounded bg-slate-800/20">
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <span className="text-slate-400">Estado Prod:</span>
                                                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold uppercase">{data.pigStage}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-xs mt-2">
                                                                        <span className="text-slate-400">Consumo Hoy:</span>
                                                                        <span className="font-mono">{data.foodConsumption} <span className="text-[10px]">kg</span></span>
                                                                    </div>
                                                                </div>

                                                                <button className="w-full mt-2 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded font-bold text-[10px] transition-all">
                                                                    DESCARGAR REPORTE SAP
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                            {count > 1 && (
                                                <div className="mt-2 text-center text-xs text-slate-400 italic">
                                                    Multiple units selected.
                                                    <br />
                                                    Detailed controls disabled in summary view.
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (
                            // GENERAL / AVERAGE VIEW
                            <div className="space-y-3 opacity-50">
                                <p className="text-xs text-center italic">Select Galpon(s) to view stats.</p>
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-400 text-xs">AVG TEMP</span>
                                    <span className="text-xl font-mono">24.0 C</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- HUD: TOOLS --- */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 bg-slate-900/90 p-2 rounded-full border border-slate-600 shadow-2xl">
                        <button
                            className={`p-3 rounded-full hover:bg-slate-700 transition-colors ${activeTool === 'measure' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
                            onClick={() => setActiveTool(activeTool === 'measure' ? 'none' : 'measure')}
                            title="Measure Distance"
                        >
                            RULER
                        </button>
                        <button
                            className={`p-3 rounded-full hover:bg-slate-700 transition-colors ${activeTool === 'incident' ? 'bg-red-600 text-white' : 'text-slate-300'}`}
                            onClick={() => setActiveTool(activeTool === 'incident' ? 'none' : 'incident')}
                            title="Report Incident"
                        >
                            REPORT
                        </button>
                        <button
                            className={`p-3 rounded-full hover:bg-slate-700 transition-colors ${isThermalMode ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]' : 'text-slate-300'}`}
                            onClick={() => {
                                const next = !isThermalMode;
                                setIsThermalMode(next);
                                if (map.current) {
                                    map.current.setLayoutProperty('thermal-heatmap', 'visibility', next ? 'visible' : 'none');
                                    if (next) setIsWelfareMode(false); // Mutual exclusion for clarity
                                }
                            }}
                            title="Toggle Thermal Heatmap"
                        >
                            THERMAL
                        </button>
                        <button
                            className={`p-3 rounded-full hover:bg-slate-700 transition-colors ${isWelfareMode ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'text-slate-300'}`}
                            onClick={() => {
                                const next = !isWelfareMode;
                                setIsWelfareMode(next);
                                if (map.current) {
                                    if (next) setIsThermalMode(false);
                                }
                            }}
                            title="Toggle Welfare Stress Vision"
                        >
                            WELFARE
                        </button>
                        <button
                            className={`p-3 rounded-full hover:bg-slate-700 transition-colors ${isBimMode ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'text-slate-300'}`}
                            onClick={() => setIsBimMode(!isBimMode)}
                            title="BIM Editor Mode"
                        >
                            BIM EDIT
                        </button>
                    </div>

                    {/* --- BIM TOOLKIT --- */}
                    {isBimMode && (
                        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-900/95 p-4 rounded-xl border border-indigo-500 shadow-2xl flex gap-4 animate-in slide-in-from-bottom duration-300">
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-indigo-400 font-bold mb-2 tracking-widest">ADD ASSETS</span>
                                <div className="flex gap-2">
                                    <button onClick={addGalpon} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded border border-slate-600 flex flex-col items-center gap-1 w-20">
                                        <div className="w-8 h-4 bg-red-500 rounded-sm"></div>
                                        <span className="text-[10px]">GALPON</span>
                                    </button>
                                    <button onClick={addSilo} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded border border-slate-600 flex flex-col items-center gap-1 w-20">
                                        <div className="w-4 h-6 bg-yellow-500 rounded-sm"></div>
                                        <span className="text-[10px]">SILO</span>
                                    </button>
                                    <button onClick={addLaguna} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded border border-slate-600 flex flex-col items-center gap-1 w-20">
                                        <div className="w-6 h-4 bg-blue-500 rounded-sm"></div>
                                        <span className="text-[10px]">LAGUNA</span>
                                    </button>
                                    <button onClick={addZona} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded border border-slate-600 flex flex-col items-center gap-1 w-20">
                                        <div className="w-6 h-6 border-2 border-red-500 rounded-full"></div>
                                        <span className="text-[10px]">ZONA</span>
                                    </button>
                                    <button onClick={addEdificio} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded border border-slate-600 flex flex-col items-center gap-1 w-20">
                                        <div className="flex gap-0.5 items-end justify-center h-6">
                                            <div className="w-2 h-4 bg-slate-400 rounded-sm"></div>
                                            <div className="w-2 h-6 bg-slate-300 rounded-sm"></div>
                                        </div>
                                        <span className="text-[10px]">EDIFICIO</span>
                                    </button>
                                    <button onClick={addPlanta} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded border border-slate-600 flex flex-col items-center gap-1 w-20">
                                        <div className="flex gap-1 items-end justify-center h-6">
                                            <div className="w-4 h-3 bg-slate-500 rounded-sm"></div>
                                            <div className="w-2 h-6 bg-slate-400 rounded-sm"></div>
                                        </div>
                                        <span className="text-[10px]">PLANTA</span>
                                    </button>
                                    <button onClick={addSiloGigante} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded border border-slate-600 flex flex-col items-center gap-1 w-20">
                                        <div className="w-6 h-6 bg-purple-600 rounded-md border border-purple-400"></div>
                                        <span className="text-[10px]">SILO G.</span>
                                    </button>
                                    <button onClick={addPTAR} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded border border-slate-600 flex flex-col items-center gap-1 w-20">
                                        <div className="flex gap-1 items-end justify-center h-6">
                                            <div className="w-6 h-3 bg-teal-400 rounded-sm border-t-2 border-teal-200"></div>
                                            <div className="w-3 h-3 bg-teal-700 rounded-full"></div>
                                        </div>
                                        <span className="text-[10px]">PTAR</span>
                                    </button>
                                    <div className="w-px bg-slate-700 mx-2"></div>
                                    {/* BIM TOOLS */}
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => {
                                                if (isBimMode) {
                                                    setIsBimMode(false);
                                                } else {
                                                    // Warning check before entering BIM mode if target is in red zone? 
                                                    // Actually, BIM placement happens on map click in BIM mode.
                                                    setIsBimMode(true);
                                                }
                                            }}
                                            className={`p-2 rounded border transition-all flex flex-col items-center gap-1 w-20 ${isBimMode ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 hover:bg-slate-700 text-indigo-400 border-indigo-900/50'}`}
                                        >
                                            <span className="text-xl">🏗️</span>
                                            <span className="text-[10px]">{isBimMode ? 'QUIT BIM' : 'BIM MODE'}</span>
                                        </button>

                                        {/* SAVE TOOL */}
                                        <button
                                            onClick={saveMapData}
                                            disabled={isSaving}
                                            className={`p-2 rounded border transition-all flex flex-col items-center gap-1 w-20 ${isSaving ? 'bg-emerald-800' : 'bg-emerald-900/50 hover:bg-emerald-800'} text-emerald-400 border-emerald-900`}
                                        >
                                            <span className="text-xl">💾</span>
                                            <span className="text-[10px]">{isSaving ? 'SAVING...' : 'SAVE DATA'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImportModel}
                                        accept=".ifc,.glb,.gltf"
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- SELECTION INFO --- */}
                    {selectedIds.size > 0 && (
                        <div className="absolute bottom-4 left-4 bg-white/90 p-4 rounded-lg shadow-lg text-slate-900 w-64 animate-in slide-in-from-left duration-200">
                            <h4 className="font-bold text-lg border-b border-slate-200 pb-1 mb-2">
                                {selectedIds.size === 1 ? lastSelectedName : `${selectedIds.size} Units Selected`}
                            </h4>

                            <p className="text-xs text-slate-500 mb-2">
                                {Array.from(selectedIds).join(', ')}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                <div className="bg-slate-100 p-1 rounded">
                                    <span className="block text-slate-400">Status</span>
                                    <span className="font-bold text-green-600">Active</span>
                                </div>
                                <div className="bg-slate-100 p-1 rounded">
                                    <span className="block text-slate-400">Data Feed</span>
                                    <span className="font-bold text-blue-600">Synced</span>
                                </div>
                            </div>

                            {isBimMode && (
                                <div className="flex gap-1 mt-2">
                                    <button
                                        onClick={duplicateSelection}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 rounded text-xs transition-colors flex items-center justify-center gap-1"
                                    >
                                        <span>📑 DUPLICATE</span>
                                    </button>
                                    <button
                                        onClick={deleteSelected}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 rounded text-xs transition-colors flex items-center justify-center gap-1"
                                    >
                                        <span>🗑️ DELETE</span>
                                    </button>
                                </div>
                            )}

                            <button onClick={() => setSelectedIds(new Set())} className="w-full mt-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1 rounded text-xs">
                                CLEAR SELECTION
                            </button>
                        </div>
                    )}

                    {/* --- TELEPORT BUTTON --- */}
                    <div className="absolute top-4 right-[250px]">
                        <button onClick={handleTeleport} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-lg flex items-center gap-2 border-2 border-white">
                            TELEPORT TO PLANT
                        </button>
                    </div>

                </div>

                {activeSection === 'management' && <GestorDashboard />}
                {activeSection === 'climate' && <ClimateDashboard />}
                {activeSection === 'feeding' && <FeedingDashboard />}
                {activeSection === 'biosecurity' && <BiosecurityDashboard activeBreach={breachAlert.active ? breachAlert.msg : undefined} />}
                {activeSection === 'predictive' && <PredictiveDashboard />}
                {activeSection === 'welfare' && <WelfareDashboard />}
                {activeSection === 'sync' && <MobileSync />}
                {activeSection === 'resources' && <ResourceDashboard />}

                {/* PLACEHOLDERS FOR OTHER SECTIONS */}
                {activeSection === 'logistics' && (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-20 text-center">
                        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse border border-indigo-500/50 text-indigo-400">
                            🚧
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">MÓDULO EN DESARROLLO</h2>
                        <p className="text-slate-500 max-w-sm">Estamos integrando la telemetría avanzada para {activeSection}. Disponible en la siguiente actualización.</p>
                    </div>
                )}
            </main>
        </div>
    );
};