
/* document.addEventListener("DOMContentLoaded", () => {
const buttons = document.querySelectorAll("[data-carousel-button]")

buttons.forEach(button => {
    button.addEventListener("click", () =>{
        const offset = button.dataset.carouselButton === "next"? 1 : -1
        const slides = button
        .closest("[data-carousel]")
        .querySelector("[data-slides]")

        const activeSlides = slides.querySelector("[data-active]")
        let newIndex = [...slides.children].indexOf(activeSlides) + offset
        if(newIndex < 0) {
            newIndex = slides.children.length-1
        }
        if(newIndex >= slides.children.length){
            newIndex = 0
        } 

        slides.children[newIndex].dataset.active = true
        delete activeSlides.dataset.active

    });
});

}); */


document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("[data-carousel-button]");
    const slides = document.querySelector("[data-slides]");
    let currentIndex = 0;
  
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const offset = button.dataset.carouselButton === "next" ? 1 : -1;
        currentIndex = (currentIndex + offset + slides.children.length) % slides.children.length;
        slides.children[currentIndex].dataset.active = true;
      });
    });
  });
  