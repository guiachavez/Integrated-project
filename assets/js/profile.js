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

let inquiries = []

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

        // query to count inquiries under user who is logged in
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
                    
                    // query to count inquiries for each pet under user logged in
                    const q2 = query(inqRef, where("petId", "==", doc.id), 
                                             where("petowner.petownerId", "==", user.uid));

                    getCountFromServer(q2).then(pet_inq_cnt => {
                        let row  = `<tr>
                                <td data-id="${doc.id}">${data.name}</td>
                                <td>${data.age}</td>
                                <td>${data.size}</td>
                                <td>${data.gender}</td>
                                <td>${data.type}</td>
                                <td>${data.breed}</td>
                                <td>${data.color}</td>
                                <td>${data.desc}</td>
                                <td data-count="${pet_inq_cnt.data().count}">No. of Inquiries: ${pet_inq_cnt.data().count}</td>
                                <td id="response-buttons"></td>
                            </tr>`;
                                        
                        table.innerHTML += row
                    })
                    
                    // push the inquiries into array
                    getDocs(q2).then((snapshot) => {
                        snapshot.docs.forEach((doc) => {
                            let data = doc.data()
                            inquiries.push(data)
                        })
                    })
                })
            }).then(() => {
                setTimeout(() => {
                    addButtons(inquiries)
                }, 1000)
            }).catch(err => {
                console.log(err.message)
            }) 
    }

})

// add accept and decline buttons on user profile, by looping through inquiries array
const addButtons = (inquiries) => {
    const resp = document.querySelectorAll('#result tr')

    $('#result tr').each(function(){
        $(this).find('td[data-count]').each(function(){
            if($(this)[0].attributes[0].value != 0) {
                for(let el in inquiries) {
                    if($(this).closest('tr').find('td[data-id]')[0].attributes[0].value == inquiries[el].petId) {
                        console.log(inquiries[el])
                        $(this).closest('tr').find('#response-buttons').append([
                            $('<p />', {'text': `Applicant: ${inquiries[el].applicant.app_firstName} ${inquiries[el].applicant.app_lastName}`}),
                            $('<button />', {'text': 'Accept'}),
                            $('<button />', {'text': 'Decline'})
                        ])
                    }
                }
                
            }
        })
    })     
}

