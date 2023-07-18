import { getFirestore, documentId, query, where, doc, getDocs, addDoc, collection, serverTimestamp, orderBy } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { app } from './config.js'
import { globalShowPosts } from './global-functions.js'


// init the firestore and storage
const db = getFirestore(app)

//references
const adoptJourney = collection(db, 'adoptionJourney')
const aniRef = collection(db, "animals")

const sortedQuery = query(adoptJourney, orderBy("posted_at"))
    showPosts(sortedQuery) 

//for sorting using date posted
const sortby = document.getElementById('sort')
sortby.addEventListener('change', () => {
    $('#stories').empty();
    if (sortby.value == "descending") {
        const sortedQuery = query(adoptJourney, orderBy("posted_at", "desc"))
        showPosts(sortedQuery)
    } else if (sortby.value == "ascending") {
        const sortedQuery = query(adoptJourney, orderBy("posted_at"))
        showPosts(sortedQuery)    
    }
})

function showPosts(sortedQuery) {
    globalShowPosts(sortedQuery)
}


$(document).ready(function() {  
    var article = document.getElementsByClassName('article');
    
    for (let i = 0; i < article.length; i++) {
        article[i].addEventListener('click', function() {
            this.classList.toggle('active');

            if ($(this).hasClass("active")) {
                $(this).find('img').css('transform', 'rotate(90deg)')
            } else {
                $(this).find('img').css('transform', 'rotate(0deg)')
            }

            var content = this.nextElementSibling;

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            } 
        });
    }
});