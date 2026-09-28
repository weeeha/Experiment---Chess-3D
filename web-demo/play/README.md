# Boneboard — Play

Live: https://boneboard-play.vercel.app

A separate chess interface based on the supplied portrait game screenshot and the seven existing Boneboard collections. The player–board–player structure, exact 19-piece position, clocks, captured pieces and +15 material advantage are preserved. The original green board and flat icons are replaced by the collection's generated photographic piece renders and matching board materials.

Run `npm run dev` here and open http://127.0.0.1:4191/. Run `npm test` for the game checks. No installation, build, API key, remote runtime dependency or backend is required.

- Seven switchable styles; the chosen style is preserved in the URL.
- Legal local two-player chess, captures, check/checkmate, draw detection, castling, en passant and a promotion picker.
- The reference position is an untimed study; its pictured clocks stay at 0:39 and 0:00.9.
- New game starts a standard position with 3-, 5-, 10-minute or untimed play. The clock starts after the first move. Clocks pause when the browser tab becomes hidden; Resume clocks continues them.
- Move history records moves made in this session. Earlier moves are unknown and are not invented.
- Undo restores the prior position and clocks, paused. Restore reference position returns to the screenshot.
- Flip board, fullscreen, keyboard selection (arrows, Enter/Space, Escape), responsive layout and native accessible buttons.

This is local practice on one screen. There is no online matchmaking, account system, engine opponent, rating update, saved game persistence or official tournament clock adjudication.

All 14 PNG files are unchanged copies of the existing Rendered Collection assets; their hashes are recorded in `asset-provenance.json`. Generated art is not photography of manufactured sets. The existing connected-component atlas extraction is reused in the browser. Chess rules use the existing vendored chess.js 1.4.0 (BSD-2-Clause); UI icons use Phosphor 2.1.1 (MIT). Licenses are preserved in `vendor/`.

Standalone Vercel project: `boneboard-play`. The earlier chess editions are separate. Deployment uses only this directory's static runtime files from a standalone packaging directory; no shared-repository Git identity or other project settings are changed.

Browser evidence and visual comparisons are in `../test-artifacts/play/`; see `design-qa.md` for the acceptance report.

Deployment `dpl_GvPpFnSj7vnQ4RYZECEzt5TVik3E` reported READY and received the dedicated public alias. The CLI was invoked with `--target preview`; Vercel classified this first deployment to the new project as production automatically. No existing project was deployed or changed.
