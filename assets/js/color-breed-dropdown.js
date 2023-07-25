import { app } from './config.js' 
import { petfinderAPI, token } from './config.js'
import { getFirestore, collection, getDoc, getDocs, setDoc, addDoc, deleteDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'

// init the firestore and storage
const db = getFirestore(app)

let newOption = new Option('Option Text','Option Value');

const colorList = document.getElementById('color');
const breedList = document.getElementById('breed');
const petType = document.getElementById('pet-type');
const orgList = document.getElementById('orgId');

var tokenType;
var tokenAccess;

// for dropdown handler COLOR and BREED
const source = document.getElementById('source'); 

// access set location
let position = JSON.parse(localStorage.getItem('position'))
let latlong

if (position.lng == undefined) {
    latlong = `${position.lat},${position.lon}`
} else {
    latlong = `${position.lat},${position.lng}`
}

source.addEventListener('change', (e) => {
    console.log(e.target.value)
    if (e.target.value == 'shelter') {
        changeAttr(latlong)
    } else if (e.target.value == 'owner') {
        ownerDropdown()
    }
})

petType.addEventListener('change', (e) => {
    if ($('#source').val() == 'shelter') {
        changeAttr(latlong);
    } else if ($('#source').val() == 'owner') {
        ownerDropdown();
    }
})

// for changing the options on dropdown
function removeOpt(selectOption) {
    let opt = selectOption.options.length - 1;

    for(let i = opt; i >= 1; i--) {
        selectOption.remove(i);
    }
}

export function changeAttr(latlong) {
    removeOpt(colorList)
    removeOpt(breedList)
    removeOpt(orgList)

    const typeSelected = document.getElementById('pet-type').value

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
        console.log(data)
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

        return fetch(`https://api.petfinder.com/v2/organizations?distance=10&location=${latlong}&page=1`, {
            headers: {
                'Authorization': tokenType + ' ' + tokenAccess,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }).then(function (resp) {
        return resp.json();
    }).then(function (data) {
        console.log(data)

        for(const org in data.organizations) {
            const organization = data.organizations[org]
            let orgObj = {name: organization.name, id: organization.id}
            let orgArr = []

            orgArr.push(orgObj)

            console.log(orgArr)
            for(const el of orgArr) {
                // console.log(el)
                newOption = new Option(el.name, el.id);

                orgList.add(newOption,undefined);
            }
        }

        document.getElementById('orgId').value = localStorage.getItem('orgId')

        return fetch('https://api.petfinder.com/v2/types/' + typeSelected + '/breeds', {
            headers: {
                'Authorization': tokenType + ' ' + tokenAccess,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
    }).then(function (resp) {
        return resp.json();
    }).then(function (data) {
        console.log(data)

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

export function ownerDropdown() {
    removeOpt(colorList)
    removeOpt(breedList)

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
            console.log(breedList)
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