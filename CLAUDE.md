# Digital Distillation — working notes for Claude Code

Static site. No build step, no dependencies, no package.json. Open `index.html` and it runs.

## Layout
- `index.html`        — shell only. No inline `<script>` or `<style>`; the CSP forbids both.
- `assets/styles.css` — all styling, including one `.a-<authorId>` palette rule per author.
- `assets/app.js`     — all logic, IIFE, strict mode.
- `data/authors.js`   — roster (`window.DD_AUTHORS`).
- `data/entries.js`   — GENERATED corpus (`window.DD_ENTRIES`). Do not hand-edit.
- `data/entries.new.js` — hand-written source entries (Bryant and the 20th-century tier).
- `data/entries.c21.js`  — hand-written source entries (21st-century tier).
- `tools/build-entries.js` — regenerates `data/entries.js`. Run `node tools/build-entries.js`.

## Adding a thinker
1. Append an object to `data/authors.js` (`id`, `name`, `years`, `note`, `era`). `era` must be
   one of the values in `window.DD_ERAS` — the build fails otherwise. Add a new era to that array
   if you need one; tab groups render in the order the array gives.
2. Add `.a-<id> {--accent:#RRGGBB;--tint:#RRGGBB}` to the bottom of `assets/styles.css`.
3. Add entries to `data/entries.new.js` or `data/entries.c21.js` with `au` set to the new id.
4. `node tools/build-entries.js` — it fails loudly on duplicate ids, unknown authors, unknown eras, authors with zero entries, or entries missing a field.

Tabs, subject index, keyword cloud and all counts derive from the data. Do not hardcode them.

## Entry contract
`{ id, au, s, a, p, k[>=3], src }`. `a` is an ORIGINAL wording of a documented idea, never a
quotation. `src` names the concept and work it derives from. Do not paste real quotations into
this corpus — the whole project depends on that line holding.

## Constraints that must not regress
- No `innerHTML`, no `eval`, no `new Function`, no inline event handlers.
- No `localStorage`/`sessionStorage`/`indexedDB`. State lives in memory and the URL hash.
- No third-party requests: no CDNs, no web fonts, no analytics. `connect-src 'none'` enforces it.
- URL hash is untrusted. `a`/`s`/`k` are allow-listed against the corpus; `q` is capped at 64
  chars and stripped to letters, numbers, spaces, hyphens and apostrophes.
- Build DOM with `createElement` + `textContent`.
- Keep `_headers` and the CSP `<meta>` in `index.html` in sync.

## Checks before pushing
```
node tools/build-entries.js
grep -rn "innerHTML\|eval(\|localStorage\|sessionStorage\|http://" index.html assets data   # expect no hits
```
