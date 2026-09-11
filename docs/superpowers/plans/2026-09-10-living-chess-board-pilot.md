# Living Chess Animated Board Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free browser prototype with a responsive 8 x 8 board and one animated rook that can idle, move legally, strike, die, and reset.

**Architecture:** Keep the game rules and animation state machine in a pure ES module, then render that state through a single responsive Canvas. Load the corrected individual RGBA frames from a local asset folder and expose deterministic browser hooks for Playwright verification.

**Tech Stack:** HTML5 Canvas, CSS, vanilla JavaScript ES modules, Node built-in test runner, Python static server, Playwright browser client.

**Spec:** `docs/superpowers/specs/2026-09-10-living-chess-board-pilot-design.md`

## Global Constraints

- The board is a fixed near-top-down 8 x 8 view with no camera rotation.
- The demo contains one blue-and-gold armoured rook and does not implement full chess.
- Rook movement accepts only destinations in the current row or column.
- Board input is locked during movement, Strike, Death, and the dead state.
- Move and Strike return to Idle; Death holds its last frame until Reset.
- Sprite sampling uses nearest-neighbour rendering with the shared `(128, 236)` source pivot.
- The default sprite faces right, mirrors for leftward movement, and retains facing on vertical movement.
- The page exposes `window.render_game_to_text()` and `window.advanceTime(ms)`.
- The `F` key toggles fullscreen; `Escape` uses browser-native fullscreen exit.
- A partial or failed asset load disables interaction and displays an in-page error.

---

### Task 1: Asset staging and project shell

**Files:**
- Create: `web-demo/index.html`
- Create: `web-demo/styles.css`
- Create: `web-demo/progress.md`
- Create: `web-demo/assets/rook/rook-animation.json`
- Create: `web-demo/assets/rook/{idle,move,strike,death}/*.png`
- Test: `web-demo/tests/assets.test.mjs`

**Interfaces:**
- Consumes: corrected source frames from `output/imagegen/living-chess-pilot/rook/`.
- Produces: `#game-canvas`, `[data-action]` controls, `#status`, and a local asset tree matching `rook-animation.json`.

- [ ] **Step 1: Write the failing asset test**

```js
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("the demo contains all declared rook frames", async () => {
  const root = new URL("../assets/rook/", import.meta.url);
  const metadata = JSON.parse(await readFile(new URL("rook-animation.json", root)));
  let total = 0;
  for (const [name, animation] of Object.entries(metadata.animations)) {
    for (let index = 1; index <= animation.frames; index += 1) {
      const filename = `${name}/${name}-${String(index).padStart(2, "0")}.png`;
      await access(new URL(filename, root));
      total += 1;
    }
  }
  assert.equal(total, 32);
});
```

- [ ] **Step 2: Run the asset test and verify RED**

Run: `node --test web-demo/tests/assets.test.mjs`

Expected: FAIL because `web-demo/assets/rook/rook-animation.json` does not exist.

- [ ] **Step 3: Create the page shell and stage assets**

Create a canvas with `aria-label="Living Chess board"`, four action buttons
(`idle`, `strike`, `death`, `reset`), a status region, and a concise instruction
line. Copy the source metadata and the four numbered frame directories into
`web-demo/assets/rook/`. Add CSS for a centred responsive game shell, restrained
blue-and-gold controls, visible keyboard focus, and a square canvas capped by the
viewport.

- [ ] **Step 4: Run the asset test and verify GREEN**

Run: `node --test web-demo/tests/assets.test.mjs`

Expected: PASS with one passing test and no warnings.

- [ ] **Step 5: Record progress and commit**

Add `Original prompt: can you now create chess board and add the character there (animated)` to `web-demo/progress.md`, followed by the asset-test result.

```bash
git add web-demo/index.html web-demo/styles.css web-demo/progress.md web-demo/assets web-demo/tests/assets.test.mjs
git commit -m "feat: scaffold living chess board demo"
```

---

### Task 2: Pure rook state machine

**Files:**
- Create: `web-demo/game-model.js`
- Create: `web-demo/tests/game-model.test.mjs`
- Modify: `web-demo/progress.md`

