import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, collection, getDocs, getDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js'
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { app } from './config.js'


const auth = getAuth(app)

$("header").load("header.html"); 
$("footer").load("footer.html");

window.onload = function() {
    onAuthStateChanged(auth, (user) => {
        console.log(user)
        let login = document.getElementById("login") 
        let profile = document.getElementById("login_profile")   
        if (user) {
            //$('#login').closest('li').css('display', 'none')
            $('.profile').text('Profile')
            $('.profile').attr('href', './profile.html')

        } else {
            //$('#login').closest('li').css('display', 'block')
            $('.profile').text('Log in')
            $('.profile').attr('href', './login.html')
        }
    })
}

// For displaying uploaded images

export function imageUpload() {
    let imageInput = document.getElementById('myFile');
    let imageOutput = document.querySelector('.displayImages')
    let imageArr = []

    imageInput.addEventListener("change", () => {
        let uploadedImages = imageInput.files

        for(let i=0; i<uploadedImages.length; i++) {
            imageArr.push(uploadedImages[i])
        }

        displayImages()
    })

    const displayImages = () => {
        let images = ''

        imageArr.forEach((img, i) => {
            images += `<div class="upload-image">
                            <img src="${URL.createObjectURL(img)}" alt="image">
                            <div class="close">&times;</div>
                        </div>`
        })

        imageOutput.innerHTML = images   

        $('.close').each(function() {
            $(this).on('click', () => {
                $(this).closest('.upload-image').remove()
            })
        })
    }
}

export function uploadToStorage(photo, imagesArr, docRef) {
    for (var i = 0; i < photo.length; i++) {
        const file = photo[i];
        const storage = getStorage();
        const metadata = {
            contentType: "image/jpeg"
        };
        const storageRef = ref(storage, "adoptionImages/" + docRef.id + "/" + file.name);
    
        imagesArr.push(uploadBytes(storageRef, file, metadata)
            .then(uploadResult => {
                return getDownloadURL(uploadResult.ref)
            })
        )
    }  
}

export function globalShowPosts(sortedQuery) {
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
                        $('<p />', {text: `Posted ${diffDays} day(s) ago.`, class: 'posted-date' })
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

// const subNav = document.querySelector(".dd-pet")
    // const subNavList = document.querySelector(".find-pet-dd")

    // const hamMenu = document.querySelector(".hamburger-menu")
    // const mainMenu = document.querySelector(".header-link")
    // const loginSignup = document.querySelector(".login")

    // const menu = document.querySelector(".menu")

    // var hamMenuValue = true;

    // subNav.addEventListener('mouseenter', function(){
    //     subNavList.style.display = 'block';
    // })

    // subNav.addEventListener('mouseleave', function(){
    //     subNavList.style.display = 'none';
    // })

    // hamMenu.addEventListener('click', function(){
    //     if(hamMenuValue){
    //         mainMenu.style.display = 'block';
    //         loginSignup.style.display = 'block';
    //     }
    //     else{
    //         mainMenu.style.display = 'none';
    //         loginSignup.style.display = 'none';
    //     }

    //     menu.classList.toggle("menu-nav")
    //     menu.classList.toggle("menu-mob")
    //     hamMenuValue = !hamMenuValue
    // 