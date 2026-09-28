# Material collection visual QA — 2026-09-11

## Reviewed

- Khokhloma pawn: paint follows the turned body and spherical head; gold trim, red/black ground and lacquer response are visible. No simulated checkerboard is present.
- Khokhloma knight: revised narrow gold crest avoids overlapping broad faces. Three-axis projection reduces stretching around extrusion edges. Opened both the initial and substantially rotated camera captures.
- All three full boards and six-piece collections, including each side. Piece type hierarchy and light/dark (or red/black) pairing remain legible. Slim gold and ornamental frame treatments render on actual board geometry.
- Bone & Gold: satin body separated from the gold rings and crown. Modern Simple: restrained matte surface and visible rounded edge shading. These two finishes use procedural material detail rather than generated image maps.
- Mobile (390 × 844 viewport): expanded inspection stage reserves space for the side switcher and caption. The final knight is clear of both controls. All style and piece buttons remain accessible without horizontal overflow.

## Verification evidence

`web-demo/test-artifacts/textured/acceptance/validation.json` reports a pass for controls, 36 rendered style/side/type combinations, full boards, keyboard/pointer arrangement, occupied-square behaviour, camera controls, fullscreen, mobile layouts, direct links/reload, and missing artwork feedback. No page errors or failed asset requests. Three repeated cycles through the styles retained 20 textures and 382 geometries for the same Khokhloma board scene.

`web-demo/test-artifacts/textured/zoom-validation.json` separately confirms wheel zoom, restoration of the exact initial view, and rotation retaining the inspected piece. The prescribed web-game client was used for the pawn and knight proof captures.

## Limits

Simplified procedural chess forms; the flat-sided horse and bishop are not full sculpted replicas of the reference images. The gold paint mask is estimated from pigment colour. Mobile checks use a browser viewport, not a physical phone performance test. The new edition is a local free-arrangement visual prototype.
