// Builds every playable under ads/* and collects them into public/:
//   public/index.html        → gallery page linking to every ad
//   public/<ad>/index.html   → the single-file playable itself
// Vercel: Build Command `npm run build`, Output Directory `public`.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const adsDir = path.join(root, 'ads');
const outDir = path.join(root, 'public');
const only = process.argv[2]; // optional: build a single ad, e.g. `npm run build -- ad-01`

const ads = readdirSync(adsDir)
  .filter((d) => existsSync(path.join(adsDir, d, 'package.json')))
  .filter((d) => !only || d === only)
  .sort();

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const built = [];
for (const ad of ads) {
  const dir = path.join(adsDir, ad);
  console.log(`\n▶ ${ad}`);
  const install = existsSync(path.join(dir, 'package-lock.json')) ? 'npm ci' : 'npm install';
  if (!existsSync(path.join(dir, 'node_modules'))) execSync(install, { cwd: dir, stdio: 'inherit' });
  execSync('npm run build', { cwd: dir, stdio: 'inherit' });

  const html = path.join(dir, 'dist', 'index.html');
  if (!existsSync(html)) throw new Error(`${ad}: dist/index.html not found`);
  cpSync(path.join(dir, 'dist'), path.join(outDir, ad), { recursive: true });

  const title = (readFileSync(html, 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || ad;
  const kb = Math.round(statSync(html).size / 1024);
  built.push({ ad, title, kb });
}

const cards = built
  .map(
    ({ ad, title, kb }) => `
      <a class="card" href="./${ad}/index.html">
        <div class="frame"><iframe src="./${ad}/index.html" loading="lazy" tabindex="-1" title="${title}"></iframe></div>
        <div class="meta"><strong>${title}</strong><span>${ad} · ${kb} KB</span></div>
      </a>`,
  )
  .join('');

writeFileSync(
  path.join(outDir, 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>VegaSlot Playables</title>
<style>
  :root { --bg:#0b0616; --card:#1a0d30; --line:#3a2366; --gold:#ffd56a; --text:#efe7ff; --muted:#a898c8; }
  * { box-sizing: border-box; margin: 0; }
  body { background: var(--bg); color: var(--text); font: 15px/1.5 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 32px 16px 64px; }
  header { max-width: 1100px; margin: 0 auto 28px; }
  h1 { color: var(--gold); font-size: 28px; letter-spacing: .5px; }
  header p { color: var(--muted); }
  .grid { max-width: 1100px; margin: 0 auto; display: grid; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
  .card { display: block; background: var(--card); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; color: inherit; text-decoration: none; transition: transform .15s, border-color .15s; }
  .card:hover { transform: translateY(-3px); border-color: var(--gold); }
  .frame { aspect-ratio: 9 / 16; background: #000; position: relative; }
  .frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; pointer-events: none; }
  .meta { padding: 12px 14px; display: flex; flex-direction: column; }
  .meta span { color: var(--muted); font-size: 13px; }
</style>
</head>
<body>
  <header>
    <h1>VegaSlot Playables</h1>
    <p>${built.length} playable ad${built.length === 1 ? '' : 's'} · tap one to open it full screen</p>
  </header>
  <main class="grid">${cards}
  </main>
</body>
</html>
`,
);

console.log(`\n✓ ${built.length} ad(s) → public/`);
