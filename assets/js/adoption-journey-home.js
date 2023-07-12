import { getFirestore, documentId, query, where, doc, getDocs, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { app } from './config.js'


// init the firestore and storage
const db = getFirestore(app)

//references
const adoptJourney = collection(db, 'adoptionJourney')
const aniRef = collection(db, "animals")

getDocs(adoptJourney).then((posts) => { 
    let adposts = []
 
    posts.docs.forEach( (doc) => {
        adposts.push({...doc.data(), id: doc.id })

        let postsdata = doc.data()

        const petPhoto = query(aniRef, where(documentId(), "==", postsdata.petDetails.petId))

        getDocs(petPhoto).then((photo) => {
        
            let petphoto = []
            console.log(petphoto)

            photo.docs.forEach( (doc) => {
                petphoto.push({...doc.data(), id: doc.id })
                let petphotodata = doc.data()

        let photo = petphotodata.photo[0];
        let table = document.getElementById('postDetails');

        // document.querySelector('#petphoto').src = photo;

        let row  = `<tr>
        <td>${postsdata.title}</td>
        <td>${postsdata.body}</td>
        <td>${petphotodata.photo[0]}</td>
        <td>${postsdata.petDetails.petName}</td>
        <td>${postsdata.authorDetails.firstName}</td>
        <td>${postsdata.petDetails.ownerLname}</td>
        <td>${postsdata.authorDetails.city}</td>
        <td>${postsdata.authorDetails.state}</td>

                </tr>`;
  
        table.innerHTML += row

})
})
    })
})
