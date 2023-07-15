import { getFirestore, getDoc, query, where, doc, getDocs, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'
import { imageUpload, uploadToStorage } from './global-functions.js';

// init the firestore and storage
const db = getFirestore(app)

// Initialize Authentication
const auth = getAuth(app)

//references
const adoptJourney = collection(db, 'adoptionJourney')
const aniRef = collection(db, "animals")
const accRef = collection(db, "accounts")


// adoption journey class
class adoptStory{
    constructor(title, body, posted_at, petName, userId, firstName, lastName, city, state, photo){
        this.title = title;
        this.body = body; 
        this.posted_at = posted_at;
        this.petName = petName
        this.authorDetails = {
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            city: city,
            state: state
        }
        this.photo = photo;
    }
}



const addStory = document.querySelector('.adopted-story')
// add story button
const addStoryBtn = document.getElementById('add-story');
const adoptedUser = document.querySelector('.adopted-user')

// adopt user form inputs
let firstName = document.getElementById('user-fname');
let lastName = document.getElementById('user-lname');
let city = document.getElementById('city');
let state = document.getElementById('state');

onAuthStateChanged(auth, (adoptuser) => {
    if (adoptuser) {

        const uidRef = doc(db, "accounts", adoptuser.uid); 
        let userId = adoptuser.uid;

        getDoc(uidRef).then(userDoc => {
            let data = userDoc.data();
            
            firstName.value = data.firstName;
            lastName.value = data.lastName;
            city.value = data.address.city;
            state.value = data.address.state;

        })

        addStoryBtn.addEventListener('click', (e) => {
            e.preventDefault()
            handleAdoptStory(userId, firstName, lastName, city, state)
        })

    }
})



async function handleAdoptStory(userId, firstName, lastName, city, state) {
    const docRef = doc(db, "accounts", userId); 
    const imagesArr = [];
    let petName = document.getElementById('petname');
    let storytitle = document.getElementById("story-title");
    let storybody = document.getElementById("body");
    let posted_at = new serverTimestamp();
    let photo = myFile.files
            
    // for saving photos to firestore
    uploadToStorage(photo, imagesArr, docRef)
    const photos = await Promise.all(imagesArr);
    console.log(photos);  
            

    setTimeout(() => {
        const adopt = new adoptStory(storytitle.value, storybody.value, posted_at, petName.value, userId, firstName.value, lastName.value, city.value, state.value, photos);
        
        $('.modal.spinner').removeClass('modal-active')
        addDoc(adoptJourney, Object.assign({}, adopt))
        .then(() => {
            addStory.reset();
            adoptedUser.reset();
            document.querySelector('.displayImages').innerHTML = ''
            $('.success-modal').addClass('modal-active');
        })
    }, 5000)

    $('.modal.spinner').addClass('modal-active')
}

imageUpload()