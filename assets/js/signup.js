import { getFirestore, setDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
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



 
 
 const provider = new GoogleAuthProvider(app);

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
            if (user) {
              // Check Firestore for existing user information
              const docRef = doc(db, 'accounts', user.uid);
              getDoc(docRef)
                .then((doc) => {
                  if (doc.exists()) {

                    // if information already exists in Firestore, pre-fill the fields
                    const userData = doc.data();
                    useremail.value = userData.email;
                    fname.value = userData.firstName;
                    lname.value = userData.lastName;
                  } 
                  else {
                        // First-time user, prompt for additional information
                        const googleEmail = user.email;

                        const displayNameParts = user.displayName.split(' ');

                        const googleFirstName = displayNameParts.length > 0 ? displayNameParts[0] : '';
                        const googleLastName = displayNameParts.length > 1 ? displayNameParts.slice(1).join(' ') : '';

                console.log('Google Email:', googleEmail);
                console.log('Google First Name:', googleFirstName);
                console.log('Google Last Name:', googleLastName);
                    
                        // Pre-fill the fields with Google sign-in details
                        useremail.value = googleEmail;
                        fname.value = googleFirstName;
                        lname.value = googleLastName;

                        // Store the additional information in Firestore
                        const uid = user.uid;
                        const isOwner = false;
                        const petOwner = new accountSignup(uid, googleFirstName, googleLastName, googleEmail, isOwner);
                    
                        setDoc(docRef, Object.assign({}, petOwner))
                        .then(() => {
                        // Document successfully stored
                            addAccount.reset();

                        // to redirect the page ==============
                            window.location.href = './../main/index.html';
                        })
                    .catch((error) => {
                    console.log(error.message);
                    });
                }   
            })
        .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        });
    }

     })

     .catch((error) => {
        console.log(error.message);
      });
  });



 