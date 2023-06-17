import { app } from './config.js' 
import { petfinderAPI, token } from './config.js'
import { getFirestore, collection, getDoc, getDocs, setDoc, addDoc, deleteDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'

// init the firestore and storage
const db = getFirestore(app)

let newOption = new Option('Option Text','Option Value');

const colorList = document.getElementById('color');
const breedList = document.getElementById('breed');
const petType = document.getElementById('pet-type')

var tokenType;
var tokenAccess;

// for dropdown handler COLOR and BREED
const source = document.getElementById('source'); 

source.addEventListener('change', (e) => {
    removeOpt(colorList)
    removeOpt(breedList)
    console.log(e.target.value)
    if (e.target.value == 'shelter') {
        changeAttr()
    } else if (e.target.value == 'owner') {
        ownerDropdown()
    }
})

petType.addEventListener('change', (e) => {
    removeOpt(colorList)
    removeOpt(breedList)
    if ($('#source').val() == 'shelter') {
        changeAttr();
    } else if ($('#source').val() == 'owner') {
        ownerDropdown();
    }
})

function removeOpt(selectOption) {
    let opt = selectOption.options.length - 1;

    for(let i = opt; i >= 1; i--) {
        selectOption.remove(i);
    }
}

function changeAttr() {
    const typeSelected = petType.value

    fetch('https://api.petfinder.com/v2/oauth2/token', {
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + petfinderAPI + '&client_secret=' + token,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        tokenType = data.token_type
        tokenAccess = data.access_token
        return fetch('https://api.petfinder.com/v2/types', {              
            headers: {
                'Authorization': tokenType + ' ' + tokenAccess,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }).then(function (resp) {
        // Return the API response as JSON
        return resp.json();

    }).then(function (data) {

        for(const type in data.types) {
            const petObj = data.types[type]
            // console.log(petObj)
            if(petObj.name == typeSelected) {

                let colorArr = petObj.colors
                for(const el of colorArr) {
                    newOption = new Option(el, el);
                    colorList.add(newOption,undefined);
                }
            }
        }

        return fetch('https://api.petfinder.com/v2/types/' + typeSelected + '/breeds', {
            headers: {
                'Authorization': tokenType + ' ' + tokenAccess,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }).then(function (resp) {
        return resp.json();
    }).then(function (data) {
        for(const name in data.breeds) {
            // console.log(data.breeds[name])
            const breedObj = data.breeds[name]
            let breedArr = []
            breedArr.push(breedObj.name)
            // console.log(breedArr)
            for(const el of breedArr) {
                // console.log(el)
                newOption = new Option(el, el);
                breedList.add(newOption,undefined);
            }
        }
    }).catch((err) => {
        console.log(err)
    })
}

function ownerDropdown() {
    const typeRef = doc(db, "types", petType.value)

    getDoc(typeRef).then(docSnap => { 
        let data = docSnap.data();

        for(const br in data.breeds) {
            const breedObj = data.breeds[br]
            let breedArr = []
            
            breedArr.push(breedObj)

            for(const el of breedArr) {
                newOption = new Option(el, el);
                breedList.add(newOption,undefined); 
            }
        }

        for(const cl in data.colors) {
            const colorObj = data.colors[cl]
            let colorArr = []

            colorArr.push(colorObj)

            for(const el of colorArr) {
                newOption = new Option(el, el);
                colorList.add(newOption,undefined); 
            }
        }
    });
}