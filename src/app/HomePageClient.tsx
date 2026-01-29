"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { LoginOverlay } from "@/components/UI/LoginOverlay";

const MapLibreViewer = dynamic(() => import("@/components/Map/MapLibreViewerFixed").then((mod) => mod.MapLibreViewer), { ssr: false });

export function HomePageClient() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState<{ name: string, surname: string } | null>(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('vanguard_user');
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (data: { name: string; surname: string; role: string; phone: string }) => {
        sessionStorage.setItem('vanguard_user', JSON.stringify(data));
        setUserData(data);
        setIsAuthenticated(true);
        console.log(`[ACCESS LOG] ${data.name} entered.`);
    };

    return (
        <main className="w-full h-screen bg-black relative">
            {!isAuthenticated && (
                <LoginOverlay onLogin={handleLogin} />
            )}

            {isAuthenticated && (
                <>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/80 text-white px-4 py-1 rounded-full text-xs backdrop-blur border border-slate-700 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-700">
                        Bienvenido, {userData?.name} {userData?.surname}
                    </div>
                    <MapLibreViewer className="w-full h-full" />
                </>
            )}
        </main>
    );
}
