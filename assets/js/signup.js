import { getFirestore, setDoc, doc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
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

// check device
var check
window.mobileCheck = function() {
    check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

  
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

    window.mobileCheck(check) 
    
    if (check == false) {
        signInWithRedirect(auth, provider);
    } else {
        signInWithPopup(auth, provider) 
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            // const credential = GoogleAuthProvider.credentialFromResult(result);
            // const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            console.log(user)
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
    }
})

if (signInWithRedirect) {
    redirect()
}

function redirect() {
    window.onload = (event) => {
        getRedirectResult(auth)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            // const credential = GoogleAuthProvider.credentialFromResult(result);
            // const token = credential.accessToken;
            // The signed-in user info.
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
    };
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
                    alert("Sign up successful!")
                    window.location.href = './index.html'
                })
            } else {
                alert("Account already exists!")
            }
            
            return true;
    
         })
}
