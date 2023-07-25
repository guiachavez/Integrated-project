import { getFirestore, getDoc, getDocs, doc, query, where, collection, getCountFromServer, documentId, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'


// init the firestore and storage
const db = getFirestore(app)
const storage = getStorage(app);

// Initialize Authentication
const auth = getAuth(app)

//references, animals table
const aniRef = collection(db, 'animals')
const inqRef = collection(db, 'inquiries')

const modalContent = document.querySelector('.user-profile-main .modal-content')

let inquiries = []

onAuthStateChanged(auth, (user) => {
    if (user) {

        const uidRef = doc(db, "accounts", user.uid)      
        getDoc(uidRef).then(docSnap => {

            let data = docSnap.data();
            let photo = data.photo;
            let table = document.getElementById('ownerDetails');

            document.querySelector('#photo').src = photo;
            document.querySelector('.owner-name').innerHTML = `${data.firstName} ${data.lastName}`

            document.querySelector('.fName').innerHTML = `: ${data.firstName}`
            document.querySelector('.number').innerHTML = `: ${data.phone}`
            document.querySelector('.country').innerHTML = `: ${data.address.country}`
            document.querySelector('.city').innerHTML = `: ${data.address.city}`
            document.querySelector('.lName').innerHTML = `: ${data.lastName}`
            document.querySelector('.email').innerHTML = `: ${data.email}`
            document.querySelector('.postal').innerHTML = `: ${data.address.postcode}`
            document.querySelector('.address').innerHTML = `: ${data.address.street}, ${data.address.city}`
        })

        // query to count inquiries under user who is logged in
        const inq = query(inqRef, where("petowner.petownerId", "==", user.uid));

        // getCountFromServer(inq).then(inq_count => {
        //     $('#profile-pic').append([
        //         $('<p />', {'text': `You have ${inq_count.data().count} inquiries waiting for you!`})
        //     ])
        // })

        // query for matching user uid on animals table to get pets posted/inquired by the user
        const q = query(aniRef, where("owner_id", "==", user.uid));
        const iq = query(inqRef, where ("applicant.applicantId", "==", user.uid));

        getDocs(q)
        .then((snapshot) => {
            let animals = []
            let ctr = 0
            snapshot.docs.forEach( (doc) => {
                animals.push({...doc.data(), id: doc.id })

                //let table = document.getElementById('result');
                let data = doc.data();
                
                // query to count inquiries for each pet under user logged in
                const q2 = query(inqRef, where("petId", "==", doc.id), 
                                        where("petowner.petownerId", "==", user.uid),
                                        where("isAccepted", "!=", false),
                                        where("adoptionSuccess", "==", "init"));

                getCountFromServer(q2).then(pet_inq_cnt => {
                    $('.rehome-pet-wrapper').append([
                        $('<div />', {'class': `rehome-pet-${ctr++} list`}).append([
                            $('<div />', {class: 'rehome-pet-list'}).append([
                                $('<div />', {'class': 'pet-image'}).append([
                                    $('<img />', {src:  `${data.photo[0]}`}),
                                    $('<p />', {text:  `${data.name}`})
                                ]),
                                $('<div />', {'class': 'description'}).append([
                                    $('<p />', {text:  `${data.desc}`}),
                                    $('<div />').append([
                                        $('<ul />').append([
                                            $('<li />', {text: `${data.breed}`}),
                                            $('<li />', {text: `${data.gender}`}),
                                            $('<li />', {text: `${data.age}`}),
                                            $('<li />', {text: `${data.size}`}),
                                            $('<li />', {text: `${data.color}`})
                                        ])
                                    ]),
                                    $('<div />', {'data-count': `${pet_inq_cnt.data().count}`, 'data-id': `${doc.id}`}).append([
                                        $('<button />', {class: 'go-to-inquiries', text: `${pet_inq_cnt.data().count} Active Inquiries`})
                                    ])
                                ])
                            ]),
                            $('<div />', {class: 'responseButtonsModal'})
                        ])
                    ])
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
                addButtonsv2(inquiries)
                //addButtons(inquiries)
                
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
                                <td><img src=${data2.photo[0]}></td>
                                <td data-id="${doc.id}">${data2.name}</td>
                                <td>${data.petowner.po_firstName}, ${data.petowner.po_lastName}</td>
                                <td>${data.petowner.po_email}</td>
                                <td>${data2.type}</td>
                                <td>${data2.breed}</td>
                                <td>${inq_status}</td>
                                <td>${data.declineReason}</td>
                            </tr>`;
                                        
                        table.innerHTML += row
                    })
                })
            })
        })
    }

})

// Accept Inquiry function
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
                $('<button />', {'text': 'Close', 'class': 'close outline-btn font', 'data-close': `${id}`})
            ])
            $(this).closest('.response-buttons').find('.decline').remove();
            $(this).remove();
        }
    })

    closeButton()
}

// call function when close button is clicked
function closeButton() {
    $('button.close').each(function() {
        $(this).on('click', (e) => {
            e.preventDefault()
            for(let el in inquiries) {
                if($(this).data('close') == inquiries[el].inquiryId) {
                    closeInquiry(inquiries[el].inquiryId, inquiries[el].petId)
                }
            }
        })
    })
}

// declining the inquiry
function declineInquiry(id, petId) {
    $('button.decline').each(function() {
        if($(this).data('decline') == id) {            
            if ($('.decline-modal').length == 0) {
                $('.user-profile-main .modal-content').append([
                    $('<div />', {class: 'decline-modal'}).append([
                        $('<h2 />', {text: 'Decline Reason'}),
                        $('<div />', {class: 'decline-confirmation'}).append([
                            $('<p />', {text: 'Please include reason why you are declining the inquiry'}),
                            $('<div />').append([
                                $('<textarea />', {class: 'reason', placeholder: 'Give your reason'}),
                                $('<p />', {class: 'alert', text: '**Please fill out the field.'})
                            ]),
                            $('<button />', {text: 'Submit', class: 'outline-next-btn font decline-first', value: 'reason'})
                        ])
                    ])
                ])
        
                $('.user-profile-main .modal').addClass('modal-active')

                submitDeclineReason(id)
            }
        }
    })
}

function submitDeclineReason(id) {
    const updateinqRef = doc(db, "inquiries", id);
    let declineReason = document.querySelector('.user-profile-main .modal textarea')
    let allInquiry = document.querySelectorAll('button[data-decline]')
    let alert = document.querySelector('.decline-modal .alert')

    $('.decline-first').on('click', function() {

        if (declineReason.value != '') {
            updateDoc(updateinqRef, {
                isAccepted: false,
                declineReason: declineReason.value
            });

            [...allInquiry].forEach(function(inq) {
                if(inq.dataset.decline == id) {
                    inq.innerHTML = 'Declined Application'
                    inq.setAttribute('disabled', 'disabled')

                    inq.closest('.response-buttons').querySelector('.accept').remove()
                }
            });

            modalContent.parentElement.classList.remove('modal-active')
            modalContent.innerHTML = ''
        } else {
            alert.style.display = 'block'
        }
    })
}

// When close button is clicked show modal if the adoption was a success or not
function closeInquiry(inqId, petId) {
    if ($('.adoption-confirmation').length == 0) {
        $('.user-profile-main .modal-content').append([
            $('<div />').append([
                $('<h2 />', {text: 'Adoption Confirmation'}),
                $('<div />', {class: 'adoption-confirmation'}).append([
                    $('<p />', {text: 'Is the adoption process Successful?'}),
                    $('<div />', {class: 'radio-response'}).append([
                        $('<label />', {text: 'Yes'}).append([
                            $('<input />', {type: 'radio', text: 'Yes', name: 'response', value: 'yes', checked: 'checked'}),
                        ]),
                        $('<label />', {text: 'No'}).append([
                            $('<input />', {type: 'radio', text: 'No', name: 'response', value: 'no'})
                        ])
                    ]),
                    $('<textarea />', {class: 'reason', placeholder: 'Give your reason'}),
                    $('<button />', {text: 'Submit', class: 'outline-next-btn font', value: 'reason'})
                ])
            ])
        ])

        $('.user-profile-main .modal').addClass('modal-active')
    }

    showModalConfirmation(inqId, petId) 
}

// show modal
function showModalConfirmation(inqId, petId) {
    const radioButton = document.querySelectorAll('input[name="response"]')
    const reasonBox = document.querySelector('.reason')
    const confirmationBtn = document.querySelector('.user-profile-main .modal button')
    let answer;

    radioButton.forEach(function(val) {
        val.addEventListener('change', function(e) {
            e.preventDefault();

            answer = this.value

            if(answer == 'no') {
                reasonBox.classList.add('display')
            } else {
                reasonBox.classList.remove('display')
            }
        })
    })
    
    confirmationBtn.addEventListener('click', function() {
        answer = document.querySelector('input[name="response"]:checked').value;
        submitAnswer(answer, inqId, petId)
    })
}

// setting fields on database
function submitAnswer(answer, inqId, petId) {
    const updateinqRef = doc(db, "inquiries", inqId);
    const updateaniRef = doc(db, "animals", petId);
    const declineReason = document.querySelector('.user-profile-main .modal textarea')


    if(answer == 'no') {
        updateDoc(updateinqRef, {
            declineReason: declineReason.value
        })

        updateDoc(updateinqRef, {
            adoptionSuccess: false
        });

        changingToStatus(answer, inqId)

        $('.modal').removeClass('modal-active')
        modalContent.innerHTML = ''
    } else {
        updateDoc(updateaniRef, {
            isAdopted: true
        });

        updateDoc(updateinqRef, {
            adoptionSuccess: true
        });

        changingToStatus(answer, inqId)

        $('.modal').removeClass('modal-active')
        modalContent.innerHTML = ''
    }
}

// Updating buttons text to successful or rejected adoption
function changingToStatus(answer, inqId) {
    $('button.close').each(function() {
        if($(this).data('close') == inqId) {
            if (answer == 'yes') {
                $(this).html('Successful Adoption')
                $(this).addClass('success')
                $(this).attr('disabled', 'disabled')
                $(this).removeClass('close')
            } else {
                $(this).html('Rejected')
                $(this).addClass('reject')
                $(this).attr('disabled', 'disabled')
                $(this).removeClass('close')
            }
        }
    })
    modalContent.innerHTML = ''
}

function loopButtons() {
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
                        declineInquiry(inquiries[el].inquiryId, inquiries[el].petId)
                    }
                }
            })
        })
    }

    closeButton()
}

// appending buttons
function addButtonsv2(inquiries) {
    $('.go-to-inquiries').each(function() {
        $(this).closest('[data-count]').each(function(){
            if($(this)[0].attributes[0].value != 0) {
                let id = $(this).closest('div').attr('data-id')
                const q = query(aniRef, where(documentId(), "==", id));

                for(let el in inquiries) {
                    if(inquiries[el].petId == id) {
                        if(inquiries[el].isAccepted == 'init') {
                            $(this).closest('.list').find('.responseButtonsModal').append([
                                $('<div />', {class: 'inquiry-list'}).append([
                                    $('<div />').append([
                                        $('<span />', {'text': 'Name: '}).append([
                                            $('<p />', {'text': `${inquiries[el].applicant.app_firstName} ${inquiries[el].applicant.app_lastName}`})
                                        ]),
                                        $('<span />', {'text': 'Email: '}).append([
                                            $('<p />', {'text': `${inquiries[el].applicant.app_email}`})
                                        ])
                                    ]),
                                    $('<div />', {'class': 'response-buttons'}).append([
                                        $('<button />', {'text': 'Accept', 'class': 'accept outline-next-btn font', 'data-accept': `${inquiries[el].inquiryId}`}),
                                        $('<button />', {'text': 'Decline', 'class': 'decline outline-btn-gray font', 'data-decline': `${inquiries[el].inquiryId}`})
                                    ])
                                ])
                            ])
                        } else if (inquiries[el].isAccepted == true) {                           
                            if ($(this).closest('div').data('id') == inquiries[el].petId) {
                                if (inquiries[el].adoptionSuccess == true) {
                                    $(this).closest('.list').find('.responseButtonsModal').append([
                                        $(this).closest('.list').find('.responseButtonsModal').append([
                                            $(this).closest('.list').find('.responseButtonsModal').append([
                                                $('<div />', {class: 'inquiry-list'}).append([
                                                    $('<div />').append([
                                                        $('<span />', {'text': 'Name: '}).append([
                                                            $('<p />', {'text': `${inquiries[el].applicant.app_firstName} ${inquiries[el].applicant.app_lastName}`})
                                                        ]),
                                                        $('<span />', {'text': 'Email: '}).append([
                                                            $('<p />', {'text': `${inquiries[el].applicant.app_email}`})
                                                        ])
                                                    ]),
                                                    $('<div />', {'class': 'response-buttons'}).append([
                                                        $('<button />', {'text': 'Successful Adoption', 'id': `Success-${inquiries[el].inquiryId}`, 'class': 'success outline-btn font', 'data-success': `${inquiries[el].inquiryId}`, 'disabled': 'disabled'}),
                                                    ])
                                                ])
                                            ])
                                        ])
                                    ])
                                } else if (inquiries[el].adoptionSuccess == false) {
                                    $(this).closest('.list').find('.responseButtonsModal').append([
                                        $(this).closest('.list').find('.responseButtonsModal').append([
                                            $('<div />', {class: 'inquiry-list'}).append([
                                                $('<div />').append([
                                                    $('<span />', {'text': 'Name: '}).append([
                                                        $('<p />', {'text': `${inquiries[el].applicant.app_firstName} ${inquiries[el].applicant.app_lastName}`})
                                                    ]),
                                                    $('<span />', {'text': 'Email: '}).append([
                                                        $('<p />', {'text': `${inquiries[el].applicant.app_email}`})
                                                    ])
                                                ]),
                                                $(this).closest('.list').find('.responseButtonsModal').append([
                                                    $('<div />', {'class': 'response-buttons'}).append([
                                                        $('<button />', {'text': 'Rejected', 'id': `Reject-${inquiries[el].inquiryId}`, 'class': 'reject outline-btn-gray font', 'data-reject': `${inquiries[el].inquiryId}`})
                                                    ])
                                                ])
                                            ])
                                        ])
                                    ])
                                    
                                } else if (inquiries[el].adoptionSuccess == 'init') {
                                    $(this).closest('.list').find('.responseButtonsModal').append([
                                        $('<div />', {class: 'inquiry-list'}).append([
                                            $('<div />').append([
                                                $('<span />', {'text': 'Name: '}).append([
                                                    $('<p />', {'text': `${inquiries[el].applicant.app_firstName} ${inquiries[el].applicant.app_lastName}`})
                                                ]),
                                                $('<span />', {'text': 'Email: '}).append([
                                                    $('<p />', {'text': `${inquiries[el].applicant.app_email}`})
                                                ])
                                            ]),
                                            $('<div />', {'class': 'response-buttons'}).append([
                                                $('<button />', {'text': 'Close', 'id': `Close-${inquiries[el].inquiryId}`, 'class': 'close outline-btn font', 'data-close': `${inquiries[el].inquiryId}`})
                                            ])
                                        ])
                                    ])
                                }
                            }
                        }
                    }
                }

                loopButtons()
            }
        })
    })
    showInquiry()
}

$('.close').on('click', function() {
    $('.modal').removeClass('modal-active')
    modalContent.innerHTML = ''
})


// toggle to show inquiries
function showInquiry() {
    var inqButton = document.getElementsByClassName('go-to-inquiries');

    for (let i = 0; i < inqButton.length; i++) {
        inqButton[i].addEventListener('click', function() {
            this.classList.toggle('active');

            var content = this.closest('.rehome-pet-list').nextElementSibling;

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            } 
        });
    }
}

// function to set whic tab is active
$('ul.nav-tabs li').click(function(){
    let section_id = $(this).attr('data-nav');

    $('ul.nav-tabs li').removeClass('current');
    $('.content').removeClass('current');

    $(this).addClass('current');
    $("#"+section_id).addClass('current');
});


// signout
const logoutButton = document.querySelector('.logout')
logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            window.location.href = './login.html'
        })
        .catch((err) => {
            console.log(err.message)
        })
})