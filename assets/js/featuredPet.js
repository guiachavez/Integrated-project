import { getFirestore, collection, getDocs, getDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { app } from './config.js'
import { petfinderAPI, token } from './config.js'
import { tomtomAPI } from './config.js'



// init the firestore and storage
const db = getFirestore(app);
const storage = getStorage(app);


// collection reference
const aniRef = collection(db, 'animals')

// filter function    
const searchAnimals = document.querySelector('.home_searchbox')
let urlParam
let searchParamsObj

// for location - tomtom searchbox plugin
var searchOptions = {
  key: tomtomAPI,
  language: 'en-Gb',
  limit: 20
};

var autocompleteOptions = {
  key: tomtomAPI,
  language: 'en-GB'
};

var searchBoxOptions = {
  minNumberOfCharacters: 3,
  searchOptions: searchOptions,
  autocompleteOptions: autocompleteOptions,
  distanceFromPoint: [15.4, 53.0]
};

// Create a new instance of the TomTom SearchBox
var ttSearchBox = new tt.plugins.SearchBox(tt.services, searchBoxOptions);


// Add an event listener for the resultselected event
ttSearchBox.on('tomtom.searchbox.resultselected', function(event) {
  console.log(event.data.result.address);
  console.log(event.data.result.position);
  localStorage.setItem('location-query', JSON.stringify(event.data.result.address));
  localStorage.setItem('position', JSON.stringify(event.data.result.position));
});

// Add the event listener to the search location input field
const searchLocationInput = document.querySelector('.home_searchbox');
searchLocationInput.addEventListener('input', () => {
  const enteredLocation = searchLocationInput.value; // or obtain the location from localStorage

  // Fetch the pet data from the Firebase database based on the user's location
  const petsCollection = collection(db, 'animals');
  const petsQuery = query(petsCollection, where('location', '==', enteredLocation));
  getDocs(petsQuery)
    .then((querySnapshot) => {
      //  if any pets are found based on the location
      if (!querySnapshot.empty) {
        // Get the pet data
        const pets = querySnapshot.docs.map((doc) => doc.data());

        // Generate the carousel slides
        const carouselContainer = document.querySelector('.carousel-container');
        const carousel = document.querySelector('.carousel');

        // Clear the existing carousel content
        carousel.innerHTML = '';

        // Generate slides for each pet
        pets.forEach((pet) => {
          const slide = document.createElement('div');
          slide.classList.add('slide');

          // Create the image element and set its source
          const image = document.createElement('img');
          image.src = pet.image;
          slide.appendChild(image);

          // Create the pet information element
          const info = document.createElement('div');
          info.classList.add('info');

          // Create and populate the pet data elements
          const name = document.createElement('h3');
          name.textContent = pet.name;
          info.appendChild(name);

          const type = document.createElement('p');
          type.textContent = pet.type;
          info.appendChild(type);

          const age = document.createElement('p');
          age.textContent = `Age: ${pet.age}`;
          info.appendChild(age);

          const gender = document.createElement('p');
          gender.textContent = `Gender: ${pet.gender}`;
          info.appendChild(gender);

          const location = document.createElement('p');
          location.textContent = `Location: ${pet.location}`;
          info.appendChild(location);

          slide.appendChild(info);

          // Append the slide to the carousel
          carousel.appendChild(slide);
        });

        // Initialize the Slick Carousel
        $('.carousel').slick({
            dots: true,
            infinite: false,
            speed: 300,
            slidesToShow: 3,
            slidesToScroll: 1,
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 3,
                  slidesToScroll: 3,
                  infinite: true,
                  dots: true
                }
              },
              {
                breakpoint: 600,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 2
                }
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1
                }
              }
              // You can unslick at a given breakpoint now by adding:
              // settings: "unslick"
              // instead of a settings object
            ]
          });

        // Make the carousel container visible
        carouselContainer.style.display = 'block';
      } else {
        console.log('No pets available from this location');
      }
    })
    .catch((error) => {
      console.error('Error getting pet data:', error);
    });
});
