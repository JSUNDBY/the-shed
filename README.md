# The Shed

Visual proposals + client work hub for Superthoughts Studio. Lives at [the-shed.joshsundby.com](https://the-shed.joshsundby.com).

## How it works

Static site (GitHub Pages) + a tiny Cloudflare Worker that stores star ratings + comments from clients.

```
the-shed/
  index.html            # single page; hash router
  css/styles.css        # all styling
  js/
    data.js             # projects + concepts (edit this to add work)
    app.js              # router + rendering
    ratings.js          # fetch/submit ratings
  assets/
    <project-id>/<concept-id>/   # image files referenced in data.js
  worker/
    worker.js           # CF Worker (ratings endpoint)
    wrangler.toml       # worker config
  CNAME                 # the-shed.joshsundby.com
```

## Adding a concept

1. Drop images into `assets/<project-id>/<concept-id>/`
2. Add the concept to `js/data.js` with its `id`, `name`, `description`, and image filenames
3. Commit + push. GitHub Pages deploys automatically.

## Deploying the ratings worker

See [worker/README.md](worker/README.md).

One-time setup:
```bash
cd worker
npx wrangler kv:namespace create RATINGS_KV
# paste returned id into wrangler.toml
npx wrangler deploy
```

## Deploying the site

GitHub Pages. First time:

1. Create repo: `gh repo create joshsundby/the-shed --public --source . --push`
2. In GitHub → Settings → Pages:
   - Source: `main` branch, `/` (root)
   - Custom domain: `the-shed.joshsundby.com`
   - Enforce HTTPS (after cert provisions)
3. Wait ~10 min for DNS + cert.

DNS is already live (CNAME `the-shed` → `joshsundby.github.io`).

## Local preview

```bash
python3 -m http.server 8088
# open http://localhost:8088
```

Ratings won't submit locally because the CF Worker CORS is locked to the production origin — that's fine, you can still test the UI.
