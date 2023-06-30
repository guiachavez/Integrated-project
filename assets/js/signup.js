import { getFirestore, setDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'


// init the firestore and storage
const db = getFirestore(app)

// Initialize Authentication
const auth = getAuth(app)

// setting up classes
class accountSignup {
    constructor(uid, firstName, lastName, email, isOwner) {
        this.uid = uid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.isOwner = isOwner;
    }
}



// adding document to firestore
const addAccount = document.querySelector('.signup')
addAccount.addEventListener('submit', handleForm)

function handleForm(e) {
    e.preventDefault();
    
    let email = useremail.value;
    let pw = signuppw.value
    let firstName = fname.value;
    let lastName = lname.value;
    
    //create user in auth
    createUserWithEmailAndPassword(auth, email, pw)
        .then(() => {
            let uid = auth.currentUser.uid
            let isOwner = false   

            const petowner = new accountSignup(uid, firstName, lastName, email, isOwner)
            const docRef = doc(db, 'accounts', uid)
            
            setDoc(docRef, Object.assign({}, petowner))
                .then(() => {
                    addAccount.reset()
                })
            // window.location.href ="./../main/profile.html"
        }) 
        .catch((err) => {
            console.log(err.message)   
        })
}




const firebaseConfig = {
    apiKey: "AIzaSyAdLOXJVUxHlv8GCi6G_0j-12e_cCmzGkw",
     authDomain: "fir-projects-37dfd.firebaseapp.com",
     projectId: "fir-projects-37dfd",
     storageBucket: "fir-projects-37dfd.appspot.com",
     messagingSenderId: "552149961611",
     appId: "1:552149961611:web:c54ea11939e6da05d57d8e",
     measurementId: "G-FKNKXH7SJW"
 };
 
 
 
 
 import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js'
 import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
 
 
//  const app = initializeApp(firebaseConfig);
 const provider = new GoogleAuthProvider(app);
//  auth = getAuth(app);
 
 const googleButton = document.querySelector('.google-sign-in')
 
 googleButton.addEventListener('click', (e) =>{
     e.preventDefault();
 
     signInWithRedirect(auth, provider);
 
     getRedirectResult(auth)
     .then((result) => {
     // This gives you a Google Access Token. You can use it to access Google APIs.
     const credential = GoogleAuthProvider.credentialFromResult(result);
     const token = credential.accessToken;
 
     // The signed-in user info.
     const user = result.user;
     // IdP data available using getAdditionalUserInfo(result)
     // ...
 
     //name , email
 
     alert(cred.user);
 
 
   }).catch((error) => {
     // Handle Errors here.
     const errorCode = error.code;
     const errorMessage = error.message;
     // The email of the user's account used.
     const email = error.customData.email;
     // The AuthCredential type that was used.
     const credential = GoogleAuthProvider.credentialFromError(error);
     // ...
   });
 
 })
 