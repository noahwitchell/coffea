// Flat art: terraced hillside and coin-like plant tokens. No gradients, no blur — solid faces only.
export const PAL = {
  Y: { top: '#efb43f', side: '#b98425', mark: '#8a5f14' },
  G: { top: '#3e9a6e', side: '#2a6e4e', mark: '#1d4f37' },
  B: { top: '#34508f', side: '#22386a', mark: '#172648' },
  R: { top: '#e2573f', side: '#a93a28', mark: '#7d2617' },
  M: { top: '#fbf8f2', side: '#cfc6b6', mark: '#3a3530' },
};
const R = 30;
// Coffee bean: an oval with an S-crease.
const bean = c => `<g transform="rotate(-28)"><ellipse rx="10.5" ry="15" fill="${c}"/>
  <path d="M0 -14 C-5 -6 5 6 0 14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></g>`;

export function defs() {
  let s = '';
  for (const [k, p] of Object.entries(PAL)) {
    const mark = k === 'M'
      ? `<path d="M-14 6 A14 14 0 1 1 10 10" fill="none" stroke="${p.mark}" stroke-width="4" stroke-linecap="round"/><path d="M3 4 L13 14 L17 1 Z" fill="${p.mark}"/>`
      : `<g color="${p.top}">${bean(p.mark)}</g>`;
    s += `<symbol id="bush${k}" viewBox="-50 -50 100 100" overflow="visible">
      <circle cy="6" r="${R}" fill="${p.side}"/><rect x="-${R}" y="0" width="${R * 2}" height="6" fill="${p.side}"/>
      <circle r="${R}" fill="${p.top}"${k === 'M' ? ` stroke="${p.side}" stroke-width="1.5"` : ''}/>${mark}</symbol>`;
  }
  return s;
}

// Board geometry (viewBox units). Row 0 = top of the mountain.
export const CELL = 100, OX = 38, OY = 64, RISER = 10, W = OX + 4 * CELL + 16, H = OY + 4 * CELL;
export const cx = i => OX + (i & 3) * CELL + CELL / 2;
export const cy = i => OY + (i >> 2) * CELL + CELL / 2 - RISER / 2;

const TERRACE = [['#f2e3c6', '#e2cca5'], ['#ead3ad', '#d6b98b'], ['#e0c091', '#c9a46f'], ['#d4ab76', '#b98f5a']];
export function hillside() {
  let s = `<rect width="${W}" height="${H}" fill="#d9e8ec"/>
    <circle cx="${W - 92}" cy="34" r="20" fill="#f7dcc0"/>
    <path d="M0 ${OY} L70 22 L130 46 L210 6 L300 50 L360 26 L${W} ${OY - 8} L${W} ${OY} Z" fill="#bcd2d8"/>
    <path d="M0 ${OY} L110 40 L190 58 L280 32 L${W} ${OY - 2} L${W} ${OY} Z" fill="#a9c3c9"/>`;
  for (let r = 0; r < 4; r++) {
    const y = OY + r * CELL, [top, side] = TERRACE[r];
    s += `<rect x="0" y="${y}" width="${W}" height="${CELL}" fill="${top}"/>
      <rect x="0" y="${y + CELL - RISER}" width="${W}" height="${RISER}" fill="${side}"/>
      <text class="rownum" x="${OX / 2}" y="${y + CELL / 2 + 4}" text-anchor="middle">${4 - r}</text>`;
  }
  return s;
}
// Empty plot: a flat planting hole.
export const hole = () => `<circle r="${R}" cy="3" fill="rgba(110,70,30,.16)"/>`;
