import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  limit,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { app } from "./config.js";
import { globalShowPosts } from "./global-functions.js";

const db = getFirestore(app);

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

// Variables to display on the list on the left
const orgList = document.getElementById("orgList");

let radius = 10;

// MARK: - TomTom (Map View) functions ==========================================================================

let address;

// Stores the users location in the variable at top
function storeUserLocation(location) {
  userLocation = [location.coords.longitude, location.coords.latitude];

  setupMap();
  loadLocationOfCenter();

  /* reverse geocoding====================================== */
  console.log(userLocation);

  const latitude = userLocation[1];
  const longitude = userLocation[0];
  const apiUrl = `https://api.tomtom.com/search/2/reverseGeocode/${latitude},${longitude}.json?key=${tomtomAPI}`;

  localStorage.setItem("position", `{"lng":${longitude},"lat":${latitude}}`);

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      address = data.addresses[0].address.freeformAddress;

      localStorage.setItem(
        "location-query",
        JSON.stringify(data.addresses[0].address)
      );

      // Extract the city from the address
      const city = extractCityFromAddress(address);

      // calling featuredPet function
      featuredPet(city);
    })
    .catch((error) => {
      console.log("Error during reverse geocoding:", error);
    });
}

/* extract city from the address function definition */
function extractCityFromAddress(address) {
  // Extract city from address
  let city = "";
  const parts = address.split(",");

  if (parts.length > 1) {
    const secondHalf = parts[1].trim();
    const secondHalfParts = secondHalf.split(" ");

    if (secondHalfParts.length > 0) {
      city = secondHalfParts[0].trim();
    }

    return city;
  }
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

  fetch(geocodingAPIUrl)
    .then((response) => response.json())
    .then((data) => {
      const results = data.results;
      //To display on the div (popup) & list
      const orgInfo = document.createElement("div");
      orgInfo.className = "orgInfo";
      orgInfo.setAttribute("data-org", organization.id);

      if (results && results.length > 0) {
        const position = results[0].position;
        const latitude = position.lat;
        const longitude = position.lon;
        locationOfAnimalCenter.push([longitude, latitude]);

        //Popup tag to display the info.
        const popup = new tt.Popup({
          closeButton: false,
        }).setDOMContent(orgInfo);

        //Sets up marker with the pop up
        const newMarker = new tt.Marker()
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map);

        newMarker.getElement().setAttribute("data-org", organization.id);

        //Adds marker and popup to map
        animalCenterMarker.push(newMarker);
      } else {
        console.log("No results found");
      }

      //Variables to be appended for the popup:
      const orgName = document.createElement("p");
      orgName.className = "orgName";
      orgName.textContent = organization.name;
      orgInfo.appendChild(orgName);

      const orgPhone = document.createElement("p");
      orgPhone.textContent = `Phone: ${organization.phone}`;
      if (organization.phone !== null) {
        orgInfo.appendChild(orgPhone);
      }

      const orgEmail = document.createElement("p");
      orgEmail.textContent = `Email: ${organization.email}`;
      if (organization.email !== null) {
        orgInfo.appendChild(orgEmail);
      }

      const orgWebsite = document.createElement("p");
      orgWebsite.textContent = `Website: ${organization.website}`;
      if (organization.website !== null) {
        orgInfo.appendChild(orgWebsite);
      }

      const orgAddress = document.createElement("p");
      orgAddress.className = "orgAddress";
      orgAddress.textContent = `Address: ${address}`;
      orgAddress.setAttribute("data-add", `${address}`);
      orgInfo.appendChild(orgAddress);

      const orgId = document.createElement("p");
      orgId.className = "orgId";
      orgId.textContent = organization.id;
      orgInfo.appendChild(orgId);

      // Button to go to the results
      const goToOrg = document.createElement("button");
      goToOrg.className = "goToOrg";
      var link = document.createTextNode("See pets");
      goToOrg.appendChild(link);
      goToOrg.title = "See the pets available in this shelter";
      goToOrg.target = "_blank";
      goToOrg.setAttribute("data-org", `${organization.id}`);
      orgInfo.append(goToOrg);

      //Display the list
      orgList.innerHTML += outerHTML(orgInfo);
    })

    .catch((error) => {
      console.log("Error:", error);
    });
}

//Converts the HTML Object into a string so that it can be seen in the list on the left
function outerHTML(node) {
  return node.outerHTML || new XMLSerializer().serializeToString(node);
}

//Create a function to handle the click event to open the popup
function handleClickToPopup(event) {
  console.log("click working");
  const clickedItem = event.target.closest(".orgInfo");
  if (!clickedItem) return;

  const orgId = clickedItem.getAttribute("data-org");
  const marker = animalCenterMarker.find(
    (m) => m.getElement().getAttribute("data-org") === orgId
  );

  if (marker) {
    //Open the popup associated with the marker
    marker.togglePopup();
  }
}

orgList.addEventListener("click", handleClickToPopup);

function passOrg() {
  $(".goToOrg").on("click", function () {
    localStorage.setItem("orgId", $(this).data("org"));
    localStorage.setItem("source", "shelter");

    let address = $(this).closest(".orgInfo").find(".orgAddress").data("add");
    const getAdd = `https://api.tomtom.com/search/2/geocode/${address}.json?key=${tomtomAPI}`;

    fetch(getAdd)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        let locatedAddress = data.results[0].address;
        let position = data.results[0].position;
        localStorage.setItem("location-query", JSON.stringify(locatedAddress));
        localStorage.setItem("position", JSON.stringify(position));
        localStorage.setItem("type", "");

        window.location.href = "http://127.0.0.1:5500/main/pet.html";
      })
      .catch((error) => {
        console.log(error);
      });
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
      distance: radius,
    })
    .then(async (resp) => {
      let organizations = resp.data.organizations;
      for (let i = 0; i < organizations.length; i++) {
        let organization = organizations[i];
        let searchAddress = getAddressStringFor(organization);

        showAddressOnMap(searchAddress, organization);
        await sleep(400);
      }
      setZoomToFit();
      passOrg();
    })
    .catch((error) => {
      // Handle the error
      console.log("Error:", error);
    });
}

