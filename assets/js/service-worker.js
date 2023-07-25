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



const cacheName = "v1";
const urlsToCache = [ "/offline.html",
 ];
 // add offline.html to the cache only to show it when offline
// NEVER cache service worker itself ( i.e. don't include sw.js in above array)
// MAKE SURE THERE IS NO TYPO in the File names otherwise the cache.addAll fails in install

self.addEventListener('install', (event) => { // invoked when a browser installs this SW
    // here we cache the resources that are defined in the urlsToCache[] array
    console.log(`[SW] Event fired: ${event.type}`);
    event.waitUntil(       // waitUntil tells the browser to wait for the input promise to finish
		  caches.open( cacheName )		//caches is a global object representing CacheStorage
			  .then( ( cache ) => { 			// open the cache with the name cacheName*
				  return cache.addAll( urlsToCache );      	// pass the array of URLs to cache**. it returns a promise
		}));
    self.skipWaiting();  // it tells browser to activate this SW and discard old one immediately (useful during development)
    console.log(`[SW] installed`);
});

self.addEventListener('activate', (event) => { // invoked after the SW completes its installation. 
    // It's a place for the service worker to clean up from previous SW versions
    console.log(`[SW] Event fired: ${event.type}`);
    event.waitUntil( deleteOldCache() )    // waitUntil tells the browser to wait for the input promise to finish
    self.clients.claim(); // lets the newly activated SW takes control of all related open pages 
    console.log(`[SW] activated`);
});

// iterates over cache entries for this site and delete all except the one matching cacheName
async function deleteOldCache() {
  const keyList = await caches.keys();
  return Promise.all( keyList.map( ( key ) => {
    if ( key !== cacheName  ) {    // compare key with the new cache Name in SW
      return caches.delete( key );  // delete any other cache
    }
  }));
}


self.addEventListener('fetch', event => {
    // Fires whenever the app requests a resource (file or data)  normally this is where the service worker would check to see
    // if the requested resource is in the local cache before going to the server to get it. 
    console.log(`[SW] Fetch event for ${event.request.url}`);

    event.respondWith(NetworkFirstThenCacheStrategy(event) );

});

// CACHE FIRST, THEN NETWORK STRATEGY
async function CacheFirstThenNetworkStrategy(event) {
    const cachedResponse = await caches.match( event.request.url, {ignoreVary:true} ); // ignore vary header (useful for offline match)
    if (cachedResponse) {
      console.log("using catched "+event.request.url);
      return cachedResponse
    }
    //not found in cache try to return from server (would be successfull if we are online)
    return fetch( event.request );  // returns cachedResponse or server fetch  if no cachedResponse
  }


// NETWORK FIRST, THEN CACHE STRATEGY
async function NetworkFirstThenCacheStrategy(event) {
  try {
      return await fetch( event.request );  // returns server fetch
  } catch(error) {
      return caches.match( "offline.html",event.request.url , {ignoreVary:true} ); // returns cached response if server fetch fails (e.g. user is offline)
  }
}