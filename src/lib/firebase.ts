import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, off } from "firebase/database";

// Configuration for the public demo project - Redondos Vanguard
// You can replace these with your own project keys later for full privacy
const firebaseConfig = {
    apiKey: "AIzaSyB-MOCK-FOR-DEMO-ONLY",
    authDomain: "redondos-vanguard.firebaseapp.com",
    databaseURL: "https://redondos-vanguard-default-rtdb.firebaseio.com",
    projectId: "redondos-vanguard",
    storageBucket: "redondos-vanguard.appspot.com",
    messagingSenderId: "302394857612",
    appId: "1:302394857612:web:7f6d5e4a3b2c1d0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Simple helpers to push and listen
export const updateTrackerInCloud = (id: string, data: any) => {
    const trackerRef = ref(db, 'trackers/' + id);
    set(trackerRef, data);
};

export const listenToTrackers = (callback: (data: any) => void) => {
    const trackersRef = ref(db, 'trackers');
    onValue(trackersRef, (snapshot) => {
        const data = snapshot.val();
        callback(data || {});
    });
};
