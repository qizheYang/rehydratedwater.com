/**
 * Shared tile constants and utilities for Mahjong web apps.
 */

const API_BASE = '/api/mahjong';

const SUIT_NAMES = { m: '万', p: '筒', s: '条', z: '字' };

const TILE_CN = {
  '1m':'一万','2m':'二万','3m':'三万','4m':'四万','5m':'五万',
  '6m':'六万','7m':'七万','8m':'八万','9m':'九万',
  '1p':'一筒','2p':'二筒','3p':'三筒','4p':'四筒','5p':'五筒',
  '6p':'六筒','7p':'七筒','8p':'八筒','9p':'九筒',
  '1s':'一条','2s':'二条','3s':'三条','4s':'四条','5s':'五条',
  '6s':'六条','7s':'七条','8s':'八条','9s':'九条',
  '1z':'東','2z':'南','3z':'西','4z':'北','5z':'白','6z':'發','7z':'中',
};

const TILE_LABELS = {
  '1m':'一\n万','2m':'二\n万','3m':'三\n万','4m':'四\n万','5m':'五\n万',
  '6m':'六\n万','7m':'七\n万','8m':'八\n万','9m':'九\n万',
  '1p':'一\n筒','2p':'二\n筒','3p':'三\n筒','4p':'四\n筒','5p':'五\n筒',
  '6p':'六\n筒','7p':'七\n筒','8p':'八\n筒','9p':'九\n筒',
  '1s':'一\n条','2s':'二\n条','3s':'三\n条','4s':'四\n条','5s':'五\n条',
  '6s':'六\n条','7s':'七\n条','8s':'八\n条','9s':'九\n条',
  '1z':'東','2z':'南','3z':'西','4z':'北','5z':'白','6z':'發','7z':'中',
};

const SUIT_COLORS = {
  m: { fg: '#e63946', bg: '#fff5f5' },
  p: { fg: '#457b9d', bg: '#f0f7ff' },
  s: { fg: '#2d6a4f', bg: '#f0faf4' },
  z: { fg: '#4a4a6a', bg: '#f5f5fa' },
};

const ALL_TILES = [];
for (const s of ['m','p','s']) {
  for (let r = 1; r <= 9; r++) ALL_TILES.push(`${r}${s}`);
}
for (let r = 1; r <= 7; r++) ALL_TILES.push(`${r}z`);

/**
 * Parse compact tile notation.
 * '234m567p11z' → ['2m','3m','4m','5p','6p','7p','1z','1z']
 */
function parseTiles(notation) {
  notation = notation.trim().toLowerCase();
  if (!notation) return [];
  if (notation.includes(' ')) {
    return notation.split(/\s+/).filter(Boolean).map(t => {
      if (t[0] === '0' && 'mps'.includes(t[1])) return '5' + t[1];
      return t;
    });
  }
  const result = [];
  const re = /([0-9]+)([mpsz])/g;
  let m, total = '';
  while ((m = re.exec(notation)) !== null) {
    const [, digits, suit] = m;
    total += digits + suit;
    for (const d of digits) {
      const r = d === '0' ? '5' : d;
      result.push(r + suit);
    }
  }
  if (total !== notation) return null; // invalid
  return result;
}

/**
 * Format tile list to compact notation.
 * ['2m','3m','4m','1z','1z'] → '234m11z'
 */
function formatCompact(tiles) {
  if (!tiles.length) return '';
  const groups = {};
  for (const t of tiles) {
    const suit = t[t.length - 1];
    if (!groups[suit]) groups[suit] = [];
    groups[suit].push(t[0]);
  }
  let s = '';
  for (const suit of ['m','p','s','z']) {
    if (groups[suit]) s += groups[suit].join('') + suit;
  }
  return s;
}

/**
 * Create a tile element for display.
 */
function createTileEl(tileCode, opts = {}) {
  const el = document.createElement('div');
  el.className = 'tile-display' + (opts.className ? ' ' + opts.className : '');
  const suit = tileCode[tileCode.length - 1];
  const colors = SUIT_COLORS[suit] || SUIT_COLORS.z;
  el.style.color = colors.fg;
  el.style.backgroundColor = colors.bg;
  el.style.borderColor = colors.fg + '40';

  const label = TILE_LABELS[tileCode] || tileCode;
  if (label.includes('\n')) {
    const [top, bot] = label.split('\n');
    el.innerHTML = `<span class="tile-rank">${top}</span><span class="tile-suit">${bot}</span>`;
  } else {
    el.innerHTML = `<span class="tile-honor">${label}</span>`;
  }

  if (opts.count !== undefined) {
    const badge = document.createElement('span');
    badge.className = 'tile-badge';
    badge.textContent = `×${opts.count}`;
    el.appendChild(badge);
  }

  if (opts.onClick) {
    el.classList.add('clickable');
    el.addEventListener('click', () => opts.onClick(tileCode));
  }

  el.dataset.tile = tileCode;
  return el;
}

/**
 * Build the tile input grid.
 */
function buildTileGrid(container, onClick) {
  container.innerHTML = '';
  const suits = [
    { suit: 'm', label: '万', tiles: [1,2,3,4,5,6,7,8,9] },
    { suit: 'p', label: '筒', tiles: [1,2,3,4,5,6,7,8,9] },
    { suit: 's', label: '条', tiles: [1,2,3,4,5,6,7,8,9] },
    { suit: 'z', label: '字', tiles: [1,2,3,4,5,6,7] },
  ];

  for (const { suit, label, tiles } of suits) {
    const row = document.createElement('div');
    row.className = 'tile-row';
    const labelEl = document.createElement('span');
    labelEl.className = 'tile-row-label';
    labelEl.textContent = label;
    labelEl.style.color = SUIT_COLORS[suit].fg;
    row.appendChild(labelEl);
    for (const r of tiles) {
      const code = `${r}${suit}`;
      const btn = createTileEl(code, { onClick, className: 'tile-btn' });
      row.appendChild(btn);
    }
    container.appendChild(row);
  }
}

/**
 * Render hand tiles in a display area.
 */
function renderHand(container, tiles, onRemove) {
  container.innerHTML = '';
  if (!tiles.length) {
    container.innerHTML = '<span class="hand-placeholder">Click tiles or type notation above</span>';
    return;
  }
  tiles.forEach((t, i) => {
    const el = createTileEl(t, {
      onClick: onRemove ? () => onRemove(i) : undefined,
      className: 'hand-tile',
    });
    container.appendChild(el);
  });
}

/**
 * Debounce helper.
 */
function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Make an API call.
 */
async function apiCall(endpoint, data) {
  const resp = await fetch(API_BASE + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return resp.json();
}

/**
 * Star rating for discard quality.
 */
function starRating(index, total) {
  if (total <= 1) return '★★★';
  if (index === 0) return '★★★';
  const ratio = index / (total - 1);
  if (ratio <= 0.33) return '★★★';
  if (ratio <= 0.66) return '★★';
  return '★';
}
