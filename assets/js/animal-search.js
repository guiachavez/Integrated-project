import { getFirestore, collection, getDocs, getDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'
import { petfinderAPI, token } from './config.js'
import { tomtomAPI } from './config.js'
import { changeAttr, ownerDropdown } from "./../js/color-breed-dropdown.js";
 

// init the firestore and storage
const db = getFirestore(app)
const storage = getStorage(app);
const auth = getAuth(app)

// collection refererence
const aniRef = collection(db, 'animals')

// filter function    
const searchAnimals = document.querySelector('.search')
let urlParam
let searchParamsObj


// for location - tomtom searchbox plugin
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
document.querySelector('.search-location').appendChild(ttSearchBox.getSearchBoxHTML());

ttSearchBox.on('tomtom.searchbox.resultselected', function(event) {
    localStorage.setItem('location-query', JSON.stringify(event.data.result.address))
    localStorage.setItem('position', JSON.stringify(event.data.result.position))

    homeSearch()
})


//when the load page this function will be called
const homeSearch = () => {
    let source = localStorage.getItem('source')
    let type = localStorage.getItem('type')
    let locationText = JSON.parse(localStorage.getItem('location-query'))
    let position = JSON.parse(localStorage.getItem('position'))
    let breed = document.getElementById('breed').value;
    let age = document.querySelector('input[name="age"]:checked').value;
    let gender = document.querySelector('input[name="gender"]:checked').value;
    let size = document.querySelector('input[name="size"]:checked').value;
    let color = document.getElementById('color').value;
    let goodWithChildren = JSON.parse(document.querySelector('input[name="children"]:checked').value);
    let houseTrained = JSON.parse(document.querySelector('input[name="trained"]:checked').value);
    let orgId = localStorage.getItem('orgId')
    let latlong

    if (position.lng == undefined) {
        latlong = `${position.lat},${position.lon}`
    } else {
        latlong = `${position.lat},${position.lng}`
    }

    if (source || type) {

        document.getElementById('pet-type').value = type
        document.getElementById('source').value = source
        //document.getElementById('location').value = locationText.freeformAddress
        document.querySelector('.tt-search-box-input').value = locationText.freeformAddress
      
        $('#filtered-pets').empty()

        if (source == 'owner') {
            let ageArr = age.split(",");
            let sizeArr = size.split(",");
            let genderArr = gender.split(",");

            searchOwner(color, breed, type, ageArr, sizeArr, genderArr, goodWithChildren, houseTrained)
            ownerDropdown()
            $('.organization').css('display', 'none')
        } else {
            searchPetFinder(type, breed, age, gender, size, color, goodWithChildren, houseTrained, orgId, latlong)
            changeAttr(latlong)
            $('.organization').css('display', 'block')

        }
    } else {
        $('.search-check').addClass('modal-active')
    } 
    
}

// when apply filter/button was clicked call this function
const loadFilter = ()=> {
    let type = document.getElementById('pet-type').value;
    let source = document.getElementById('source').value;
    let breed = document.getElementById('breed').value;
    let age = document.querySelector('input[name="age"]:checked').value;
    let gender = document.querySelector('input[name="gender"]:checked').value;
    let size = document.querySelector('input[name="size"]:checked').value;
    let color = document.getElementById('color').value;
    let goodWithChildren = JSON.parse(document.querySelector('input[name="children"]:checked').value);
    let houseTrained = JSON.parse(document.querySelector('input[name="trained"]:checked').value);
    let orgId = document.getElementById('orgId').value;

    let position = JSON.parse(localStorage.getItem('position'))
    let latlong

    if (position.lng == undefined) {
        latlong = `${position.lat},${position.lon}`
    } else {
        latlong = `${position.lat},${position.lng}`
    }
    
    //convert values to array
    let ageArr = age.split(",");
    let sizeArr = size.split(",");
    let genderArr = gender.split(",");

    localStorage.setItem('source', source);

    $('#filtered-pets').empty();
    if (source == 'owner') {
        searchOwner(color, breed, type, ageArr, sizeArr, genderArr, goodWithChildren, houseTrained)

        // setting up objects for url params
        //urlParam = {'color': color, 'breed': breed, 'type': type, 'source': source, 'age': ageArr, 'size': sizeArr, 'gender': genderArr, 'goodWithChildren': goodWithChildren, 'houseTrained': houseTrained}

    } else {
        //loadUserLocation()
        searchPetFinder(type, breed, age, gender, size, color, goodWithChildren, houseTrained, orgId, latlong)

        // setting up objects for url params
        //urlParam = {'type': type, 'source': source, 'breed': breed, 'age': age, 'gender': gender, 'size': size, 'color': color, 'goodWithChildren': goodWithChildren, 'houseTrained': houseTrained, 'orgId': orgId, 'userLocationString': userLocationString}
    }

    // adding params to url
    // searchParamsObj = Object.assign({}, urlParam)
    // let param = jQuery.param( searchParamsObj );
    // window.history.replaceState(null, null, `?${param}`);

    // settingup local storage
    localStorage.setItem('searchParams', JSON.stringify(searchParamsObj));

    if($('.filter').is(':visible') == true) {
        searchFilters.style.display = 'none';
        closeFilter.style.display = 'none';
        searchResult.style.display = 'block'
        filterClicked = false;
    }
}

const reLoadFilter = ()=> {
    let oldParams = JSON.parse(localStorage.getItem('searchParams'))

    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const id = params.get("type");

    if(id != '') {
        if (localStorage.getItem('source') == 'owner') {
            searchOwner(oldParams.color, oldParams.breed, oldParams.type, oldParams.age, oldParams.size, oldParams.gender, oldParams.goodWithChildren, oldParams.houseTrained)
        } else if (localStorage.getItem('source') == 'shelter') {
            searchPetFinder(oldParams.type, oldParams.breed, oldParams.age, oldParams.gender, oldParams.size, oldParams.color, oldParams.goodWithChildren, oldParams.houseTrained, oldParams.orgId, oldParams.userLocationString)
        }
    }
    //convert values to array
    // let ageArr = age.split(",");
    // let sizeArr = size.split(",");
    // let genderArr = gender.split(",");
}



async function searchOwner(color, breed, type, ageArr, sizeArr, genderArr, goodWithChildren, houseTrained) {
    
    let userId

    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid
        } else {
            userId = ''   
        }
    })
        
        let breedArr = []; 
        
        if (breed == '') {
            const typeRef = doc(db, "types", type)

            try {
                const docSnap = await getDoc(typeRef);
                if (docSnap.exists()) {
                    breedArr = docSnap.data().breeds;
                }
            } catch (e) {
                console.log(e);
            }

        } else {
            breedArr = breed.split(",");
        };
            
        let colorArr = []; 
            
        if (color == '') {
            const typeRef = doc(db, "types", type)

            try {
                const docSnap = await getDoc(typeRef);
                if (docSnap.exists()) {
                    colorArr = docSnap.data().colors;
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            colorArr = color.split(",");
        };

        let location = JSON.parse(localStorage.getItem('location-query'))
        let city = location.municipality
        let country = location.country

        const q = query(aniRef,
            where("type", "==", type), 
            where("age", "in", ageArr), 
            where("size", "in", sizeArr), 
            where("attributes.good_with_children", "==", goodWithChildren),
            where("attributes.house_trained", "==", houseTrained),
            where("location.city", "==", city),
            where("location.country", "==", country),
            where("owner_id", "!=", userId))

            try {
                const querySnapshot = await getDocs(q);
                const results = []

                console.log(querySnapshot)
                querySnapshot.forEach((doc) => {
                    results.push([doc.id,doc.data()])
                })

                for(const i in results) {
                    if(results[i][1].isAdopted != true) {
                        if (genderArr.indexOf(results[i][1].gender) > -1) {                  
                            if (breedArr.indexOf(results[i][1].breed) > -1) {
                                if (colorArr.indexOf(results[i][1].color) > -1) {
                                    let petPhoto = results[i][1].photo
                                    let isArr = Array.isArray(petPhoto)
    
                                    $('#filtered-pets').append([
                                        $('<div />', {'class': `pet pet-${i}`, 'data-id': `${results[i][0]}`}).append([
                                            $('<div />', {'class': 'pet-photos slider'})
                                        ]).append([
                                            $('<div />', {'class': 'pet-details'}).append([
                                                $('<p />', {text: `${results[i][1].name}`, class: 'pet-name'}),
                                                $('<p />', {text: `${results[i][1].gender}, ${results[i][1].breed}` }),
                                                $('<p />', {text: `${results[i][1].location.city}, ${results[i][1].location.country}`, class: 'pet-location'}) 
                                            ])
                                        ])        
                                    ])
    
                                    if(!isArr) {
                                        $(`.pet-${i} .pet-photos`).append([
                                            $('<div />', {'class': 'pet-img'}).append([
                                                $('<a />', {'href': `./../main/pet-details.html?id=${results[i][0]}`}).append([
                                                    $('<img>', {'src': `${results[i][1].photo}`})
                                                ])
                                            ])
                                        ])
                                    } else {
                                        for(const key in petPhoto) {
                                            $(`.pet-${i} .pet-photos`).append([
                                                $('<div />', {'class': `pet-img`}).append([
                                                    $('<a />', {'href': `./../main/pet-details.html?id=${results[i][0]}`}).append([
                                                        $('<img>', {'src': petPhoto[key]})
                                                    ])
                                                ])
                                            ])
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (document.getElementById('filtered-pets').hasChildNodes() == false) {
                    $('#filtered-pets').append([
                        $('<div />', {'class': 'no-results'}).append([
                            $('<h2 />', {'text': 'No results found'}),
                            $('<p />', {'text': "Try adjusting your search or filter to find what you're looking for."}),
                            $('<img />', {'src': './../assets/images/cat-404.png'})
                        ])
                    ])
                }
                
                $('.slider').slick({
                    infinite: true,
                    dots: true,
                    slidesToShow: 1,
                    slidesToScroll: 1
                });
            } catch (e) {
                console.log(e);
            }        
}         

// renewing token for petfinder API
var petObj;
var searchPetFinder = (type, breed, age, gender, size, color, goodWithChildren, houseTrained, orgId, location) => {
    console.log("searchPetFinder")
    fetch('https://api.petfinder.com/v2/oauth2/token', {
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + petfinderAPI + '&client_secret=' + token,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        return fetch(`https://api.petfinder.com/v2/animals?type=${type}&breed=${breed}&age=${age}&gender=${gender}&size=${size}&color=${color}&good_with_children=${goodWithChildren}&house_trained=${houseTrained}&organization=${orgId}&location=${location}&distance=10`, {
            headers: {
                'Authorization': data.token_type + ' ' + data.access_token,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }).then(function (resp) {
        // Return the API response as JSON
        return resp.json();
    }).then(function (data) {
        console.log('pets', data);
        // APPEND PET RESULTS TO FRONT END
        for(const pet in data) {
            if(pet == 'animals') {
                petObj = data[pet];
                for(const i in petObj) {
                    $('#filtered-pets').append([
                        $('<div />', {'class': `pet pet-${i}`}).append([
                            $('<div />', {'class': 'pet-photos slider'})
                        ]).append([
                            $('<div />', {'class': 'pet-details'}).append([
                                $('<p />', {text: `${petObj[i].name}`, class: 'pet-name'})
                            ]).append([
                                $('<p />', {text: `${petObj[i].gender}, ${petObj[i].breeds.primary}` }),
                                $('<p />', {text: `${petObj[i].contact.address.city}, ${petObj[i].contact.address.country}`, class: 'pet-location'}) 

                                
                            ])
                        ])
                    ])

                    for(const photo in petObj[i].photos) {
                        $(`.pet-${i} .pet-photos`).append([
                            $('<div />', {'class': `pet-img`}).append([
                                $('<a />', {'href': `./../main/pet-details.html?id=${petObj[i].id}`}).append([
                                    $('<img>', {'src': petObj[i].photos[photo].medium})
                                ])
                            ])
                        ])
                    }
                }

                $('.slider').slick({
                    infinite: true,
                    dots: true,
                    slidesToShow: 1,
                    slidesToScroll: 1
                });
            }
        }

        if (document.getElementById('filtered-pets').hasChildNodes() == false) {
            $('#filtered-pets').append([
                $('<div />', {'class': 'no-results'}).append([
                    $('<h2 />', {'text': 'No results found'}),
                    $('<p />', {'text': "Try adjusting your search or filter to find what you're looking for."}),
                    $('<img />', {'src': './../assets/images/cat-404.png'})
                ])
            ])
        }
        // save the pet search result to local storage to access to pet-details.html
        localStorage.setItem('outputObj', JSON.stringify(petObj));
    }).catch((err) => {
        console.log(err)
    })
}

var userLocation;
var userLocationString;

export function storeUserLocation(location) {
    userLocation = [location.coords.longitude, location.coords.latitude];
    userLocationString = userLocation[1].toString() + ", " + userLocation[0].toString();
}
export function loadUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(storeUserLocation);
    }
}

export {userLocationString, userLocation}

$(document).ready(function() {
    const displayOrg = () => {
        $('.where-from-selector').on('change', function() {
            localStorage.setItem('source', $(this).val())

            if($(this).val() == 'shelter') {
                $('.organization').css('display', 'block')
            } else {
                $('.organization').css('display', 'none')
            }
        })

        $('.petSelector').on('change', function() {
            localStorage.setItem('type', $(this).val())
        })
    }
    displayOrg()
    loadUserLocation();

    $('#orgId').on('change', function() {
        localStorage.setItem('orgId', $(this).val())
    })

    searchAnimals.addEventListener('submit', loadFilter)

    // if(localStorage.getItem('searchParams') != undefined) {

    //     if(localStorage.getItem('source') == 'shelter') {
    //         $('.organization').css('display', 'block')
    //     } else {
    //         $('.organization').css('display', 'none')
    //     }
    //     reLoadFilter()
    // }

    $('.home-search button').on('click', function(e) {
        e.preventDefault();
        if($('#form-type').val() == null || $('#form-source').val() == null) {
            $('.alert').css('display', 'block')
        } else {
            $('.search-check').removeClass('modal-active')
            homeSearch()
        }
    })

    homeSearch()
})

const filters = document.querySelector('.filter-icon');
const searchFilters = document.querySelector('.search-filter');
const closeFilter = document.querySelector('.close-icon');
const searchResult = document.querySelector('.search-result')
let filterClicked = false;

filters.addEventListener("click", function(){
    searchFilters.style.display = 'block';
    closeFilter.style.display = 'block';
    searchResult.style.display = 'none'
    filterClicked = true;
});

closeFilter.addEventListener("click", function(){
    searchFilters.style.display = 'none';
    closeFilter.style.display = 'none';
    searchResult.style.display = 'block'
    filterClicked = false;
});

window.addEventListener('resize', function() {
    let screenWidth = this.window.innerWidth;
    if(screenWidth < 820 && !filterClicked){
        searchFilters.style.display = 'none';
        closeFilter.style.display = 'none';
    }
    else if(screenWidth > 820 && filterClicked){
        filterClicked = false;
        searchResult.style.display = 'block'
    }
    else{
        searchFilters.style.display = 'block';
        closeFilter.style.display = 'block';
    }
})