# Boneboard Play design QA

final result: passed

## Visual targets and evidence

Source visual truth: `/var/folders/d4/sl9nkrvs0nxcy796hxphzwr80000gp/T/TemporaryItems/NSIRD_screencaptureui_UGsU2j/Screenshot 2026-09-10 at 10.52.25 PM.png`, 740×1108 pixels. Styling source: the existing Boneboard Modern/Rendered Collection, including its seven figure atlases, matching materials, serif display type and understated typography.

Implementation: http://127.0.0.1:4191/?style=bone. Verified in the Codex in-app browser at CSS viewports 1440×1000, 1280×720, 740×1108 and 390×844. The provided source is a portrait game crop without device chrome; this is a responsive web edition within the existing static project, not a simulated phone OS.

Evidence directory: `/Users/nickv/Documents/ChatGPT/Chess Style/web-demo/test-artifacts/play/`.

- `reference-size-bone.png`: reference position at 740×1108 CSS pixels. Browser capture returned 725×1086 image pixels, uniformly scaled by the capture surface. Normalized to 740×1108 for the comparison.
- `reference-comparison.png`: source and normalized implementation in the same 1480×1150 comparison input, each with a 42-pixel label strip. Opened and visually compared together.
- `desktop-bone.png`: 1440×1000 desktop composition.
- `compact-desktop.png`: final 1280×720 layout. New game ends at CSS y=674.5; board toolbar ends at y=703, within the 720-pixel viewport.
- `phone-bone.png` and `phone-khokhloma-full.png`: portrait content and complete scrollable phone experience.
- `bone-moved.png`, `metal-moved.png`, `simple-moved.png`, `porcelain-moved.png`, `fashion-moved.png`, `royal-moved.png`, `khokhloma-moved.png`: Qd5+ retained across all seven styles.
- `seven-style-review.png`: all seven rendered captures in one review input.

## Comparison and findings

No outstanding P0/P1/P2 findings.

- Typography: the original sans-serif player/clock hierarchy is preserved, with the established Boneboard serif used in the sidebar. Player rows and clocks are deliberately more compact than the enlarged source screenshot, and remain readable at phone size. Style descriptions use existing compact collection typography.
- Layout: a square board sits between opponent and player, with material/captured-piece details beside the names and clocks aligned right. Portrait uses one column with the style selector below; desktop places it to the right. No horizontal overflow at the four tested sizes. All 19 reference pieces occupy the correct source squares.
- Colors and tokens: the charcoal surrounding UI comes from the reference, warmed by Boneboard's ivory and gold. Collection-specific boards and pieces are intentional substitutions requested by the user. The f5/f4 last-move highlights remain visible with a warm gold overlay.
- Asset quality: all 14 PNGs hash-match their existing originals. Atlas silhouettes are correctly isolated, centered and sized; no missing image loads in seven-style acceptance. Royal Court uses its larger rook treatment. Phosphor provides real library icons. Monogram avatars and compact country codes intentionally replace the screenshot's personal image/flags.
- Content: the reference names, ratings, two clocks, captured pieces, material advantage and board arrangement match the supplied image. New games switch to White/Black local player labels. No invented prior move history or remote opponent claims.

Focused checks covered the board squares, f5/f4 highlight, captured-piece rows, clock fractions, source names/ratings, and style thumbnail controls. These are readable in the same-input full-resolution portrait comparison and desktop capture; additional cropped files were not needed.

## Comparison history

1. Initial compact desktop review: [P2] sidebar's New game and board toolbar extended below a roughly 720-pixel-high window. [P2] last-move fill was too subtle on photographic textures. Fixed by reducing short-window sidebar density, applying a viewport-dependent board size and increasing the gold highlight opacity.
2. Intermediate review: New game was visible, but the board toolbar still ended below the viewport. Corrected the available-height calculation using the complete player-row and toolbar heights.
3. Final review: `compact-desktop.png` shows both main controls inside the viewport; measured toolbar bottom is 703/720. `reference-comparison.png` confirms visible last-move highlights and the preserved board arrangement. Desktop and phone captures show no clipped pieces or horizontal overflow. No further visual fixes required.

## Functional acceptance

- All seven style buttons change both board materials and figures and preserve a moved queen at d5, piece count, move history and clocks. No missing image loads.
- White queen b7→d5 is legal, produces Qd5+ and Black to move / Check; it appears in the Moves tab.
- White queen b7×a7 updates to 10 captured pieces and +16 material; undo and reference restoration return to the original arrangement.
- Flipping changes the upper-left square to h1 and moves nykaza to the top player row; flipping back restores orientation.
- A fresh game has 32 pieces and 3:00 on each clock. Keyboard Enter/arrows plays e2→e4. Black e7→e5 works by pointer. Pause/Resume update the visible clock mode. A longer live observation confirmed Black counting down to 1:33 while White stayed at 3:00.
- Fullscreen CSS state appeared and disappeared via the Expand control. The browser's read-only document snapshot reports no fullscreenElement even while its locator detects the fullscreen state, so this is scoped to the in-app browser's observed UI state.
- Phone style selection and starting/moving in a fresh game work. Tabs and their arrow-key navigation use accessible native controls.
- Browser error/warning log: empty at inspection.
- Four meaningful local game tests pass: exact reference/FEN and frozen clocks; legality/turns/undo; timed game start/pause/expiry/undo; capture/en-passant/castling/underpromotion/checkmate. Corrected the initial test's miscount from 18 to the source's actual 19 pieces.

## Follow-up polish and scope

The more ornamental porcelain and Khokhloma sets are visually busier than the simpler editions, consistent with the existing supplied collection. Bone & Gold is the default. Game state is local and resets on reload. Physical mobile-device testing and independent Safari/Firefox acceptance were not performed. No online opponent or backend is claimed.

Implementation checklist: source comparison complete; required fidelity surfaces reviewed; P2 findings corrected and re-captured; interactions checked; licenses and artwork provenance preserved; separate deployment package ready.
