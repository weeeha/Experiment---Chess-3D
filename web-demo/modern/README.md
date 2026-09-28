# Boneboard — The Modern Collection

Published at https://boneboard-modern.vercel.app. The separate photographic top-down edition is at https://boneboard-modern.vercel.app/rendered/.

Interactive visual prototype at `/modern/`. Run `npm start` from `web-demo`, then open http://127.0.0.1:4187/modern/.

Three original procedural 3D chess designs: Bone & Gold / Art Deco, Metal / Geometric, and Modern Simple / Minimal. Right-hand style selection changes shapes, materials, and board palette while retaining the current arrangement. Thumbnails are rendered from the same meshes as the main view.

- **The board:** full 32-piece starting layout. Play the light side against Silly AI: select a piece and a marked square. The opponent makes mostly random legal moves, occasionally favors a capture, and offers a little commentary. Castling, en passant, check, checkmate and draws are supported; pawns promote automatically to queens. No clocks, ratings, or competitive controls.
- **Arrange freely:** stops pending replies and keeps the composition, allowing either side to move to an empty square. Play a fresh game restores the starting position and restarts the opponent.
- **The pieces:** all six piece types, with light/dark editions. Click a figure or a labeled piece button to inspect it individually.
- **Camera:** drag to orbit, scroll/pinch to zoom; Top view and Reset view. F or the expand button enters fullscreen.
- **Keyboard:** focus the board; arrows choose squares, Enter/Space selects or places, Escape clears selection. The initial keyboard square is e2.
- **Reset the board:** restores the starting arrangement without changing the chosen style.

Rendering is on demand; there are no idle loops or piece movement animations. A small thinking indicator respects reduced-motion preferences. Replies pause during piece inspection or while the tab is hidden. Changing styles preserves the game; resetting cancels pending replies. Original animation playground remains at `/`.

## Dependencies and provenance

Original piece geometry and UI are in `pieces.js`, `app.js`, and `style.css`. Earlier generated concept images informed the direction; the live prototype does not embed those raster boards or claim to reproduce their photorealistic quality.

Locally vendored Three.js **0.180.0**, including OrbitControls and RoomEnvironment, copied from the pinned npm package. MIT license is preserved at `vendor/LICENSE`. Runtime uses local files only; no CDN, API, remote images, or web fonts. Source documentation: https://threejs.org/docs/ and https://github.com/mrdoob/three.js/tree/r180.

The shared opponent lives in `silly-game.js` and `silly-ui.js`. Move validation uses locally vendored [chess.js 1.4.0](https://github.com/jhlywa/chess.js), with its BSD-2-Clause license preserved at `vendor/CHESS-LICENSE`. The opponent uses no remote AI service or API key.

Run `npm test` and `npm run test:silly` for gameplay checks. Run browser acceptance checks from `web-demo`: `node tests/browser-modern.mjs`. Evidence is written to `test-artifacts/modern/`.
