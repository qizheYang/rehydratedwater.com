# rehydratedwater.com — Deploy Guide for Claude Code

## Project Overview

**Domain:** rehydratedwater.com
**Server:** DigitalOcean Ubuntu 24.04 droplet at `143.198.106.233`
**DNS:** Managed via Squarespace (A records for `@` and `www` → `143.198.106.233`)
**SSL:** Let's Encrypt via Certbot (auto-renews)

This site hosts browser games and web apps. The repo at `github.com/qizheYang/rehydratedwater.com` contains pre-built static files that are served directly by Nginx — there is no build step on the server.

---

## Repository Structure

```
rehydratedwater.com/
├── index.html              ← Landing page (retro pixel-art)
├── game/
│   ├── cidle/              ← Chinese Wordle (Flutter web app)
│   ├── 2048/               ← 2048 Magicful Edition (Flutter web app)
│   ├── pathfinding/        ← A* Pathfinding Visualizer (Flutter web app)
│   └── <future-games>/
├── mahjong/                ← Riichi Mahjong (Flutter web app)
└── <future-apps>/
```

### How Game Deployment Works

Each game lives in its own separate GitHub repo and has a GitHub Actions workflow that:

1. Builds the Flutter web app
2. Checks out `qizheYang/rehydratedwater.com`
3. Copies the built output into `game/<name>/`
4. Commits and pushes to this repo

The game repos are:
- `qizheYang/Cidle_VibeCoding` → deploys to `game/cidle/`
- `qizheYang/2048_VibeCoding` → deploys to `game/2048/`
- `qizheYang/PathfindingGame_VibeCoding` → deploys to `game/pathfinding/`
- `qizheYang/Mahjong_VibeCoding` → deploys to `mahjong/`

**Do NOT manually edit files inside `game/*/` or `mahjong/`** — they will be overwritten by the next game deploy.

---

## Server Setup

### Nginx Config

Location: `/etc/nginx/sites-available/rehydratedwater.com`

The Nginx config serves files directly from `/var/www/rehydratedwater.com/`. Key locations:

- `/` → serves `index.html` from repo root
- `/game/` → alias to `/var/www/rehydratedwater.com/game/`, serves Flutter apps

### Auto-Deploy (Webhook)

A webhook service listens on port 9000. When this repo receives a push, GitHub sends a POST to:

```
http://143.198.106.233:9000/hooks/deploy-rehydrated
```

This triggers `/var/www/deploy-rehydrated.sh` which runs:

```bash
cd /var/www/rehydratedwater.com
git pull origin main
```

**Result:** Any push to `main` → server auto-pulls within seconds.

---

## How to Deploy Changes

### For the landing page and new apps (this repo)

1. Make changes locally in the repo
2. Commit and push to `main`
3. The webhook auto-pulls on the server — changes are live within seconds

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### For game updates

Push changes to the individual game repo. Its GitHub Actions workflow will build, commit to this repo, and the webhook will pull to the server.

### Manual server deploy (if webhook fails)

```bash
ssh digitalocean
cd /var/www/rehydratedwater.com
sudo git pull origin main
```

---

## Adding New Pages / Apps

### Static HTML/JS/CSS app

1. Create a directory in the repo root (e.g., `mahjong/`)
2. Add your `index.html` and assets
3. Push to `main` — it's live at `rehydratedwater.com/mahjong/`
4. If the app uses client-side routing, add a Nginx location block:

```nginx
location /mahjong/ {
    alias /var/www/rehydratedwater.com/mahjong/;
    try_files $uri $uri/ /mahjong/index.html;
}
```

Then reload Nginx: `sudo nginx -t && sudo systemctl reload nginx`

### Adding a new Flutter game

1. Create a new game repo with a `.github/workflows/deploy.yml` (see existing game repos for template)
2. Add the `REHYDRATEDWATERCOM` secret to the new repo (Settings → Secrets → Actions)
3. The workflow should build with `--base-href "/game/<name>/"` and deploy to `game/<name>/` in this repo
4. Push to trigger the workflow

---

## Key Files on Server

| Path | Purpose |
|------|---------|
| `/var/www/rehydratedwater.com/` | Git repo, served by Nginx |
| `/etc/nginx/sites-available/rehydratedwater.com` | Nginx config |
| `/var/www/deploy-rehydrated.sh` | Auto-deploy script |
| `/etc/webhook.conf` | Webhook config (also has yangqizhe.com hook) |
| `/etc/letsencrypt/live/rehydratedwater.com/` | SSL certificates |

---

## Important Notes

- **No build step on server.** Everything is pre-built and committed to the repo. The server just does `git pull`.
- **Don't edit `game/*/` files directly** in this repo — they're auto-deployed from game repos and will be overwritten.
- **GitHub Actions secret:** All game repos use `REHYDRATEDWATERCOM` as the secret name for the deploy token.
- **Cidle known issue:** The pinyin lookup uses a Cloudflare Worker (`cidle-api.cidle-api.workers.dev`). The version deployed via GitHub Actions calls `mdbg.net` directly which fails due to CORS. This needs a source code fix in the Cidle repo to use the Cloudflare Worker URL.
- **Other domain on same server:** `yangqizhe.com` is also hosted on this droplet with its own Nginx config and deploy webhook.
- **VPN:** `connect.yangqizhe.com` runs V2Ray (VMESS + WebSocket + TLS) on the same server.
