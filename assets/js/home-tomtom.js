
// console.log("hii")
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


// MARK: - TomTom (Map View) functions ==========================================================================

let address;

// Stores the users location in the variable at top
function storeUserLocation(location) {
  userLocation = [location.coords.longitude, location.coords.latitude];
  
  setupMap();
  loadLocationOfCenter();
  /* reverse geocoding====================================== */
  console.log(userLocation)

    const latitude = userLocation[1];
    const longitude = userLocation[0];
    const apiUrl = `https://api.tomtom.com/search/2/reverseGeocode/${latitude},${longitude}.json?key=${tomtomAPI}`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        address = data.addresses[0].address.freeformAddress;
        // console.log('Location:', address);
        
        // Extract the city from the address
        const city = extractCityFromAddress(address);
        console.log('City:', city);

        // calling featuredPet function
        featuredPet(city);
      })
      .catch(error => {
        console.log('Error during reverse geocoding:', error);
      });  

}

/* extract city from the address function definition */
function extractCityFromAddress(address){
  let city = '';
  // Extract city from address
  const parts = address.split(',');
  if (parts.length > 1) {
    const secondHalf = parts[1].trim();
    const secondHalfParts = secondHalf.split(' ');
    if (secondHalfParts.length > 0) {
      city = secondHalfParts[0].trim();
    }

  return city;}
  
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

      if (results && results.length > 0) {
        const position = results[0].position;
        const latitude = position.lat;
        const longitude = position.lon;
        locationOfAnimalCenter.push([longitude, latitude]);

        //Pop up tag to display the info.
        const popup = new tt.Popup({ closeButton: false }).setDOMContent(
          orgInfo
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
      orgAddress.textContent = `Address: ${address}`;
      orgInfo.appendChild(orgAddress);

      const orgId = document.createElement("p");
      orgId.className = "orgId";
      orgId.textContent = organization.id;
      orgInfo.appendChild(orgId);

      // Button to go to the results
      const goToOrg = document.createElement("a");
      goToOrg.className = "goToOrg";
      var link = document.createTextNode("See pets");
      goToOrg.appendChild(link);
      goToOrg.title = "See the pets available in this shelter";
      goToOrg.href = "./animals.html";
      goToOrg.target = "_blank";
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
      //NEED TO SET THIS TO USER ENTER
      //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
      console.log("Error:", error);
    });
}

// __main__
function main() {
  loadUserLocation();
}

window.addEventListener("load", main);


import { getFirestore, collection, getDocs, getDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { app } from './config.js'

const db = getFirestore(app);

const pets = [];
/* featured pet using location =============================== */

function featuredPet(checklocation) {
  const petsCollection = collection(db, 'animals');
  const queryRef = query(petsCollection, where('location.city', 'in', [checklocation, 'Vancouver']));
  
  console.log(queryRef);
  getDocs(queryRef)
    .then((querySnapshot) => {
      
      for (let i = 0; i < querySnapshot.size; i++) {
        const doc = querySnapshot.docs[i];
        const pet = doc.data();

        console.log('Retrieved pet:', pet);

        const petObj = {
          photo: pet.photo,
          name: pet.name,
          type: pet.type,
          age: pet.age,
          gender: pet.gender,
          location: pet.location
        };

        pets.push(petObj);

        // Call the createCarousel function with the pets array
        
      }
        createCarousel(pets);
        // console.log(pets);
      })
      .catch((error) => {
        console.error('Error getting pet data:', error);
      });
    }
      function createCarousel(pets) {
        const carouselContainer = document.querySelector('.carousel-container');
        const carousel = document.querySelector('.carousel');
          
        // Store unique identifiers of added pets
        const uniqueIdentifiers = [];


        pets.forEach((pet) => {
          // Create a div element for the pet
          const petDiv = document.createElement('div');
          petDiv.classList.add('carousel-item');
          
           // Check if pet's photo or unique identifier already exists in carousel
              /* if (uniqueIdentifiers.includes(pet.photo) || uniqueIdentifiers.includes(pet.owner_id)) {
                return; // Skip adding the slide
              } */


          // Create elements for pet details
          const petPhoto = document.createElement('img');
          petPhoto.src= pet.photo; 

          const petName = document.createElement('h3');
          petName.textContent = pet.name;
          
          const petAttributes = document.createElement('p');
          petAttributes.textContent = ` ${pet.type} , ${pet.age}, ${pet.gender}`;
          
          const petLocation = document.createElement('p');
          petLocation.textContent = `${pet.location.city},${pet.location.state}`;
          
          // Append pet details to the pet div
          petDiv.appendChild(petPhoto);
          petDiv.appendChild(petName);
          petDiv.appendChild(petAttributes);
          petDiv.appendChild(petLocation);
          
          // Append pet div to the carousel container
          carousel.appendChild(petDiv);
          carousel.style.maxWidth = "700px";
          carousel.style.maxHeight = "700px";
    
          carouselContainer.appendChild(carousel);

          // Add pet's photo or unique identifier to the list of added pets
       /* uniqueIdentifiers.push(pet.photo);
          uniqueIdentifiers.push(pet.uniqueIdentifier); */

          carouselContainer.style.display = 'inline-block';
          carouselContainer.style.margin = "auto 0";
        }); 
         // Initialize the Slick Carousel
         $('.carousel').not('.slick-initialized').slick({
          dots: true,
          infinite: true,
          speed: 300,
          slidesToShow: 3,
          slidesToScroll: 1,
        });
      
        // Make the carousel container visible
          carouselContainer.style.display = 'block';
      }
         
