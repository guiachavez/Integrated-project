import { getFirestore, collection, getDocs, setDoc, addDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { app } from './config.js'


// init the firestore and storage
const db = getFirestore(app)
const storage = getStorage(app);

// collection refererence
const colRef = collection(db, 'owners')

// get collection data, returns promise
getDocs(colRef)
    .then((snapshot) => {
        let owners = []

        snapshot.docs.forEach((doc) => {
            owners.push({...doc.data(), id: doc.id })
        })
        console.log(owners)
    })
    .catch(err => {
        console.log(err.message)
    })

// setting up classes
class Petowner {
    constructor(firstName, lastName, email, phone, add1, add2, city, country, pcode, state, photo) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.address = {
            address1: add1,
            address2: add2,
            city: city,
            country: country,
            postcode: pcode,
            state: state
        }
        this.photo = photo;
    }
}

// adding document to firestore
const addPetOwner = document.querySelector('.add')
addPetOwner.addEventListener('submit', handleForm)

function handleForm(e) {  
    e.preventDefault();
    let firstName = fname.value;
    let lastName = lname.value;
    let email = owneremail.value;
    let phone = ownerphone.value;
    let address1 = add1.value;
    let address2 = add2.value;
    let ownercountry = country.value;
    let ownercity = city.value;
    let postalcode = pcode.value;
    let ownerstate = state.value;
    let ownerphoto = myFile.files[0]
    let filename = myFile.files[0].name
    let url
    
    // image upload to FIRESTORAGE
    const storageRef = ref(storage, 'images/'+filename);
    const metadata = {
        contentType: 'image/jpeg',
    };
    const uploadTask = uploadBytesResumable(storageRef, ownerphoto, metadata);

    uploadTask.on('state_changed',
        (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(progress);
        },
        (error) => {
            alert(error);
        },
        () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref)
                .then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    url = downloadURL;  
                });
        }
    )

     // add downloadURL to FIRESTORE
    setTimeout(() => {
        const petowner = new Petowner(firstName, lastName, email, phone, address1, address2, ownercountry, ownercity, postalcode, ownerstate, url)
        const docRef = collection(db, 'owners')
        addDoc(docRef, Object.assign({}, petowner))
            .then(() => {
                addPetOwner.reset()
        })
    }, 5000)
}


// adding documents
// const addPetOwner = document.querySelector('.add')
// addPetOwner.addEventListener('submit', (e) => {
//     e.preventDefault();

//     addDoc(colRef, {
//         email: addPetOwner.email.value,
//         phone: addPetOwner.phone.value,
//         address: {
//             country: addPetOwner.country.value,
//             city: addPetOwner.city.value
//         }
//     })
//     .then(() => {
//         addPetOwner.reset()
//     })
// })

// deleting document
// const deletePetOwner = document.querySelector('.delete')
// deletePetOwner.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const docRef = doc(db, 'owners', deletePetOwner.id.value)

//     deleteDoc(docRef)
//         .then(() => {
//             deletePetOwner.reset()
//         })

// })


