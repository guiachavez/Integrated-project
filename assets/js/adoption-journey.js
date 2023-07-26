import { getFirestore, getDoc, query, where, doc, getDocs, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'
import { imageUpload, uploadToStorage } from './global-functions.js';
import { getStorage, uploadString, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

// init the firestore and storage
const db = getFirestore(app)

// Initialize Authentication
const auth = getAuth(app)
const storage = getStorage();

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

var cameraphoto

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
            console.log(photo.length)
    if (photo.length == 0) {
        const storageRef = ref(storage, "adoptionImages/" + docRef.id + "/" + `story_photo_${Date.now()}`);
        imagesArr.push(uploadString(storageRef, cameraphoto, 'data_url').then((snapshot) => {
                console.log('Uploaded a data_url string!');
                return getDownloadURL(snapshot.ref)
            })
        )

        const photos = await Promise.all(imagesArr);
        updateDB(photos);
    } else {
        // for saving photos to firestore
        uploadToStorage(photo, imagesArr, docRef)
        const photos = await Promise.all(imagesArr);
        console.log(photos);  
    }
    
    function updateDB(photos) {
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
}

imageUpload()

//camera function

var width = 320; // We will scale the photo width to this
var height = 0; // This will be computed based on the input strea
var streaming = false
var video = null;
var canvas = null;
var photo = null;
var startbutton = null;
var choosebutton = document.getElementById('choosebutton')

function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementById('startbutton');
    

    navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            console.log("An error occurred: " + err);
        });

    video.addEventListener('canplay', function(ev) {
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width);

            if (isNaN(height)) {
                height = width / (4 / 3);
            }

            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    }, false);

    startbutton.addEventListener('click', function(ev) {
        $('.camera-output').css('display', 'block')
        takepicture();
        ev.preventDefault();
    }, false);

    clearphoto();
}

choosebutton.addEventListener('click', function(ev) {
        startup();
        startbutton.style.display = 'block'
        ev.preventDefault();
})


function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
}


function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);

        cameraphoto = canvas.toDataURL('image/png');
        photo.setAttribute('src', cameraphoto);
    } else {
        clearphoto();
    }
}

        // window.addEventListener('load', startup, false);