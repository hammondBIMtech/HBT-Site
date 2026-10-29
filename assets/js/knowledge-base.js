
(() => {
    "use strict";

    const section = document.getElementById("knowledge-base-section");
    const articlesContainer = document.getElementById("knowledge-base-articles");
    const paginationContainer = document.getElementById("knowledge-base-pagination");

    const ARTICLES_URL = "/assets/data/knowledge-base.json";
    const ARTICLES_PER_PAGE = 6;

    let articles = [];
    let currentPage = 1;

    if (!section || !articlesContainer || !paginationContainer) return;

    function addStyles() {
        if (document.getElementById("knowledge-base-page-styles")) return;

        const style = document.createElement("style");
        style.id = "knowledge-base-page-styles";

        style.textContent = `
            #knowledge-base-section #knowledge-base-articles {
                display: flex;
                flex-direction: column;
                gap: var(--space-m, 1.5rem);
            }

            #knowledge-base-section .kb-content-card {
                display: flex;
                flex-direction: column;
                gap: var(--space-xs, 0.75rem);
                min-width: 0;
            }

            #knowledge-base-section .cc-img {
                width: 100%;
                aspect-ratio: 16 / 9;
                overflow: hidden;
            }

            #knowledge-base-section .cc-img img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            #knowledge-base-section .kb-card-actions {
                display: flex;
                flex-direction: column;
                gap: var(--space-xs, 0.75rem);
                margin-top: auto;
            }

            #knowledge-base-section .kb-card-actions .button {
                display: block;
                width: 100%;
                box-sizing: border-box;
                text-align: center;
            }

            #knowledge-base-section #knowledge-base-pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-top: var(--space-l, 2rem);
            }

            #knowledge-base-section #knowledge-base-pagination button {
                min-width: 42px;
                padding: 0.65rem 0.9rem;
                border: 1px solid var(--color-secondary, #cecece);
                border-radius: 2px;
                background: transparent;
                color: inherit;
                font: inherit;
                cursor: pointer;
                transition: background-color 0.2s ease, color 0.2s ease,
                    transform 0.2s ease;
            }

            #knowledge-base-section #knowledge-base-pagination button:hover:not(:disabled) {
                background: var(--color-primary, #1C1A1A);
                color: var(--color-text-light, #fff);
                transform: translateY(-2px);
            }

            #knowledge-base-section #knowledge-base-pagination button.active,
            #knowledge-base-section #knowledge-base-pagination button:disabled {
                background: var(--color-primary, #1C1A1A);
                color: var(--color-text-light, #fff);
                border-color: var(--color-primary, #1C1A1A);
                cursor: default;
            }

            #knowledge-base-section #knowledge-base-pagination button:focus-visible {
                outline: 2px solid var(--color-tertiary, #C43C2F);
                outline-offset: 3px;
            }

            @media (min-width: 729px) {
                #knowledge-base-section #knowledge-base-articles {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    align-items: stretch;
                }
            }

            @media (min-width: 1024px) {
                #knowledge-base-section #knowledge-base-articles {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #knowledge-base-section #knowledge-base-pagination button {
                    transition: none;
                }
            }
        `;

        document.head.appendChild(style);
    }

    async function fetchArticles() {
        articlesContainer.textContent = "Loading articles...";

        try {
            const response = await fetch(ARTICLES_URL);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("The Knowledge Base JSON must contain an array.");
            }

            articles = data;

            articles.sort((a, b) =>
                String(b.date ?? "").localeCompare(String(a.date ?? "")) ||
                Number(b.id ?? 0) - Number(a.id ?? 0)
            );

            addStyles();
            renderArticles();
            renderPagination();
        } catch (error) {
            console.error("Could not load Knowledge Base articles:", error);

            articlesContainer.textContent =
                "Sorry, Knowledge Base items could not be loaded. Please try again later.";

            paginationContainer.replaceChildren();
        }
    }

    function createArticleCard(article) {
        const card = document.createElement("article");
        card.className = "kb-content-card";

        const title = document.createElement("h5");
        title.textContent = article.title || "Untitled article";

        const imageContainer = document.createElement("div");
        imageContainer.className = "cc-img";

        const image = document.createElement("img");
        image.src = article.imageUrl || "";
        image.alt = article.title ? `Image for ${article.title}` : "Article image";
        image.loading = "lazy";

        imageContainer.appendChild(image);

        const abstract = document.createElement("p");
        const summary = article.abstract || article.subHeading ||
            article.body || "No abstract available.";

        const plainSummary = String(summary).trim();
        const maxLength = 180;

        abstract.textContent = plainSummary.length > maxLength
            ? plainSummary.slice(0, maxLength).trimEnd() + "…"
            : plainSummary;

        const actions = document.createElement("div");
        actions.className = "kb-card-actions";

        const articleLink = document.createElement("a");
        articleLink.className = "button tertiary";
        articleLink.textContent = "Article";
        articleLink.href = article.articleUrl ||
            `/knowledge-base/article/index.html?id=${encodeURIComponent(article.id)}`;

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

    function renderPagination() {
        paginationContainer.replaceChildren();

        const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
        if (totalPages <= 1) return;

        const previousButton = document.createElement("button");
        previousButton.type = "button";
        previousButton.textContent = "Previous";
        previousButton.disabled = currentPage === 1;

        previousButton.addEventListener("click", () => {
            if (currentPage > 1) changePage(currentPage - 1);
        });

        paginationContainer.appendChild(previousButton);

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

            button.addEventListener("click", () => changePage(page));
            paginationContainer.appendChild(button);
        }

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.textContent = "Next";
        nextButton.disabled = currentPage === totalPages;

        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) changePage(currentPage + 1);
        });

        paginationContainer.appendChild(nextButton);
    }

    function changePage(page) {
        const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
        if (page < 1 || page > totalPages) return;

        currentPage = page;
        renderArticles();
        renderPagination();

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    fetchArticles();
})();
