import { getFirestore, documentId, query, where, doc, getDocs, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { app } from './config.js'


// init the firestore and storage
const db = getFirestore(app)

//references
const adoptJourney = collection(db, 'adoptionJourney')
const aniRef = collection(db, "animals")

let adposts = []
getDocs(adoptJourney).then((posts) => { 
    
 
    posts.docs.forEach( (doc) => {
        adposts.push([doc.id, {...doc.data()}])
    })

    for(const i in adposts) {
        let petPhoto = adposts[i][1].photo
        console.log(adposts[i][1].body)
        $('#stories').append([
            $('<div />', {'class': `story story-${i}`, 'data-id': `${adposts[i][0]}`}).append([
                $('<div />', {'class': 'story-details'}).append([
                    $('<div />', {'class': 'story-photos slider'}),
                    $('<div />').append([
                        $('<p />', {text: `${adposts[i][1].petDetails.petName}`, class: 'pet-name'}),
                        $('<p />', {text: 'Adopted by ', class: 'owner-name'}).append([
                            $('<span />', {text: `${adposts[i][1].petDetails.ownerFname}`})
                        ]),
                        $('<p />', {text: `${adposts[i][1].authorDetails.city}, ${adposts[i][1].authorDetails.state}`, class: 'owner-location'})
                    ])
                ]),
                $('<div />', {'class': 'story-content'}).append([
                    $('<p />', {text: `${adposts[i][1].title}`, class: 'story-title'}),
                    $('<p />', {text: `${adposts[i][1].body}` })
                ])
            ])
        ])

        for(const key in petPhoto) {
            $(`.story-${i} .story-photos`).append([
                $('<div />', {'class': `story-img`}).append([
                    $('<img>', {'src': petPhoto[key]})
                ])
            ])
        }

        $('.story-photos').not('.slick-initialized').slick({
            infinite: true,
            dots: true,
            arrows: false,
            slidesToShow: 1,
            slidesToScroll: 1
        });
    }
})

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





