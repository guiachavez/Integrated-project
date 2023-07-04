import { getFirestore, getDoc, getDocs, doc, query, where, collection, getCountFromServer, documentId, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
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
            // console.log(inq_count.data().count)

            $('#profile-pic').append([
                $('<p />', {'text': `You have ${inq_count.data().count} inquiries waiting for you!`})
            ])
        })

        // query for matching user uid on animals table to get pets posted/inquired by the user
        const q = query(aniRef, where("owner_id", "==", user.uid));
        const iq = query(inqRef, where ("applicant.applicantId", "==", user.uid));

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
                                <td class="response-buttons"></td>
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

        getDocs(iq)
        .then((snapshot) => {
            let animalsinq = []
            

            snapshot.docs.forEach( (doc) => {
                animalsinq.push({...doc.data(), id: doc.id })
                let table = document.getElementById('result_inq');
                let data = doc.data();
                
                //get details from animals collection
                const iqd = query(aniRef, where(documentId(), "==", data.petId));

                getDocs(iqd)
                .then((snapshot) => {
                let animalsinqdet = []
    
                snapshot.docs.forEach( (doc) => {
                animalsinqdet.push({...doc.data(), id: doc.id })
                let data2 = doc.data();
                let inq_status = getStatus();

                function getStatus() {    
                if( data.isAccepted == true && data.adoptionSuccess == "init" ) {

                    let inq_status = "Accepted"
                    return inq_status

                } else if ( data.isAccepted == true && data.adoptionSuccess == true ) {

                    let inq_status = "Successful Adoption"
                    return inq_status
                    
                } else if ( data.isAccepted == true && data.adoptionSuccess == false ) {

                    let inq_status = "Unsuccessful Adoption"
                    return inq_status
                
                } else if ( data.isAccepted == false ) {

                    let inq_status = "Declined"
                    return inq_status
                    
                } else {

                    let inq_status = "No response yet"
                    return inq_status
                }
                }
                
                let row  = `<tr>
                            <td data-id="${doc.id}">${data2.name}</td>
                            <td>${data2.age}</td>
                            <td>${data2.size}</td>
                            <td>${data2.gender}</td>
                            <td>${data2.type}</td>
                            <td>${data2.breed}</td>
                            <td>${data2.color}</td>
                            <td>${data2.desc}</td>
                            <td>${inq_status}</td>
                        </tr>`;
                                    
                    table.innerHTML += row
                })
            })
        })
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
                        // console.log(inquiries[el])
                        $(this).closest('tr').find('.response-buttons').append([
                            $('<p />', {'text': `Applicant: ${inquiries[el].applicant.app_firstName} ${inquiries[el].applicant.app_lastName}`}),
                            $('<button />', {'text': 'Accept', 'id': `Accept-${inquiries[el].inquiryId}`}),
                            $('<button />', {'text': 'Decline', 'id': `Decline-${inquiries[el].inquiryId}`})
                        ])

                        var btnAccept = document.getElementById(`Accept-${inquiries[el].inquiryId}`);
                        var btnDecline = document.getElementById(`Decline-${inquiries[el].inquiryId}`);
                        
                        
                        btnAccept.addEventListener("click", acceptInquiry);
                        btnDecline.addEventListener("click", declineInquiry);
                        
                        
                        const updateinqRef = doc(db, "inquiries", inquiries[el].inquiryId);
                        const updateaniRef = doc(db, "animals", inquiries[el].petId);

                        function acceptInquiry() {
                            updateDoc(updateinqRef, {
                                isAccepted: true,
                                adoptionSuccess: "init"
                            });
                            btnAccept.innerText = "Close"
                            btnDecline.disabled = true
                            btnAccept.id = `Close-${inquiries[el].inquiryId}`
                            var btnClose = document.getElementById(`Close-${inquiries[el].inquiryId}`);
                            btnClose.addEventListener("click", closeInquiry);   
                            }
                                                   
                        function declineInquiry() {
                            updateDoc(updateinqRef, {
                                isAccepted: false
                            });  
                            btnAccept.disabled = true
                            btnDecline.disabled = true                      
                            }

                        function closeInquiry() {
                            let adoptAsk = confirm('Is the adoption successful?');
                            if (adoptAsk == true) {
                                updateDoc(updateaniRef, {
                                    isAdopted: true
                                });

                                updateDoc(updateinqRef, {
                                    adoptionSuccess: true
                                });
                                // btnDecline.innerText = "SUCCESS"
                                // btnClose.innerText = ""
                            } else {
                                updateDoc(updateinqRef, {
                                    adoptionSuccess: false
                                });
                                // btnDecline.innerText = "FAILED"
                                // btnClose.innerText = ""
                            }
                            btnClose.disabled = true
                        }

                        if (inquiries[el].isAccepted == true && inquiries[el].adoptionSuccess == "init") {
                            
                            btnAccept.innerText = "Close"
                            btnDecline.disabled = true
                            btnAccept.id = `Close-${inquiries[el].inquiryId}`
                            var btnClose = document.getElementById(`Close-${inquiries[el].inquiryId}`);
                            btnClose.addEventListener("click", closeInquiry);

                        } else if (inquiries[el].isAccepted == false) {
                            btnAccept.disabled = true
                            btnDecline.disabled = true
                            // btnDecline.innerText = "DECLINED"
                            // btnAccept.innerText = ""

                        } else if (inquiries[el].isAccepted == true && inquiries[el].adoptionSuccess == true) {
                            
                            btnClose.disabled = true
                            btnDecline.disabled = true
                            // btnDecline.innerText = "SUCCESS"
                            // btnClose.innerText = ""

                        } else if (inquiries[el].isAccepted == true && inquiries[el].adoptionSuccess == false) {
                            
                            btnClose.disabled = true
                            btnDecline.disabled = true
                            // btnDecline.innerText = "FAILED"
                            // btnClose.innerText = ""
                        }

                        }
                        
                        


                    }             
                }
            })
        })
    }


