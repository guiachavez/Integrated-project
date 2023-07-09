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
    // })
}