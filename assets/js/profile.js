import { getFirestore, getDoc, getDocs, doc, query, where, collection, getCountFromServer } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'


// init the firestore and storage
const db = getFirestore(app)
const storage = getStorage(app);

// Initialize Authentication
const auth = getAuth(app)

//references, animals table
const aniRef = collection(db, 'animals')
const inqRef = collection(db, 'inquiries')

onAuthStateChanged(auth, (user) => {
    if (user) {

        const uidRef = doc(db, "accounts", user.uid)      
        getDoc(uidRef).then(docSnap => {

            let data = docSnap.data();
            let photo = data.photo;
            let table = document.getElementById('ownerDetails');

            document.querySelector('#photo').src = photo;
              
            let row  = `<tr>
                        <td>${data.email}</td>
                        <td>${data.firstName}</td>
                        <td>${data.lastName}</td>
                        <td>${data.phone}</td>
                        <td>${data.address.street}</td>
                        <td>${data.address.city}</td>
                        <td>${data.address.state}</td>
                        <td>${data.address.postcode}</td>
                        <td>${data.address.country}</td>
                    </tr>`;
                  
            table.innerHTML += row

        })

        const inq = query(inqRef, where("petowner.petownerId", "==", user.uid));

        getCountFromServer(inq).then(inq_count => {
            console.log(inq_count.data().count)

            $('#profile-pic').append([
                $('<p />', {'text': `You have ${inq_count.data().count} inquiries waiting for you!`})
            ])
        })

        // query for matching user uid on animals table to get pets posted by the user
        const q = query(aniRef, where("owner_id", "==", user.uid));

        getDocs(q)
            .then((snapshot) => {
                let animals = []
        
                snapshot.docs.forEach( (doc) => {
                    animals.push({...doc.data(), id: doc.id })

                    let table = document.getElementById('result');
                    let data = doc.data();
                    
                    let row  = `<tr>
                            <td>${data.name}</td>
                            <td>${data.age}</td>
                            <td>${data.size}</td>
                            <td>${data.gender}</td>
                            <td>${data.type}</td>
                            <td>${data.breed}</td>
                            <td>${data.color}</td>
                            <td>${data.desc}</td>
                        </tr>`;
                                    
                    table.innerHTML += row
                })
            })
            .catch(err => {
                console.log(err.message)
            }) 
    }

})