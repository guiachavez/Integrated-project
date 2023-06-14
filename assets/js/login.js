import { getAuth, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
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
            window.location.href ="./../main/ownerpost.html"
        })
        .catch((err) => {
            console.log(err.message)
        })
})