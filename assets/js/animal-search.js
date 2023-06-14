import { getFirestore, collection, getDocs, getDoc, setDoc, addDoc, deleteDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { app } from './config.js'
import { petfinderAPI, token } from './config.js'
 

// init the firestore and storage
const db = getFirestore(app)
const storage = getStorage(app);

// collection refererence
const aniRef = collection(db, 'animals')

// get collection data
getDocs(aniRef)
    .then((snapshot) => {
        let animals = []

        snapshot.docs.forEach( (doc) => {
            animals.push({...doc.data(), id: doc.id })
            let data = doc.data();
            console.log(data)
            if (data.attributes.good_with_children == 1) {
                var gc = 'Yes'
            } else {
                var gc = 'No'
            }    

            let row  = `<tr>
                            <td>${data.name}</td>
                            <td>${data.age}</td>
                            <td>${data.size}</td>
                            <td>${data.gender}</td>
                            <td>${data.type}</td>
                            <td>${data.breed}</td>
                            <td>${gc}</td>
                            <td>${data.description}</td>
                            <td>${data.owner_id}</td>
                            <td>${data.contact.email}</td>
                            <td>${data.contact.phone}</td>
                        </tr>`;
            let table = document.getElementById('myTable')
            table.innerHTML += row
        })

    })
    .catch(err => {
        console.log(err.message)
    })

// filter function    
const searchAnimals = document.querySelector('.search')

searchAnimals.addEventListener('submit', ()=> {
    let type = document.getElementById('pet-type').value;
    let source = document.getElementById("source").value;
    let breed = document.getElementById("breed").value;
    let age = document.querySelector('input[name="age"]:checked').value;
    let gender = document.querySelector('input[name="gender"]:checked').value;
    let size = document.querySelector('input[name="size"]:checked').value;
    let color = document.getElementById("color").value;
    let goodWithChildren = JSON.parse(document.querySelector('input[name="children"]:checked').value);
    let houseTrained = document.querySelector('input[name="trained"]:checked').value;
    
    //convert values to array
    let ageArr = age.split(",");
    let sizeArr = size.split(",");
    let genderArr = gender.split(",");
    let typeArr = type.split(",");
    let breedArr = breed.split(",");  

    $('#filtered-pets').empty();
    if (source == 'owner') {
        searchOwner(ageArr, sizeArr, genderArr, typeArr, breedArr, goodWithChildren)
    } else {
        searchPetFinder(type, breed, age, gender, size, color, goodWithChildren, houseTrained)
    }
})

var searchOwner = (ageArr, sizeArr, genderArr, typeArr, breedArr, goodWithChildren) => {

    const q = query(aniRef, 
        where("age", "in", ageArr), 
        where("size", "in", sizeArr), 
        where("gender", "in", genderArr), 
        where("type", "in", typeArr),
        where("breed", "in", breedArr),
        where("attributes.good_with_children", "==", goodWithChildren));

    getDocs(q)
        .then(querySnapshot => {
            querySnapshot.forEach((doc) => {
                let results = []

                results.push(doc.id, " => ", doc.data())
                let data = doc.data();
                let row  = `<tr>
                                <td>${data.name}</td>
                                <td>${data.age}</td>
                                <td>${data.size}</td>
                                <td>${data.gender}</td>
                                <td>${data.type}</td>
                                <td>${data.breed}</td>
                                <td>${data.description}</td>
                                <td>${data.contact.email}</td>
                                <td>${data.contact.phone}</td>
                            </tr>`;
                let table = document.getElementById('result')
                table.innerHTML += row
            
            });
        })
}

// renewing token for petfinder API
var searchPetFinder = (type, breed, age, gender, size, color, goodWithChildren, houseTrained) => {
    fetch('https://api.petfinder.com/v2/oauth2/token', {
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + petfinderAPI + '&client_secret=' + token,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        return fetch(`https://api.petfinder.com/v2/animals?type=${type}&breed=${breed}&age=${age}&gender=${gender}&size=${size}&color=${color}&good_with_children=${goodWithChildren}&house_trained=${houseTrained}&location=Vancouver, BC&distance=9`, {
            headers: {
                'Authorization': data.token_type + ' ' + data.access_token,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }).then(function (resp) {
        // Return the API response as JSON
        return resp.json();
    }).then(function (data) {
        console.log('pets', data);
        // APPEND PET RESULTS TO FRONT END
        for(const pet in data) {
            if(pet == 'animals') {
                const petObj = data[pet];

                for(const i in petObj) {
                    $('#filtered-pets').append([
                        $('<div />', {'class': `pet-${i}`}).append([
                            $('<div />', {'class': 'pet-details'}).append([
                              $('<p />', {text: `${petObj[i].species}, ${petObj[i].name}, ${petObj[i].gender}` })
                            ])
                        ])
                    ])

                    for(const photo in petObj[i].photos) {
                        $(`.pet-${i}`).append([
                            $('<div />', {'class': 'pet-photos'}).append([
                                $('<img>', {'src': petObj[i].photos[photo].small})
                            ])
                        ])
                    }
                }
            }
        }
    }).catch((err) => {
        console.log(err)
    })
}