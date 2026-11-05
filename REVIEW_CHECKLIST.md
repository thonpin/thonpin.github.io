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
