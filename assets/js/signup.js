import { getFirestore, setDoc, doc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'
 

// init the firestore and storage
const db = getFirestore(app)

// Initialize Authentication
const auth = getAuth(app)
const provider = new GoogleAuthProvider(app)

// setting up classes
class accountSignup {
    constructor(uid, firstName, lastName, email, isOwner, photo, phone, street, city, country, pcode, state) {
        this.uid = uid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.isOwner = isOwner;
        this.photo = photo;
        this.phone = phone;
        this.address = {
            street: street,
            city: city,
            country: country,
            postcode: pcode,
            state: state
        }
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
    let phone = '';
    let street = '';
    let city = '';
    let country = '';
    let pcode = '';
    let state = '';
    
    //create user in auth
    createUserWithEmailAndPassword(auth, email, pw)
        .then(() => {
            let uid = auth.currentUser.uid
            let isOwner = false   
            let photo = 'https://firebasestorage.googleapis.com/v0/b/pawfectmatch-30994.appspot.com/o/Feather.png?alt=media&token=2053c6c8-df6c-4be6-b2f2-e27d3a5c6421'

            if(saveAccount(uid, firstName, lastName, email, isOwner, photo, phone, street, city, country, pcode, state)){           
                addAccount.reset()
            }

        }) 
        .catch((err) => {
            console.log(err.message)
            alert("Account already exists!")
            addAccount.reset()   
        })
}

//sign up using google
const googleButton = document.querySelector('.google-btn');

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
        const displayNameParts = user.displayName.split(' ');

        let uid = user.uid
        let firstName = displayNameParts.length > 0 ? displayNameParts[0] : '';
        let lastName = displayNameParts.length > 1 ? displayNameParts.slice(1).join(' ') : '';
        let email = user.email
        let isOwner = false
        let photo = user.photoURL
        let phone = '';
        let street = '';
        let city = '';
        let country = '';
        let pcode = '';
        let state = '';

        saveAccount(uid, firstName, lastName, email, isOwner, photo, phone, street, city, country, pcode, state)

    }) 
    .catch((err) => {
        if (err.length > 0) {
            console.log(err.message)   
        }
    })
    
}

function saveAccount(uid, firstName, lastName, email, isOwner, photo, phone, street, city, country, pcode, state) {

    const petowner = new accountSignup(uid, firstName, lastName, email, isOwner, photo, phone, street, city, country, pcode, state)
    const docRef = doc(db, 'accounts', uid)
    const accRef = collection(db, 'accounts')
    const emailQuery = query(accRef, where("email", "==", email));
    
    getDocs(emailQuery)
        .then((snapshot) => {
            if (snapshot.empty) {
                setDoc(docRef, Object.assign({}, petowner))
                .then(() => {
                    window.location.href = './index.html'
                })
            } else {
                alert("Account already exists!")
            }

            return true;
        })
}
