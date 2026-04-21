// The Shed — feedback worker
// Stores per-image yes/no + comment feedback in KV.
// KV key: "fb:<projectId>:<quarterId>:<imageId>" -> JSON { entries: [...] }
//
// Endpoints:
//   GET  /feedback/:projectId/:quarterId/:imageId -> { entries: [...] }
//   POST /feedback                                -> { ok: true }
//       body: { projectId, quarterId, imageId, decision ("yes"|"no"), name, comment? }
//
// Env bindings required (see wrangler.toml):
//   RATINGS_KV  -> KV namespace (reused from earlier setup)

const DEFAULT_ORIGIN = 'https://the-shed.joshsundby.com';

function corsHeaders(env) {
    const origin = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };
}

function json(data, status, env) {
    return new Response(JSON.stringify(data), {
        status: status || 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            ...corsHeaders(env),
        },
    });
}

function keyFor(projectId, quarterId, imageId) {
    return `fb:${projectId}:${quarterId}:${imageId}`;
}

function sanitize(s, max) {
    if (typeof s !== 'string') return '';
    return s.trim().slice(0, max);
}

function validId(s) {
    return typeof s === 'string' && /^[a-z0-9_-]{1,60}$/i.test(s);
}

async function getEntries(env, projectId, quarterId, imageId) {
    const raw = await env.RATINGS_KV.get(keyFor(projectId, quarterId, imageId));
    if (!raw) return { entries: [] };
    try { return JSON.parse(raw); }
    catch (e) { return { entries: [] }; }
}

async function hashIp(ip) {
    const data = new TextEncoder().encode(ip);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(hash)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders(env) });
        }

        // GET /feedback/:projectId/:quarterId/:imageId
        const getMatch = url.pathname.match(/^\/feedback\/([^\/]+)\/([^\/]+)\/([^\/]+)\/?$/);
        if (request.method === 'GET' && getMatch) {
            const projectId = decodeURIComponent(getMatch[1]);
            const quarterId = decodeURIComponent(getMatch[2]);
            const imageId = decodeURIComponent(getMatch[3]);
            if (!validId(projectId) || !validId(quarterId) || !validId(imageId)) {
                return json({ error: 'invalid_id' }, 400, env);
            }

            const data = await getEntries(env, projectId, quarterId, imageId);
            const entries = (data.entries || []).map(e => ({
                decision: e.decision,
                name: e.name,
                comment: e.comment || '',
                created_at: e.created_at,
            }));
            return json({ entries }, 200, env);
        }

        // POST /feedback
        if (request.method === 'POST' && url.pathname === '/feedback') {
            let body;
            try { body = await request.json(); }
            catch (e) { return json({ error: 'invalid_json' }, 400, env); }

            const projectId = body.projectId;
            const quarterId = body.quarterId;
            const imageId = body.imageId;
            const decision = body.decision === 'yes' || body.decision === 'no' ? body.decision : null;
            const name = sanitize(body.name, 60);
            const comment = sanitize(body.comment, 500);

            if (!validId(projectId) || !validId(quarterId) || !validId(imageId)) {
                return json({ error: 'invalid_id' }, 400, env);
            }
            if (!decision) return json({ error: 'invalid_decision' }, 400, env);
            if (!name) return json({ error: 'name_required' }, 400, env);

            // Rate limit: 10-second cooldown per IP per image
            const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
            const rlKey = `rl:fb:${projectId}:${quarterId}:${imageId}:${ip}`;
            const recent = await env.RATINGS_KV.get(rlKey);
            if (recent) return json({ error: 'slow_down' }, 429, env);

            const data = await getEntries(env, projectId, quarterId, imageId);
            data.entries = data.entries || [];
            data.entries.push({
                decision,
                name,
                comment,
                created_at: new Date().toISOString(),
                ip_hash: await hashIp(ip),
            });

            // Cap at 100 entries per image
            if (data.entries.length > 100) {
                data.entries = data.entries.slice(-100);
            }

            await env.RATINGS_KV.put(keyFor(projectId, quarterId, imageId), JSON.stringify(data));
            await env.RATINGS_KV.put(rlKey, '1', { expirationTtl: 10 });

            return json({ ok: true }, 200, env);
        }

        return json({ error: 'not_found' }, 404, env);
    },
};
