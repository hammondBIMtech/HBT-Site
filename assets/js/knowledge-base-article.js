
(() => {
    "use strict";

    // =========================================
    // CONFIGURATION
    // =========================================

    const ARTICLES_URL = "/assets/data/knowledge-base.json";

    const articlePage = document.getElementById("knowledge-article-page");
    const articleContainer = document.getElementById("knowledge-article");
    const messageElement = document.getElementById("knowledge-article-message");

    if (!articlePage || !articleContainer) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("id");


    // =========================================
    // HTML TEMPLATE
    // Edit the article markup here
    // =========================================

    function renderArticle(article) {
        document.title =
            `${article.title || "Knowledge Base Article"} | Hammond Web Solutions`;

        articleContainer.innerHTML = `
            <h1>${article.title}</h1>>

            <!-- Featured Image -->
            <figure
                class="knowledge-article-image-wrap"
                ${article.imageUrl ? "" : "hidden"}
            >
                <img
                    class="knowledge-article-image"
                    src="${escapeAttribute(article.imageUrl || "")}"
                    alt="${escapeAttribute(
                        article.title
                            ? `Image for ${article.title}`
                            : "Knowledge Base article image"
                    )}"
                >
            </figure>

            <h5>${article.subHeading}</h5>

            <!-- Article Body -->
            <div class="knowledge-article-body">
                ${renderBody(article.body)}
            </div>

            <!-- Article Footer -->
            <footer class="knowledge-article-footer">
                <a
                    href="/knowledge-base/index.html"
                    class="knowledge-article-back-link"
                >
                    &larr; Back to Knowledge Base
                </a>
            </footer>
        `;

        if (messageElement) {
            messageElement.textContent = "";
            messageElement.hidden = true;
        }

        articleContainer.hidden = false;
    }


    // =========================================
    // CONTENT HELPERS
    // =========================================

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttribute(value) {
        return escapeHTML(value);
    }

    function renderBody(body) {
        const bodyText = String(body || "").trim();

        if (!bodyText) {
            return "<p>No article content is available yet.</p>";
        }

        return bodyText
            .split(/\n\s*\n/)
            .map(paragraph => paragraph.trim())
            .filter(Boolean)
            .map(paragraph => `<p>${escapeHTML(paragraph)}</p>`)
            .join("\n");
    }


    // =========================================
    // ERROR HANDLING
    // =========================================

    function showMessage(message) {
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.hidden = false;
        } else {
            articleContainer.textContent = message;
        }

        articleContainer.hidden = true;
    }


    // =========================================
    // LOAD ARTICLE
    // =========================================

    async function loadArticle() {
        if (!articleId) {
            showMessage(
                "No Knowledge Base article was specified. Return to the Knowledge Base and select an article."
            );
            return;
        }

        try {
            const response = await fetch(ARTICLES_URL);

            if (!response.ok) {
                throw new Error(
                    `Could not load ${ARTICLES_URL}: HTTP ${response.status}`
                );
            }

            const articles = await response.json();

            if (!Array.isArray(articles)) {
                throw new Error(
                    "The Knowledge Base JSON must contain an array of articles."
                );
            }

            const article = articles.find(item =>
                String(item.id) === String(articleId)
            );

            if (!article) {
                showMessage(
                    `Knowledge Base article ID ${articleId} could not be found.`
                );
                return;
            }

            renderArticle(article);

        } catch (error) {
            console.error("Could not load Knowledge Base article:", error);

            showMessage(
                "Sorry, this Knowledge Base article could not be loaded. Check that the JSON file is available."
            );
        }
    }


    // =========================================
    // START
    // =========================================

    loadArticle();

})();
