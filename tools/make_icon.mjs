// Writes icons/icon.svg: one Racemosa (medium green) shrub on the tan terrace colour.
import { writeFileSync } from 'node:fs';
import { defs } from '../js/art.js';
const S = 512;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${S} ${S}">
<defs>${defs().replace(/href="#/g, 'xlink:href="#')}</defs>
<rect width="${S}" height="${S}" fill="#ead3ad"/>
<use xlink:href="#bushG" x="-50" y="-50" width="100" height="100" transform="translate(256 238) scale(5.95)"/>
</svg>`;
writeFileSync(new URL('../icons/icon.svg', import.meta.url), svg);
