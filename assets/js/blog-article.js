
(() => {
    "use strict";

    // =========================================
    // CONFIGURATION
    // =========================================

    const ARTICLES_URL = "/assets/data/blog-articles.json";

    const articlePage = document.getElementById("blog-article-page");
    const articleContainer = document.getElementById("blog-article");
    const messageElement = document.getElementById("blog-article-message");

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
            `${article.title || "Article"} | Hammond Web Solutions`;

        // EDIT THE HTML BELOW TO CHANGE THE ARTICLE LAYOUT
        articleContainer.innerHTML = `
            <div class="article-navigation">
                <a href="/blog/index.html" class="article-back-link">
                    &larr; Back to Blog
                </a>
            </div>

            <article class="article-content">
                <h1>${article.title}</h1>

                <!-- Featured Image -->
                <figure
                    class="article-image-wrap"
                    ${article.imageUrl ? "" : "hidden"}
                >
                    <img
                        class="article-image"
                        src="${escapeAttribute(article.imageUrl || "")}"
                        alt="${escapeAttribute(
                            article.title
                                ? `Image for ${article.title}`
                                : "Article image"
                        )}"
                    >
                </figure>

                <h5>${article.subHeading}</h5>

                <!-- Article Body -->
                <div class="article-body">
                    ${renderBody(article.body)}
                </div>

                <!-- Article Footer -->
                <footer class="article-footer">
                    <a href="/blog/index.html" class="article-back-link">
                        &larr; Back to All Articles
                    </a>
                </footer>

            </article>
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

    // Escape text before inserting it into an HTML template
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

    // Turn the JSON body into editable HTML paragraphs
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
                "No article was specified. Please return to the blog and select an article."
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
                    "The blog JSON must contain an array of articles."
                );
            }

            const article = articles.find(item =>
                String(item.id) === String(articleId)
            );

            if (!article) {
                showMessage(`Article ID ${articleId} could not be found.`);
                return;
            }

            renderArticle(article);

        } catch (error) {
            console.error("Could not load blog article:", error);

            showMessage(
                "Sorry, this article could not be loaded. Check that the JSON file is available."
            );
        }
    }


    // =========================================
    // START
    // =========================================

    loadArticle();

})();
