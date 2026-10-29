// Global

async function loadComponents() {
    const header = document.getElementById("header");
    const footer = document.getElementById("footer");

    const headerResponse = await fetch("/assets/components/header.html");
    header.innerHTML = await headerResponse.text();

    const footerResponse = await fetch("/assets/components/footer.html");
    footer.innerHTML = await footerResponse.text();

    const hamburger = document.querySelector(".hamburger");
    const slideMenu = document.querySelector(".slide-menu");

    if (hamburger && slideMenu){
        hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        slideMenu.classList.toggle("active");
    })
    }
    };

loadComponents();


// Homepage


async function homeHero() {
    const hero = document.getElementById("hero")

    if (!hero) return

    try {
        const response = await fetch ("/assets/components/hero.html")

        if (!response.ok){
            throw new Error(`Failed to load hero`)
        }

        hero.innerHTML = await response.text()
    } catch (error){
        console.error(error)
    }
    
}



document.addEventListener("DOMContentLoaded", () => {
    homeHero();
});

// About

async function aboutHero() {
    const hero = document.getElementById("a-hero")

    if (!hero) return

    try {
        const response = await fetch ("/assets/components/about-hero.html")

        if (!response.ok){
            throw new Error(`Failed to load hero`)
        }

        hero.innerHTML = await response.text()
    } catch (error){
        console.error(error)
    }
    
}



document.addEventListener("DOMContentLoaded", () => {
    aboutHero();
});


