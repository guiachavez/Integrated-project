import { getFirestore, documentId, query, where, doc, getDocs, addDoc, collection, serverTimestamp, orderBy } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { app } from './config.js'


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

    getDocs(sortedQuery).then((posts) => { 
        let adposts = []
        posts.docs.forEach( (doc) => {
            adposts.push([doc.id, {...doc.data()}])
        })

        for(const i in adposts) {
            let petPhoto = adposts[i][1].photo
            
            // for date computation
            let datePosted = adposts[i][1].posted_at.toDate()
            const oneDay = 24 * 60 * 60 * 1000;
            const date = new Date();
            const diffDays = Math.round(Math.abs((date - datePosted) / oneDay));
            
            $('#stories').append([
                $('<div />', {'class': `story story-${i}`, 'data-id': `${adposts[i][0]}`}).append([
                    $('<div />', {'class': 'story-details'}).append([
                        $('<div />', {'class': 'story-photos slider'}),
                        $('<div />').append([
                            $('<p />', {text: `${adposts[i][1].petName}`, class: 'pet-name'}),
                            $('<p />', {text: 'Adopted by ', class: 'owner-name'}).append([
                                $('<span />', {text: `${adposts[i][1].authorDetails.firstName}`})
                            ]),
                            $('<p />', {text: `${adposts[i][1].authorDetails.city}, ${adposts[i][1].authorDetails.state}`, class: 'owner-location'})
                        ])
                    ]),
                    $('<div />', {'class': 'story-content'}).append([
                        $('<p />', {text: `${adposts[i][1].title}`, class: 'story-title'}),
                        $('<p />', {text: `${adposts[i][1].body}` }),
                        $('<br />'),
                        $('<i />', {text: `Posted ${diffDays} day(s) ago.` })
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