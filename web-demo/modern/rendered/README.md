# Boneboard — The Rendered Collection

Fixed top-down board with pre-rendered photographic chess sprites. Local URL: http://127.0.0.1:4187/modern/rendered/. The approved procedural 3D prototype remains at `/modern/` locally and at the root of the dedicated Vercel project.

Seven editions: Bone & Gold, Metal, Modern Simple, Blue Porcelain, Fashion House, Royal Court, and Khokhloma. Each has a matching board made from generated material images, a 32-piece arrangement, six-piece collection, and individual figures for both sides. Khokhloma uses red and black editions. Board only hides the pieces to show the matching board. Play the light (or red) side against Silly AI, a deliberately weak opponent that makes mostly random legal moves and comments on its own questionable strategy. Select a figure and a marked square; arrow keys and Enter/Space provide the same interaction. Legal moves, captures, castling, en passant, checkmate and draws are supported, with automatic queen promotion. The compact opponent strip and last-move highlights leave the style showcase central.

Arrange freely stops pending replies and preserves the composition. Play a fresh game restores the starting position. Changing styles keeps the game; individual inspection, Board only, and hidden tabs pause replies. Reset cancels pending replies.

The app uses Canvas 2D and PNG images only. The board is orthographic and fixed; the sprites use a consistent elevated product camera to preserve recognizable silhouettes. There are no meshes, WebGL, camera controls, piece animations, or remote runtime dependencies. A small thinking indicator respects reduced-motion preferences. The shared local opponent uses chess.js 1.4.0 for move validation, with its BSD-2-Clause license in `../vendor/CHESS-LICENSE`; no remote AI service is used. Source PNGs retain their original transparency; the browser finds each cell's visible bounds and displays the isolated piece. Size on the board is adjusted by type for legibility.

## Asset provenance

Generated on 2026-09-10/11 using the built-in image generation tool: seven original 1536×1024 RGBA figure atlases and seven RGB board material atlases. Each figure atlas contains six columns (pawn, rook, knight, bishop, queen, king) and two sides. All 84 individual figures are available. Each material atlas supplies light/dark tiles and the frame, with two texture variations; Canvas 2D composes a precise 8×8 board. Exact prompts and original generation filenames are preserved in `asset-provenance.json`, with hashes in `asset-checksums.json`. All 14 runtime PNGs match their generated originals.

These are generated product renders, not photographs of manufactured chess sets. User references informed the material directions. Six editions use recognizable Staunton silhouettes; Royal Court uses miniature guards, domed towers, riders, advisors, a royal pavilion and a ceremonial elephant. Labels describe visual directions rather than historical reproductions.

## Validation

From `web-demo`, run `npm test`, `npm run test:silly`, and `node tests/browser-rendered.mjs`. Screenshots and results are in `test-artifacts/rendered/`. Covers all fourteen PNG assets, no 3D renderer, arrangement, all 84 style/side/type combinations, matching board-only views, fullscreen, reset, and desktop/mobile layouts. The prescribed web-game client also passed with the Khokhloma deep link.

## Publication

Live: https://boneboard-modern.vercel.app/rendered/?style=khokhloma. The approved original 3D study remains at https://boneboard-modern.vercel.app.

Production deployment `dpl_7HQh2pN2dcoZWvyEr1iVC47j1StN` reported READY and received the public alias. Published from a standalone static package linked to the same authenticated Vercel project; repository commit metadata was omitted because the shared repository's commit author was rejected by Vercel. No Git identity or deployment protection settings were changed.
