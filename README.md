# Boneboard

New: [The Modern Collection](web-demo/modern/README.md) — a separate 3D visual prototype with a right-hand style switcher, complete board, and individual piece inspection. Published at https://boneboard-modern.vercel.app. A second collection uses a fixed top-down board and photographic image pieces at https://boneboard-modern.vercel.app/rendered/. Local paths are `/modern/` and `/modern/rendered/`. Both local collections now include Silly AI, a deliberately weak opponent with legal moves, playful commentary, and an Arrange freely option. This gameplay update has not yet been published.

An animated pixel-art chess playground with four characters in a medieval courtyard. Public preview: [boneboard.vercel.app](https://boneboard.vercel.app).

Select a character in the sidebar, click an empty highlighted square to move, or click an enemy to approach and attack. Blue Rook and Royal Tower are allies; Crimson Knight and Dread Tower form the opposing side. Attacks follow the existing movement patterns to an adjacent square, lunge toward the target, and trigger its collapse. The attacker returns to the approach square.

This is an animation prototype, not a full chess game: no turns, check/checkmate, or standard capture rules. Fallen pieces remain until reset. Characters use 2D sprite frames, including for vertical attacks.

## Run locally

Requires Node.js 20 or newer, npm, and Python 3.

```sh
cd web-demo
npm ci
npm start
```

Open http://127.0.0.1:4187. No API keys or environment variables are required.

## Verify

```sh
cd web-demo
npm test
npx playwright install chromium
# Keep npm start running in another terminal, then:
npm run test:browser
```

Browser checks exercise desktop/mobile rendering, all four characters, legal movement, targeting, directional lunges, collapse, reset cancellation, keyboard input, fullscreen, sharing, and the duel. Screenshots and results are written to the ignored `web-demo/test-artifacts/` folder.

## Controls

- Sidebar: choose either side; tapping an ally on the board also selects it.
- Board: click a highlighted square to move or an enemy to approach and attack.
- Keyboard: focus the board, use arrow keys, then Enter or Space to move/attack.
- Animation controls: preview Idle, Move, Attack, or Death independently.
- Watch the duel: run a scripted encounter using the same combat sequence.
- Reset: restore all four units, including during an animation.
- Expand or F: toggle fullscreen; Share preview copies/shares the current URL.

## Deployment

Deploy the `web-demo` directory as a static site. `web-demo/vercel.json` contains the hosting settings. The existing Vercel project is `living-chess-steel-and-bone`; the short public alias is `boneboard.vercel.app`. Assign the alias to a newly tested preview when updating it. Vercel connection files and environment files are local and ignored.

## Artwork

The four characters contain 128 transparent animation frames. The courtyard animates its flags and braziers with discrete sprites. See [asset provenance](web-demo/assets/README.md). These are generated concept-quality assets; small drawing variations between frames remain. Original generation packages and review captures are preserved locally and excluded from this source changeset.
