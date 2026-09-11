# Blue idle transparency repair — 2026-09-10

The generated idle master contains a real alpha channel. The original exporter used connected components to select each pose, then accidentally replaced the source alpha with that binary selection mask. Pixels with alpha as low as 1/255 became fully opaque, producing the black fringe visible around the plume, shield and limbs.

The eight idle PNGs now retain their original alpha values. RGB values at every visible pixel, the set of occupied pixels, frame dimensions and bounds, the shared pivot, timing and poses are unchanged. Across the eight frames, 15,804 pixels that had been made fully opaque now correctly have alpha below 128. No new artwork or colour edits were introduced. Other animation clips came from RGB masters and are unchanged.

The unmodified RGBA source is preserved in `source/blue-idle.png`; `alpha-restoration.json` records source/output SHA-256 hashes and frame bounds. The before exports remain in the ignored local `output/imagegen/living-chess-pilot/rook-alpha-before/` folder.

To reproduce from the repository root, using Python 3 and Pillow:

```sh
python3 web-demo/scripts/restore-blue-alpha.py \
  --source web-demo/assets/rook-v2/source \
  --output output/imagegen/blue-alpha-rebuilt
```

The script retains the original extraction geometry and pose grouping while copying alpha values instead of substituting 255. The browser uses a revision query on the Blue Rook assets and portrait to refresh the previously cached PNGs.

Verification: all eight outputs match the previous PNG dimensions, nonzero-alpha bounds and RGB content, with no increased alpha values. Reviewed the corrected board and portrait, and reran model, interaction and combat checks with 128 loaded frames and no browser errors. Before/after evidence is in the local ignored `web-demo/test-artifacts/alpha-repair/` folder.
