importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js')

workbox.loadModule('workbox-strategies');

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