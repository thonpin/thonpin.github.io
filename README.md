# THNP — Software Engineering Portfolio

Responsive, static developer portfolio for **Thongn Noppakoon**.

- **GitHub Pages target:** https://thonpin.github.io/
- **Source repository:** https://github.com/thonpin/thonpin.github.io
- **Branch:** `main`
- **Extended portfolio:** https://dini.srru.ac.th/port/

The site prioritizes real software projects and describes experience, education, cybersecurity practices, digital education, and responsible AI-assisted development.

**Article publishing module:** public article catalog, searchable list, embedded reader and Google-login-gated Publisher workspace. This module requires a separate Firebase project, Firestore Rules and Publisher approval before posts can be published. See [ARTICLES_SETUP.md](ARTICLES_SETUP.md).

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Semantic one-page portfolio, metadata, 9 selected projects, education, experience |
| `assets/css/styles.css` | Base responsive layout, light/dark themes and typography |
| `assets/css/mobile-ux.css` | Conversion-focused mobile components, design tokens and container queries |
| `assets/css/articles.css` | Mobile-first catalog, article cards, document viewer, editor UI |
| `articles/catalog.html` | Browse article categories |
| `articles/list.html` | Search and filter published articles |
| `articles/post.html` | Article detail with safe Google Docs, Slides or Drive PDF embed |
| `articles/editor.html` | Google Login and Publisher-only draft/publish form |
| `assets/js/articles-core.js` | Google link validation, embed URL conversion and card helpers |
| `assets/js/articles-public.js` | Read-only Firebase public queries, including homepage latest |
| `assets/js/articles-editor.js` | Auth-gated form and Firestore writing |
| `assets/js/articles-config.js` | Firebase public Web Config for `github-thonpin` (connected; server services still require setup) |
| `firestore.rules`, `firestore.indexes.json` | Server-enforced access and latest-post index |
| `tests/articles.test.mjs` | Embed security and article module contract tests |
| `ARTICLES_SETUP.md` | Firebase onboarding and Publisher approval checklist |
| `assets/css/noscript.css` | Unhides all project cards only when JavaScript is disabled |
| `assets/js/app.js` | Theme, menu, three-project preview, category filters, disclosure and local conversion events |
| `tests/portfolio.test.mjs` | Node built-in regression tests: structure, accessibility contracts, interactions |
| `.github/workflows/quality.yml` | GitHub Actions checks on pushes and pull requests |
| `package.json` | Local `npm run check` without installing dependencies |
| `robots.txt` and `sitemap.xml` | Search indexing metadata |
| `.nojekyll` | GitHub Pages static deployment |

## Content and interactions

- Main sections: Selected Work → About → Expertise → Experience → Education → Credentials → Extended Portfolio → Contact.
- **Selected Work:** 9 cards, 3 featured by default; the user can expand the filtered set. Enterprise/Education/Security filters remain available, and links open live systems or approved research references.
- **Experience:** only two entries, 2023–present computer academic officer (expandable) and 2022–2023 visiting lecturer.
- **Education:** only the completed M.Ed. in Computer Education (RMU, 2018) and the ongoing Ph.D. in Computer and Digital Education (KMITL).
- **Typography:** Inter for Latin characters and IBM Plex Sans Thai for Thai; monospace for code and interface labels.
- **Usability:** compact mobile Hero, fixed two-action mobile bar (Work/Contact), mobile navigation, accessible project disclosure, theme toggle, reduced-motion support and expandable extended portfolio links.
- **No-JavaScript:** all nine work cards remain visible; the filter and disclosure controls are hidden. Native extended-portfolio details remain operable.

## Articles: publish workflow

The homepage shows a **Latest article** card once Firebase is configured and at least one article is published. Catalog, List and Reader are publicly readable; Editor requires Google Authentication and a Publisher role that is granted server-side through Firestore Rules.

Accepted Google URLs: Docs, Slides and Drive file previews; pasted Google iframe snippets are parsed to extract only approved source URLs. Files must remain accessible to visitors using Google sharing / Publish-to-web permissions. No arbitrary third-party iframe HTML is rendered.

**Activation steps:** [ARTICLES_SETUP.md](ARTICLES_SETUP.md). Firebase Web Config for `github-thonpin` has been populated from the registered Web App. Authentication provider setup, Firestore Rules/Indexes deployment and Publisher enrollment **remain required**. Until those steps are complete, the editor cannot publish, and public pages may show a database-permission or setup error.

## Quality assurance

Run JavaScript syntax and regression tests locally with Node.js 20 or newer:

```sh
npm run check
```

This runs Node's built-in test runner with no third-party runtime or test dependencies. The GitHub Actions workflow runs the same command on pushes to `main` and pull requests.

Coverage: valid internal anchors and identifiers, external-link protections, approved education/experience/project counts, CSS structure, featured-project disclosure, keyboard focus, theme persistence, mobile menu behavior, category filters and privacy-safe conversion events.

**Important:** unit/DOM-mock checks do not replace actual desktop/mobile browser tests. Before release, check 320/360/390/768/1024/1440px widths, 200% zoom, keyboard and screen reader navigation, color contrast, Lighthouse/axe, CSP console errors, external URLs and GitHub Pages deployment.

## Conversion measurement integration

The UI marks primary actions using `data-conversion="view-work"`, `data-conversion="contact"`, or `data-conversion="open-project"`. The frontend emits `portfolio:conversion` CustomEvents with a single anonymous `detail.action` string. **No analytics provider, cookies or network tracking have been added.** Connect consent-aware analytics separately if real conversion rates are needed.

## Performance and UX acceptance

- Check the first meaningful action on mobile: Portfolio card or contact CTA should be easy to reach.
- Validate the compact hero and 3-card preview at 320, 360, 390, 768, 1024 and 1440 CSS pixels.
- Validate safe-area padding, focus visibility, browser zoom 200%, reduced motion and light/dark modes.
- Measure production field LCP, INP and CLS; the codebase does not claim measured performance gains.

## Local preview

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` to review on desktop and mobile.

## Deployment and verification

The public source is maintained on `main`. **GitHub Pages publication and the latest build status must be checked separately** in the repository's **Settings → Pages** and **Actions**; an update to `main` alone does not confirm the public URL has been redeployed.

If the page displays stale files, reload without cache. The asset URLs in `index.html` are versioned for releases.

The site includes a **CSP meta policy without `unsafe-inline` for styles**, a dedicated no-JavaScript stylesheet, and external-link protections. Meta CSP is not equivalent to enforcing HTTP headers; directives such as `frame-ancestors` must be configured at the hosting layer. Review browser console output after deployment.

The footer summary remains **10px by explicit design preference**. This is a readability exception to the site's broader accessibility typography targets.

## Security and content provenance

- Never commit SQL dumps, private PHP backends, server archives, secrets, access logs, tokens, email databases, or visitor data.
- Public copy is based on the owner's portfolio and confirmed project details. Do not present an ongoing degree as completed.
- Live system links may require login; presence of a link is not a claim about system uptime.
- The portfolio does not call private APIs or embed authentication credentials.
