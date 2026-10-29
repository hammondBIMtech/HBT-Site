
(() => {
    "use strict";

    const PREVIEW_COUNT = 4;
    const SUMMARY_LENGTH = 180;

    const sections = [
        {
            containerId: "home-kb-articles",
            jsonUrl: "/assets/data/knowledge-base.json",
            listingUrl: "/knowledge-base/index.html",
            articleUrl: "/knowledge-base/article/index.html",
            buttonClass: "secondary"
        },
        {
            containerId: "home-blog-articles",
            jsonUrl: "/assets/data/blog-articles.json",
            listingUrl: "/blog/index.html",
            articleUrl: "/blog/article/index.html",
            buttonClass: "tertiary"
        }
    ];

    // EDIT YOUR CARD HTML HERE
    function createCard(article, section) {
        const summary = String(
            article.abstract ||
            article.subHeading ||
            article.body ||
            "No abstract available."
        ).trim();

        const abstract = summary.length > SUMMARY_LENGTH
            ? summary.slice(0, SUMMARY_LENGTH).trimEnd() + "…"
            : summary;

        const articleHref = article.articleUrl ||
            `${section.articleUrl}?id=${encodeURIComponent(article.id)}`;

        const videoHref = article.videoUrl || "";

        const cardHTML = `
            <article class="kb-content-card">

                <h5>${escapeHTML(article.title || "Untitled article")}</h5>

                <div class="cc-img">
                    <img
                        src="${escapeHTML(article.imageUrl || "")}"
                        alt="${escapeHTML(article.title || "Article image")}"
                        loading="lazy"
                    >
                </div>

                <p>${escapeHTML(abstract)}</p>

                <a
                    href="${escapeHTML(articleHref)}"
                    class="button ${section.buttonClass}"
                >
                    Article
                </a>

                <a
                    href="${escapeHTML(videoHref || "#")}"
                    class="button ${section.buttonClass}"
                    ${videoHref
                        ? 'target="_blank" rel="noopener noreferrer"'
                        : 'aria-disabled="true"'}
                    ${videoHref ? "" : 'tabindex="-1"'}
                >
                    Video
                </a>

            </article>
        `;

        const template = document.createElement("template");
        template.innerHTML = cardHTML.trim();

        const card = template.content.firstElementChild;
        const videoLink = card.querySelector("a:last-of-type");

        if (!videoHref) {
            videoLink.style.opacity = "0.5";
            videoLink.style.cursor = "not-allowed";

            videoLink.addEventListener("click", event => {
                event.preventDefault();
            });
        }

        return card;
    }

    // Escape text before inserting it into HTML
    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    // Sort newest first
    function getLatestArticles(data) {
        return [...data]
            .sort((a, b) =>
                String(b.date ?? "").localeCompare(String(a.date ?? "")) ||
                Number(b.id ?? 0) - Number(a.id ?? 0)
            )
            .slice(0, PREVIEW_COUNT);
    }

    // Fetch JSON and inject the cards
    async function loadPreview(section) {
        const container = document.getElementById(section.containerId);

        if (!container) return;

        container.textContent = "Loading articles...";

        try {
            const response = await fetch(section.jsonUrl);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Expected an array of articles.");
            }

            const latestArticles = getLatestArticles(data);
            const fragment = document.createDocumentFragment();

            latestArticles.forEach(article => {
                fragment.appendChild(createCard(article, section));
            });

            container.replaceChildren(fragment);

            if (latestArticles.length === 0) {
                container.textContent = "No articles available yet.";
            }

        } catch (error) {
            console.error(`Failed to load ${section.jsonUrl}:`, error);
            container.textContent = "Articles are currently unavailable.";
        }
    }

    // Load both homepage sections independently
    sections.forEach(loadPreview);

})();
