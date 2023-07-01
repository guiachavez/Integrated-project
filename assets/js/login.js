import { getAuth, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'

// Initialize Authentication
const auth = getAuth(app)

// login and logout
const logoutButton = document.querySelector('.logout')
logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('user signed out')
        })
        .catch((err) => {
            console.log(err.message)
        })
})

const loginButton = document.querySelector('.login')
loginButton.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = loginButton.email.value
    const pw = loginButton.password.value

    signInWithEmailAndPassword(auth, email, pw)
        .then((cred) => {
            console.log('user logged in: ', cred.user)
            //window.location.href ="./../main/ownerpost.html"
        })
        .catch((err) => {
            console.log(err.message)
        })
})


 
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
 