**Interfaces:**
- Produces: `createGameState()`, `isLegalRookMove(state, file, rank)`, `beginMove(state, file, rank)`, `triggerAnimation(state, name)`, `resetGame(state)`, and `advanceGame(state, milliseconds)`.
- State shape: `{ mode, square, sourceSquare, targetSquare, position, facing, frame, frameElapsedMs, moveElapsedMs, inputLocked, invalidSquare, loaded, error }`.

- [ ] **Step 1: Write failing state-machine tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceGame,
  beginMove,
  createGameState,
  isLegalRookMove,
  resetGame,
  triggerAnimation,
} from "../game-model.js";

test("rook accepts orthogonal destinations and rejects diagonals", () => {
  const state = createGameState();
  assert.equal(isLegalRookMove(state, 0, 4), true);
  assert.equal(isLegalRookMove(state, 3, 7), true);
  assert.equal(isLegalRookMove(state, 3, 4), false);
});

test("move commits its target and returns to idle", () => {
  const state = createGameState();
  assert.equal(beginMove(state, 0, 7), true);
  advanceGame(state, 900);
  assert.deepEqual(state.square, { file: 0, rank: 7 });
  assert.equal(state.mode, "idle");
  assert.equal(state.inputLocked, false);
});

test("strike returns to idle and death holds until reset", () => {
  const state = createGameState();
  triggerAnimation(state, "strike");
  advanceGame(state, 1000);
  assert.equal(state.mode, "idle");
  triggerAnimation(state, "death");
  advanceGame(state, 2000);
  assert.equal(state.mode, "dead");
  assert.equal(state.frame, 9);
  resetGame(state);
  assert.equal(state.mode, "idle");
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test web-demo/tests/game-model.test.mjs`

Expected: FAIL because `game-model.js` does not exist.

- [ ] **Step 3: Implement the minimal deterministic model**

Use animation definitions matching the metadata: Idle `6 x 180 ms`, Move
`8 x 100 ms`, Strike `8 x 85 ms`, Death `10 x 110 ms`. Use an 850 ms move
duration and linear interpolation between `sourceSquare` and `targetSquare`.
Advance one-shot animations with a loop so a large deterministic time step can
cross multiple frames. A rejected destination sets `invalidSquare` for 300 ms
without mutating the rook's square or mode.

- [ ] **Step 4: Run model and asset tests and verify GREEN**

Run: `node --test web-demo/tests/*.test.mjs`

Expected: PASS with all assertions passing.

- [ ] **Step 5: Record progress and commit**

```bash
git add web-demo/game-model.js web-demo/tests/game-model.test.mjs web-demo/progress.md
git commit -m "feat: add deterministic rook animation model"
```

---

### Task 3: Canvas renderer and browser controls

**Files:**
- Create: `web-demo/game.js`
- Modify: `web-demo/index.html`
- Modify: `web-demo/styles.css`
- Modify: `web-demo/progress.md`
- Test: `web-demo/tests/browser-smoke.mjs`

**Interfaces:**
- Consumes: state-machine exports from `game-model.js`, DOM IDs from `index.html`, and PNG frames from `assets/rook/`.
- Produces: `window.render_game_to_text(): string`, `window.advanceTime(ms): void`, `window.__livingChessReady: Promise<void>`, button actions, pointer-to-square mapping, and fullscreen handling.

- [ ] **Step 1: Write the failing browser smoke test**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright";

test("browser loads the board and exposes deterministic state", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://127.0.0.1:4173/web-demo/");
  await page.evaluate(() => window.__livingChessReady);
  const state = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
  assert.equal(state.mode, "idle");
  assert.deepEqual(state.square, { file: 0, rank: 7 });
  assert.equal(state.assets.loadedFrames, 32);
  await browser.close();
});
```

- [ ] **Step 2: Start the server and verify RED**

Run `python3 -m http.server 4173 --bind 127.0.0.1` from the repository root,
then run `node --test web-demo/tests/browser-smoke.mjs`.

Expected: FAIL because the browser hooks and renderer do not exist.

- [ ] **Step 3: Implement asset loading and Canvas rendering**

Load metadata, build all 32 relative frame URLs, and resolve
`window.__livingChessReady` only after every `Image` has loaded. Render into a
1,024 x 1,024 logical coordinate system with a DPR-scaled backing store. Draw a
warm stone surround, an 832 px board beginning at `(96, 96)`, alternating warm
squares, subtle coordinate marks, hover and invalid-square feedback, and the
rook at its interpolated square position. Draw the 384 x 256 frame using nearest
neighbour sampling, the `(128, 236)` pivot, and a consistent gameplay scale.

- [ ] **Step 4: Implement controls and deterministic hooks**

Convert pointer coordinates from the canvas DOM rectangle to logical Canvas
coordinates. Route legal square clicks to `beginMove`. Wire the four buttons to
`triggerAnimation` or `resetGame`. Use `requestAnimationFrame` for normal play,
but expose `window.advanceTime(ms)` to advance and render synchronously. Return
concise JSON from `render_game_to_text` including coordinate convention, square,
target, interpolated position, mode, frame, facing, lock state, hover square,
invalid square, and loaded-frame count. Toggle fullscreen on `F` and re-render on
resize or fullscreen changes.

- [ ] **Step 5: Run all automated tests and verify GREEN**

Run: `node --test web-demo/tests/*.test.mjs`

Expected: PASS with asset, model, and browser smoke tests all passing.

- [ ] **Step 6: Record progress and commit**

```bash
git add web-demo/game.js web-demo/index.html web-demo/styles.css web-demo/tests/browser-smoke.mjs web-demo/progress.md
git commit -m "feat: render interactive animated chess board"
```

---

### Task 4: End-to-end interaction and visual QA

**Files:**
- Modify: `web-demo/tests/browser-smoke.mjs`
- Modify: `web-demo/styles.css`
- Modify: `web-demo/game.js`
- Modify: `web-demo/progress.md`
- Create: `web-demo/test-artifacts/*.png`

**Interfaces:**
- Consumes: the complete browser demo and deterministic hooks from Task 3.
- Produces: verified interaction coverage and screenshot evidence for the final handoff.

- [ ] **Step 1: Extend the browser test with failing interaction assertions**

Add assertions that click calculated square centres and use `advanceTime` to
verify: horizontal movement, vertical movement, diagonal rejection, Strike back
to Idle, Death to `dead`, input blocked while dead, Reset to starting square,
and zero captured console errors.

- [ ] **Step 2: Run the interaction test and verify RED where behaviour is incomplete**

Run: `node --test web-demo/tests/browser-smoke.mjs`

Expected: any missing interaction fails with the current state payload printed
by the assertion.

- [ ] **Step 3: Implement only the corrections exposed by the test**

Correct coordinate mapping, state timing, control disabling, or rendering only
where the failing assertion demonstrates a mismatch. Do not add full chess rules
or additional characters.

- [ ] **Step 4: Run the prescribed Playwright game loop**

Run the shared web-game client against `http://127.0.0.1:4173/web-demo/` with
short click bursts and deterministic pauses. Capture screenshots for initial
Idle, mid-Move, Strike, and final Death states. Inspect every screenshot and the
`render_game_to_text` output, and confirm no console errors.

- [ ] **Step 5: Verify responsive and fullscreen-safe rendering**

Repeat screenshots at `1280 x 900` and `820 x 1180`. Confirm the complete board,
rook, controls, and status remain visible; the sprite is crisp; the pivot is
stable; and no adjacent animation frame appears.

- [ ] **Step 6: Run the final verification suite**

Run:

```bash
node --test web-demo/tests/*.test.mjs
python3 output/imagegen/living-chess-pilot/rook/test_rook_frames.py
```

Expected: all Node tests pass, the rook isolation regression test passes, and
the inspected screenshots match the text state.

- [ ] **Step 7: Record results and commit**

Append the exact test commands, passing counts, screenshot paths, and any
remaining art-only polish notes to `web-demo/progress.md`.

```bash
git add web-demo
git commit -m "test: verify living chess pilot interactions"
```
