// MARK: - Variables ====================================================================

// Contains two values: Longitude and Latitude
var userLocation;
var userLocationMarker;

// Contains a random number of values of the type Array. Each array contains two values agian. One for the longitude and the other for the latitude of the coordinate.
var locationOfAnimalCenter = [];
var animalCenterMarker = [];

// The map on which everything will be presented
var map;

// API Strings
import { petfinderAPI, token } from "./config.js";
import { tomtomAPI } from "./config.js";

// MARK: - TomTom (Map View) functions ==========================================================================

// Stores the users location in the variable at top
function storeUserLocation(location) {
  userLocation = [location.coords.longitude, location.coords.latitude];
  setupMap();
  loadLocationOfCenter();
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

function setZoomToFit() {
  // Create an empty Bounds object
  const bounds = new tt.LngLatBounds();

  // Iterate over the points and extend the bounds object with each point
  locationOfAnimalCenter.forEach((point) => {
    const lngLat = new tt.LngLat(point[0], point[1]);
    bounds.extend(lngLat);
  });

  // Fit the map view to the bounds
  map.fitBounds(bounds, { padding: 50 }); // Optional padding for the edge around the points
}

// Converts a given address as String to coordinates and presents a marker on the map at this position
function showAddressOnMap(address, organization) {
  const geocodingAPIUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(
    address
  )}.json?key=${tomtomAPI}`;

  //Popup & List information
  const orgList = document.getElementById("orgList");
  orgList.innerHTML = "";

  const popupInfo = document.createElement("div");
  popupInfo.className = "popupInfo";

  const orgName = document.createElement("p");
  orgName.className = "orgName";
  orgName.textContent = organization.name;
  popupInfo.appendChild(orgName);

  const orgPhone = document.createElement("p");
  orgPhone.textContent = `Phone: ${organization.phone}`;
  popupInfo.appendChild(orgPhone);

  const orgEmail = document.createElement("p");
  orgEmail.textContent = `Email: ${organization.email}`;
  popupInfo.appendChild(orgEmail);

  const orgWebsite = document.createElement("p");
  orgWebsite.textContent = `Website: ${organization.website}`;
  popupInfo.appendChild(orgWebsite);

  const orgAddress = document.createElement("p");
  orgAddress.textContent = `Address: ${address}`;
  popupInfo.appendChild(orgAddress);

  orgList.appendChild(popupInfo);

  fetch(geocodingAPIUrl)
    .then((response) => response.json())
    .then((data) => {
      const results = data.results;

      if (results && results.length > 0) {
        const position = results[0].position;
        const latitude = position.lat;
        const longitude = position.lon;
        locationOfAnimalCenter.push([longitude, latitude]);
        //Pop up tag to display the info.
        const popup = new tt.Popup({ closeButton: false }).setDOMContent(
          popupInfo
        );
        //Sets up marker with the pop up
        const newMarker = new tt.Marker()
          .setLngLat([longitude, latitude])
          .setPopup(popup);
        //Adds marker and popup to map
        newMarker.addTo(map);
        animalCenterMarker.push(newMarker);
      } else {
        console.log("No results found");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Converts the address of the Petfinder API architecture to a string
function getAddressStringFor(organization) {
  let organizationAddress = organization.address;
  let address1 = organizationAddress.address1;
  let address2 = organizationAddress.address2;
  let city = organizationAddress.city;
  let country = organizationAddress.country;
  let postcode = organizationAddress.postcode;
  let state = organizationAddress.state;
  let seperator = ", ";
  let searchAddress =
    city + seperator + country + seperator + postcode + seperator + state;

  return searchAddress;
}

// By running this function the code will stuck for the given time in ms.
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Loads the location of each animal center near to the users location individually and presents it on the map.
// This functions will sleep after loading each location to avoid server limitation errors.
function loadLocationOfCenter() {
  var petfinderClient = new petfinder.Client({
    apiKey: petfinderAPI,
    secret: token,
  });

  let userLocationString =
    userLocation[1].toString() + ", " + userLocation[0].toString();

  petfinderClient.organization
    .search({
      location: userLocationString,
      distance: 10,
    })
    .then(async (resp) => {
      let organizations = resp.data.organizations;
      for (let i = 0; i < organizations.length; i++) {
        let organization = organizations[i];
        let searchAddress = getAddressStringFor(organization);
        //console.log(i, searchAddress);
        showAddressOnMap(searchAddress, organization);
        await sleep(400);
      }
      setZoomToFit();
    })
    .catch((error) => {
      // Handle the error
      console.error("Error:", error);
    });
}

// __main__
function main() {
  loadUserLocation();
}

window.addEventListener("load", main);
