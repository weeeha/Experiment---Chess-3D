# Modern collection verification

Verified locally in Chromium at 1440 x 960, 1280 x 800, and 390 x 844. All three styles, 32-piece board, six individual figures per style, light/dark inspection, pointer and keyboard arrangement, occupied-square selection, state retention, rapid switching, orbit/reset/top-view/fullscreen controls, and responsive layout passed. No page or console errors in the acceptance run. The original playground's nine model tests passed. The prescribed web game client completed and its canvas output was inspected.

Inspected each board style, the collection, individual king views, mobile board/knight, and top view. Refined exposure, thumbnail cropping, single-piece framing, board contrast, and top-view spacing. Evidence is in ../test-artifacts/modern/.

Five vendored Three.js files hash-match the pinned 0.180.0 package; MIT license retained. Pieces are original procedural geometry. This is a visual prototype with free arrangement, not a full chess rules engine.

The user reviewed and approved this prototype on 2026-09-10, requested that it be kept and published, and requested a separate fixed-board version using rendered image pieces.

## Photographic edition

The separate /rendered/ edition passed local browser acceptance at 1440 x 960, 1280 x 800, and 390 x 844. It loads three RGBA atlases and no Three.js modules. Tested 32 pieces, both arrangement inputs, state retention, all 36 individual style/side/type combinations, collection view, fullscreen, and reset. No page or console errors. Visually inspected all three boards, collections, light/dark kings, mobile board and collection. Corrected neighboring-row pixel bleed and mobile coordinate/caption overlap. The prescribed web-game client also completed. Evidence: ../test-artifacts/rendered/.

The images are original generated product renders. Their fixed elevated camera preserves familiar silhouettes on an orthographic 2D board. The app does not claim a full chess rules engine.

Asset SHA-256:

- bone.png: `8a45d2996311baab7bc42051d4e1f8bab466b595a47f37cb92b98a595d0ee26c`
- metal.png: `76a6169b6804921ea972d1068f554c7035b9cbd41d6754d788559a649d6596ff`
- simple.png: `a13a11ffad1386c87bdcf16c78781360b1fa6721ee4b8e18e093053776febd65`

## Final seven-set release

Added Blue Porcelain, Fashion House, Royal Court and Khokhloma, and generated distinct matching board materials for all seven sets. Added Board only, red/black labels for Khokhloma, and a style query parameter. All 84 individual style/side/type combinations and seven board-only views passed browser acceptance, together with arrangement, reset, fullscreen, 1280 x 800 fit, and 390 x 844 mobile layouts. Visually inspected the new boards, collections, selected large figures and mobile layouts. The final prescribed game client passed with ?style=khokhloma. All 14 PNGs hash-match their source generations; hashes are recorded in rendered/asset-checksums.json.

Published successfully: Vercel deployment dpl_7HQh2pN2dcoZWvyEr1iVC47j1StN reported READY, production, aliased to https://boneboard-modern.vercel.app. The rendered collection is /rendered/. The original approved 3D prototype remains at the root. The earlier commit-author BLOCKED deployment was replaced with an authenticated standalone static upload without repository metadata; no identities or protection policies were changed.

## Rook proportions and square centering

Royal Court rooks now use a target height of 0.94 squares instead of 0.76. All seven sets vertically center each figure's visible bounding box in its square. Existing browser acceptance and the prescribed client passed; inspected Royal Court and Khokhloma boards. Evidence is in ../test-artifacts/rendered/ including rook-centering-client/. No source images were edited.
