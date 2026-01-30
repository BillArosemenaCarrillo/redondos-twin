"use client";

import { useState, useEffect } from 'react';

export interface GPSCoord {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp: number;
}

export interface Tracker {
    id: string;
    name: string;
    type: 'person' | 'vehicle' | 'truck';
    coords: GPSCoord;
    battery?: number;
    lastSeen: number;
}

export const useTracker = (enable: boolean = false) => {
    const [coords, setCoords] = useState<GPSCoord | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enable || typeof window === 'undefined' || !navigator.geolocation) {
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newCoord = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                };
                setCoords(newCoord);

                // Update local storage for shared tracking
                const myTrackerId = localStorage.getItem('vanguard_my_id') || `T-${Math.floor(Math.random() * 1000)}`;
                if (!localStorage.getItem('vanguard_my_id')) {
                    localStorage.setItem('vanguard_my_id', myTrackerId);
                }

                const trackersJson = localStorage.getItem('redondos_trackers');
                let trackers: Record<string, Tracker> = trackersJson ? JSON.parse(trackersJson) : {};

                const trackerData: Tracker = {
                    id: myTrackerId,
                    name: localStorage.getItem('vanguard_my_name') || 'Celular Operario',
                    type: (localStorage.getItem('vanguard_my_type') as any) || 'person',
                    coords: newCoord,
                    battery: 85,
                    lastSeen: Date.now()
                };

                trackers[myTrackerId] = trackerData;
                localStorage.setItem('redondos_trackers', JSON.stringify(trackers));

                // SYNC TO CLOUD (FIREBASE)
                import('../lib/firebase').then(({ updateTrackerInCloud }) => {
                    updateTrackerInCloud(myTrackerId, trackerData);
                }).catch(err => console.error("Firebase sync error", err));
            },
            (err) => {
                setError(err.message);
                console.error("GPS Error:", err);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [enable]);

    return { coords, error };
};
