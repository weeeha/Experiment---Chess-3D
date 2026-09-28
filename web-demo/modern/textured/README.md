# Boneboard — The Material Collection

Three image-inspired finishes on actual, rotatable 3D chess meshes: **Modern Simple**, **Khokhloma**, and **Bone & Gold**.

Open [the local collection](http://127.0.0.1:4187/modern/textured/?style=khokhloma). Run `npm start` from `web-demo` if the local preview server is not already running. This edition lives beside the original `/modern/` study and `/modern/rendered/` image collection. It has not been separately published by this task.

## The finishes

| Style | Piece surface | Board |
| --- | --- | --- |
| Modern Simple | Chalk and graphite matte porcelain, subtle object-space roughness variation, rounded forms | Restrained warm grey and charcoal matte squares |
| Khokhloma | Generated golden foliage, green leaves and red berries over red/black clear-coated lacquer; separate gold trim | Dark and warm ochre honed squares, ornamental frame and gold edge |
| Bone & Gold | Warm satin ivory and charcoal, subtle ivory variation, champagne-gold rings and crowns | Warm ivory and charcoal honed surfaces, slim gold edge |

All six piece types have both side variants: 36 style/side/type combinations and a complete 32-piece board for each style. The viewer supports orbit, zoom, top view, board arrangement, keyboard navigation, reset, fullscreen, six-piece lineups, individual inspection, and direct links such as `?style=khokhloma&piece=knight&side=black`. It is a material/shape prototype with free arrangement, without chess rules or movement animations.

Piece shapes adapt the earlier procedural collection with continuous turned profiles, a curved horse outline, an actual bishop slit, and raised crowns. These are simplified 3D interpretations, not photorealistic reconstructions of the generated images. The image reference does not supply complete geometry or unseen surface detail.

## Artwork and provenance

The new [Khokhloma paint texture](assets/khokhloma-paint.png) is an **unchanged 1254 × 1254 RGB PNG** created with the built-in image-generation tool. [Exact prompts and source paths](assets/provenance.json) record both the first rejected checkerboard-background attempt and the accepted flat-black-background correction. The original Khokhloma chess atlas was supplied as a style reference; no perspective chess render is used as a mesh texture.

The renderer keys out the near-black background and composites pigment over the lacquer. It estimates a separate metallic response for gold-coloured pigment; that is a colour-based approximation, not a separately authored metalness map. Live studio lighting supplies the reflections. Cylindrical surfaces use height-based UVs, and the horse/bishop use three-axis projection to reduce edge stretching. The clear margins allow repetition without cropped motifs. [Asset validation and SHA-256](assets/validation.json) verify the PNG matches the generated original and document its edge/black-key measurements.

The other two finishes use physically based materials and procedural surface variation. No external images, fonts, APIs, or CDNs are required at runtime. Three.js **0.180.0** and its MIT license remain in the sibling `../vendor/` directory. Shared material/texture lifetime is independent of disposable piece geometry.

## Verification

Run `node tests/browser-textured.mjs` from `web-demo`. It covers styles and both sides, 32-piece arrangement, keyboard/pointer controls, occupied-square behaviour, rotation, camera reset, fullscreen, responsive layouts, direct links, texture/geometry lifecycle over repeated style cycles, and a missing-texture error state. It writes screenshots and `validation.json` under `web-demo/test-artifacts/textured/acceptance/`.

The prescribed web-game browser client is also used for pawn and knight proof captures. Screenshots must be visually inspected: a passing control check alone does not establish material quality or seam quality. Mobile coverage is a browser viewport check, not a physical-device performance benchmark.
