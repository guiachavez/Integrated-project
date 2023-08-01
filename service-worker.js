const cacheName = "v1";
const urlsToCache = [ "offline.html", "pawfectmatch-logo-colour.svg"
 ];
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
     // do nothing here, just log all the network requests
    console.log(`Fetching ${event.request.url}`);
    // generally the service worker caching strategy is defeind here
    event.respondWith(NetworkFirstOrDefaultPage(event) );
});


// NETWORK FIRST, THEN CACHE STRATEGY
async function NetworkFirstOrDefaultPage(event) {
    try {
        return await fetch( event.request );  // returns server fetch
    } catch(error) {
        console.log(error);
        return caches.match( './offline.html' , {ignoreVary:true} ); // returns default offline page)
    }
  }