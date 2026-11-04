# THNP — Modern Software Engineering / Developer Portfolio

**Target URL:** https://thonpin.github.io/  
**Status:** Review branch only — not deployed.

A responsive static landing page summarizing the author's public-facing portfolio content. Details link to the existing site https://dini.srru.ac.th/port/ rather than replicating the PHP application.

## Files

- `index.html` — landing page, canonical URL and social metadata
- `assets/css/styles.css` — responsive styling and light/dark themes
- `assets/js/app.js` — mobile menu, filtering and theme interaction
- `.nojekyll` — disables Jekyll processing when Pages is later enabled
- `REVIEW_CHECKLIST.md` — pre-release checklist

Preview locally with `python3 -m http.server 8000` then visit http://localhost:8000.

## Release safety

- **Do not merge or enable GitHub Pages until the owner approves.**
- Deep links may trigger the legacy website's visitor registration/access-control steps.
- `noindex,nofollow` currently prevents ordinary search indexing requests; it does not hide public repository source files. Revisit only after approval.
- The repository contains **no SQL backups, PHP backends, .env files, MFA secrets, admin credentials, or visitor/access logs**.
