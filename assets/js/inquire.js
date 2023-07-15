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
    constructor(appId, afname, alname, petownerId, pofname, polname, petId, petname, inquired_at, inquiryId, isAccepted, adopt, owner, restriction, children, sneeds, vet, typeArr, houseArr, ageArr, genderArr, sizeArr, petactArr) {
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
        this.adopt = adopt;
        this.owner = owner;
        this.restriction = restriction;
        this.children = children;
        this.sneeds = sneeds;
        this.vet = vet;
        this.pettype = typeArr;
        this.house = houseArr;
        this.petage = ageArr;
        this.petgender = genderArr;
        this.petsize = sizeArr;
        this.petactivity = petactArr;
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

                // radio button values
                let adopt = document.querySelector('input[name="adopting"]:checked').value;
                let owner = document.querySelector('input[name="owner"]:checked').value;
                let restriction = document.querySelector('input[name="restriction"]:checked').value;
                let children = document.querySelector('input[name="children"]:checked').value;
                let sneeds = document.querySelector('input[name="splneeds"]:checked').value;
                let vet = document.querySelector('input[name="vet"]:checked').value;

                // checkbox values
                let petType = document.querySelectorAll('input[id="pettype"]:checked')
                let house = document.querySelectorAll('input[id="house"]:checked')
                let petAge = document.querySelectorAll('input[id="petage"]:checked')
                let petGender = document.querySelectorAll('input[id="petgender"]:checked')
                let petSize = document.querySelectorAll('input[id="petsize"]:checked')
                let petAct = document.querySelectorAll('input[id="petactivity"]:checked')

                // array to store checkbox values
                let typeArr = [];
                for(let i=0; i<petType.length; i++){
                    typeArr.push(petType[i].value)
                }
                let houseArr = [];
                for(let i=0; i<house.length; i++){
                    houseArr.push(house[i].value)
                }
                let ageArr = [];
                for(let i=0; i<petAge.length; i++){
                    ageArr.push(petAge[i].value)
                }
                let genderArr = [];
                for(let i=0; i<petGender.length; i++){
                    genderArr.push(petGender[i].value)
                }
                let sizeArr = [];
                for(let i=0; i<petSize.length; i++){
                    sizeArr.push(petSize[i].value)
                }
                let petactArr = [];
                for(let i=0; i<petAct.length; i++){
                    petactArr.push(petAct[i].value)
                }
                
                if(localStorage.getItem('source') == 'owner') {
                    const appdetails = new appDetails(appId, afname.value, alname.value, petownerId, pofname, polname, petId, petname, inquired_at, inquiryId, isAccepted, adopt, owner, restriction, children, sneeds, vet, typeArr, houseArr, ageArr, genderArr, sizeArr, petactArr)
                    console.log(appdetails)
                    
                    setTimeout(() => {
                        setDoc(inqRef, Object.assign({}, appdetails))
                            .then(() => {

                                inquirePet.reset();
                                $('.modal.spinner').removeClass('modal-active')
                                
                                $('.success-modal').addClass('modal-active');
                            })
                    }, 2000)

                    $('.modal.spinner').addClass('modal-active')
                   
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