importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js')
importScripts('/workbox-config.js');

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
workbox.core.skipWaiting();
workbox.core.clientsClaim();


workbox.routing.registerRoute(
    ({request}) => {
        if(request.destination === 'image'){
        const url = new URL(request.url);
        const path = url.pathname;
        const isFinalIcon = path.includes('../logo/finalIcon');
        return isFinalIcon;
        }
        return false;
    },
    new workbox.strategies.NetworkFirst()
)