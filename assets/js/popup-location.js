// Contains two values: Longitude and Latitude
var userLocation;
var userLocationMarker;
var setLocation;

// The map on which everything will be presented
var map;

// API Strings
var tomtomAPIKey = "4NGblFt1cWFjRxqAPtg7qW4jUfUYjzS1";

function locationSearch() {
  var setLocation = document.getElementById("search-city").value;
  console.log(setLocation);
  userLocation = [];
  const fuzzySearch = `https://api.tomtom.com/search/2/search/${setLocation}.json?key=${tomtomAPIKey}`;
  fetch(fuzzySearch)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      console.log(data.results[0].position);
      const results = data.results;
      if (results && results.length > 0) {
        const position = results[0].position;
        const latitude = position.lat;
        const longitude = position.lon;
        userLocation = [longitude, latitude];
      } else {
        console.log("No results found");
      }
    });
  setupMap();
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
    key: tomtomAPIKey,
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
