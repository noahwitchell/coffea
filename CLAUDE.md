# Coffea Arabica — notes for Claude

- Owner: Noah. His board game (first draft "Arabica Rulebook v1.0", ~/Downloads/ArabicaRules_v100.pages) as a phone PWA. Look follows his 3D-printable board render: sky + red Lobster script title, rolling green hills, rows numbered 1 (bottom) to 4 (top), pieces = six-lobed bushes with red cherries.
- No build step, no frameworks, no npm deps. ES modules served statically, same setup as ~/Claude/EveryDay and ~/Claude/FretFlow.
- All rules live in `js/model.js` (row 0 in code = top = "row 4" on screen). Run `node --test tests/model.test.mjs` after changing them. Computer opponent in `js/ai.js` (easy random / normal = don't hand over a win / hard = one full turn of expectimax).
- Rulings the rulebook left open (shown in the app's rules sheet): disease is orthogonal and checked before the win; transplants obey altitude; a piece with no legal spot goes back and the turn ends; 8 straight passes = draw.
- Steady interface: controls hold their size and position; disable, don't remove.
- Game in progress saved in localStorage `coffea.v1`.
- Icon: `node tools/make_icon.mjs && zsh tools/render_icons.sh`.
- Public repo github.com/noahwitchell/coffea, GitHub Pages from main (push = deploy). Bump CACHE in sw.js when shipping.
