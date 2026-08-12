# Digital Distillation

Daily affirmations distilled from the documented ideas of thirteen thinkers, cross-indexed by
thinker, subject and keyword. Static site, no build step, no dependencies.

## What this is, precisely

**None of these are quotations.** Every entry is an original wording written to carry an idea
that the named thinker actually argued for. Each carries an attribution line naming the concept
and the work it comes from, so the reader can go and read the real thing. This is deliberate: it
keeps the project clear of the copyright that attaches to these authors' actual words, and it
produces something more useful anyway — a maxim about the world becomes a sentence you can say
to yourself.

Where an idea is popularly attributed but not firmly sourced, the attribution line says so
rather than asserting it.

## Roster (26 thinkers, 294 entries)

Tabs are grouped into four eras. The grouping is a navigation aid, not a taxonomy — several
21st-century thinkers are also diaspora thinkers, and they appear once, under the era.

**Success canon** — Jim Rohn (60), Dale Carnegie (10), Napoleon Hill (10), Stephen R. Covey (10), Tony Robbins (10)

**Critical thought** — Viktor Frankl (10), Peter Drucker (10), Neil deGrasse Tyson (10)

**Diaspora thought** — W. E. B. Du Bois (10), Howard Thurman (10), James Baldwin (10), Maya Angelou (10), Toni Morrison (10)

**21st century** — John Hope Bryant (18), Daniel Kahneman (8), Carol Dweck (8), Brené Brown (8), James Clear (8), Cal Newport (8), Nassim Nicholas Taleb (8), Adam Grant (8), Oliver Burkeman (8), Bryan Stevenson (8), Isabel Wilkerson (8), Ta-Nehisi Coates (8), Chimamanda Ngozi Adichie (8)

### Curation notes

**Napoleon Hill's biography is substantially disputed.** Several claims in *Think and Grow Rich*,
notably the Andrew Carnegie commission, have no corroborating evidence. He is included because
the ideas were influential, not because the account of their origin is sound.

**The roster deliberately avoids actively contested political ground.** There are 21st-century
figures with large followings whose work is the subject of live partisan dispute. Including them
would make the app read as taking a side. The selection favours durable, teachable ideas.

**Colour cannot carry 26 identities.** Each thinker has a distinct accent, but at 26 the eye
cannot reliably tell all of them apart. Colour separates thinkers *within* an era group; the
author's name appears on every card and in the status line as the actual identifier.

**Entry counts vary by design.** Rohn is the original corpus at 60; most thinkers sit at 8–10.
The number reflects how much distinct, well-documented material each has, not their importance.

## Features

- **Tabs per thinker**, each with its own accent colour, so entries never blur together.
- **Cross-index** by subject and by keyword, both scoped to the selected thinker.
- **Free-text search** across affirmation, practice, subject, keywords, attribution and name.
- **Daily entry**, deterministic by day-of-year so it's stable all day; *Give me another* for a
  random one from the current selection.
- **Three text sizes**, carried in the URL so a large-text view is shareable.
- **Deep links.** Every view has an address: `#a=bryant&k=vulnerability`, `#e=frankl-03`,
  `#t=xl`.

## Security

The app takes no user input that reaches storage or a server, but the URL hash *is* untrusted
input, and that's the real attack surface. Measures:

- **CSP** in a `<meta>` tag and in `_headers`: `default-src 'none'` with `script-src 'self'`,
  `style-src 'self'`, `connect-src 'none'`, `frame-ancestors 'none'`, `object-src 'none'`,
  `base-uri 'none'`, `form-action 'none'`.
- **No `unsafe-inline` needed** — there is no inline `<script>` or `<style>` and no inline event
  handler anywhere. This is why the CSS lives in a file and author colours are classes rather
  than inline styles.
- **No `innerHTML`, no `eval`, no `new Function`.** Every node is built with `createElement` and
  `textContent`, so no string ever reaches an HTML parser.
- **Hash validation.** `a`, `s` and `k` are allow-listed against the corpus; anything else is
  discarded. `q` is capped at 64 characters and stripped to letters, numbers, spaces, hyphens
  and apostrophes.
- **No third-party requests.** No CDN, no web fonts, no analytics, no trackers — which is also
  why the type is a system stack rather than Google Fonts. Adding a font CDN would require
  loosening the CSP and would fail an SRI check; self-host into `assets/fonts/` instead.
- **No storage APIs.** No cookies, no `localStorage`. Nothing to leak, nothing needing a consent
  banner.
- **Security headers** in `_headers`: `nosniff`, `DENY` framing, `no-referrer`,
  `Permissions-Policy`, HSTS, COOP/CORP.

**Known limitation:** GitHub Pages does not honour a `_headers` file, so on Pages you get only
the `<meta>` CSP and no `nosniff`/HSTS/frame headers. For a clean external scan, deploy to
Netlify or Cloudflare Pages, which do read `_headers`. This is a hosting choice, not a code fix.

Verify:
```bash
grep -rn "innerHTML\|eval(\|new Function\|localStorage\|sessionStorage\|http://" index.html assets data
# expect no matches
```

## Accessibility

Keyboard-operable throughout, visible focus rings, `aria-pressed` on every toggle, labelled
regions, `prefers-reduced-motion` respected, and a text-size control independent of browser
zoom. Colour is never the only signal — the selected thinker is also named in the status line.

## Adding a thinker

See `CLAUDE.md`. Four steps, one of them a script.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```
Opening `index.html` directly via `file://` also works.

## Licence

Code: MIT. The distilled text is original writing; the underlying ideas belong to their
originators and are attributed throughout.
