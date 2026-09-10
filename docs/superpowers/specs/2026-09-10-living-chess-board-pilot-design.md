# Living Chess Animated Board Pilot — Design

Date: 2026-09-10

## Objective

Build a small browser-based visual prototype that proves an upright, animated
side-view character can read clearly on a fixed near-top-down chessboard. The
prototype uses the existing blue-and-gold armoured rook animation set and does
not attempt to implement a complete chess game.

## Experience

The page presents a responsive 8 x 8 medieval board centred on a restrained
dark backdrop. One blue-and-gold rook starts near the player side. The board is
fixed; there is no camera rotation.

The user can click a square in the rook's current row or column to move there.
The character plays its Move loop while interpolating between squares and returns
to Idle at the destination. A click on a diagonal square is rejected with a brief,
non-blocking visual response.

A compact control group provides four direct actions:

- Idle restarts the looping idle animation.
- Strike plays once in place, then returns to Idle.
- Death plays once and holds its final frame.
- Reset returns the rook to its starting square and Idle state.

Board clicks are ignored while a one-shot animation or movement is active.
After Death, movement and animation controls other than Reset are disabled.

## Visual Direction

The board uses warm stone and parchment squares, a subtle raised frame, and
restrained blue-and-gold accents that match the rook. Decoration must not make
legal squares harder to read. Pixel art is rendered with nearest-neighbour
sampling and no smoothing.

The rook uses the corrected 384 x 256 RGBA frames and shared pivot at pixel
`(128, 236)` from the top-left. It faces right by default and mirrors for
leftward movement. Vertical movement retains the most recent facing direction.
The character remains upright while the board is viewed from above, creating
the approved 2.5D presentation.

## Architecture

The prototype is dependency-free and lives in `web-demo/`:

- `index.html` contains the canvas, concise controls, and accessible labels.
- `styles.css` provides the responsive page shell and control styling.
- `game.js` owns asset loading, state transitions, deterministic timing animation,
  board input, and Canvas rendering.
- `assets/rook/` contains the 32 import-ready PNG frames copied from the approved
  rook package, plus animation metadata.
- `progress.md` records the original request, verification results, and open
  follow-ups.

The canvas is the single visual surface. A small explicit state machine owns
`idle`, `move`, `strike`, `death`, and `dead`. Animation definitions are data,
not control-flow branches scattered through the renderer.

## Data and Animation Flow

At startup, the demo loads animation metadata and all PNG frames before enabling
interaction. The game loop advances the active animation using elapsed time and
draws the current frame at the rook's interpolated board position using the
shared pivot.

For a legal destination, the state machine records the source square,
destination square, duration, and facing. Position interpolates in screen space
while the Move animation loops. Completion commits the logical square and
transitions to Idle.

Strike and Death use one-shot playback. Strike transitions to Idle after its
last frame. Death transitions to `dead` and freezes on its last frame. Reset
restores the initial position, facing direction, and Idle animation.

## Resizing and Input

The canvas scales to the available viewport while retaining a square logical
play area and crisp device-pixel rendering. Pointer coordinates are converted
from CSS pixels to logical canvas coordinates before square selection.

The `F` key toggles fullscreen and `Escape` exits through the browser's standard
fullscreen behaviour. Resizing and fullscreen changes preserve the logical
piece position and animation state.

## Error Handling

The demo shows an in-page loading state until every frame is ready. A failed
asset load produces a visible error message and leaves interaction disabled;
the game must not run with a partial animation set. Unsupported fullscreen
requests fail silently without affecting play.

Invalid rook destinations do not mutate the logical position or animation
state. Repeated pointer input during locked transitions is ignored rather than
queued.

## Testability and Verification

The page exposes `window.render_game_to_text()` with the coordinate convention,
current square, target square, animation, frame, facing, input lock, and load or
error state. It also exposes `window.advanceTime(ms)` so animation and movement
can be tested deterministically.

Verification covers:

- all 32 rook frames load without console errors;
- Idle loops and remains anchored;
- legal horizontal and vertical clicks move to the selected square;
- diagonal clicks leave the rook in place;
- Move returns to Idle;
- Strike returns to Idle;
- Death holds its final frame and blocks interaction;
- Reset restores the initial position and state;
- fullscreen and responsive resizing preserve interaction mapping;
- browser screenshots confirm crisp sprites, an unobstructed board, correct
  pivot placement, and no neighbouring-frame bleed.

## Out of Scope

The pilot excludes full chess rules, other pieces, turns, opponents, captures,
combat synchronization, sound, menus, persistence, monetization, and the
separate premium 3D chess concept.
