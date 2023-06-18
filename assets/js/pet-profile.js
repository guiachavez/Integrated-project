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
