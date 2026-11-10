# VegaSlot Playables

Every playable ad lives in its own folder under `ads/` (Phaser 3 + Vite, built to one self-contained `index.html`).

| Ad | Path on the site |
| --- | --- |
| `ads/ad-01` | `/ad-01/` |

## Work on one ad

```bash
cd ads/ad-01
npm install
npm run dev          # http://localhost:5174
npm run dev:mobile   # reachable from a phone on the same Wi-Fi
npm run build        # → ads/ad-01/dist/index.html (upload this to ad networks)
```

## Build the whole site

```bash
npm run build            # all ads → public/ + gallery page at public/index.html
npm run build -- ad-01   # just one ad
```

## Deploy (Vercel)

Import this repo in Vercel — `vercel.json` already sets the build (`npm run build`) and output (`public`).
Every push to `main` goes live; other branches get preview links.

## Add a new ad

Copy an existing folder (e.g. `ads/ad-01` → `ads/ad-02`), change its `<title>` in `index.html`, and push. It shows up on the gallery page automatically.
