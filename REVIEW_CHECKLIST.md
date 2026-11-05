# Portfolio release and UI/UX acceptance checklist

Repository: `thonpin/thonpin.github.io` · Branch: `main` · Updated: 2026-11-05

## Source and content

- [x] Source, CSS and JavaScript reviewed against current `main`.
- [x] Exactly nine project cards, three categories and six-card pagination.
- [x] Exactly two experience records; current role details remain collapsible.
- [x] Exactly two education records; Ph.D. remains in progress.
- [x] Both Curriculum overview links remain removed.
- [x] No duplicate IDs, broken fragment targets or missing ARIA references.
- [x] External `target=_blank` links use `noopener` attributes.

## Quality improvements

- [x] Light-mode secondary text contrast strengthened.
- [x] Legibility improved across project cards and education labels.
- [x] Decorative Code Editor has horizontal overflow, not hidden text clipping.
- [x] Mobile navigation Escape and keyboard focus behavior improved.
- [x] Project pagination moves keyboard focus to updated results.
- [x] Duplicate screen reader live announcement removed.
- [x] No-script view shows all cards with appropriate messaging.
- [x] Unused CSS rules and redundant media query removed.
- [x] Footer retained at explicitly requested 10px; implemented in CSS.
- [x] CSP meta policy added, with documented hosting-level limitations.

## Automated verification

- [x] Regression suite committed as `tests/portfolio.test.mjs`.
- [x] npm scripts committed.
- [x] GitHub Actions quality workflow committed.
- [x] All five tests replayed successfully against the current code in a V8 test harness.
- [ ] Validate native Node runner and GitHub Actions status on the actual repository.

## Production checks still required

- [ ] Confirm new GitHub Pages deployment completes successfully.
- [ ] Check mobile layouts at 320/360/390px and tablet/desktop at 768/1024/1440px.
- [ ] Check 200% zoom and screen reader announcements, keyboard tab order and focus visibility.
- [ ] Run axe-core / Lighthouse and fix any remaining issues.
- [ ] Check CSP console and HTTP security response headers.
- [ ] Verify external service and research portfolio URLs.
- [ ] Inspect repository history for accidental sensitive content before broad distribution.

**Note:** This checklist supersedes the previous pre-publication review state. Headless-browser results from earlier commits are not a validation of the latest commit.
