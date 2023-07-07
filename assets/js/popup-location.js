// Contains two values: Longitude and Latitude
var userLocation;
var userLocationMarker;
var setLocation;

// The map on which everything will be presented
var map;

// API Strings
import { tomtomAPI } from './config.js'

async function locationSearch() {
  var setLocation = document.getElementById("search-city").value;
  console.log(setLocation);

  tt.services.fuzzySearch({
    key: tomtomAPI,
    query: setLocation
  })
  .then(function(response) {
    console.log(response)
    map = tt.map({
      key: tomtomAPI,
      container: 'map',
      center: response.results[0].position,
      zoom: 12
    })
  })
}

// Stores the users location in the variable atop
function storeUserLocation(location) {
  userLocation = [location.coords.longitude, location.coords.latitude];
  setupMap();
}

// Loads the users location and calls the presentUserLocationOnMap function
function loadUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(storeUserLocation);
  }
}

// Initialize the TomTom map in the element with an id set to 'map'
function setupMap() {
  map = tt.map({
    key: tomtomAPI,
    container: "map",
    center: [userLocation[0], userLocation[1]],
    zoom: 15,
  });

  const markerOptions = {
    color: "purple",
  };
  userLocationMarker = new tt.Marker(markerOptions)
    .setLngLat(userLocation)
    .addTo(map);
}

// __main__
function main() {
  loadUserLocation();
}

//Event listener for input Search
var apply = document.getElementById("apply");
apply.addEventListener("click", locationSearch);

window.addEventListener("load", main);