// Set Radius
const setRadius = document.getElementById("setRadius");
const radiusValue = document.getElementById("radiusValue");
const applyRadius = document.getElementById("home_apply-radius");

setRadius.addEventListener("input", () => {
  radiusValue.innerHTML = setRadius.value;
  radius = setRadius.value;
  console.log(radius);
});

applyRadius.addEventListener("click", () => {
  orgList.innerHTML = "";
  locationOfAnimalCenter = [];
  setupMap();
  loadLocationOfCenter();
});

/* featured pet using location =============================== */
const pets = [];

function featuredPet(checklocation) {
  const petsCollection = collection(db, "animals");
  const queryRef = query(
    petsCollection,
    where("location.city", "==", checklocation),
    limit(6)
  );

  getDocs(queryRef)
    .then((querySnapshot) => {
      for (let i = 0; i < querySnapshot.size; i++) {
        const doc = querySnapshot.docs[i];
        const pet = doc.data();

        const petObj = {
          photo: pet.photo,
          name: pet.name,
          type: pet.type,
          age: pet.age,
          gender: pet.gender,
          location: pet.location,
        };

        pets.push(petObj);

        // Call the createCarousel function with the pets array
      }

      createCarousel(pets);
    })
    .catch((error) => {
      console.log("Error getting pet data:", error);
    });
}

function createCarousel(pets) {
  const carouselContainer = document.querySelector(".carousel-container");
  const carousel = document.querySelector(".carousel");

  // Store unique identifiers of added pets
  const uniqueIdentifiers = [];

  pets.forEach((pet) => {
    // Create a div element for the pet
    const petDiv = document.createElement("div");
    petDiv.classList.add("carousel-item");

    // Create elements for pet details
    const petPhoto = document.createElement("img");
    petPhoto.src = pet.photo;

    const petName = document.createElement("h3");
    petName.textContent = pet.name;

    const petAttributes = document.createElement("p");
    petAttributes.textContent = `${pet.gender}, ${pet.age}, ${pet.size} `;

    const petLocation = document.createElement("p");
    petLocation.classList = "pet-location";
    petLocation.textContent = `${pet.location.city}, ${pet.location.state}`;

    // Append pet details to the pet div
    petDiv.appendChild(petPhoto);
    petDiv.appendChild(petName);
    petDiv.appendChild(petAttributes);
    petDiv.appendChild(petLocation);

    // Append pet div to the carousel container
    carousel.appendChild(petDiv);
    // carousel.style.maxWidth = "700px";
    // carousel.style.maxHeight = "700px";

    carouselContainer.appendChild(carousel);

    // carouselContainer.style.display = 'inline-block';
    // carouselContainer.style.margin = "auto 0";
  });

  // Initialize the Slick Carousel
  $(".carousel")
    .not(".slick-initialized")
    .slick({
      arrows: true,
      infinite: true,
      speed: 300,
      slidesToShow: 3,
      slidesToScroll: 1,
      respondTo: "slider",
      adaptiveHeight: true,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: true,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });

  // Make the carousel container visible
  carouselContainer.style.display = "block";
}

/* featured user story ======================= */

const journeyArr = [];
const adoptionJourneyCollection = collection(db, "adoptionJourney");
const q = query(adoptionJourneyCollection, limit(4));

globalShowPosts(q);

setTimeout(function () {
  $(".home_adopt-stories #stories").not(".slick-initialized").slick({
    infinite: true,
    arrows: true,
    slidesToShow: 1,
    slidesToScroll: 1,
  });
}, 1000);

/* To change location on map =================================== */

var searchOptions = {
  key: tomtomAPI,
  language: "en-Gb",
  limit: 20,
};

var autocompleteOptions = {
  key: tomtomAPI,
  language: "en-GB",
};

var searchBoxOptions = {
  minNumberOfCharacters: 3,
  searchOptions: searchOptions,
  autocompleteOptions: autocompleteOptions,
  distanceFromPoint: [15.4, 53.0],
};

var ttSearchBoxLoc = new tt.plugins.SearchBox(tt.services, searchBoxOptions);
document
  .querySelector(".home_change-location")
  .prepend(ttSearchBoxLoc.getSearchBoxHTML());

ttSearchBoxLoc.on("tomtom.searchbox.resultselected", function (event) {
  console.log(event.data.result.address);
  console.log(event.data.result.position);
  localStorage.setItem(
    "location-query",
    JSON.stringify(event.data.result.address)
  );
  localStorage.setItem("position", JSON.stringify(event.data.result.position));

  handleResult(JSON.parse(localStorage.getItem("position")));
});

$(".tt-search-box2-input").attr("placeholder", "Change location");

var handleResult = function (response) {
  moveMap(response);

  marker = new tt.Marker().setLngLat(position).addTo(map);
};

var moveMap = function (lnglat) {
  map.flyTo({
    center: lnglat,
    zoom: 14,
  });

  locationOfAnimalCenter = [];

  userLocation = [];
  userLocation.push(lnglat.lng);
  userLocation.push(lnglat.lat);

  orgList.innerHTML = "";
  // setupMap();
  loadLocationOfCenter();
};

// __main__
function main() {
  loadUserLocation();
}

window.addEventListener("load", main);
