
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
    // ARTICLE TEMPLATE
    // =========================================

    function renderArticle(article) {
        const title = article.title || "Knowledge Base Article";
        const subHeading = article.subHeading || "";

        document.title = `${title} | Hammond BIM Tech`;

        articleContainer.innerHTML = `
            <h1>${escapeHTML(title)}</h1>

            <figure
                class="knowledge-article-image-wrap"
                ${article.imageUrl ? "" : "hidden"}
            >
                <img
                    class="knowledge-article-image"
                    src="${escapeAttribute(article.imageUrl || "")}"
                    alt="${escapeAttribute(`Image for ${title}`)}"
                >
            </figure>

            ${
                subHeading
                    ? `<h5 class="knowledge-article-subheading">${escapeHTML(subHeading)}</h5>`
                    : ""
            }

            <div class="knowledge-article-body">
                ${renderBody(article.body)}
            </div>

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
    // SECURITY HELPERS
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


    // =========================================
    // MARKDOWN NORMALISATION
    // Fixes escaped Markdown in existing articles
    // =========================================

    function normaliseMarkdown(text) {
        return String(text || "")
            // Convert \## Heading to ## Heading
            .replace(/\\(?=#{1,6}\s)/g, "")

            // Convert \**bold text\** to **bold text**
            .replace(/\\(?=\*\*)/g, "")

            .trim();
    }


    // =========================================
    // INLINE MARKDOWN
    // Bold, italic and inline code
    // =========================================

    function renderInline(text) {
        let result = escapeHTML(text);

        // Inline code: `example`
        result = result.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );

        // Bold: **example**
        result = result.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
        );

        // Italic: *example*
        result = result.replace(
            /(^|[^*])\*([^*]+)\*(?!\*)/g,
            "$1<em>$2</em>"
        );

        return result;
    }


    // =========================================
    // BLOCK MARKDOWN
    // Headings, paragraphs, lists and quotes
    // =========================================

    function renderBody(body) {
        const bodyText = normaliseMarkdown(body);

        if (!bodyText) {
            return "<p>No article content is available yet.</p>";
        }

        const lines = bodyText.split(/\r?\n/);
        const output = [];

        let paragraphLines = [];
        let listItems = [];
        let listType = null;

        function flushParagraph() {
            if (!paragraphLines.length) return;

            const content = paragraphLines
                .map(line => line.trim())
                .filter(Boolean)
                .join(" ");

            if (content) {
                output.push(`<p>${renderInline(content)}</p>`);
            }

            paragraphLines = [];
        }

        function flushList() {
            if (!listItems.length || !listType) return;

            const items = listItems
                .map(item => `<li>${renderInline(item)}</li>`)
                .join("\n");

            output.push(`<${listType}>\n${items}\n</${listType}>`);

            listItems = [];
            listType = null;
        }

        function flushAll() {
            flushParagraph();
            flushList();
        }

        for (const rawLine of lines) {
            const line = rawLine.trim();

            // Blank line separates Markdown blocks
            if (!line) {
                flushAll();
                continue;
            }

            // Headings: # through ######
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

            if (headingMatch) {
                flushAll();

                const level = headingMatch[1].length;
                const content = renderInline(headingMatch[2]);

                output.push(`<h${level}>${content}</h${level}>`);
                continue;
            }

            // Unordered lists: - item or * item
            const unorderedMatch = line.match(/^[-*]\s+(.+)$/);

            if (unorderedMatch) {
                flushParagraph();

                if (listType !== "ul") {
                    flushList();
                    listType = "ul";
                }

                listItems.push(unorderedMatch[1]);
                continue;
            }

            // Ordered lists: 1. item
            const orderedMatch = line.match(/^\d+\.\s+(.+)$/);

            if (orderedMatch) {
                flushParagraph();

                if (listType !== "ol") {
                    flushList();
                    listType = "ol";
                }

                listItems.push(orderedMatch[1]);
                continue;
            }

            // Blockquotes: > quoted text
            const quoteMatch = line.match(/^>\s*(.*)$/);

            if (quoteMatch) {
                flushAll();

                output.push(
                    `<blockquote><p>${renderInline(quoteMatch[1])}</p></blockquote>`
                );

                continue;
            }

            // Regular paragraph line
            flushList();
            paragraphLines.push(line);
        }

        flushAll();

        return output.join("\n");
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

            const article = articles.find(
                item => String(item.id) === String(articleId)
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
