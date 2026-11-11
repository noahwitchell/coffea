// Flat art: terraced hillside and six-lobed coffee shrub tokens. No gradients, no blur — solid faces only.
export const PAL = {
  // Four greens told apart by hue AND lightness: chartreuse (light, yellow), grass (mid), pale mint (light, blue), deep teal (dark, blue).
  Y: { top: '#a9dccb', side: '#78ad9b', berry: '#d2392b' },
  G: { top: '#bccb3c', side: '#8a962a', berry: '#d2392b' },
  R: { top: '#4f9a45', side: '#386f31', berry: '#d2392b' },
  B: { top: '#1f5b5a', side: '#123b3a', berry: '#e2483a' },
  M: { top: '#fbf8f2', side: '#cfc6b6', berry: '#3a3530' },
};
// Six-lobed shrub silhouette, flat: one solid top face over a solid side face.
// lr/ld/cr = lobe radius, lobe distance, core radius (smaller = withered).
const shrub = (fill, dy = 0, lr = 13, ld = 19, cr = 20) => `<g fill="${fill}" transform="translate(0 ${dy})">${[0, 1, 2, 3, 4, 5].map(k => {
  const a = (k * 60 - 90) * Math.PI / 180;
  return `<circle cx="${(Math.cos(a) * ld).toFixed(2)}" cy="${(Math.sin(a) * ld).toFixed(2)}" r="${lr}"/>`;
}).join('')}<circle r="${cr}"/></g>`;
// Monoculture disease: the withered end state the healthy shrub fades into.
const WITHERED = { top: '#6e5134', side: '#4c3722', berry: '#33211a', lobe: [10, 17, 16], r: 3 };
const CHERRIES = [[0, -14], [-13, 0], [13, 0], [0, 11]];

export function defs() {
  let s = '';
  for (const [k, p] of Object.entries(PAL)) {
    const mark = k === 'M'
      ? `<path d="M-12 5 A12 12 0 1 1 9 9" fill="none" stroke="${p.berry}" stroke-width="3.6" stroke-linecap="round"/><path d="M3 3 L12 12 L15 0 Z" fill="${p.berry}"/>`
      : CHERRIES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="${p.berry}"/>`).join('');
    s += `<symbol id="bush${k}" viewBox="-50 -50 100 100" overflow="visible">${shrub(p.side, 6)}${shrub(p.top)}${mark}</symbol>`;
  }
  {
    const p = WITHERED, [lr, ld, cr] = p.lobe;
    s += `<symbol id="withered" viewBox="-50 -50 100 100" overflow="visible">${shrub(p.side, 6, lr, ld, cr)}${shrub(p.top, 0, lr, ld, cr)}${CHERRIES.map(([x, y]) => `<circle cx="${x * ld / 19}" cy="${y * ld / 19 + 2}" r="${p.r}" fill="${p.berry}"/>`).join('')}</symbol>`;
  }
  return s;
}

// Board geometry (viewBox units). Row 0 = top of the mountain.
export const CELL = 100, OX = 38, OY = 64, RISER = 10, W = OX + 4 * CELL + 16, H = OY + 4 * CELL;
export const cx = i => OX + (i & 3) * CELL + CELL / 2;
export const cy = i => OY + (i >> 2) * CELL + CELL / 2 - RISER / 2;

export const TERRACE = [['#f2e3c6', '#e2cca5'], ['#ead3ad', '#d6b98b'], ['#e0c091', '#c9a46f'], ['#d4ab76', '#b98f5a']];
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
export const hole = () => `<g opacity=".16">${shrub('#6e461e', 3)}</g>`;
