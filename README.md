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
| `assets/js/app.js` | Theme persistence, navigation, category filters, 6-card pagination |
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

## Local preview

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` to review on desktop and mobile.

## Deployment and verification

The public source is maintained on `main`. **GitHub Pages publication and the latest build status must be checked separately** in the repository's **Settings → Pages** and **Actions**; an update to `main` alone does not confirm the public URL has been redeployed.

If the page displays stale files, reload without cache. The asset URLs in `index.html` are versioned for releases.

## Security and content provenance

- Never commit SQL dumps, private PHP backends, server archives, secrets, access logs, tokens, email databases, or visitor data.
- Public copy is based on the owner's portfolio and confirmed project details. Do not present an ongoing degree as completed.
- Live system links may require login; presence of a link is not a claim about system uptime.
- The portfolio does not call private APIs or embed authentication credentials.
