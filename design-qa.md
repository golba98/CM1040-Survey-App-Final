# Design QA — Visual Data map and prototype tabs

- Source visual truth: `/tmp/codex-clipboard-hFIzRf.png`
- Implementation screenshot: `/tmp/visual-data-map-fixed.png`
- Survey-state screenshot: `/tmp/survey-visual-data-map-fixed.png`
- Side-by-side comparison: `/tmp/map-comparison.png`
- Viewport: 1080 × 900 CSS px for the focused map; 1106 × 865 CSS px for the survey state
- Density: device scale factor 1; source 1106 × 865 px; implementation capture 1065 × 888 px after browser viewport chrome
- State: Visual Data, 2006–2012, desktop, dark theme

## Full-view comparison

The source showed the map occupying nearly the entire embedded viewport. The revised view constrains the same vector map to a 520 px maximum width and 360 px maximum height, keeping it beside the methodological synthesis panel at desktop widths. The map remains sharp, geographically accurate, and consistent with the prototype palette.

## Focused comparison

The focused map comparison confirms that the province boundaries, neighboring-country context, coastline, fills, and ocean remain intact. Only presentation scale and centering changed. The new outer era tabs match the existing survey control styling and remain horizontally scrollable at narrow widths.

## Findings and iteration history

- P1 fixed: the oversized map dominated the embedded prototype and hid surrounding context. Constrained and centered the existing SVG without rasterizing it.
- P1 fixed: chapter selection now remains inside each mini app. Its existing 2006–2012, 2013–2019, and 2020–2026 navigation is linked back to the matching optional survey question set.
- P2 fixed: the viewer heading and subtitle could describe a different selection. They now derive from the active concept and era.
- P2 fixed: the mobile mini-app chapter row could clip the selected tab. Mobile navigation now uses three equal-width compact tabs, and the survey chapter heading follows the selected mini-app route.
- Post-fix evidence: Chrome confirmed Visual Data + 2020–2026 selects `/live-prototypes/visual-data/digital-divide.html` and displays the Visual Data 2020–2026 questions.

## Required fidelity surfaces

- Typography: existing survey and prototype typography preserved.
- Spacing/layout: map scale corrected; two-level tab rhythm is consistent.
- Colors/tokens: existing teal survey states and prototype theme tokens preserved.
- Image quality: original vector map retained at full sharpness.
- Copy/content: chapter labels use the content's actual 2006–2012, 2013–2019, and 2020–2026 ranges.

## Interaction and technical checks

- Concept tabs: passed.
- Mini-app era navigation: passed.
- Mobile mini-app era navigation at 390 × 844: passed; all three links remain visible and usable.
- Embedded route updates: passed.
- Matching optional questions: passed.
- Chrome console errors: none.
- Production build: passed.
- Automated tests: 3 passed.

final result: passed
