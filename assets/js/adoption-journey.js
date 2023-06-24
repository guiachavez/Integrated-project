import { getFirestore, getDoc, setDoc, doc, updateDoc, arrayUnion, addDoc, collection } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'


// init the firestore and storage
const db = getFirestore(app)
const storage = getStorage(app);

// Initialize Authentication
const auth = getAuth(app)

//references
const adoptJourney = collection(db, 'adoptionJourney')

// class for user
class userDetails{
    constructor(phone, street, city, country, pcode, state) {
        this.phone = phone;
        this.address = {
            street: street,
            city: city,
            country: country,
            postcode: pcode,
            state: state
        }
    }
}

// adoption journey class
class adoptStory{
    constructor(title, desciption, ownerId){
        this.title = title;
        this.desciption = desciption;
        this.userID = ownerId;
    }
}

// adopt owner form
const adoptUserForm = document.querySelector(".adopted-user");

// submit button for adopt form
const adoptUserBtn = document.getElementById("story-owner");

// adoption story form
const addStoryForm = document.querySelector(".adopted-story");

// add story button
const addStoryBtn = document.getElementById("add-story");

// adopt user form inputs
let fname = document.getElementById('user-fname');
let lname = document.getElementById('user-lname');
let email = document.getElementById('user-email');
let phone = document.getElementById('phone');
let country = document.getElementById('country');
let city = document.getElementById('city');
let state = document.getElementById('state');
let pcode = document.getElementById('postal-code');
let street = document.getElementById('street');

onAuthStateChanged(auth, (adoptuser) => {
    if (adoptuser) {
        const uidRef = doc(db, "accounts", adoptuser.uid); 
        const userid = adoptuser.uid;

        getDoc(uidRef).then(userDoc => {
            let data = userDoc.data();
            console.log(data)
            fname.value = data.firstName;
            lname.value = data.lastName;
            email.value = data.email;

            let checkAddress = data.hasOwnProperty('address');
            console.log(checkAddress)
            let isOwner = data.isOwner;

            if(checkAddress) {
                street.value = data.address.street
                city.value = data.address.city
                state.value = data.address.state
                pcode.value = data.address.postcode
                country.value = data.address.country
            }

            console.log(isOwner)

            adoptUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('called')
                handleAdoptUserForm(adoptuser, phone, street, city, country, pcode, state)
            })

            addStoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleAdoptStory(userid)
            })
        })
    }
})

function handleAdoptUserForm(user, phone, street, city, country, pcode, state) {
    const userdetails = new userDetails(phone.value, street.value, city.value, country.value, pcode.value, state.value)

    const docAdopt = doc(db, 'accounts', user.uid)
    setDoc(docAdopt, Object.assign({}, userdetails,),  { merge: true })
        .then(() => {
            adoptUserForm.reset()
        })
    .catch((err) => {
        console.log(err.message)
        //add frontend display here for error message
    })
}

function handleAdoptStory(userid){
    const docStory = doc(db, 'adoptionJourney', userid);

    console.log(docStory);

    let storytitle = document.getElementById("story-title");
    let storydesc = document.getElementById("desc");

    setTimeout(() => {
        const adopt = new adoptStory(storytitle.value, storydesc.value, userid);

        addDoc(adoptJourney, Object.assign({}, adopt))
        .then(() => {
            addStoryForm.reset();
        })
    }, 5000)
}