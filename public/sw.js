const CACHE_NAME = 'vanguard-v1';

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
});

// BACKGROUND SYNC (EXPERIMENTAL)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'trace-location') {
        event.waitUntil(sendLocationUpdate());
    }
});

async function sendLocationUpdate() {
    // This is where we would trigger a background GPS check
    // but browser support for periodicSync is limited to installed PWAs
    console.log('Background Sync triggered');
}
