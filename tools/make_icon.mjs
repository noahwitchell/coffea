// Writes icons/icon.svg: flat terraces with the winning 2x2 hybrid of all four tokens.
import { writeFileSync } from 'node:fs';
import { defs } from '../js/art.js';
const S = 512;
const tok = (k, x, y) => `<use xlink:href="#bush${k}" x="-50" y="-50" width="100" height="100" transform="translate(${x} ${y}) scale(2.35)"/>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${S} ${S}">
<defs>${defs().replace(/href="#/g, 'xlink:href="#')}</defs>
<rect width="${S}" height="${S}" fill="#d9e8ec"/>
<path d="M0 120 L110 46 L200 86 L320 20 L420 70 L512 40 L512 140 L0 140 Z" fill="#bcd2d8"/>
<rect y="120" width="${S}" height="200" fill="#ead3ad"/><rect y="300" width="${S}" height="20" fill="#d6b98b"/>
<rect y="320" width="${S}" height="192" fill="#e0c091"/><rect y="492" width="${S}" height="20" fill="#c9a46f"/>
${tok('Y', 172, 216)}${tok('G', 340, 216)}${tok('B', 172, 400)}${tok('R', 340, 400)}
</svg>`;
writeFileSync(new URL('../icons/icon.svg', import.meta.url), svg);
