// Writes icons/icon.svg: the hillside with the winning 2x2 hybrid square of all four bushes.
import { writeFileSync } from 'node:fs';
import { defs } from '../js/art.js';
const S = 512;
const bush = (k, x, y, s = 1.62) => `<use href="#bush${k}" x="-50" y="-50" width="100" height="100" transform="translate(${x} ${y}) scale(${s})"/>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${S} ${S}">
<defs>${defs()}</defs>
<rect width="${S}" height="${S}" fill="url(#sky)"/>
<path d="M0 150 Q128 40 256 120 Q384 40 512 150 L512 512 L0 512 Z" fill="url(#hillA)"/>
<path d="M0 300 C170 240 340 270 512 250 L512 512 L0 512 Z" fill="rgba(0,0,0,.25)" filter="url(#soft)" transform="translate(0 -10)"/>
<path d="M0 300 C170 240 340 270 512 250 L512 512 L0 512 Z" fill="url(#hillB)"/>
${bush('Y', 176, 200)}${bush('G', 336, 200)}${bush('B', 176, 360)}${bush('R', 336, 360)}
</svg>`;
writeFileSync(new URL('../icons/icon.svg', import.meta.url), svg.replace(/href="#/g, 'xlink:href="#'));
