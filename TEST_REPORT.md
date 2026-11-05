# Portfolio quality audit and regression report — 2026-11-05

**Repository:** https://github.com/thonpin/thonpin.github.io  
**Branch:** `main`  
**Scope:** `index.html`, `assets/css/styles.css`, `assets/js/app.js`, metadata, documentation and new test/CI files.

## Changes implemented

1. Improved light-theme secondary-text contrast by changing `--subtle` to `#506466`.
2. Increased readability of small project, education and filter labels; improved touch targets.
3. Made Code Editor horizontally scrollable instead of clipping long lines and retained Python/Java/React stack labels in both visual and accessible hero metadata.
4. Added keyboard focus management for mobile navigation (open first link, Escape returns to menu button) and paginated gallery (focus updated group).
5. Removed redundant accessibility announcements; improved no-JavaScript copy while displaying all project cards when scripts are disabled.
6. Removed unused CSS rules and one redundant media query; preserved the experience, education and project layout.
7. Moved the footer's owner-requested 10px font size from inline HTML styling to shared CSS.
8. Added a restrictive baseline CSP meta policy allowing self-hosted assets and Google Fonts (review in-browser; CSP meta cannot replace HTTP response headers).
9. Added dependency-free Node tests, npm commands, and GitHub Actions quality workflow.

## Verified against current source

- No duplicate IDs or dangling internal anchors / ARIA label references.
- 9 work cards with categories 5 enterprise, 3 education, 1 security; page 1 = 6, page 2 = 3.
- Education cards: only ongoing KMITL Ph.D. and completed RMU M.Ed.
- Experience timeline: only 2023–PRESENT and 2022–2023.
- No reintroduced Curriculum overview links.
- Theme switch, mobile menu, filter/pager logic and section highlighting verified with DOM mocks.
- All five committed regression test cases passed in an in-session V8 emulation of Node test semantics; **CI run status and native Node test execution have not yet been independently verified**.

## Follow-up verification required

- [ ] Run `npm run check` using Node.js 20+ on a real local checkout or inspect GitHub Actions logs.
- [ ] Confirm the GitHub Pages deployment and live network responses.
- [ ] Run browser visual and keyboard tests at 320, 360, 390, 768, 1024, and 1440 CSS px, including 200% zoom.
- [ ] Run axe-core and Lighthouse on both light/dark themes.
- [ ] Check CSP console violations and HTTP security headers in production.
- [ ] Verify external legacy-portfolio and live-system links from the target network.
- [ ] Run a complete repository and Git history secret scan before public release.

## Accepted design exception

The compact footer summary remains at 10px by the owner's explicit preference. Other prominent labels and interactive controls were made more legible.

## Limitations

Static inspection and DOM-mock testing are not equivalent to a cross-browser visual regression, a full WCAG audit, Lighthouse field metrics or penetration testing. A CSP meta element cannot enforce directives such as `frame-ancestors`.
