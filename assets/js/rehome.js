import { getFirestore, getDoc, setDoc, doc, updateDoc, arrayUnion, addDoc, collection } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'
import { imageUpload, uploadToStorage } from './global-functions.js'


// init the firestore and storage
const db = getFirestore(app)
const storage = getStorage(app);

// Initialize Authentication
const auth = getAuth(app)

//references
const aniRef = collection(db, 'animals')

// setting up classes for user and pet form
class userDetails {
    constructor(phone, street, city, country, pcode, state) {
        this.phone = phone;
        this.address = {
            street: street,
            city: city,
            country: country,
            postcode: pcode,
            state: state
        }
        // this.photo = photo; 
    }
}

class Petdetails {
    constructor(pname, ptype, pbreed, pcolor, page, pgender, psize, pdesc, pht, pgwc, photo, ownerid, street, city, country, pcode, state, isAdopted) {
        this.name = pname;
        this.type = ptype;
        this.breed = pbreed;
        this.color = pcolor;
        this.age = page;
        this.gender = pgender;
        this.size = psize;
        this.desc = pdesc;         
        this.attributes = {
            house_trained: pht,
            good_with_children: pgwc
        };
        this.photo = photo;
        this.owner_id = ownerid;
        this.location = {
            street: street,
            city: city,
            country: country,
            postcode: pcode,
            state: state
        }
        this.isAdopted = isAdopted;
    }
}

// choosing pet on the first page of rehome
const whichPet = () => {
    $('.pet-category').each(function() {
        if(!$(this).hasClass('active')) {
            $('#submitPet').attr('disabled', 'disabled')
        }

        $(this).on('click', () => {
            $('.active').not(this).removeClass('active');
            $(this).addClass('active')

            $('.pet').not(this).show()
            $('.active-pet').not(this).hide()
            $(this).find('.pet').hide()
            $(this).find('.active-pet').show()

            $('#submitPet').prop("disabled", false)
            localStorage.setItem('rehome-pet-type', $(this).find('p').text())
        })
        
    })
}
whichPet()

// after choosing pet proceed to tab-2
const submitPet = document.getElementById('submitPet');
let pages = document.querySelectorAll('.tab');
let bar = document.querySelectorAll('.progress-holder')


let hash = () => {
    let checkTab = location.hash ? location.hash : '#tab-1';
    for(let el of pages) {
        if('#'+el.id == checkTab) {
            console.log(checkTab)
            el.style.display = 'block'
        } else {
            el.style.display = 'none'
        }
    }

    for(let i of bar) {
        if(i.classList.contains(checkTab.slice(1))) {
            $(i).find('.progress-bar').css({
                'width': '100%',
                'opacity': '40%'
            })
        }

        if(location.hash == '#tab-2') {
            $('.tab-1 .progress-bar').css({
                'width': '100%',
            })

            $('.tab-3 .progress-bar').css({
                'width': '0%',
            })
        } else if(location.hash == '#tab-3') {
            $('.tab-1 .progress-bar').css({
                'width': '100%'
            })
            $('.tab-2 .progress-bar').css({
                'width': '100%',
                'opacity': '1'
            })
        }
    }
}


submitPet.addEventListener('click', function() {

    $('#tab-progress').addClass('active')

    location.hash = '#tab-2'
    hash()

    document.getElementById('ptype').value = localStorage.getItem('rehome-pet-type')


})


// rehome-pet form and submit button on rehome-pet form
const addPet = document.querySelector('.rehome-pet');
const submit = document.getElementById('post-now');

// rehome-user form and submit button on rehome-owner form
const userForm = document.querySelector('.rehome-user');
const submitOwner = document.getElementById('post-owner')

// user form inputs
let fname = document.getElementById('user-first-name');
let lname = document.getElementById('user-last-name');
let email = document.getElementById('user-email');
let phone = document.getElementById('userphone');
let country = document.getElementById('usercountry');
let city = document.getElementById('usercity');
let state = document.getElementById('userstate');
let pcode = document.getElementById('userpcode');
let street = document.getElementById('userstreet');

