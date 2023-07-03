import { tomtomAPI } from './config.js'
// const locationQuery = localStorage.getItem('location-query')

// if(locationQuery != null || locationQuery != '') {
//     document.getElementById('query').value = locationQuery
// }

const homeSearch = document.getElementById('submit')

const search = (e) => {
    e.preventDefault()
    //let location = document.getElementById('query').value
    let type = document.getElementById('type').value
    let source = document.getElementById('source').value

    
    localStorage.setItem('type', type)
    localStorage.setItem('source', source)
    
    //locationSearch(location)
    
    

    

    setTimeout(function() {
        window.location.href = 'http://127.0.0.1:5500/main/animals.html';
    }, 3000)
}

let mapContainer = document.getElementById('map')
let marker

var map = tt.map({
    key: tomtomAPI,
    container: mapContainer,
    center:  [-123.120735, 49.282730],
    zoom: 14
})

// searching
var locationSearch = (setLocation) => {
    console.log(setLocation);

    tt.services.fuzzySearch({
      key: tomtomAPI,
      query: setLocation,
      //boundingBox: map.getBounds()

    }).then(handleResult)
  
    localStorage.setItem('location-query', setLocation)
  
}

var handleResult = function(response) {
    console.log(response)
    if(response.results) {
        let position = response.results[0].position
        moveMap(position)
        localStorage.setItem('position', JSON.stringify(position))

        marker = new tt.Marker()
                    .setLngLat(position)
                    .addTo(map)
    }
}


var moveMap = function(lnglat) {
    map.flyTo({
        center: lnglat,
        zoom: 14
    })
}

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
document.querySelector('form').appendChild(ttSearchBox.getSearchBoxHTML());

ttSearchBox.on('tomtom.searchbox.resultselected', function(event) {
    console.log(event.data.result.address)
    console.log(event.data.result.position)
    localStorage.setItem('location-query', JSON.stringify(event.data.result.address))
    localStorage.setItem('position', JSON.stringify(event.data.result.position))
})

// var state = {
//     previousOptions: {
//         query: null,
//         center: null
//     },
//     callbackId: null,
//     userLocation: null
// };

// map.addControl(new tt.FullscreenControl({container: document.querySelector('body')}));
// map.addControl(new tt.NavigationControl());


// var geolocateControl = new tt.GeolocateControl({
//     positionOptions: {
//         enableHighAccuracy: false
//     }
// });

// geolocateControl.on('geolocate', function(event) {
//     var coordinates = event.coords;
//     state.userLocation = [coordinates.longitude, coordinates.latitude];
//     ttSearchBox.updateOptions(Object.assign({}, ttSearchBox.getOptions(), {
//         distanceFromPoint: state.userLocation
//     }));
// });

// map.addControl(geolocateControl);
// map.on('moveend', handleMapEvent);

// function handleMapEvent() {
//     // Update search options to provide geobiasing based on current map center
//     var oldSearchOptions = ttSearchBox.getOptions().searchOptions;
//     var oldautocompleteOptions = ttSearchBox.getOptions().autocompleteOptions;
//     var newSearchOptions = Object.assign({}, oldSearchOptions, { center: map.getCenter() });
//     var newAutocompleteOptions = Object.assign({}, oldautocompleteOptions, { center: map.getCenter() });
//     ttSearchBox.updateOptions(Object.assign({}, searchBoxOptions, {
//         placeholder: 'Query e.g. Washington',
//         searchOptions: newSearchOptions,
//         autocompleteOptions: newAutocompleteOptions,
//         distanceFromPoint: state.userLocation
//     }));
//     console.log(ttSearchBox.getOptions())
// }



// var updateSearchOptions = function() {
//     let options = tt.SearchBox.getOptions()
//     options.searchOptions.boundingBox = map.getBounds()
//     ttSearchBox.updateOptions(options)
//     console.loh(options)
// }

// map.on('dragend', function() {
//     updateSearchOptions()
// })
$(document).ready(function() {
    homeSearch.addEventListener('click', search);

    // let location = document.getElementById('query').value
    // let type = document.getElementById('type').value
    // let source = document.getElementById('source').value

    // if(location == '' || type == '' || source == '') {
    //     document.getElementById('submit').disabled = true; 
    // }

})
