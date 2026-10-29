const hamburger = document.querySelector(".hamburger");
const slideMenu = document.querySelector(".slide-menu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    slideMenu.classList.toggle("active");
});


