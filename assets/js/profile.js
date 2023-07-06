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

                if($('.accept').length > 0) {
                    $('button.accept').each(function() {
                        $(this).on('click', () => {
                            for(let el in inquiries) {
                                if($(this).data('accept') == inquiries[el].inquiryId) {
                                    acceptInquiry(inquiries[el].inquiryId)
                                }
                            }
                        })
                    })
                }

                if($('.decline').length > 0) {
                    $('button.decline').each(function() {
                        $(this).on('click', () => {
                            for(let el in inquiries) {
                                if($(this).data('decline') == inquiries[el].inquiryId) {
                                    declineInquiry(inquiries[el].inquiryId)
                                }
                            }
                        })
                    })
                }

                closeButton()
                
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

                        // changing the status display on animals inquired
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
                    if(inquiries[el].isAccepted == 'init') {
                        if($(this).closest('tr').find('td[data-id]')[0].attributes[0].value == inquiries[el].petId) {
                            $(this).closest('tr').find('.response-buttons').append([
                                $('<p />', {'text': `Applicant: ${inquiries[el].applicant.app_firstName} ${inquiries[el].applicant.app_lastName}`}),
                                $('<button />', {'text': 'Accept', 'class': 'accept', 'data-accept': `${inquiries[el].inquiryId}`}),
                                $('<button />', {'text': 'Decline', 'class': 'decline', 'data-decline': `${inquiries[el].inquiryId}`})
                            ])
                        }
                    } else if (inquiries[el].isAccepted == true) {
                        if ($(this).closest('tr').find('td[data-id]')[0].attributes[0].value == inquiries[el].petId) {
                            if (inquiries[el].adoptionSuccess == true) {
                                $(this).closest('tr').find('.response-buttons').append([
                                    $(this).closest('tr').find('.response-buttons').append([
                                        $('<p />', {'text': `Applicant: ${inquiries[el].applicant.app_firstName} ${inquiries[el].applicant.app_lastName}`}),
                                        $('<button />', {'text': 'Successful Adoption', 'id': `Success-${inquiries[el].inquiryId}`, 'class': 'success', 'data-success': `${inquiries[el].inquiryId}`, 'disabled': 'disabled'}),
                                    ])
                                ])
                            } else if (inquiries[el].adoptionSuccess == false) {
                                $(this).closest('tr').find('.response-buttons').append([
                                    $('<p />', {'text': `Applicant: ${inquiries[el].applicant.app_firstName} ${inquiries[el].applicant.app_lastName}`}),
                                    $('<button />', {'text': 'Rejected', 'id': `Reject-${inquiries[el].inquiryId}`, 'class': 'reject', 'data-reject': `${inquiries[el].inquiryId}`, 'disabled': 'disabled'})
                                ])
                            } else {
                                $(this).closest('tr').find('.response-buttons').append([
                                    $('<p />', {'text': `Applicant: ${inquiries[el].applicant.app_firstName} ${inquiries[el].applicant.app_lastName}`}),
                                    $('<button />', {'text': 'Close', 'id': `Close-${inquiries[el].inquiryId}`, 'class': 'close', 'data-close': `${inquiries[el].inquiryId}`}),
                                    $('<button />', {'text': 'Decline', 'id': `Decline-${inquiries[el].inquiryId}`, 'class': 'decline', 'data-decline': `${inquiries[el].inquiryId}`, 'disabled': 'disabled'})
                                ])
                            }
                        }
                    } else if(inquiries[el].isAccepted == false) {
                        if($(this).closest('tr').find('td[data-id]')[0].attributes[0].value == inquiries[el].petId) {
                            $(this).closest('tr').find('.response-buttons').append([
                                $('<p />', {'text': `Applicant: ${inquiries[el].applicant.app_firstName} ${inquiries[el].applicant.app_lastName}`}),
                                $('<button />', {'text': 'Rejected', 'id': `Reject-${inquiries[el].inquiryId}`, 'class': 'reject', 'data-reject': `${inquiries[el].inquiryId}`, 'disabled': 'disabled'})
                            ])
                        }
                    }
                    
                }             
            }
        })
    })
}

function passId(id) {
    const updateinqRef = doc(db, "inquiries", id);
    const updateaniRef = doc(db, "animals", id);
}


function acceptInquiry(id) {
    const updateinqRef = doc(db, "inquiries", id);

    updateDoc(updateinqRef, {
        isAccepted: true,
        adoptionSuccess: "init"
    });

    changingAcceptToClose(id)
}

// changing button from accept to close
function changingAcceptToClose(id) {
    $('button.accept').each(function() {
        if($(this).data('accept') == id) {
            $(this).closest('.response-buttons').append([
                $('<button />', {'text': 'Close', 'class': 'close', 'data-close': `${id}`})
            ])
            $(this).closest('.response-buttons').find('.decline').attr('disabled', 'disabled')
            $(this).remove();
            
        }
    })

    closeButton()
}

// call function when close button is clicked
function closeButton() {
    $('button.close').each(function() {
        $(this).on('click', () => {
            for(let el in inquiries) {
                if($(this).data('close') == inquiries[el].inquiryId) {
                    closeInquiry(inquiries[el].inquiryId, inquiries[el].petId)
                }
            }
        })
    })
}

// declining the inquiry
function declineInquiry(id) {
    const updateinqRef = doc(db, "inquiries", id);

    $('button.decline').each(function() {
        if($(this).data('decline') == id) {
            updateDoc(updateinqRef, {
                isAccepted: false
            });  

            $(this).closest('.response-buttons').find('.decline').attr('disabled', 'disabled')
            $(this).closest('.response-buttons').find('.accept').attr('disabled', 'disabled')
        }
    })
}

// When close button is clicked show prompt if the adoption was a success or not
function closeInquiry(inqId, petId) {
    let adoptAsk = confirm('Is the adoption successful?');
    const updateinqRef = doc(db, "inquiries", inqId);
    const updateaniRef = doc(db, "animals", petId);

    if (adoptAsk == true) {
        updateDoc(updateaniRef, {
            isAdopted: true
        });

        updateDoc(updateinqRef, {
            adoptionSuccess: true
        });

        changingToStatus(adoptAsk, inqId)

    } else {
        updateDoc(updateinqRef, {
            adoptionSuccess: false
        });

        changingToStatus(adoptAsk, inqId)
    }
}

// Updating buttons text to successful or rejected adoption
function changingToStatus(adoptAsk, inqId) {
    $('button.close').each(function() {
        if($(this).data('close') == inqId) {
            if (adoptAsk == true) {
                $(this).html('Successful Adoption')
                $(this).attr('disabled', 'disabled')
            } else {
                $(this).html('Rejected')
                $(this).attr('disabled', 'disabled')
            }
        }
    }) 
}