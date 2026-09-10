# Animation clean plate

Generated on 2026-09-10 with one built-in `image_gen` edit call. Source: `../courtyard.png`, inspected before editing. Saved unchanged at `clean-plate.png`.

Dimensions: 1254 × 1254 PNG. SHA-256: `afaa450b6551b35ccf656db5b95a1a8073a30527401dcd0cf9873e3770b8634d`.

Original tool output preserved: `/Users/nickv/.codex/generated_images/01a08cf6-b0ad-79d3-9a9d-59e1657a9610/exec-184311c7-537d-4ce8-89a3-975b697c8de5.png`.

Visual inspection: both cloth banners removed and revealed foliage filled; hanging rods and posts retained; all four flames and sparks extinguished; all four metal bowls and pedestals retained. The generator may alter pixels beyond requested removal areas, so compositing only the required regions into the original is preferable to replacing the original wholesale.

## Prompt

```text
Use case: precise-object-edit.
Asset type: clean background plate for sprite animation in a pixel-art game.
Edit target: attached1254x1254 medieval chess courtyard background. Preserve the exact camera, framing, image dimensions, and all existing objects and geometry except the explicit removals below.
Make ONLY these removals:
1. Remove the BLUE CLOTH BANNER with gold lion on the far LEFT (roughly x0-105,y238-578). Keep the horizontal hanging rod, gold rod hardware, vertical posts, and every stone/foliage object. Fill the narrow revealed region with matching dark greenery, stone wall and ground scenery consistent with surrounding pixels.
2. Remove the CRIMSON CLOTH BANNER with skull on the far RIGHT (roughly x1151-1254,y237-579). Keep the horizontal hanging rod, hardware, vertical posts, and scenery. Fill the revealed region with matching dark foliage, wooden fence and stone scenery.
3. Extinguish ALL FOUR BRAZIERS: remove every orange/yellow flame tongue, floating spark and orange halo/glow above the four metal bowls near (128,269),(1122,268),(108,684),(1152,683). Preserve all four metal bowls/braziers, their exact rim shapes, dark bowl interiors, bases and stone pedestals. Replace flame areas with matching background stone/foliage. The four bowls must have dark empty interiors and no warm glowing pixels.
Invariants: central 8x8 chessboard must remain absolutely unchanged, all 64 tiles and boundaries same pixels; everything outside banner cloth/flame/glow removal masks must remain unchanged. Preserve palette, pixel size, crisp outlines, foliage, rocks, barrels, tent, crates and shadows. No invented new objects, text or labels.
Return one square1254x1254 image, same composition and alignment as input.
```
