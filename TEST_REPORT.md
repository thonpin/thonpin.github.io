# UX redesign implementation and QA report — 2026-11-06

Repository: https://github.com/thonpin/thonpin.github.io · Branch: `main`

## Changes delivered

- **Intent-first page order:** Selected Work now follows the Hero before About.
- **Compact mobile Hero:** clearer value proposition, two prominent CTAs, technology chips remain visible; decorative code editor is omitted at narrow phone widths to save vertical space.
- **Featured projects:** show 3 of 9 by default. Filter by all/enterprise/education/security; expand to see all matching cards and collapse again.
- **Mobile action bar:** always-visible Work and Contact shortcuts on phones/tablets, using safe-area insets and space reserved at the bottom of the document.
- **Extended Portfolio:** nine original profile deep links remain available in a native, keyboard-operable details accordion.
- **Atomic design primitives:** new `assets/css/mobile-ux.css` contains semantic design tokens, project explorer, mobile bar and disclosure styles; container queries adjust cards by component width.
- **Accessible state:** one live-region status, `aria-pressed`, `aria-expanded`, empty-state message, keyboard-vs-pointer focus behavior, reduced-motion preferences.
- **No-JavaScript:** all nine cards remain visible; inoperative filters and expand controls are hidden by dedicated `noscript.css`.
- **Conversion hooks:** `data-conversion` attributes on CTAs and project links; anonymous local `portfolio:conversion` CustomEvent, with **no analytics SDK, cookie or outbound tracking**.
- **Existing security policy:** CSP meta and external-link protection remain unchanged.
- **Existing content:** nine project records, two experience records and two education cards preserved.

## Latest validation

- [x] Checked current GitHub source after updates.
- [x] Six V8-based DOM-mock regression tests passed: HTML anchors/IDs, content and no-JS fallback, CSS/contrast, featured gallery filtering, conversion event, theme and keyboard navigation.
- [ ] Native Node.js runner / GitHub Actions conclusion not independently confirmed.
- [ ] Browser rendering and manual accessibility validation pending (320–1440 CSS px and 200% zoom).
- [ ] Production Core Web Vitals (LCP/INP/CLS) and conversion-rate baselines not measured.

## Performance principles

All project filtering remains synchronous in the browser over nine static records; no skeleton or optimistic state is shown because no network request occurs. Container queries and reduced-motion settings provide adaptive behavior without new dependencies. Measure LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 against real traffic before making performance claims.

## Accepted design exception

The footer summary remains 10px per the owner's prior explicit preference; this is smaller than recommended general body text. Native details preserve expandable job history and extended portfolio links.

## Limitations

DOM mocks do not establish WCAG 2.2 AA compliance, pixel-perfect mobile layout, full cross-browser behavior, security-header compliance or real conversion uplift. Follow up with actual browser tests, axe/Lighthouse and GitHub Pages deployment review.


## Article publishing module — 2026-11-06

Implemented source files:
- articles/catalog.html, articles/list.html, articles/post.html, articles/editor.html
- assets/css/articles.css
- assets/js/articles-core.js, articles-public.js, articles-editor.js, articles-config.js
- firestore.rules, firestore.indexes.json, firebase.json
- tests/articles.test.mjs, ARTICLES_SETUP.md

Home page includes a latest-published-article card, and the main navigation links to the article catalog. Public reads are restricted to published documents; an authenticated Google account requires an explicitly approved Publisher role to write.

Validated in source/V8 emulation:
- 7 article-module tests and 6 existing portfolio tests passed (13 total)
- Approved Docs/Slides/Drive link formats and pasted Google iframe parsing
- Untrusted URL protocols and third-party domains rejected by the parser
- DOM content via textContent/createElement; no raw author iframe HTML execution
- Four article pages have no inline script or style and include CSP metadata
- No Firebase private key, service-account JSON or assigned publisher UID committed

Outstanding external setup and checks:
- [ ] Create or connect Firebase project and populate public Web Config
- [ ] Enable Google sign-in and authorize thonpin.github.io
- [ ] Deploy firestore.rules and firestore.indexes.json to Firebase
- [ ] Create article_publishers/{UID} with enabled: true via Firebase administrator
- [ ] Test published/draft behavior from anonymous, signed-in unauthorized and authorized accounts
- [ ] Verify Google Doc/Slide/Drive public Viewer rights and iframe rendering
- [ ] Verify live GitHub Pages deployment, mobile layout and GitHub Actions status

Until Firebase setup is complete, the editor intentionally disallows posting, and the latest-article region shows a setup placeholder. No production publication or WCAG certification is claimed.
