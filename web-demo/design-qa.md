# Courtyard style update — 2026-09-10

final result: passed

## Scope and comparison evidence

Reference: `test-artifacts/courtyard/style-reference.png` (3204 × 1788).
Implementation: `test-artifacts/courtyard/fullscreen.png` (2560 × 1440), `desktop.png` (1394 × 1445 full page), `mobile.png` (375 × 1419 full page) in the same folder.
Preview: http://127.0.0.1:4187/

The original reference and fullscreen implementation were opened together in one comparison input. Comparison concerns the board's materials, palette, scenery, and illustrated treatment. The reference is a wide battle composition; the prototype retains its existing square canvas and two animated characters. These are intentional scope constraints, not a claim to reproduce the complete army or camera perspective. Source and implementation were compared by their board regions and relative tile scale, not by whole-image pixel subtraction. No density-based spacing findings were filed.

Browser: Codex in-app. Fullscreen capture 2560 × 1440; phone viewport override 390 × 844 CSS px, browser content width 375 px with scrollbar, no horizontal overflow (scrollWidth 375 <= innerWidth 390). Desktop full-page capture includes the existing surrounding interface. State: reset, knight selected, both characters idle. Frame timing varies naturally. Temporary viewport override reset after checks.

## Findings and fidelity surfaces

- No actionable P0/P1/P2 findings in the scoped board restyle.
- Colors: ochre brown and warm sandstone replace the muted gray/olive board. Blue/gold and crimson banners, greenery and orange braziers closely follow the reference.
- Imagery: actual generated raster courtyard; mossy stone walls, four braziers, heraldic banners, trees, crates and barrels. No scenery approximated with CSS or vector shapes. Existing transparent animated sprites remain crisp.
- Layout: complete 8 × 8 grid visible on desktop and phone. Tile boundaries were measured and mapped into renderer and pointer coordinates. Selected, hover, invalid, and keyboard rectangles use the same geometry.
- Typography and content: existing interface copy and font system preserved. Small coordinate labels remain supplemental; the source artwork contains no interface typography to clone.
- Focused inspection: fullscreen evidence is sufficiently detailed to review tile seams, sprite anchors, banners and braziers directly; an additional crop was unnecessary.

## Comparison history

Before browser review, replaced the uniform provisional grid with boundaries measured from the actual generated artwork. First complete rendered visual comparison found no actionable P0/P1/P2 differences for this scoped update. No subsequent visual changes.

## Verification

- Four existing model tests passed after implementation.
- In-app browser: knight Move control, desktop tile click to e4, attack, completed duel, reset, fullscreen entry/exit, keyboard movement to e4 on phone viewport, phone-size tile click to e4, invalid square feedback.
- Phone responsive layout and horizontal overflow checked.
- Browser error log empty after interaction checks and final reload.
- Existing external share/deployment behavior was not exercised in this update.

## Follow-up polish

P3: Hand-painted outer edges taper by a few pixels. Interior seam calibration keeps target centers and interaction overlays aligned; a fully rectified art export could eliminate residual edge irregularity if needed.

## Implementation checklist

- [x] Save generated artwork and prompt/provenance in assets/courtyard/.
- [x] Integrate calibrated rendering and input mapping.
- [x] Update existing smoke-test coordinate helper.
- [x] Verify model and browser behavior, compare source and result, leave preview open.

## Sprite animation correction

The initial displacement animation was rejected by the user for warping/aliasing and has been removed. Final implementation uses 24 separately generated poses: eight flame frames, eight blue flag poses, eight crimson flag poses. Drawn silhouettes switch at fixed scale with integer destination bounds. Hanging bars and bowl rims remain fixed foreground layers.

Evidence: `test-artifacts/courtyard/sprites-a.png`, `sprites-b.png`, `sprites-verification.json`. Full-page browser exports contain a half-scale rendered page within 1394 × 1445 files; temporal comparison uses actual image bounds x30,y191,size468, not assumed fullscreen geometry. Both flags and all four flame regions differ between frames; sampled empty-board region has zero changed pixels. Native browser screenshot inspected for clean matte removal and sprite placement. Original atlas files inspected for eight distinct frames per animation.

Four model tests pass; browser movement exercised with scenery active; no browser warnings/errors. The generated flags have somewhat cleaner folds than the original still artwork, accepted as a minor stylistic difference for real pose animation. Prior static-courtyard checks remain documented above.

final result: passed


## Four-piece integration — 2026-09-10

Added Royal Tower and Dread Tower alongside the revised Blue Rook and Crimson Knight. All four characters are visible together at reset, at b2/d4/f6/g7. Towers use the existing 170px standing scale, shared ground pivot and nearest-neighbour rendering; original courtyard and sprite scenery are preserved.

Reviewed full desktop and phone captures plus Dread Tower impact pose. All four identities read clearly, with no clipping or overlap at reset; phone controls form a two-by-two character grid. A transient share toast appears in the phone test capture. No blocking visual findings. Concept-quality frame-to-frame drawing variation remains inherited from the supplied assets.

Five model tests and the browser interaction suite pass. 128 frames load with zero browser errors. Both towers complete movement, attack/recovery, collapse/hold and reset; existing knight/rook, duel, keyboard, mobile input, fullscreen and sharing checks pass. All 64 newly staged tower PNGs hash-match their source packages.

## Enemy targeting and attack lunge — 2026-09-10

Reviewed canvas captures for right, left, upward and downward attack peaks, approach, defeat, and a full phone capture. The attacker crosses slightly into the target tile at impact then returns; the origin selection outline stays anchored while the target outline identifies the defender. Source sprite poses remain side views for vertical attacks; directional motion is supplied by the character position. Target collapse begins on the impact frame. No blocking visual or interaction findings in the scoped change.

Verification: nine model tests, full existing browser suite, and new combat browser suite passed with no browser errors. Keyboard and phone clicks issue the same command. Reset interrupts an ongoing approach cleanly. Model/browser checks distinguish intermediate approach and strike from completed defeat, and verify input unlocks afterward.
