# Mobile-first UX and release acceptance checklist

Repository: `thonpin/thonpin.github.io` · Branch: `main` · Updated: 2026-11-06

## Content and interaction integrity
- [x] Nine project cards preserved (5 enterprise, 3 education, 1 security).
- [x] Three featured cards shown initially; expandable filtered lists preserve all records.
- [x] Two experience records preserved; current role remains expandable.
- [x] Two education cards preserved; doctoral degree remains in progress.
- [x] Extended Portfolio's nine original deep links are accessible in a native details section.
- [x] Removed Curriculum overview links stay removed.
- [x] No duplicate IDs, dangling anchors or missing ARIA label references.

## Mobile-first design
- [x] Simplified Hero and reordered Work before About.
- [x] Two-action Work / Contact bar with safe-area padding.
- [x] Compact phone project cards and stat strip.
- [x] Container-query gallery styles and semantic design tokens.
- [x] Focus-visible controls and reduced-motion styles.
- [x] No-JavaScript fallback shows all nine projects.
- [x] Footer retains the requested 10px text size.

## Automated verification
- [x] Dependency-free Node test suite and GitHub Actions quality workflow exist.
- [x] Six tests replayed successfully using DOM mocks in V8.
- [ ] Validate native Node test execution and a completed GitHub Actions run.

## Manual release checks still required
- [ ] Verify GitHub Pages publication and browser caching after latest asset updates.
- [ ] Inspect layouts at 320, 360, 390, 768, 1024 and 1440 CSS pixels.
- [ ] Test 200% zoom, mobile safe areas, device rotation and sticky-bar focus occlusion.
- [ ] Confirm keyboard and screen-reader behavior across all filters and details.
- [ ] Run axe-core WCAG 2.2 AA checks in light/dark/high-contrast modes.
- [ ] Measure field LCP, INP and CLS; do not infer scores from code review.
- [ ] Verify external URLs and production CSP/security headers.
- [ ] Establish baseline conversion events using a consent-aware analytics provider before claiming improvements.

The earlier 6+3 pagination documentation is superseded by 3-card progressive disclosure. No backend, authentication, user profiles or network analytics were added.


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
