# The Shed — Ratings Worker

Cloudflare Worker that stores ratings/reviews for each concept.

## One-time setup

From this `worker/` directory:

```bash
# 1. Create the KV namespace (run once, save the id)
npx wrangler kv:namespace create RATINGS_KV

# 2. Copy the returned `id` into wrangler.toml (replace REPLACE_WITH_KV_NAMESPACE_ID)

# 3. Deploy
npx wrangler deploy
```

After deploy, the worker lives at `https://the-shed-ratings.j-sundby.workers.dev`.
That URL is already wired into `js/data.js`.

## Endpoints

- `GET /ratings/:projectId/:conceptId` → `{ avg, count, ratings: [...] }`
- `POST /rate` → `{ ok: true }`
  - body: `{ projectId, conceptId, stars (1-5), name, comment? }`

## Notes

- Rate limit: one submission per IP per concept per minute.
- Name + comment sanitized, length-capped.
- IP is stored as a short hash (not raw IP).
- Max 500 ratings retained per concept.
