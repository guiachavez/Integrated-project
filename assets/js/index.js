
import { tomtomAPI } from './config.js'

const homeSearch = document.getElementById('submit')

const search = (e) => {
    e.preventDefault()
    let type = document.getElementById('type').value
    let source = document.getElementById('source').value
    let alert = document.querySelector('.alert')
    
    localStorage.setItem('type', type)
    localStorage.setItem('source', source)

    $('select').on('change', function() {
        alert.style.display = 'none'
    })

    if(type && source) {
        // redirect to animals page
        setTimeout(function() {
            window.location.href = '../../main/pet.html';
        }, 1000)
    } else {
        alert.style.display = 'block'
    }
    
}

// COMMENT OUT THE MAP
// let mapContainer = document.getElementById('map')
// let marker

// var map = tt.map({
//     key: tomtomAPI,
//     container: mapContainer,
//     center:  [-123.120735, 49.282730],
//     zoom: 14
// })

// searching
// var locationSearch = (setLocation) => {
//     console.log(setLocation);

//     tt.services.fuzzySearch({
//       key: tomtomAPI,
//       query: setLocation,
//       //boundingBox: map.getBounds()

//     }).then(handleResult)
  
//     localStorage.setItem('location-query', setLocation)
  
// }

// var handleResult = function(response) {
//     console.log(response)
//     if(response.results) {
//         let position = response.results[0].position
//         moveMap(position)
//         localStorage.setItem('position', JSON.stringify(position))

//         marker = new tt.Marker()
//                     .setLngLat(position)
//                     .addTo(map)
//     }
// }


// var moveMap = function(lnglat) {
//     map.flyTo({
//         center: lnglat,
//         zoom: 14
//     })
// }


// FUNCTION FOR LOCATION SEARCH
var searchOptions = {
    key: tomtomAPI,
    language: 'en-Gb',
    limit: 20
}

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

var ttSearchBox = new tt.plugins.SearchBox(tt.services, searchBoxOptions)
document.querySelector('form').prepend(ttSearchBox.getSearchBoxHTML());

ttSearchBox.on('tomtom.searchbox.resultselected', function(event) {
    // console.log(event.data.result.address)
    // console.log(event.data.result.position)
    localStorage.setItem('location-query', JSON.stringify(event.data.result.address))
    localStorage.setItem('position', JSON.stringify(event.data.result.position))
})

$('.tt-search-box-input').attr('placeholder', 'Country/City')

$(document).ready(function() {
    homeSearch.addEventListener('click', search);
})

// $('.featured-pet-slider').slick({
//     infinite: true,
//     dots: true,
//     slidesToShow: 1,
//     slidesToScroll: 1
// });
