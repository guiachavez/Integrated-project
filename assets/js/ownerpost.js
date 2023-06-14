import { getFirestore, collection, getDoc, getDocs, setDoc, addDoc, deleteDoc, doc, updateDoc, arrayUnion } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'


// init the firestore and storage
const db = getFirestore(app)
const storage = getStorage(app);

// Initialize Authentication
const auth = getAuth(app)

// collection refererence
const aniRef = collection(db, 'animals')

// // setting up classes
class Petdetails {
    constructor(pname, ptype, pbreed, pcolor, page, pgender, psize, pht, pgwc, photo, ownerid) {
        this.name = pname;
        this.type = ptype;
        this.breed = pbreed;
        this.color = pcolor;
        this.age = page;
        this.gender = pgender;
        this.size = psize;         
        this.attributes = {
                house_trained: pht,
                good_with_children: pgwc
                            };
        this.photo = photo;
        this.owner_id = ownerid;
    }
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        const uidRef = doc(db, "accounts", user.uid)      
      
        getDoc(uidRef).then(docSnap => { 
            let data = docSnap.data();
            let table = document.getElementById('ownerDetails')
            let row  = `<tr>
                            <td>${data.email}</td>
                            <td>${data.firstName}</td>
                            <td>${data.lastName}</td>
                        </tr>`;
                    
            table.innerHTML += row
        })

        // adding document to firestore
        const addPet = document.querySelector('.postpet')
        const submit = document.getElementById('post-pet')

        submit.addEventListener('click', (e) => {
            handleForm(user);
        })

        // adding documents
        // const addPetDetails = document.querySelector('.postpet')
        // addPetDetails.addEventListener('submit', (e) => {
        //     e.preventDefault();

        // addDoc(aniRef, {
        //     name: addPet.pname.value,
        //     type: addPet.ptype.value,
        //     breed: addPet.pbreed.value,
        //     color: addPet.pcolor.value,
        //     age: addPet.page.value,
        //     gender: addPet.pgender.value,
        //     size: addPet.psize.value,
        //     attributes: {
        //         good_with_children: addPet.pgwc.value,
        //         house_trained: addPet.pht.value
        //     },
        //     owner_id: user.uid
        // })
        // .then(() => {
        //     addPet.reset()
        // })
    }
});

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

function handleForm(user) {
    let pname = document.getElementById('pname').value;
    let ptype = document.getElementById('ptype').value;
    let pbreed = document.getElementById('pbreed').value;
    let page = document.querySelector('input[name="age"]:checked').value;
    let pgender = document.querySelector('input[name="gender"]:checked').value;
    let psize = document.querySelector('input[name="size"]:checked').value;
    let pcolor = document.getElementById('pcolor').value;
    let pgwc = JSON.parse(document.querySelector('input[name="children"]:checked').value);
    let pht = JSON.parse(document.querySelector('input[name="trained"]:checked').value);
    let petphoto = myFile.files[0]
    let filename = myFile.files[0].name
    let url
    let ownerid = user.uid

    // image upload to FIRESTORAGE
    const storageRef = ref(storage, 'images/'+filename);
    const metadata = {
        contentType: 'image/jpeg',
    };
    const uploadTask = uploadBytesResumable(storageRef, petphoto, metadata);

    uploadTask.on('state_changed',
        (snapshot) => {
        // Getting the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(progress);
        },
        (error) => {
            console.log(error);
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
        const petdetails = new Petdetails(pname, ptype, pbreed, pcolor, page, pgender, psize, pht, pgwc, url, ownerid)
        // const docRef = collection(db, 'animals')
        addDoc(aniRef, Object.assign({}, petdetails))
            .then(() => {
                addPet.reset()
        })
    }, 5000)

    //add breed and color
    const typeRef = doc(db, 'types', ptype)
    updateDoc(typeRef, 
    {
        breeds: arrayUnion(pbreed),
        colors: arrayUnion(pcolor)
    });
}
