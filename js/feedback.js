// Feedback — per-image yes/no + comment.
// Each .review-card[data-project][data-quarter][data-image] owns one feedback widget.

window.Feedback = (function () {
    'use strict';

    const esc = (s) => String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const NAME_KEY = 'shed-reviewer-name';

    function formatDate(iso) {
        try {
            const d = new Date(iso);
            return d.toLocaleString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit',
            });
        } catch (e) { return ''; }
    }

    async function fetchFeedback(projectId, quarterId, imageId) {
        const url = `${SHED.config.workerUrl}/feedback/${encodeURIComponent(projectId)}/${encodeURIComponent(quarterId)}/${encodeURIComponent(imageId)}`;
        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            console.warn('[feedback] fetch failed', err);
            return { entries: [] };
        }
    }

    async function submitFeedback(payload) {
        const res = await fetch(`${SHED.config.workerUrl}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `HTTP ${res.status}`);
        }
        return await res.json();
    }

    function renderHistory(card, entries) {
        const historyEl = card.querySelector('[data-role="history"]');
        if (!entries || entries.length === 0) {
            historyEl.innerHTML = '';
            return;
        }
        // Newest first, show up to 5
        const list = [...entries].slice(-5).reverse();
        historyEl.innerHTML = `
            <div class="feedback-history-title">Previous feedback</div>
            ${list.map(e => `
                <div class="history-item history-${e.decision === 'yes' ? 'yes' : 'no'}">
                    <div class="history-head">
                        <span class="history-decision">${e.decision === 'yes' ? '&check; Approved' : '&times; Passed'}</span>
                        <span class="history-name">${esc(e.name)}</span>
                        <span class="history-date">${formatDate(e.created_at)}</span>
                    </div>
                    ${e.comment ? `<div class="history-comment">${esc(e.comment)}</div>` : ''}
                </div>
            `).join('')}
        `;
    }

    function updateSubmitState(card) {
        const submit = card.querySelector('[data-role="submit"]');
        const decisionBtns = card.querySelectorAll('.decision-btn');
        const nameEl = card.querySelector('[data-role="name"]');
        const hasDecision = [...decisionBtns].some(b => b.classList.contains('active'));
        const hasName = nameEl.value.trim().length > 0;
        submit.disabled = !(hasDecision && hasName);
    }

    function init(projectId, quarterId, imageId) {
        const card = document.querySelector(
            `.review-card[data-project="${projectId}"][data-quarter="${quarterId}"][data-image="${imageId}"]`
        );
        if (!card) return;

        const nameEl = card.querySelector('[data-role="name"]');
        const commentEl = card.querySelector('[data-role="comment"]');
        const submitEl = card.querySelector('[data-role="submit"]');
        const statusEl = card.querySelector('[data-role="status"]');
        const decisionBtns = card.querySelectorAll('.decision-btn');

        // Prefill name from prior session
        try {
            const savedName = localStorage.getItem(NAME_KEY);
            if (savedName) nameEl.value = savedName;
        } catch (e) {}

        let decision = null;

        decisionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                decision = btn.dataset.value;
                decisionBtns.forEach(b => b.classList.toggle('active', b === btn));
                updateSubmitState(card);
            });
        });

        nameEl.addEventListener('input', () => updateSubmitState(card));

        // Initial fetch — restore button state from most recent feedback
        fetchFeedback(projectId, quarterId, imageId).then(data => {
            renderHistory(card, data.entries);
            if (data.entries && data.entries.length > 0) {
                const latest = data.entries[data.entries.length - 1];
                decision = latest.decision;
                decisionBtns.forEach(b => b.classList.toggle('active', b.dataset.value === decision));
            }
        });

        submitEl.addEventListener('click', async () => {
            if (!decision) return;
            const name = nameEl.value.trim();
            const comment = commentEl.value.trim();
            if (!name) return;

            try { localStorage.setItem(NAME_KEY, name); } catch (e) {}

            submitEl.disabled = true;
            statusEl.textContent = 'Sending...';
            statusEl.className = 'feedback-status';

            try {
                await submitFeedback({
                    projectId, quarterId, imageId,
                    decision, name, comment,
                });
                statusEl.textContent = 'Thanks — your feedback is recorded.';
                statusEl.className = 'feedback-status success';
                commentEl.value = '';
                decisionBtns.forEach(b => b.classList.remove('active'));
                decision = null;
                updateSubmitState(card);

                const data = await fetchFeedback(projectId, quarterId, imageId);
                renderHistory(card, data.entries);
            } catch (err) {
                console.error('[feedback] submit failed', err);
                statusEl.textContent = 'Something went wrong. Try again?';
                statusEl.className = 'feedback-status error';
                submitEl.disabled = false;
            }
        });
    }

    return { init };
})();
