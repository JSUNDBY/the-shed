// The Shed — router + rendering
(function () {
    'use strict';

    const esc = (s) => String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const padNum = (n) => String(n).padStart(2, '0');

    // --- Router ------------------------------------------------------------
    function route() {
        const hash = window.location.hash.slice(2) || '';
        const parts = hash.split('/').filter(Boolean);

        if (parts[0] === 'project' && parts[1]) {
            const project = SHED.projects.find(p => p.id === parts[1]);
            if (project) return renderProject(project);
        }

        renderHome();
    }

    // --- Home --------------------------------------------------------------
    function renderHome() {
        // Single client — skip index, go straight to the project.
        if (SHED.projects.length === 1) {
            window.location.hash = `#/project/${SHED.projects[0].id}`;
            return;
        }

        document.title = `The Shed — ${SHED.config.studioName}`;
        const app = document.getElementById('app');
        app.innerHTML = `
            <section class="home-intro">
                <div class="home-intro-label">Visual Review</div>
                <h1 class="home-intro-title">The <em>Shed</em></h1>
                <p class="home-intro-lede">
                    Select a project to review.
                </p>
            </section>
            <section class="project-list">
                ${SHED.projects.map((p, i) => projectCard(p, i + 1)).join('')}
            </section>
        `;
    }

    function projectCard(p, num) {
        const qCount = (p.quarters || []).length;
        const latest = (p.quarters || [])[0];
        return `<a class="project-card" href="#/project/${esc(p.id)}">
            <div class="project-card-num">${padNum(num)}</div>
            <div class="project-card-main">
                <div class="project-card-title">${esc(p.name)}</div>
                <div class="project-card-tagline">${esc(p.tagline)}</div>
                <div class="project-card-summary">${esc(p.summary)}</div>
            </div>
            <div class="project-card-meta">
                <span>${qCount} quarter${qCount === 1 ? '' : 's'}</span>
                ${latest ? `<span>Latest — ${esc(latest.label)}</span>` : ''}
                <span class="project-card-arrow">&rarr;</span>
            </div>
        </a>`;
    }

    // --- Project page ------------------------------------------------------
    function renderProject(project) {
        document.title = `${project.name} — The Shed`;
        const app = document.getElementById('app');
        app.innerHTML = `
            ${SHED.projects.length > 1 ? '<a class="back-link" href="#/">&larr; Index</a>' : ''}
            <section class="project-hero">
                <div class="project-hero-label">Project &bull; ${esc(project.client || 'Client')}</div>
                <h1>${formatTitle(project.name)}</h1>
                <div class="project-hero-tagline">${esc(project.tagline)}</div>
                <p class="project-hero-summary">${esc(project.summary)}</p>
            </section>
            ${(project.quarters || []).map(q => quarterSection(project, q)).join('')}
        `;

        (project.quarters || []).forEach(q => {
            (q.images || []).forEach(img => Feedback.init(project.id, q.id, img.id));
        });
    }

    // Italicize the last word of a title for editorial flourish.
    function formatTitle(name) {
        const parts = esc(name).split(' ');
        if (parts.length < 2) return `<em>${parts[0]}</em>`;
        const last = parts.pop();
        return `${parts.join(' ')} <em>${last}</em>`;
    }

    function quarterSection(project, quarter) {
        const imgs = quarter.images || [];
        return `<section class="quarter" id="quarter-${esc(quarter.id)}">
            <div class="quarter-head">
                <div>
                    <div class="quarter-label">Review</div>
                    <h2 class="quarter-title">${formatTitle(quarter.label)}</h2>
                    ${quarter.description ? `<p class="quarter-description">${esc(quarter.description)}</p>` : ''}
                </div>
                <div class="quarter-meta">
                    <span class="quarter-status status-${esc(quarter.status || 'in-review')}">${esc((quarter.status || 'in-review').replace(/-/g, ' '))}</span>
                    ${quarter.date ? `<span class="quarter-date">${esc(quarter.date)}</span>` : ''}
                </div>
            </div>
            <div class="review-grid">
                ${imgs.map((img, i) => reviewCard(project, quarter, img, i + 1)).join('')}
            </div>
        </section>`;
    }

    function reviewCard(project, quarter, img, num) {
        const src = `assets/${project.id}/${img.filename}`;
        return `<article class="review-card" data-project="${esc(project.id)}" data-quarter="${esc(quarter.id)}" data-image="${esc(img.id)}">
            <div class="review-card-index">Plate ${padNum(num)} &nbsp;&middot;&nbsp; ${esc(img.title)}</div>
            <div class="review-card-image" onclick="openLightbox('${esc(src)}')">
                <img src="${esc(src)}" alt="${esc(img.title)}" loading="lazy">
            </div>
            <div class="review-card-footer">
                <div class="review-card-notes-col">
                    ${img.notes ? `<p class="review-card-notes">${esc(img.notes)}</p>` : ''}
                    <div class="feedback-history" data-role="history"></div>
                </div>
                <div class="review-card-feedback">
                    <div class="feedback-decision" data-role="decision">
                        <button type="button" class="decision-btn decision-yes" data-value="yes">
                            <span class="decision-icon">&check;</span>
                            Approve
                        </button>
                        <button type="button" class="decision-btn decision-no" data-value="no">
                            <span class="decision-icon">&times;</span>
                            Pass
                        </button>
                    </div>
                    <textarea class="feedback-comment" data-role="comment" placeholder="A thought, a note, a reference..." maxlength="500"></textarea>
                    <div class="feedback-actions">
                        <input type="text" class="feedback-name" data-role="name" placeholder="Your name" maxlength="60">
                        <button type="button" class="feedback-submit" data-role="submit" disabled>Send</button>
                    </div>
                    <div class="feedback-status" data-role="status"></div>
                </div>
            </div>
        </article>`;
    }

    // --- Lightbox (global) -------------------------------------------------
    window.openLightbox = function (src) {
        let box = document.getElementById('lightbox');
        if (!box) {
            box = document.createElement('div');
            box.id = 'lightbox';
            box.className = 'lightbox';
            box.onclick = () => box.classList.remove('open');
            box.innerHTML = '<img alt="">';
            document.body.appendChild(box);
        }
        box.querySelector('img').src = src;
        box.classList.add('open');
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const box = document.getElementById('lightbox');
            if (box) box.classList.remove('open');
        }
    });

    // --- Boot --------------------------------------------------------------
    window.addEventListener('hashchange', route);
    window.addEventListener('DOMContentLoaded', route);
})();
