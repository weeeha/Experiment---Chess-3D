# Runtime artwork provenance

All runtime artwork was generated and packaged for this project on 2026-09-10 using the built-in image generation tool. The courtyard and tower directions use the user's supplied screenshots as visual references. This is 2D concept artwork, not 3D meshes; no production-readiness or third-party license claim is implied.

| Folder | Character / role | Frames |
| --- | --- | ---: |
| rook-v2 | Revised Blue Rook, human with blue armor and shield | 32 |
| knight | Crimson Knight, mounted undead rider | 32 |
| tower | Royal Tower, ivory stone and blue/gold banners | 32 |
| tower-black | Dread Tower, dark stone and crimson banners | 32 |
| courtyard | Board, clean plate, animated flags and flames | 8 poses per scenery sequence |

Each character contains eight frames for Idle, Move, Strike and Death, with frame timing and shared pivot specified in its animation JSON. Source PNG exports were staged without redrawing or recoloring; all 64 tower frames were hash-verified against their local generation packages. Shared transparent padding, nearest-neighbour rendering and the ground pivot preserve alignment.

Original concepts, prompts, masters, extraction scripts and validation reports remain in the local `output/imagegen/living-chess-pilot/` packages (excluded from Git). The old `rook` package is also preserved locally; the application uses `rook-v2`. Courtyard prompts and provenance are included in its folder. Slight frame-to-frame drawing variations are a known limitation.
