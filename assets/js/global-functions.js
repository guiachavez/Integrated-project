import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { app } from './config.js'


const auth = getAuth(app)

$("header").load("header.html"); 
$("footer").load("footer.html");

window.onload = function() {
    console.log('loaded')

        $('.header-link a').each(function() {
            console.log('here')
            console.log($(this).attr('data-path'))

            if (window.location.pathname.includes($(this).attr('data-path'))) {
                $(this).closest('li').addClass('selected')
            } else {
                $(this).closest('li').removeClass('selected')
            }
        })
        

    onAuthStateChanged(auth, (user) => {
        let login = document.getElementById("login") 
        let profile = document.getElementById("login_profile")   
        if (user) {

            // profile.innerText = "Profile"
            // profile.href = "./profile.html" 
            // profile.setAttribute("data-path", "profile");
            $('#login').closest('li').css('display', 'none')
            $('#profile').closest('li').css('display', 'block')
            // login.style.display = 'none'
            // profile.style.display = 'block'
        } else {
            $('#login').closest('li').css('display', 'block')
            $('#profile').closest('li').css('display', 'none')
            // login.style.display = 'block'
            // profile.style.display = 'none'
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