// check if user is logged in, if yes auto populate fields else redirect to login page
onAuthStateChanged(auth, (user) => {
    if (user) {
        const uidRef = doc(db, "accounts", user.uid); 
        const userid = user.uid;

        getDoc(uidRef).then(docSnap => {
            let data = docSnap.data();

            fname.value = data.firstName;
            lname.value = data.lastName;
            email.value = data.email;

            let checkAddress = data.hasOwnProperty('address');
            let isOwner = data.isOwner;

            if(checkAddress) {
                street.value = data.address.street
                city.value = data.address.city
                state.value = data.address.state
                pcode.value = data.address.postcode
                country.value = data.address.country
            }
            
            submitOwner.addEventListener('click', (e) => {
                e.preventDefault();
                handleUserForm(user, phone, street, city, country, pcode, state)
                handlePetForm(userid, street.value, city.value, country.value, pcode.value, state.value)
            })
            

            submit.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('pet')

                location.hash = '#tab-3'
                hash()
                
            })
        })
    } else {
        //window.location.href = "./login.html"
    }
})

async function handlePetForm(userid, street, city, country, pcode, state) {
    const docRef = doc(db, 'animals', userid);
    const imagesArr = [];

    let pname = document.getElementById('pname').value;
    let ptype = document.getElementById('ptype').value;
    let pbreed = document.getElementById('pbreed').value;
    let pcolor = document.getElementById('pcolor').value;
    let page = document.getElementById('age').value;
    let pgender = document.getElementById('gender').value;
    let psize = document.getElementById('size').value;
    let pdesc = document.getElementById('pdesc').value;
    let pht = document.querySelector("input[name='trained']").checked ? 1 : 0;
    let pgwc = document.querySelector("input[name='children']").checked ? 1 : 0;
    let petphoto = myFile.files
    let isAdopted = "init";

    // loop through uploaded photos and upload to FIRESTORAGE
    uploadToStorage(petphoto, imagesArr, docRef)
    
    const photos = await Promise.all(imagesArr);
    console.log(photos);

    //add downloadURL to FIRESTORE
    setTimeout(() => {
        const petdetails = new Petdetails(pname, ptype, pbreed, pcolor, page, pgender, psize, pdesc, pht, pgwc, photos, userid, street, city, country, pcode, state, isAdopted)
 
        $('.modal.spinner').removeClass('modal-active')
        addDoc(aniRef, Object.assign({}, petdetails))
            .then(() => {
                addPet.reset();
                document.querySelector('.displayImages').innerHTML = ''
                userForm.reset()
                $('.success-modal').addClass('modal-active');

            }).catch((err) => {
                console.log(err.message)
                //add frontend display here for error message
            })
    }, 4000)

    $('.modal.spinner').addClass('modal-active')
    //add breed and color to FIRESTORE
    const typeRef = doc(db, 'types', ptype);
    updateDoc(typeRef, {
        breeds: arrayUnion(pbreed),
        colors: arrayUnion(pcolor)
    });

    //set is_owner flag to TRUE
    const userRef = doc(db, 'accounts', userid)
    updateDoc(userRef, {
        isOwner: true
    });

    
}



function handleUserForm(user, phone, street, city, country, pcode, state) {
    console.log(phone.value)
    const userdetails = new userDetails(phone.value, street.value, city.value, country.value, pcode.value, state.value)

    const docRef = doc(db, 'accounts', user.uid)
    setDoc(docRef, Object.assign({}, userdetails,),  { merge: true })
        .then(() => {
            
        })


    .catch((err) => {
        console.log(err.message)
        //add frontend display here for error message
    })
}

// For displaying uploaded images
imageUpload()


// check if fields have values

$('.rehome-pet input').bind('keyup', function() {
    checkVal()
})

$('.rehome-pet textarea').bind('keyup', function() {
    checkVal()
})

$('.rehome-pet select').change(function(){
    checkVal()
})


function checkVal() {
    let valArr = []
    $('[required]').each(function() {
        if ($(this).val() != '') {
            valArr.push($(this).val())
        }
    })

    //return empty
    console.log(valArr)
    console.log(valArr.length)
    const checkArr = (currentValue) => currentValue != null;
   if (valArr.length >= 8 && valArr.every(checkArr)) {
    submit.removeAttribute('disabled')
    localStorage.setItem('pet-details-form', JSON.stringify(valArr))
   } else {
    submit.setAttribute('disabled', 'disabled')
   }
}

checkVal()

$('#back-pet-form').on('click', () => {
    location.hash = '#tab-2'
    hash()
})

