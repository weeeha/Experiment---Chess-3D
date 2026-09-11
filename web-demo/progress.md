Original prompt: can you now show them on the chessboard? Create vercel preview so I can share with friends

## Scope

Extend the existing one-rook pilot design into a two-character animation
playground with the blue rook and crimson mounted skeleton knight. Select and
move pieces with their chess movement patterns, preview animations, watch a
scripted encounter, reset, fullscreen, and share a Vercel preview. This is an
animation playground, not a complete chess game.

## Work

- Staged the 64 approved transparent frames and both metadata files.
- Building a dependency-free responsive canvas preview in `web-demo/`.
- Four model tests pass: chess movement, collision blocking, animation states,
  death hold, and scripted duel completion.
- Browser checks pass with all 64 frames loaded and zero console errors:
  desktop/mobile rendering, knight/rook movement, invalid move rejection,
  attack recovery, death lock, reset, Move button, scripted duel, fullscreen,
  clipboard sharing, touch-size coordinate mapping, and keyboard movement.
- Reviewed desktop/mobile and animation screenshots. The supplied generation
  assets remain concept quality, with their existing pose variation.
- Vercel preview READY: https://living-chess-steel-and-bone-ancmxi8lu-pegbo.vercel.app
  (`dpl_9dPrRL2j1evFf5C9oW1UsjYdrWpL`, explicit `--target preview`).
- New Vercel project: `living-chess-steel-and-bone` in `pegbo`.
  Vercel auto-assigned the initial deployment to production despite the absence
  of `--prod`; the explicit second deployment above is the shared preview.
- Disabled SSO deployment protection for this new public demo project so friends
  can view the link without a Vercel account. No existing projects were changed.
- Remaining scope: this is a two-character animation playground, not full chess.
  Local browser verification completed before deployment; Vercel reported READY.

## 2026-09-10 — Reference-style courtyard

- Replaced the procedural board artwork with a generated pixel-art medieval courtyard based on the user's screenshot: sandstone/ochre tiles, mossy stone walls, blue/crimson banners, four braziers, foliage and camp props.
- Preserved the two animated characters, existing page and game behavior. Calibrated tile seams, piece anchors, pointer input and interaction overlays to the actual artwork.
- Four model tests pass. In-app browser checks cover desktop/phone tile input, keyboard movement, Move, attack, duel completion, reset and fullscreen; no browser errors. Visual review: `design-qa.md`.
- Updated preview is running locally at http://127.0.0.1:4187/. This revision has not been deployed to Vercel.
- Generated asset and full prompt/provenance: `assets/courtyard/`.

## Blue redraw published

- Rebuilt all four blue animations from the approved scale-study model: 32 new
  frames, eight each for idle, move, strike, and death. Original sources remain
  in output/imagegen/living-chess-pilot/rook/; the new package is in rook-v2/.
- Updated the board and character portrait to assets/rook-v2, normalized standing
  sprite height to 170 px, shared pivot (192,236), and adjusted the blue draw
  scale to .52 (red remains .64), preserving the courtyard's tile scaling.
- Four model tests and the browser interaction suite pass, including the new
  blue attack/recovery and final death pose. All 64 frames load, no browser
  errors; desktop, mobile, keyboard, fullscreen, sharing, and duel verified.
- All 32 shipped blue frames hash-match the source export. Generated frame
  variation remains concept quality.
- Preserved the latest courtyard artwork and motion integration found in the
  workspace, and verified the combined page before deployment.
- Vercel explicit preview READY: https://living-chess-steel-and-bone-8a3kiyeei-pegbo.vercel.app
  Deployment: dpl_8kUDg7ZrnCBaSyfosa7rympLae2G. Project SSO protection is null.
  This is the updated share link; earlier preview URLs are immutable.

## 2026-09-10 — Scenery animation, corrected to sprites

