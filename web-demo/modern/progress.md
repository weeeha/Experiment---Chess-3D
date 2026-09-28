Original prompt: okay lets create board view and individual figures. I basically want a prototype with the board and a style switcher on the right.

## Scope

Standalone modern chess study at /modern/ alongside the existing playground. Three original mesh families: Bone & Gold / Art Deco, Metal / Geometric, Modern Simple / Minimal. Full board, six-piece collection, individual inspection, right style switcher, orbit/zoom, top view, and free arrangement on empty squares. This is a visual prototype, not a chess rules engine.

## Verification plan

Check desktop and mobile rendering, 32 pieces with correct board orientation, style changes preserving arrangement, six distinct pieces per style, light/dark individual views, camera controls, fullscreen, keyboard and pointer selection/movement, reset, and no page errors. Explore rapid switching and returning from piece view to a modified board. Visually inspect the rendered meshes and all three material families.

## Work

- Browser acceptance check initially failed with expected 404 before implementation.
- Using locally bundled Three.js 0.180.0 under MIT; no CDN or API required at runtime.

- Original 3D prototype completed and visually reviewed across all three styles; browser acceptance and original nine model tests passed. User approved keeping it.
- Published to a dedicated Vercel project, boneboard-modern, leaving the earlier animated playground deployment separate.
- Added a second collection at /rendered/ in that deployment, using three original transparent PNG atlases and Canvas 2D. Board is fixed top-down; individual pieces use a consistent elevated product angle.
- All 36 style/color/type combinations, style retention, board arrangement, reset, fullscreen, desktop and mobile browser checks passed. Corrected atlas row drift and detached neighboring pixels in the runtime source bounds, and separated mobile coordinates from the caption.
- Source PNGs remain unchanged; exact prompts and generation filenames are recorded in rendered/prompts.json.

- Expanded to seven image-based styles following the user's additional references: Blue Porcelain, Fashion House, Royal Court and Khokhloma. Generated seven matching board material atlases and added Board only.
- Final browser acceptance passed all 84 figures, seven styles and boards, arrangement, fullscreen, desktop fit and mobile layout. All fourteen PNGs are unchanged verified copies of generated assets.
- Vercel production release READY: dpl_7HQh2pN2dcoZWvyEr1iVC47j1StN. Public alias https://boneboard-modern.vercel.app; new collection /rendered/?style=khokhloma. Published a separate static package using the authenticated project link to avoid incorrectly attaching shared repository commit metadata.

- Browser feedback: increased Royal Court rooks on the board from 76% to 94% of a square's height (about 24% larger). Centered each figure's visible bounds vertically within its square across all seven sets, replacing a fixed baseline near the bottom edge. PNG assets and individual figure views remain unchanged.
- Existing rendered browser acceptance passed all seven styles, 84 figures, arrangement and desktop/mobile controls. Prescribed web-game client passed for Royal Court; screenshots inspected for larger rooks, centered pawns and no clipping.
- Published the rook-size and centering update: production deployment dpl_3vYWuPEkXtg7nDyk14NCmZsoQ9zM reported READY and updated https://boneboard-modern.vercel.app.

- New request: add a silly AI while keeping the collections primarily a style showcase. Added a shared local opponent for both 3D and photographic boards, with legal move hints, mostly random replies, occasional capture preference, quips, last-move highlights, and automatic queen promotion. Chess.js 1.4.0 supplies move validation; its ESM build and BSD license are vendored locally. No remote model or runtime network service.
- Arrange freely preserves the current composition and stops pending replies; Play a fresh game restores a valid starting position. Inspection, board-only viewing, and hidden tabs pause replies. Reset cancels pending replies. Styles remain independent of gameplay.
- Five new model scenarios passed alongside the nine existing checks; first browser acceptance passed both renderers including real delayed replies, inspection pause, reset cancellation, free arrangement, and mobile. Reviewing screenshots and running the original visual acceptance suites next.

- Final verification: all 14 model tests passed; original 3D and photographic acceptance suites passed, including all 84 rendered style/side/type combinations. New AI browser acceptance passed both renderers at desktop and mobile widths with keyboard and pointer moves, scheduled replies, paused inspection, reset cancellation, and free arrangement. A timing race in the test under concurrent 3D load was removed by explicitly controlling browser time; gameplay timing was unchanged.
- Prescribed web-game client completed e2–e4 and one AI reply on the Khokhloma board; JSON state asserted moveCount=2 and no console/page error artifact. Reviewed gameplay, move-hint and mobile screenshots. Vendored chess.js build and license hashes match installed 1.4.0.
- Local feature complete. Publication remains a separate next step; the public alias still serves the prior release.

- Follow-up visual feedback: nudged every board figure upward by min(4px, 6% of its square) and increased Royal Court rook target height from 0.94 to 1.12 squares (about 19% larger). Applied to both sides; individual figure views and PNG assets remain unchanged.
- Verified the publication snapshot with desktop/mobile placement and style-switch checks, no page errors or horizontal overflow, and the prescribed web-game client for Fashion House and Royal Court. Inspected screenshots, including the enlarged rooks, for placement and clipping.
- Published only these visual changes on top of the prior public release, preserving concurrent unpublished AI/textured/interface work in the shared source. Production deployment dpl_7FF5CpniC7NC1RZpgu2rEbSUsULE reported READY and aliased https://boneboard-modern.vercel.app.
