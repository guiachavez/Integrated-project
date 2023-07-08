const subNav = document.querySelector(".dd-pet")

const subNavList = document.querySelector(".find-pet-dd")

const hamMenu = document.querySelector(".hamburger-menu")

const mainMenu = document.querySelector(".header-link")

const loginSignup = document.querySelector(".login")

var hamMenuValue = true;

subNav.addEventListener('mouseenter', function(){
    subNavList.style.display = 'block';
})

subNav.addEventListener('mouseleave', function(){
    subNavList.style.display = 'none';
})

hamMenu.addEventListener('click', function(){
    if(hamMenuValue){
        mainMenu.style.display = 'block';
        loginSignup.style.display = 'block';
    }
    else{
        mainMenu.style.display = 'none';
        loginSignup.style.display = 'none';
    }

    hamMenuValue = !hamMenuValue
})