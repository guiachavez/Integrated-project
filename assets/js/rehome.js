import { getFirestore, getDoc, setDoc, doc, updateDoc, arrayUnion, addDoc, collection } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'


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


// $('ul.tabs-list li').click(function(){


//     var tab_id = $(this).attr('data-tab');

//     $('ul.tabs-list li').removeClass('current');
//     $('.tab-nested-content').removeClass('current');

//     $(this).addClass('current');
//     $("#"+tab_id).addClass('current');

//     // var contentH = $("#"+tab_id).height();
//    // var newHeight = contentH + 100;
//     // $('.specs .content').height(contentH);

//     if(tab_id == 'tab-1'){
//       $('.specs .top').css('background', '#eff0f0');
//     }
//     else{
//        $('.specs .top').css('background', 'white');
//     }

//   });


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



const submitPet = document.getElementById('submitPet');

submitPet.addEventListener('click', function() {
    // let checkHash = location.hash ? location.hash : ('#' + $(this).find('p').text().toLowerCase());
    // window.location.hash = checkHash
    // console.log(checkHash)
    
    $('#tab-1').hide()
    $('#tab-2').show()

    document.getElementById('ptype').value = localStorage.getItem('rehome-pet-type')
})


// rehome-pet form
const addPet = document.querySelector('.rehome-pet');
//submit button on rehome-pet form
const submit = document.getElementById('post-now');

// rehome-user form
const userForm = document.querySelector('.rehome-user');
//submit button on rehome-owner form
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

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uidRef = doc(db, "accounts", user.uid); 
        const userid = user.uid;

        getDoc(uidRef).then(docSnap => {
            let data = docSnap.data();
            console.log(data)
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
            console.log(isOwner)
            if(isOwner == false) {
                console.log('here')
                submitOwner.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('called')
                    handleUserForm(user, phone, street, city, country, pcode, state)
                })
            }

            submit.addEventListener('click', (e) => {
                e.preventDefault();
                handlePetForm(userid, street.value, city.value, country.value, pcode.value, state.value)
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
    let page = document.querySelector('input[name="age"]:checked').value;
    let pgender = document.querySelector('input[name="gender"]:checked').value;
    let psize = document.querySelector('input[name="size"]:checked').value;
    let pdesc = document.getElementById('pdesc').value;
    let pht = JSON.parse(document.querySelector('input[name="trained"]:checked').value);
    let pgwc = JSON.parse(document.querySelector('input[name="children"]:checked').value);
    let petphoto = myFile.files
    let isAdopted = "init";

    // loop through uploaded photos and upload to FIRESTORAGE
    for (var i = 0; i < petphoto.length; i++) {
        const file = petphoto[i];
        const storage = getStorage();
        const metadata = {
            contentType: "image/jpeg"
        };
        const storageRef = ref(storage, "images/" + docRef.id + "/" + file.name);

        imagesArr.push(uploadBytes(storageRef, file, metadata)
            .then(uploadResult => {
                return getDownloadURL(uploadResult.ref)
            })
        )
    }

    const photos = await Promise.all(imagesArr);
    console.log(photos);

    //add downloadURL to FIRESTORE
    setTimeout(() => {
        const petdetails = new Petdetails(pname, ptype, pbreed, pcolor, page, pgender, psize, pdesc, pht, pgwc, photos, userid, street, city, country, pcode, state, isAdopted)
 
        addDoc(aniRef, Object.assign({}, petdetails))
            .then(() => {
                addPet.reset();
                document.querySelector('.displayImages').innerHTML = ''
        })
    }, 5000)

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
            userForm.reset()
        })


    .catch((err) => {
        console.log(err.message)
        //add frontend display here for error message
    })
}

// For displaying uploaded images
let imageInput = document.getElementById('myFile');
let imageOutput = document.querySelector('.displayImages')
let imageArr = []

const deleteImage = () => {
    console.log('called')
    imageArr.splice(i, 1)
    displayImages()
}   

imageInput.addEventListener("change", () => {
    let uploadedImages = imageInput.files

    for(let i=0; i<uploadedImages.length; i++) {
        imageArr.push(uploadedImages[i])
    }

    displayImages()
})

const displayImages = () => {
    let images = ''

    imageArr.forEach((img, i) => {
        images += `<div class="image">
                        <img src="${URL.createObjectURL(img)}" alt="image">
                        <div onclick="deleteImage(${i})">&times;</div>
                    </div>`
    })

    imageOutput.innerHTML = images   
}