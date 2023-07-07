import { getFirestore, getDoc, doc, collection, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'

// init
const db = getFirestore(app)
const auth = getAuth(app)

//get url params
const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const pet_id = params.get("pet_id");
const own_id = params.get("own_id");

// refs
const inqRef = doc(collection(db, 'inquiries'))
// for targeting specific document
const accRef = doc(db, 'accounts', own_id)
const petRef = doc(db, 'animals', pet_id)


console.log(own_id, pet_id)
class appDetails {
    constructor(appId, afname, alname, petownerId, pofname, polname, petId, petname, inquired_at, inquiryId, isAccepted) {
        this.applicant = {
            applicantId: appId,
            app_firstName: afname,
            app_lastName: alname
        };
        this.petowner = {
            petownerId: petownerId,
            po_firstName: pofname,
            po_lastName: polname
        };
        this.petId = petId;
        this.petname = petname;
        this.inquired_at = inquired_at;
        this.inquiryId = inquiryId;
        this.isAccepted = isAccepted;
    }
}

const submit = document.getElementById('inquire-now');
const inquirePet = document.querySelector('.inquire-pet');

//inputs
let afname = document.getElementById('app-first-name');
let alname = document.getElementById('app-last-name');
let email = document.getElementById('app-email');
let phone = document.getElementById('app-phone');
let country = document.getElementById('app-country');
let city = document.getElementById('app-city');
let state = document.getElementById('app-state');
let pcode = document.getElementById('app-pcode');
let street = document.getElementById('app-street');

const getUserDetails = (petownerId, pofname, polname, petId, petname) => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const appRef = doc(db, "accounts", user.uid); 
            getDoc(appRef).then(docSnap => {
                let data = docSnap.data();
    
                afname.value = data.firstName;
                alname.value = data.lastName;
                email.value = data.email;
                phone.value = data.phone;
                country.value = data.address.country;
                city.value = data.address.city;
                state.value = data.address.state;
                pcode.value = data.address.postcode;
                street.value = data.address.street;
            })

            let appId = user.uid;
            let inquired_at = new serverTimestamp();
            let inquiryId = inqRef.id
            let isAccepted = "init"
            console.log(inquiryId)

            submit.addEventListener('click', (e) => {
                e.preventDefault();
                
                if(localStorage.getItem('source') == 'owner') {
                    const appdetails = new appDetails(appId, afname.value, alname.value, petownerId, pofname, polname, petId, petname, inquired_at, inquiryId, isAccepted)
                    console.log(appdetails)
        
                    setDoc(inqRef, Object.assign({}, appdetails))
                        .then(() => {
                            inquirePet.reset();
                        })
                } else {
                    let outputObj = JSON.parse(localStorage.getItem('outputObj'));
                    console.log(outputObj)
                }
                
            })
        }
    })
}

if(localStorage.getItem('source') == 'owner') {
    getDoc(accRef).then(ownSnap => {

        let owndata = ownSnap.data();

        let petownerId = owndata.uid;
        let pofname = owndata.firstName;
        let polname = owndata.lastName;


        getDoc(petRef).then(petSnap => {

            let petdata = petSnap.data();

            let petId = petSnap.id;
            let petname = petdata.name;

            getUserDetails(petownerId, pofname, polname, petId, petname)
        })
    })
} else if (localStorage.getItem('source') == 'shelter') {
    getUserDetails();
}

