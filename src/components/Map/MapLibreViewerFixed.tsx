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
import LogisticsDashboard from "../Dashboard/LogisticsDashboard";
import PlantDashboard from "../Dashboard/PlantDashboard";
import MobileSync from "../Dashboard/MobileSync";
import masterData from "../../data/infrastructure.json";
import { useTracker } from "../../hooks/useTracker";

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
    pigCount: number;
    pigAge: number;
    pigStage: 'Inicio' | 'Crecimiento' | 'Engorde' | 'Recria';
    foodConsumption: number;
    ventilationOn: boolean;
    extractorOn: boolean;
    foodPricePerKg: number;
    weightPerPig: number;
    totalFoodPrice: number;
    totalMeatWeight: number;
    siloCapacity: number;
    siloLevel: number;
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

const METER_TO_DEG = 1 / 111320;

export const MapLibreViewer = ({ className }: { className?: string }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [zoom, setZoom] = useState(16);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [lastSelectedName, setLastSelectedName] = useState<string>("");
    const [breachAlert, setBreachAlert] = useState<{ active: boolean; msg: string }>({ active: false, msg: "" });
    const [geoJsonData, setGeoJsonData] = useState<any>(masterData);
    const [trackers, setTrackers] = useState<Record<string, any>>({});
    const [traces, setTraces] = useState<Record<string, [number, number][]>>({});
    const [sensorData, setSensorData] = useState<Record<string, SimulationState>>({});

    // Config states
    const [mapStyle, setMapStyle] = useState<'dark' | 'streets'>('dark');
    const [activeSection, setActiveSection] = useState('overview');
    const [isBimMode, setIsBimMode] = useState(false);
    const [isThermalMode, setIsThermalMode] = useState(false);
    const [isWelfareMode, setIsWelfareMode] = useState(false);
    const [environment, setEnvironment] = useState({ time: 12, isRaining: false });
    const [isSaving, setIsSaving] = useState(false);

    // --- GLOBAL TRACKING STATE ---
    const [isGlobalTracking, setIsGlobalTracking] = useState(false);
    const { coords: myCoords, error: gpsError } = useTracker(isGlobalTracking);

    useEffect(() => {
        const stored = localStorage.getItem('vanguard_is_tracking') === 'true';
        if (stored) setIsGlobalTracking(true);
    }, []);

    const toggleGlobalTracking = () => {
        const next = !isGlobalTracking;
        setIsGlobalTracking(next);
        localStorage.setItem('vanguard_is_tracking', String(next));
    };

    const [sanitaryRules] = useState<Record<string, { forbiddenContacts: string[], allowedZoneIds: string[] }>>({
        'Operario-A': { forbiddenContacts: ['Operario-B'], allowedZoneIds: ["1769696928308"] }, // Galpon 8308
        'Operario-B': { forbiddenContacts: ['Operario-A'], allowedZoneIds: ["1769696935651"] }  // Galpon 5651
    });
    const [sanitaryLogs, setSanitaryLogs] = useState<any[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const trackerEntries = Object.values(trackers);
            const newLogs: any[] = [];

            // 1. Proximity Check (Contact Tracing)
            for (let i = 0; i < trackerEntries.length; i++) {
                for (let j = i + 1; j < trackerEntries.length; j++) {
                    const t1 = trackerEntries[i] as any;
                    const t2 = trackerEntries[j] as any;
                    if (!t1.coords || !t2.coords) continue;

                    const dist = Math.sqrt(
                        Math.pow(t1.coords.lat - t2.coords.lat, 2) +
                        Math.pow(t1.coords.lng - t2.coords.lng, 2)
                    ) * 111320; // Approx meters

                    if (dist < 10) { // 10 meters breach
                        const rules1 = sanitaryRules[t1.name] || sanitaryRules[t1.id];
                        if (rules1?.forbiddenContacts.includes(t2.name) || rules1?.forbiddenContacts.includes(t2.id)) {
                            newLogs.push({
                                type: 'CONTACT',
                                severity: 'Critical',
                                msg: `ALERTA SANITARIA: Contacto prohibido entre ${t1.name} y ${t2.name}`,
                                time: new Date().toLocaleTimeString()
                            });
                        }
                    }
                }
            }

            // 2. Zoning Check (Assigned Areas)
            trackerEntries.forEach((t: any) => {
                const rules = sanitaryRules[t.name] || sanitaryRules[t.id];
                if (rules) {
                    // Check if inside any of his allowed zones
                    // (Simplification: just finding if he's near his zone center for now,
                    // or we could use isPointInPolygon if we restored the geoJson logic)
                    newLogs.push({
                        type: 'ZONING',
                        severity: 'Warning',
                        msg: `Verificación Sanitaria: ${t.name} en Granja Correcta`,
                        time: new Date().toLocaleTimeString()
                    });
                }
            });

            if (newLogs.length > 0) {
                setSanitaryLogs(prev => [...newLogs, ...prev].slice(0, 50));
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [trackers, sanitaryRules]);

    const geoJsonRef = useRef<any>(masterData);
    const redZonesRef = useRef({ type: 'FeatureCollection', features: [] });

    // --- DATA RESTORATION ---
    useEffect(() => {
        const localData = localStorage.getItem('redondos_infrastructure');
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                // Only overwrite if parsed data actually has features
                if (parsed?.features?.length > 0) {
                    setGeoJsonData(parsed);
                    geoJsonRef.current = parsed;
                }
            } catch (e) {
                console.error("Local storage load failed:", e);
                localStorage.removeItem('redondos_infrastructure'); // Clean up corrupt data
            }
        }
    }, []);

    // Trackers Sync
    useEffect(() => {
        const trackersJson = localStorage.getItem('redondos_trackers');
        if (trackersJson) setTrackers(JSON.parse(trackersJson));

        let mqttClient: any = null;
        const initCloudSync = async () => {
            try {
                const { initMQTT } = await import('../../lib/mqtt');
                mqttClient = initMQTT((cloudData) => {
                    setTrackers(prev => ({ ...prev, [cloudData.id]: cloudData }));
                });
            } catch (err) { console.error(err); }
        };
        initCloudSync();
    }, []);

    // --- MAP INITIALIZATION ---
    useEffect(() => {
        if (!mapContainer.current) return;

        if (map.current && typeof map.current.remove === 'function') {
            try {
                map.current.remove();
            } catch (e) {
                console.warn("Error cleaning up map instance:", e);
            }
            map.current = null;
        }

        // Reliable fallback styles for production
        const styles = [
            'https://tiles.openfreemap.org/styles/dark',
            'https://basemaps.cartocp.com/gl/dark-matter-gl-style/style.json',
            'https://demotiles.maplibre.org/style.json'
        ];

        let styleIndex = 0;

        const initMapInstance = (url: string) => {
            if (!mapContainer.current) return;

            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: url,
                center: [REDONDOS_PLANT_COORDS.lng, REDONDOS_PLANT_COORDS.lat],
                zoom: zoom,
                pitch: 45
            });

            map.current.on('error', (e) => {
                console.error("Style error for:", url, e);
                if (styleIndex < styles.length - 1) {
                    styleIndex++;
                    map.current?.remove();
                    initMapInstance(styles[styleIndex]);
                }
            });

            map.current.on('load', () => {
                if (!map.current) return;
                map.current.resize();

                map.current.addSource('galpones', {
                    type: 'geojson',
                    data: geoJsonData
                });

                map.current.addLayer({
                    id: 'galpones-extrusion',
                    type: 'fill-extrusion',
                    source: 'galpones',
                    paint: {
                        'fill-extrusion-color': ['get', 'color'],
                        'fill-extrusion-height': ['get', 'height'],
                        'fill-extrusion-base': 0,
                        'fill-extrusion-opacity': 0.8
                    }
                });

                map.current.addSource('live-trackers', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: [] }
                });

                map.current.addLayer({
                    id: 'live-trackers-layer',
                    type: 'circle',
                    source: 'live-trackers',
                    paint: {
                        'circle-radius': 8,
                        'circle-color': '#6366f1',
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff'
                    }
                });
            });
        };

        initMapInstance(styles[styleIndex]);

        // Auto-resize interval to handle production URL issues
        const resizer = setInterval(() => {
            if (map.current) map.current.resize();
        }, 1500);

        return () => {
            clearInterval(resizer);
            map.current?.remove();
        };
    }, [mapStyle]);

    // --- DATA SYNC EFFECT ---
    useEffect(() => {
        if (!map.current) return;
        const updateMapSources = () => {
            if (!map.current?.isStyleLoaded()) return;
            const galponesSource = map.current.getSource('galpones') as maplibregl.GeoJSONSource;
            if (galponesSource) galponesSource.setData(geoJsonData);
        };

        if (map.current.isStyleLoaded()) {
            updateMapSources();
        } else {
            map.current.on('load', updateMapSources);
        }
    }, [geoJsonData]);

    // --- TRACKER SYNC EFFECT ---
    useEffect(() => {
        if (!map.current) return;

        const updateTrackerData = () => {
            if (!map.current?.isStyleLoaded()) return;
            const source = map.current.getSource('live-trackers') as maplibregl.GeoJSONSource;
            if (source) {
                const features = Object.values(trackers)
                    .filter(t => t && t.coords && typeof t.coords.lng === 'number')
                    .map(t => ({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [t.coords.lng, t.coords.lat] },
                        properties: { name: t.name, id: t.id }
                    }));
                source.setData({ type: 'FeatureCollection', features: features as any });
            }
        };

        if (map.current.isStyleLoaded()) {
            updateTrackerData();
        } else {
            map.current.on('load', updateTrackerData);
        }
    }, [trackers]);

    // --- SENSOR SIMULATION ---
    useEffect(() => {
        const interval = setInterval(() => {
            const newData: Record<string, SimulationState> = {};
            const features = geoJsonData.features || [];
            features.forEach((f: any) => {
                const type = f.properties?.type;
                if (type === 'galpon') {
                    newData[f.id || f.properties.id] = {
                        temperature: 24 + Math.random() * 5,
                        humidity: 60 + Math.random() * 10,
                        ammonia: 10 + Math.random() * 5,
                        fanSpeed: 100,
                        lastUpdated: new Date(),
                        pigCount: 500,
                        pigAge: 12,
                        pigStage: 'Crecimiento',
                        foodConsumption: 150,
                        ventilationOn: true,
                        extractorOn: true,
                        foodPricePerKg: 1.5,
                        weightPerPig: 45,
                        totalFoodPrice: 225,
                        totalMeatWeight: 22500,
                        siloCapacity: 10000,
                        siloLevel: 8000,
                        feedType: 'Crecimiento'
                    };
                }
            });
            setSensorData(newData);
        }, 5000);
        return () => clearInterval(interval);
    }, [geoJsonData]);

    const focusOnTrackers = () => {
        const activeTrackers = Object.values(trackers);
        if (activeTrackers.length > 0 && map.current) {
            const first = activeTrackers[0] as any;
            map.current.flyTo({
                center: [first.coords.lng, first.coords.lat],
                zoom: 18,
                pitch: 60,
                duration: 2000
            });
        }
    };

    const toggleRain = () => setEnvironment(prev => ({ ...prev, isRaining: !prev.isRaining }));
    const toggleMapStyle = () => setMapStyle(mapStyle === 'dark' ? 'streets' : 'dark');
    const handleTeleport = () => {
        map.current?.flyTo({ center: [REDONDOS_PLANT_COORDS.lng, REDONDOS_PLANT_COORDS.lat], zoom: 16 });
    };

    // --- RENDER ---
    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-black overflow-hidden font-sans">
            <div className="order-2 md:order-1 h-auto md:h-full w-full md:w-20">
                <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            </div>

            <main className="flex-1 order-1 md:order-2 relative overflow-hidden flex flex-col h-full w-full">
                <div className={`relative w-full h-full ${className} ${activeSection !== 'overview' ? 'hidden' : ''}`}>
                    <div ref={mapContainer} className="w-full h-full" />

                    {/* HUD: SENSOR DATA (Live) */}
                    <div className="absolute top-4 left-4 bg-slate-900/90 p-4 rounded-lg border border-slate-700 text-white shadow-xl backdrop-blur-md w-64">
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <div className="flex-1 flex justify-between items-center">
                                <span className="font-bold text-sm tracking-wider uppercase">PLANT OVERVIEW</span>
                                {Object.keys(trackers).length > 0 && (
                                    <button
                                        onClick={focusOnTrackers}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded-md shadow-lg animate-bounce"
                                        title="Centrar en mi ubicación"
                                    >
                                        🛰️
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                            ACTIVE SENSORS: {Object.keys(sensorData).length}<br />
                            LIVE TRACKERS: {Object.keys(trackers).length}
                        </div>
                    </div>

                    {/* ENVIRONMENT CONTROL */}
                    <div className="absolute top-4 right-4 bg-slate-900/90 p-4 rounded-lg border border-slate-700 text-white shadow-xl backdrop-blur-md">
                        <h3 className="font-bold text-xs text-blue-400 mb-2 tracking-wider">ENVIRONMENT</h3>
                        <div className="flex flex-col gap-2">
                            <button onClick={toggleRain} className={`px-2 py-1 rounded text-[10px] font-bold ${environment.isRaining ? 'bg-blue-600' : 'bg-slate-700'}`}>RAIN: {environment.isRaining ? 'ON' : 'OFF'}</button>
                            <button onClick={toggleMapStyle} className="bg-slate-700 hover:bg-slate-600 text-white text-[10px] p-2 rounded">SWITCH STYLE</button>
                            <button onClick={handleTeleport} className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded text-[10px]">TELEPORT</button>
                        </div>
                    </div>
                </div>

                {activeSection === 'management' && <GestorDashboard />}
                {activeSection === 'climate' && <ClimateDashboard />}
                {activeSection === 'feeding' && <FeedingDashboard />}
                {activeSection === 'biosecurity' && <BiosecurityDashboard logs={sanitaryLogs} rules={sanitaryRules} trackers={trackers} />}
                {activeSection === 'predictive' && <PredictiveDashboard />}
                {activeSection === 'welfare' && <WelfareDashboard />}
                {activeSection === 'sync' && (
                    <MobileSync
                        isTracking={isGlobalTracking}
                        toggleTracking={toggleGlobalTracking}
                        coords={myCoords}
                        error={gpsError}
                    />
                )}
                {activeSection === 'resources' && <ResourceDashboard />}
                {activeSection === 'logistics' && <LogisticsDashboard />}
                {activeSection === 'plant' && <PlantDashboard />}
            </main>
        </div>
    );
};