# Flame animation sprite provenance

Generated on 2026-09-10 with the built-in image_gen tool. Reference: assets/courtyard/courtyard.png (style reference only).

Output: flames-sheet-chroma.png, 1774 x 887 RGB. Eight distinct redrawn flame silhouettes in 4 columns and 2 rows. Solid magenta background for chroma extraction. Raw output has no alpha; do not consume without extraction. Approximate base rows:397,838. Approximate frame centers:221,665,1109,1552. Final normalizing/extraction is performed during integration; no procedural flame warping was used to create the animation frames.

The generator did not honor requested alpha or dimensions. The first output and a transparent-alpha correction both painted a checkerboard. A second targeted correction substituted magenta and succeeded. Original outputs remain in /Users/nickv/.codex/generated_images/01a08d09-2ca6-7981-a222-5ef007aef9ba/.

## Initial prompt

Use case: stylized-concept
Asset type: production game animation sprite sheet, one PNG with actual transparent alpha background.
Use the attached courtyard image ONLY as a style and color reference for the small brazier flames. Create a NEW sprite sheet, NOT a scene edit.
Canvas exactly 1024 x 512 pixels, exactly 4 columns by 2 rows of eight chronological animation frames, each invisible cell 256 x 256 pixels. All cells same size. No drawn grid, no labels.
Each cell contains ONLY a bright medieval pixel-art flame with a few tiny rising embers. No bowl, brazier, stand, smoke cloud, ground, scenery, or shadow.
Shared base anchor is at local cell x128 y220. The main fire shape is about 90 pixels wide and 170 pixels tall, with at least 30 transparent pixels of safe margin on every side. Every frame must be centered on the same base anchor.
Frame sequence reads left to right then second row: 1 rising central tongue with short side lobes; 2 central tongue curls right as left tongue rises; 3 central tongue splits into two; 4 tall left tongue curls inward, right tongue detaches a small ember; 5 compact base sends up a fresh central tongue; 6 tongue leans left, right flame grows; 7 right tongue splits and curls left; 8 returns near first silhouette for a seamless loop.
These are eight individually redrawn, visibly different flame silhouettes and interior shapes showing actual combustion evolution: flame tongues rise, split, taper, disappear, and regenerate. Do not make copies that are merely scaled, warped, rotated, translated, or recolored.
Match the reference's chunky hand-placed pixel clusters and warm amber orange edges, brilliant yellow body and pale ivory core. Crisp pixel edges, restrained dark orange outline, no blurred glow or antialiased halos. Bright and readable at small game size.
Genuinely transparent PNG background, preserve alpha. Do not paint a checkerboard or black background. No text, no watermark.

## Alpha correction prompt (failed)

Correct this sprite sheet for production use. Remove ALL gray-and-white checkerboard pixels and replace them with ACTUAL transparent alpha, not a drawn checkerboard, not a white or black background. Return an RGBA PNG with a real alpha channel. Preserve the eight flames and their distinct poses. Canvas exactly 1024x512, a 4-column 2-row grid with each cell256x256. Keep fixed base anchors at localx128 y220 in everycell. Crisp pixels. No new imagery. This is a transparent flame sprite atlas to composite over game scenery.

## Chroma correction prompt (selected output)

Replace ONLY the entire gray/white checkerboard background with a completely FLAT SOLID UNIFORM PURE MAGENTA #FF00FF (RGB255,0,255) background. Every non-fire pixel must be exactly this solid magenta, including gaps between flame tongues. DO NOT simulate transparency. DO NOT draw a checkerboard. Preserve every flame pixel, pose and layout unchanged: eight different flame sprites in four columns and two rows, no text. This is a technical chroma-key sprite sheet.
