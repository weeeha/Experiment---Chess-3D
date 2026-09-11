# Flag animation atlas provenance

Generated with built-in image_gen on 2026-09-10. Reference: ../courtyard.png. Exactly 8 columns and 2 rows: blue/gold lion row then crimson/skull row. Actual output 1774×887 RGB. Built-in tool did not honor alpha requests; final correction supplies magenta key background for extraction. Parent task must chromakey and align cells before use. Original retained at `/Users/nickv/.codex/generated_images/01a08d09-e612-7c10-a6e6-1c5dd1989d59/exec-62844c01-77ff-4006-8df1-39b51fb6e5a9.png`.

## Initial prompt

Use case: stylized-concept. Asset type: transparent pixel-art game animation sprite atlas.
Use the supplied courtyard image ONLY as style and banner design reference; create a NEW isolated asset, do not include the courtyard.
Create ONE 2048x1024 PNG atlas with genuinely transparent alpha background. EXACTLY 8 columns and 2 rows: sixteen sprites total. Each invisible cell is 256px wide by512px tall. Top row: 8 sequential hand-painted poses of the BLUE banner with gold border and gold rampant lion from left of reference. Bottom row: 8 sequential hand-painted poses of CRIMSON banner with pale skull from right of reference. CLOTH ONLY; no rods, poles, rings, scenery, shadows outside the fabric, labels, or grid.
Within every cell cloth is centered at x128; straight horizontal top edge y30 fixed across frames; cloth width about140px and maximumheight420px. Front view matching reference tall hanging cloth proportions, three pointed bottom tips matching reference. All cloth remains at least25px from cell boundaries.
Genuine frame-by-frame eight-pose gentle breeze loop: folds travel down fabric; each successive pose is redrawn with small coherent changes in fold shape, interior fold shadows, and hem outline. Tiny hem shift only3to8pixels. Top anchor never moves. Constant scale, silhouette mass, material, lighting, and emblem identity. Lion/skull remain recognizable and do not morph. Stable 2D pixel art with crisp stepped silhouettes, dark outline and restrained painted pixel clusters as in reference. No photographic texture, blurry resampling, smooth antialiasing, skew transform, or rubber stretching. Frame8 flows into frame1. Transparent background must be actual alpha, not drawn checkerboard. Count8 blue flags and8 red flags, no more no less.

## Pose and alpha correction

Edit this sprite sheet only. Remove the checkerboard and white artifacts completely and make every background pixel fully transparent alpha. This MUST be a transparent RGBA PNG, not RGB, not a checkerboard picture. The background is empty transparent cutout.
Keep EXACTLY 8 columns by 2 rows of blue/gold lion cloth and crimson/skull cloth. Improve the animation by hand-redrawing 8 visible sequential gentle breeze poses in each row. Top center anchor and top width stay fixed. Bottom edge swings through offsets0,+4,+8,+4,0,-4,-8,-4 pixels relative to each spritecenter, with naturally changing folds and fabric shading. Emblems retain their identity. Match the pixelartlook. No blur, no warping of the whole image, no texture distortion. Keep cell positions and scale uniform. Output2048x1024, no text, no labels, no poles. Actual fully transparent background.

## Key backdrop correction

Edit image: replace EVERY checkerboard pixel and pale background outside banners with perfectly flat solid pure magenta #ff00ff RGB(255,0,255). Keep all sixteen banners unchanged. Exactly8columns,2rows as current image. No gradients, no checkerboard,no shadows,no noise in magenta background. Banners keep exactlycurrent shapes,colors,positions,andscale. Pure flat magenta backdrop for sprite chromakey extraction.
