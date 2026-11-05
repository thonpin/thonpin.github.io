# THNP — Software Engineering Portfolio

Responsive, static developer portfolio for **Thongn Noppakoon**.

- **GitHub Pages target:** https://thonpin.github.io/
- **Source repository:** https://github.com/thonpin/thonpin.github.io
- **Branch:** `main`
- **Extended portfolio:** https://dini.srru.ac.th/port/

The site prioritizes real software projects and describes experience, education, cybersecurity practices, digital education, and responsible AI-assisted development.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Semantic one-page portfolio, metadata, 9 selected projects, education, experience |
| `assets/css/styles.css` | Responsive layouts, light/dark themes, typography and interactions |
| `assets/css/noscript.css` | Unhides all project cards only when JavaScript is disabled |
| `assets/js/app.js` | Theme persistence, navigation, category filters, 6-card pagination |
| `tests/portfolio.test.mjs` | Node built-in regression tests: structure, accessibility contracts, interactions |
| `.github/workflows/quality.yml` | GitHub Actions checks on pushes and pull requests |
| `package.json` | Local `npm run check` without installing dependencies |
| `robots.txt` and `sitemap.xml` | Search indexing metadata |
| `.nojekyll` | GitHub Pages static deployment |

## Content and interactions

- Main sections: About → Selected Work → Expertise → Experience → Education → Credentials → Extended Portfolio → Contact.
- **Selected Work:** 9 cards; first 6 on page 1, remaining 3 on page 2. System cards point to their live service URLs; research links point to their source portfolio.
- **Experience:** only two entries, 2023–present computer academic officer (expandable) and 2022–2023 visiting lecturer.
- **Education:** only the completed M.Ed. in Computer Education (RMU, 2018) and the ongoing Ph.D. in Computer and Digital Education (KMITL).
- **Typography:** Inter for Latin characters and IBM Plex Sans Thai for Thai; monospace for code and interface labels.
- **Usability:** mobile navigation, keyboard-accessible experience details, accessible gallery status, theme toggle, reduced-motion support.
- **No-JavaScript:** all work cards remain visible; interactive filters are hidden.

## Quality assurance

Run JavaScript syntax and regression tests locally with Node.js 20 or newer:

```sh
npm run check
```

This runs Node's built-in test runner with no third-party runtime or test dependencies. The GitHub Actions workflow runs the same command on pushes to `main` and pull requests.

Coverage: valid internal anchors and identifiers, external link safety attributes, approved education/experience/project counts, CSS structure, theme persistence, mobile menu focus, active section navigation, category filters and keyboard-aware project pagination.

**Important:** unit/DOM-mock checks do not replace actual desktop/mobile browser tests. Before release, check 320/360/390/768/1024/1440px widths, 200% zoom, keyboard and screen reader navigation, color contrast, Lighthouse/axe, CSP console errors, external URLs and GitHub Pages deployment.

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
