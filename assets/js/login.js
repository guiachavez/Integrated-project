import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'

// Initialize Authentication
const auth = getAuth(app)
const provider = new GoogleAuthProvider(app)

//login method using email
const loginButton = document.querySelector('.login')
const errorMsg = document.querySelector('.error-msg')
loginButton.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = loginButton.email.value
    const pw = loginButton.password.value

    signInWithEmailAndPassword(auth, email, pw)
        .then((cred) => {
            console.log('user logged in: ', cred.user)
            window.location.href = './index.html'
        })
        .catch((err) => {
            console.log(err.message)
            errorMsg.style.display = 'block';
            errorMsg.innerHTML = 'Incorrect username or password';
        })
})

//login method using google
const googleButton = document.querySelector('.google-btn')
googleButton.addEventListener('click', (e) => {
    e.preventDefault();

    signInWithRedirect(auth, provider)
});

window.onload = (event) => {
    getRedirectResult(auth)
    .then((result) => {

        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        
        const user = result.user;
        console.log('user logged in: ', user.email)
        window.location.href = './index.html'
    })
    .catch((err) => {
        if (err.length > 0) {
            console.log(err.message)   
        }
    })
}

//forgot pw function
const forgotPw = document.querySelector('.login-forgotpw');
forgotPw.addEventListener('click', (e) => {
    e.preventDefault();

    var forgotDiv = document.getElementById("forgot-email");
        
        forgotDiv.classList.add('modal-active')
        // if (forgotDiv.style.display === "none") {
        //     forgotDiv.style.display = "block";
        // }
    })
    
const submitForgot = document.querySelector('.submit_forgot');
submitForgot.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = submitForgot.forgotemail.value
    
    sendPasswordResetEmail(auth, email)
        .then(() => {
            setTimeout(function() {
                alert("Password reset email sent!")
            }, 200)
            
            $('.modal').removeClass('modal-active')
        })
        .catch((err) => {
            console.log(err.message)
        });

        
})