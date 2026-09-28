Original prompt: Apply the image-based Modern Simple, Khokhloma, and Bone & Gold styles to the existing basic 3D chess models.

## Direction

Add a separate `/modern/textured/` edition, preserving the approved procedural and rendered editions. Use actual meshes, fresh flat Khokhloma paint artwork, physically based lacquer/ivory/gold/matte materials, matching boards, and all six piece types on both sides. Prove the finish on a pawn and knight, then inspect the complete collection and exercise the existing controls. No chess rules or public deployment requested in this task.

## Work

- Inspected existing Three.js 0.180.0 renderer, piece geometry, material slots, controls, image references, and previous browser acceptance coverage.
- Generating one transparent flat ornamental paint layer using the built-in image tool with the existing Khokhloma image as a visual reference. No API or paid external generation workflow used.
- Material textures are owned by the collection, separate from disposable piece geometry, so rebuilding the board and rendering thumbnails can safely share them.

## Refinement and verification

- Accepted a second generated paint layer with a flat black key background. The first output simulated transparency with a checkerboard and was rejected. The runtime PNG matches its generated original exactly; prompts, source paths, hash, and edge measurements are preserved in `assets/`.
- Reviewed the pawn first. The knight exposed stretched motifs on narrow extrusion edges and an overly broad, overlapping gold mane. Added three-axis paint projection for heads and narrowed the gold crest. Added plain lacquer base bands to improve red/black side recognition.
- Adjusted individual-piece framing to the figure's actual height. Reserved mobile space around the sculpture for colour controls and captions.
- Mobile layout styling initially reused a button-selection data attribute, accidentally giving the stage a view-reset click handler. Pointer-event tracing reproduced the selection reset. Renamed the stage's styling attribute; repeated selection checks then retained the intended pawn.
- Comprehensive browser acceptance passed prior to the final mobile adjustment, including all three styles, six-piece lineups for both sides, keyboard/pointer arrangement, occupied-square selection, camera controls, fullscreen, direct links, missing texture messaging, and zero failed requests or page errors. Repeated style cycles retained exactly 20 textures and 382 geometries in the Khokhloma board scene.
- Final acceptance rerun passed after the mobile/selection fix, with zero page errors and zero failed asset requests. Final mobile and desktop screenshots were opened and visually reviewed.
- Separate zoom/surface check passed: wheel input changes the rendered piece, Reset view restores the original image, and a large rotation retains the inspected knight. Final surface and board captures are in `test-artifacts/textured/`.
- The prescribed web-game client completed pawn and knight proof captures. Final JavaScript syntax checks and whitespace checks passed. No required implementation or verification work remains for the selected three styles.

## Scope boundary

All changes in this task are in `web-demo/modern/textured/` and `web-demo/tests/browser-textured.mjs`. Other ongoing work in the original modern viewer, image collection, and game prototypes is preserved. Models remain simplified procedural interpretations. No public deployment, game rules, or physical-device performance claims are made.
