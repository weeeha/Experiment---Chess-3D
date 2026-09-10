# Medieval courtyard board art

Generated with the built-in `image_gen` tool on 2026-09-10 for the Chess Style prototype, using the user-supplied screenshot as a style reference. No existing application artwork was overwritten.

## Files and provenance

- `courtyard.png`: unchanged generated output, **1254 × 1254 PNG**. The tool returned this size despite the prompt requesting 1536 × 1536.
- Original preserved at `/Users/nickv/.codex/generated_images/01a08cf6-b0ad-79d3-9a9d-59e1657a9610/exec-45b72c47-5479-4634-b360-287d269be56a.png`.
- Reference: `/var/folders/d4/sl9nkrvs0nxcy796hxphzwr80000gp/T/TemporaryItems/NSIRD_screencaptureui_R1wXWz/Screenshot 2026-09-10 at 4.14.42 PM.png`.
- No CLI/API fallback, image resizing, or raster modifications were used.

## Visual inspection

- Exactly **8 columns × 8 rows**, all 64 cells empty. Brown upper-left cell, cream lower-left cell.
- Grid occupies approximately x194–1060 and y165–1030, rather than the requested central 75%. Upper-left boundary starts nearer x204, lower-left near x194; a small generated taper remains.
- Approximate internal column divisions at the board midpoint: x310,418,522,627,733,839,944. Sampled color transitions vary a few pixels across rows due to hand-drawn borders and the small taper.
- Approximate internal row divisions: y275,382,487,594,700,807,914.
- Pixel-art sandstone/ochre tiles, mossy stone curb, blue/gold left banner, crimson skull right banner, four lit braziers, trees, barrels, and crates match the supplied direction. No pieces, arrows, ghosts, text, or UI.
- Consumers must align to the observed board bounds rather than assume the requested 12.5% inset. This is a visual background, not an exact geometry authority.

## Final generation prompt

```text
Use case: stylized-concept.
Asset type: square 1536x1536 background image for a playable 2D chess game.
Input image: supplied medieval chess screenshot is a STYLE REFERENCE ONLY. Recreate its warm, detailed pixel-art environment style, material colors and medieval blue/gold versus crimson/skull heraldry. REMOVE ALL CHARACTERS AND PIECES.
Primary request: Empty, perfectly regular 8 by 8 chessboard in a mossy medieval woodland stone courtyard. Exactly 64 equal square tiles alternating warm ochre brown and golden sandstone cream, top-left tile brown, bottom-left cream. Small subtle chipped stone and stippled pixel texture within cells.
Composition/geometry: SQUARE canvas, true straight orthographic plan, no vanishing point or trapezoid. Chessboard occupies precisely the central 75% of image width and height, corners at pixel (192,192),(1344,192),(1344,1344),(192,1344) on 1536x1536 canvas. Each of its EIGHT columns and EIGHT rows is exactly144 pixels wide/high; seven straight inner vertical boundaries and seven straight inner horizontal boundaries. No extra partial rows or columns. Board entirely empty, unobscured and flat. Render central 8x8 grid carefully so interactive pieces can align to it.
Scene: narrow mossy gray stone curb around the board. In OUTER 12.5% border only, medieval courtyard scenery: lush dark olive trees at upper corners, muted crimson foliage right, blue-and-gold lion heraldic banner along left edge, crimson skull banner along right edge, four small glowing braziers spaced on stone pillars outside left/right board edges, wooden barrels and crates at lower corners, small scattered daisies and ivy.
Style/medium: high-quality hand-painted pixel-art strategy game background matching reference; crisp dark pixel outlines, chunky pixel detail, slightly worn warm stone, deep blue-gray outlines, sunny afternoon warm restrained light. No blur, photorealism, or 3D render.
Constraints: every ornament is outside the central board square. No chess pieces, people, skeletons, horses, arrows, move markers, ghosts, text, lettering, numbers, coordinates, UI or watermark. Single image.
```
