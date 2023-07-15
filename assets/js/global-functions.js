import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { app } from './config.js'


const auth = getAuth(app)

$("header").load("header.html"); 
$("footer").load("footer.html");

window.onload = function() {

        $('.header-link a').each(function() {
            if (window.location.pathname.includes($(this).attr('data-path'))) {
                console.log($(this).attr('data-path'))
                $(this).closest('li').addClass('selected')
            } else {
                $(this).closest('li').removeClass('selected')
            }
        })
        

    onAuthStateChanged(auth, (user) => {
        let login = document.getElementById("login") 
        let profile = document.getElementById("login_profile")   
        if (user) {
            $('#login').closest('li').css('display', 'none')
            $('#profile').closest('li').css('display', 'block')

        } else {
            $('#login').closest('li').css('display', 'block')
            $('#profile').closest('li').css('display', 'none')
        }
    })

    $('.go-home').on('click', function() {
        window.location.href = './index.html'
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