- User rejected the first texture-displacement approach because it distorted the flags/fire and produced aliasing. That implementation has been fully replaced.
- Generated eight distinct flame sprites and eight poses for each flag. Flame playback is 105 ms/frame, flag playback 190 ms/frame, with independent offsets per brazier/flag.
- Added a clean plate for the flag/fire removal areas only; original board pixels remain intact. The original hanging bars and bowl fronts layer over the sprite roots. Fixed sprite scale and integer positions avoid subpixel shimmer.
- Generated assets arrived as RGB despite transparency requests; selected magenta-matte atlases are keyed once during loading. No texture warping, shader effects, dynamic scaling or opacity crossfades remain.
- Reduced-motion preference freezes scenery at a still sprite pose. Existing deterministic time stepping advances scenery along with pieces.
- Four model tests pass. Browser shows movement with scenery playing and reports zero warnings/errors. Frame comparisons confirm changes in both flags/all four fires, and zero changed pixels in sampled empty board region. Evidence: test-artifacts/courtyard/sprites-a.png, sprites-b.png and sprites-verification.json. Browser full-page export renders content at half scale within the file; comparisons calibrated to actual rendered board bounds x30,y191,size468.
- Local preview remains http://127.0.0.1:4187/. No Vercel deployment for this revision.


## 2026-09-10 — Boneboard / all four pieces

- Added Royal Tower and Dread Tower with all 64 original animation frames and metadata. All four pieces appear together with independent selection and existing animation controls. Towers move as rooks with source timing (160/110/95/150 ms).
- Renamed the visible preview Boneboard and updated character counts and sharing metadata. Preserved the current animated courtyard and blue redraw.
- Five model tests and expanded desktop/mobile browser suite passed; 128 loaded frames, no browser errors. Tower movement, attack, death, reset verified; all new PNGs hash-match sources. Visual review appended to design-qa.md.
- User's abbreviation PE remains unconfirmed; clarification requested in this task. Completed local playtest and visual evaluation without claiming a different PE workflow.
- Updated existing Vercel project with an explicit preview deployment: dpl_6u26HH4XJ4YA2V7aQecSvXoxZeYw, Vercel READY. Immutable preview: https://living-chess-steel-and-bone-5ugxqnu9w-pegbo.vercel.app.
- Assigned the short share alias successfully: https://boneboard.vercel.app. Future updates should point this alias at the new tested preview. Old immutable preview URLs stay on their previous revisions.

## 2026-09-10 — Click an enemy to approach and attack

- Board clicks now distinguish allies from enemies: Blue Rook/Royal Tower versus Crimson Knight/Dread Tower. Clicking an ally selects it; clicking an enemy commands the selected unit without changing selection. Sidebar selection still lets either side be controlled.
- Added automatic approach along the existing chess-move graph to a free orthogonally adjacent square. Routes avoid occupied squares; blocked approaches, allies and fallen targets are rejected. Empty-square movement keeps existing rules.
- Attack lunges 0.55 square toward the target and returns to the approach square. The hit occurs at the middle of the strike clip, matching frame 5; the defender collapses and holds its final pose. North/south/east/west lunges all follow the target vector. Existing sprites remain side views, with horizontal mirroring; no new directional art was generated.
- Input stays locked through approach, strike and collapse; Reset cancels the whole sequence. The scripted duel now uses the same combat flow. Added target outlines and updated pointer/keyboard instructions.
- Nine model tests pass. Existing browser smoke and new combat browser suite pass: clicking enemies/allies, pathing, attack/defeat, all four lunge directions, reset cancellation, mobile, keyboard, duel. 128 frames load, no browser errors. Reviewed combat screenshots and the prescribed game-client capture.
- Evidence: test-artifacts/combat/validation.json, cardinal lunge captures and mobile.png. The separate user abbreviation PE is still undefined; no claim to have completed it.
- Vercel explicit preview READY: dpl_8XBB9EJFw2FMZk58u7HP1zwQJdto at https://living-chess-steel-and-bone-ikynfwb1o-pegbo.vercel.app. Short alias https://boneboard.vercel.app updated to this deployment.

## 2026-09-10 — Blue idle black-fringe repair

- Traced the black jitter to the exporter's binary selection mask replacing original RGBA transparency. Restored source alpha for all eight Blue Rook idle frames; artwork RGB, dimensions, nonzero-alpha bounds, pivots and timings are unchanged. Other clips originated from RGB masters and are unchanged.
- Preserved original idle source and reproducible repair script in the repository. Before runtime frames remain in ignored local output. Details/hashes: assets/rook-v2/TRANSPARENCY.md and alpha-restoration.json.
- Added revision queries for Blue Rook frame/metadata loading and portrait so cached assets refresh. Source master and rebuild script are excluded from Vercel upload.
- Nine model tests, existing interaction suite and combat suite passed with 128 frames and no browser errors. Reviewed before/after board captures and corrected close-up. Eight-frame pixel comparison confirmed original colours and placement; 15,804 formerly opaque fringe pixels recovered their low alpha.
