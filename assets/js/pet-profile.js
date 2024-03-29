import { getFirestore, getDoc, getDocs, doc, query, where, collection } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'


// init the firestore and storage
const db = getFirestore(app)
const storage = getStorage(app);

// Initialize Authentication
const auth = getAuth(app)


const queryString = window.location.search;
const params = new URLSearchParams(queryString);

const id = params.get("id");

//references
const petRef = doc(db, "animals", id)      


let photoLength

if(localStorage.getItem('source') == 'owner') {
    let photoArr
    getDoc(petRef).then(docSnap => {

        let data = docSnap.data();
        console.log(data)
        let photo = data.photo;
        photoArr = data.photo;
        let owner_id = data.owner_id;
        const ownRef = doc(db, "accounts", owner_id)
    
        getDoc(ownRef).then(ownSnap => {
            let owndata = ownSnap.data();
            let ofname = owndata.firstName;
            let olname = owndata.lastName;

            document.querySelector('.pet-name').innerHTML = `${data.name}`
            document.querySelector('.pet-description').innerHTML = `${data.desc}`
            document.querySelector('.pet-location').innerHTML = `<img src="../assets/icons/pin-orange.svg" alt="paw icon"> ${data.location.city}, ${data.location.state}`
            document.querySelector('.pet-age').innerHTML = `<img src="../assets/icons/paw-orange.svg" alt="paw icon"> ${data.age}`
            document.querySelector('.pet-size').innerHTML = `<img src="../assets/icons/paw-orange.svg" alt="paw icon"> ${data.size}`
            document.querySelector('.pet-organization').innerHTML = `<img src="../assets/icons/house-orange.svg" alt="paw icon"> ${ofname}, ${olname}`
            document.querySelector('.pet-breed').innerHTML = `<img src="../assets/icons/paw-orange.svg" alt="paw icon"> ${data.breed}`
            document.querySelector('.pet-gender').innerHTML = `<img src="../assets/icons/paw-orange.svg" alt="paw icon"> ${data.gender}`

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    $('.adopt-btn').append([
                        $('<button />', {'text': 'Apply to Adopt', 'class': 'filled-default font','onclick': `window.location.href='pet-inquiries.html?pet_id=${id}&own_id=${owndata.uid}'`})
                    ])
                } else {
                    $('.adopt-btn').append([
                        $('<button />', {'text': 'Apply to Adopt', 'class': 'filled-default font','onclick': `window.location.href='login.html'`})
                    ])
                }
            })
        })

        for(let x in photoArr) {
            $('.gallery').append([
                $('<div />').append([
                    $('<a />').append([
                        $('<img />', {'src': `${photoArr[x]}`})
                    ])
                ])
            ])

            $('.slider-profile').append([
                $('<div />').append([
                    $('<a />').append([
                        $('<img />', {'src': `${photoArr[x]}`})
                    ])
                ])
            ])
        }

        photoLength = photoArr.length

        runSlider()
    })
    
} else if (localStorage.getItem('source') == 'shelter') {
    let outputObj = JSON.parse(localStorage.getItem('outputObj'));
    for (const el of outputObj) {
        if(el.id == id) {
            document.querySelector('.pet-name').innerHTML = `${el.name}`
            document.querySelector('.pet-description').innerHTML = `${el.description}`
            document.querySelector('.pet-location').innerHTML = `<img src="../assets/icons/pin-orange.svg" alt="location icon"> ${el.contact.address.city}, ${el.contact.address.state}`
            document.querySelector('.pet-age').innerHTML = `<img src="../assets/icons/paw-orange.svg" alt="paw icon"> ${el.age}`
            document.querySelector('.pet-size').innerHTML = `<img src="../assets/icons/paw-orange.svg" alt="paw icon"> ${el.size}`
            document.querySelector('.pet-organization').innerHTML = `<img src="../assets/icons/house-orange.svg" alt="paw icon"> ${el.organization_id}`
            document.querySelector('.pet-breed').innerHTML = `<img src="../assets/icons/paw-orange.svg" alt="paw icon"> ${el.species}`
            document.querySelector('.pet-gender').innerHTML = `<img src="../assets/icons/paw-orange.svg" alt="paw icon"> ${el.gender}`
            $('.adopt-btn').append([
                $('<button />', {'text': 'Apply to Adopt', 'class': 'filled-mob-btn font', 'onclick': `window.location.href='pet-inquiries.html?pet_id=${id}&own_id=${el.organization_id}'`})
            ])
            let photos = el.photos
            const photoArr= photos.map(element => element.medium);

            for(let x in photoArr) {
                console.log(photoArr[x])
                $('.gallery').append([
                    $('<div />').append([
                        $('<a />').append([
                            $('<img />', {'src': `${photoArr[x]}`})
                        ])
                    ])
                ])

                $('.slider-profile').append([
                    $('<div />').append([
                        $('<a />').append([
                            $('<img />', {'src': `${photoArr[x]}`})
                        ])
                    ])
                ])
            }

            photoLength = photoArr.length
            //$('.slider-profile').slick('unslick');
            
        }
    }
    runSlider()
}


function runSlider() {
    $('.slider-for').not('.slick-initialized').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        fade: true,
        useTransform: false,
        asNavFor: '.slider-nav'
    });

    $('.slider-nav').not('.slick-initialized').slick({
        slidesToShow: photoLength,
        slidesToScroll: 1,
        asNavFor: '.slider-for',
        dots: false,
        // centerMode: true,
        focusOnSelect: true,
        useTransform: false
    });
}



