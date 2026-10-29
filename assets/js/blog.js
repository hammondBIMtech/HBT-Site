
(() => {
    "use strict";

    // Blog-specific elements
    const blogPage = document.getElementById("blog-page");
    const articlesContainer = document.getElementById("blog-articles");
    const paginationContainer = document.getElementById("blog-pagination");

    // Configuration
    const ARTICLES_URL = "/assets/data/blog-articles.json";
    const ARTICLES_PER_PAGE = 6;

    let articles = [];
    let currentPage = 1;

    // Stop if this page does not contain the blog
    if (!blogPage || !articlesContainer || !paginationContainer) {
        return;
    }

    // Add styles for cards and pagination
    function addBlogStyles() {
        if (document.getElementById("blog-page-styles")) return;

        const style = document.createElement("style");
        style.id = "blog-page-styles";

        style.textContent = `
            #blog-page #blog-articles {
                display: flex;
                flex-direction: column;
                gap: var(--space-m, 1.5rem);
            }

            #blog-page .kb-content-card {
                display: flex;
                flex-direction: column;
                gap: var(--space-xs, 0.75rem);
                min-width: 0;
            }

            #blog-page .kb-content-card .cc-img {
                width: 100%;
                aspect-ratio: 16 / 9;
                overflow: hidden;
            }

            #blog-page .kb-content-card .cc-img img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            #blog-page .kb-card-actions {
                display: flex;
                flex-direction: column;
                gap: var(--space-xs, 0.75rem);
                margin-top: auto;
            }

            #blog-page .kb-card-actions .button {
                display: block;
                width: 100%;
                box-sizing: border-box;
                text-align: center;
            }

            #blog-page #blog-pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-top: var(--space-l, 2rem);
            }

            #blog-page #blog-pagination button {
                min-width: 42px;
                padding: 0.65rem 0.9rem;
                border: 1px solid var(--color-secondary, #cecece);
                border-radius: 2px;
                background: transparent;
                color: inherit;
                font: inherit;
                cursor: pointer;
                transition:
                    background-color 0.2s ease,
                    color 0.2s ease,
                    transform 0.2s ease;
            }

            #blog-page #blog-pagination button:hover:not(:disabled) {
                background: var(--color-primary, #1C1A1A);
                color: var(--color-text-light, #fff);
                transform: translateY(-2px);
            }

            #blog-page #blog-pagination button.active,
            #blog-page #blog-pagination button:disabled {
                background: var(--color-primary, #1C1A1A);
                color: var(--color-text-light, #fff);
                border-color: var(--color-primary, #1C1A1A);
                cursor: default;
            }

            #blog-page #blog-pagination button:focus-visible {
                outline: 2px solid var(--color-tertiary, #C43C2F);
                outline-offset: 3px;
            }

            @media (min-width: 729px) {
                #blog-page #blog-articles {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    align-items: stretch;
                }
            }

            @media (min-width: 1024px) {
                #blog-page #blog-articles {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #blog-page #blog-pagination button {
                    transition: none;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // Fetch the JSON data
    async function fetchArticles() {
        articlesContainer.textContent = "Loading articles...";

        try {
            const response = await fetch(ARTICLES_URL);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("The articles JSON must contain an array.");
            }

            articles = data;

            // Newest dates first; IDs break ties
            articles.sort((a, b) =>
                String(b.date ?? "").localeCompare(String(a.date ?? "")) ||
                Number(b.id ?? 0) - Number(a.id ?? 0)
            );

            addBlogStyles();
            renderArticles();
            renderPagination();

        } catch (error) {
            console.error("Could not load blog articles:", error);

            articlesContainer.textContent =
                "Sorry, articles could not be loaded. Please try again later.";

            paginationContainer.replaceChildren();
        }
    }

    // Create one article card
    function createArticleCard(article) {
        const card = document.createElement("article");
        card.className = "kb-content-card";

        const title = document.createElement("h5");
        title.textContent = article.title || "Untitled article";

        const imageContainer = document.createElement("div");
        imageContainer.className = "cc-img";

        const image = document.createElement("img");
        image.src = article.imageUrl || "";
        image.alt = article.title
            ? `Image for ${article.title}`
            : "Article image";
        image.loading = "lazy";

        imageContainer.appendChild(image);

        const abstract = document.createElement("p");

        // Use abstract first; fall back to subheading or body
        const summary =
            article.abstract ||
            article.subHeading ||
            article.body ||
            "No abstract available.";

        // Keep the card summaries concise
        const plainSummary = String(summary).trim();
        const maxLength = 180;

        abstract.textContent =
            plainSummary.length > maxLength
                ? plainSummary.slice(0, maxLength).trimEnd() + "…"
                : plainSummary;

        const actions = document.createElement("div");
        actions.className = "kb-card-actions";

        // Article link
        const articleLink = document.createElement("a");
        articleLink.className = "button tertiary";
        articleLink.textContent = "Article";

        // Correct path to the article template
        articleLink.href =
            `/blog/article/index.html?id=${encodeURIComponent(article.id)}`;

        // Video link
        const videoLink = document.createElement("a");
        videoLink.className = "button tertiary";
        videoLink.textContent = "Video";

        if (article.videoUrl) {
            videoLink.href = article.videoUrl;
            videoLink.target = "_blank";
            videoLink.rel = "noopener noreferrer";
        } else {
            videoLink.href = "#";
            videoLink.setAttribute("aria-disabled", "true");
            videoLink.style.opacity = "0.5";
            videoLink.style.cursor = "not-allowed";

            videoLink.addEventListener("click", event => {
                event.preventDefault();
            });
        }

        actions.append(articleLink, videoLink);
        card.append(title, imageContainer, abstract, actions);

        return card;
    }

    // Render the current page of articles
    function renderArticles() {
        articlesContainer.replaceChildren();

        const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
        const pageArticles = articles.slice(
            startIndex,
            startIndex + ARTICLES_PER_PAGE
        );

        const fragment = document.createDocumentFragment();

        pageArticles.forEach(article => {
            fragment.appendChild(createArticleCard(article));
        });

        articlesContainer.appendChild(fragment);
    }

    // Create pagination buttons
    function renderPagination() {
        paginationContainer.replaceChildren();

        const totalPages = Math.ceil(
            articles.length / ARTICLES_PER_PAGE
        );

        // No pagination needed for zero or one page
        if (totalPages <= 1) return;

        // Previous button
        const previousButton = document.createElement("button");
        previousButton.type = "button";
        previousButton.textContent = "Previous";
        previousButton.disabled = currentPage === 1;

        previousButton.addEventListener("click", () => {
            if (currentPage > 1) {
                changePage(currentPage - 1);
            }
        });

        paginationContainer.appendChild(previousButton);

        // Numbered page buttons
        for (let page = 1; page <= totalPages; page++) {
            const button = document.createElement("button");

            button.type = "button";
            button.textContent = String(page);
            button.setAttribute("aria-label", `Go to page ${page}`);

            if (page === currentPage) {
                button.classList.add("active");
                button.disabled = true;
                button.setAttribute("aria-current", "page");
            }

            button.addEventListener("click", () => {
                changePage(page);
            });

            paginationContainer.appendChild(button);
        }

        // Next button
        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.textContent = "Next";
        nextButton.disabled = currentPage === totalPages;

        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                changePage(currentPage + 1);
            }
        });

        paginationContainer.appendChild(nextButton);
    }

    // Update the page and redraw the UI
    function changePage(page) {
        const totalPages = Math.ceil(
            articles.length / ARTICLES_PER_PAGE
        );

        if (page < 1 || page > totalPages) return;

        currentPage = page;

        renderArticles();
        renderPagination();

        blogPage.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    // Start the blog
    fetchArticles();

})();
