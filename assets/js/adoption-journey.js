import { getFirestore, getDoc, query, where, doc, getDocs, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'


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
    constructor(title, body, posted_at, petName, petId, ownerId, ownerFname, ownerLname, userId, firstName, lastName, city, state){
        this.title = title;
        this.body = body; 
        this.posted_at = posted_at;
        this.petDetails = {
            petName: petName,
            petId: petId,
            ownerId: ownerId,
            ownerFname: ownerFname,
            ownerLname: ownerLname
        }
        this.authorDetails = {
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            city: city,
            state: state
        }
    }
}

let newOption = new Option('Option Text','Option Value');

const addStory = document.querySelector('.adopted-story')
// add story button
const addStoryBtn = document.getElementById("add-story");

const ownerList = document.getElementById('owners');
const petList = document.getElementById('ownerspets');

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
              
        getDocs(accRef).then((owners) => { 
            let petowners = []
            let fullnamesArr = []
        
            owners.docs.forEach( (doc) => {
                petowners.push({...doc.data(), id: doc.id })

                let ofnames = doc.data().firstName
                let olnames = doc.data().lastName               
                let oIds = doc.id
                let fullnames = ofnames + ' ' + olnames

                fullnamesArr = fullnames.split(",")

            for(const ow in fullnamesArr) {
                const namesObj = fullnamesArr[ow]

                let namesArr = []
                
                namesArr.push(namesObj)
    
                for(const el of namesArr) {
                    newOption = new Option(el, oIds);
                    ownerList.add(newOption,undefined); 
                }
                
            }
        })
        })


        ownerList.addEventListener('change', (e) => {
            e.preventDefault()

            let ownerId = ownerList.value
        
            getownerPets(ownerId)
                 
        })
    
            petList.addEventListener('change', (e) => {
                e.preventDefault()


            let ownerFname = ownerList.selectedOptions[0].text.split(" ")[0]
            let ownerLname = ownerList.selectedOptions[0].text.split(" ")[1]
            let ownerId = ownerList.value
            let petName = petList.selectedOptions[0].text
            let petId = petList.value

                addStory.addEventListener('submit', handleForm)
                function handleForm(e) {
                e.preventDefault();

                    handleAdoptStory(petName, petId, ownerId, ownerFname, ownerLname, userId, firstName, lastName, city, state)
    }
            
        })


}
})


function handleAdoptStory(petName, petId, ownerId, ownerFname, ownerLname, userId, firstName, lastName, city, state){

    console.log(firstName);

    let storytitle = document.getElementById("story-title");
    let storybody = document.getElementById("body");
    let posted_at = new serverTimestamp();

    setTimeout(() => {
        const adopt = new adoptStory(storytitle.value, storybody.value, posted_at, petName, petId, ownerId, ownerFname, ownerLname, userId, firstName.value, lastName.value, city.value, state.value);

        addDoc(adoptJourney, Object.assign({}, adopt))
        .then(() => {
            addStory.reset();
        })
    }, 5000)
}


function getownerPets(ownerId) {

const qPets = query(aniRef, where("owner_id", "==", ownerId))
                                        
getDocs(qPets).then((petname) => { 
    let petnames = []
    let petslistArr = []

    petname.docs.forEach( (doc) => {
        petnames.push({...doc.data(), id: doc.id })

       let names = doc.data().name
       petslistArr = names.split(",")
        

        for(const pl in petslistArr) {
            const petsObj = petslistArr[pl]
            // .split(" ").reverse().slice(1).reverse().join(" ")
            let petnamesArr = []
            
            petnamesArr.push(petsObj)
            console.log(petnamesArr)

            for(const el of petnamesArr) {
                newOption = new Option(el, doc.id);
                petList.add(newOption,undefined); 
                }   
            }
        })
    })
}