import { getAuth, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'

// Initialize Authentication
const auth = getAuth(app)


const signupForm = document.querySelector('.signup')
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('signup')
    const email = signupForm.email.value
    const pw = signupForm.password.value

    createUserWithEmailAndPassword(auth, email, pw)
        .then((cred) => {
            console.log('user created: ', cred.user)
            signupForm.reset()
        })
        .catch((err) => {
            console.log(err.message)
            //add frontend display here for error message
        })
})

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
        })
        .catch((err) => {
            console.log(err.message)
        })
})