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

if(localStorage.getItem('source') == 'owner') {
    getDoc(petRef).then(docSnap => {

        let data = docSnap.data();
        let photo = data.photo;
        let owner_id = data.owner_id;
        const ownRef = doc(db, "accounts", owner_id)
        
        document.querySelector('#photo').src = photo;
    
        getDoc(ownRef).then(ownSnap => {
            let owndata = ownSnap.data();
            let ofname = owndata.firstName;
            let olname = owndata.lastName;
                
            let table = document.getElementById('petDetails');        
            let row  = `<tr>
                        <td>${data.name}</td>
                        <td>${data.age}</td>
                        <td>${data.size}</td>
                        <td>${data.gender}</td>
                        <td>${data.type}</td>
                        <td>${data.breed}</td>
                        <td>${data.attributes.good_with_children}</td>
                        <td>${data.attributes.house_trained}</td>
                        <td>${data.desc}</td>
                        <td>${ofname}</td>
                        <td>${olname}</td>
                    </tr>`;
                    
            table.innerHTML += row
        })
    })
} else if (localStorage.getItem('source') == 'shelter') {
    let outputObj = JSON.parse(localStorage.getItem('outputObj'));
    console.log(id)
    for (const el of outputObj) {
        if(el.id == id) {
            console.log(el)
            document.querySelector('#photo').src = el.photos[0].small;
            let table = document.getElementById('petDetails');        
            let row  = `<tr>
                        <td>${el.name}</td>
                        <td>${el.age}</td>
                        <td>${el.size}</td>
                        <td>${el.gender}</td>
                        <td>${el.species}</td>
                        <td>${el.breeds.primary}</td>
                        <td>${el.tags[1]}</td>
                        <td>${el.attributes.house_trained}</td>
                        <td>${el.description}</td>
                        <td>${el.contact.email}</td>
                    </tr>`;
                    
            table.innerHTML += row
        }
    }
}

