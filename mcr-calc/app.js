/**
 * MCR Mahjong Scorer — Frontend Logic
 */

(function () {
  'use strict';

  // State
  let handTiles = [];
  let melds = [];       // [{type, text, tiles_display}]
  let meldsRaw = [];    // raw meld strings for API

  // DOM refs
  const handInput = document.getElementById('handInput');
  const handDisplay = document.getElementById('handDisplay');
  const tileCount = document.getElementById('tileCount');
  const tileGrid = document.getElementById('tileGrid');
  const meldInput = document.getElementById('meldInput');
  const meldDisplay = document.getElementById('meldDisplay');
  const winTile = document.getElementById('winTile');
  const calcBtn = document.getElementById('calcBtn');
  const tenpaiBtn = document.getElementById('tenpaiBtn');
  const resultsCard = document.getElementById('resultsCard');
  const resultsContent = document.getElementById('resultsContent');
  const undoBtn = document.getElementById('undoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const addMeldBtn = document.getElementById('addMeldBtn');

  let syncing = false;

  // Init
  buildTileGrid(tileGrid, onTileClick);
  renderHand(handDisplay, handTiles, onRemoveTile);
  updateCount();

  // Event listeners
  handInput.addEventListener('input', debounce(() => {
    if (syncing) return;
    const parsed = parseTiles(handInput.value);
    if (parsed) {
      handTiles = parsed;
      syncing = true;
      renderHand(handDisplay, handTiles, onRemoveTile);
      updateCount();
      syncing = false;
    }
  }, 200));

  calcBtn.addEventListener('click', doCalculate);
  tenpaiBtn.addEventListener('click', doTenpai);
  undoBtn.addEventListener('click', () => {
    if (handTiles.length) {
      handTiles.pop();
      syncFromTiles();
    }
  });
  clearBtn.addEventListener('click', () => {
    handTiles = [];
    melds = [];
    meldsRaw = [];
    syncFromTiles();
    renderMelds();
    winTile.value = '';
    hideResults();
  });

  addMeldBtn.addEventListener('click', addMeld);
  meldInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addMeld();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      hideResults();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      if (handTiles.length) {
        handTiles.pop();
        syncFromTiles();
      }
    }
    if (e.key === 'Enter' && !e.target.closest('.meld-list, #meldInput')) {
      doCalculate();
    }
  });

  // Functions
  function onTileClick(tile) {
    handTiles.push(tile);
    syncFromTiles();
  }

  function onRemoveTile(index) {
    handTiles.splice(index, 1);
    syncFromTiles();
  }

  function syncFromTiles() {
    syncing = true;
    handInput.value = formatCompact(handTiles);
    renderHand(handDisplay, handTiles, onRemoveTile);
    updateCount();
    syncing = false;
  }

  function updateCount() {
    const meldTileCount = melds.reduce((sum, m) => sum + 3, 0);
    const total = handTiles.length + meldTileCount;
    tileCount.textContent = total;
    const validCounts = [1, 2, 4, 5, 7, 8, 10, 11, 13, 14];
    tileCount.className = 'count-badge ' + (validCounts.includes(total) ? 'valid' : 'invalid');
  }

  function addMeld() {
    const val = meldInput.value.trim();
    if (!val) return;
    // parse and validate
    const parts = val.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const tokens = trimmed.toLowerCase().split(/\s+/);
      if (tokens.length !== 2) {
        showError(`Invalid meld: "${trimmed}". Format: chi 2m, pon 5z, kan 3p, an 1m`);
        return;
      }
      const [type, tile] = tokens;
      const cn = TILE_CN[tile[0] === '0' ? '5' + tile[1] : tile] || tile;
      const labels = { chi: '吃', pon: '碰', kan: '明杠', minkan: '明杠', an: '暗杠', ankan: '暗杠' };
      if (!labels[type]) {
        showError(`Unknown meld type: "${type}"`);
        return;
      }
      melds.push({ type, text: `${labels[type]} ${cn}`, raw: trimmed });
      meldsRaw.push(trimmed);
    }
    meldInput.value = '';
    renderMelds();
    updateCount();
  }

  function renderMelds() {
    meldDisplay.innerHTML = '';
    melds.forEach((m, i) => {
      const tag = document.createElement('span');
      tag.className = 'meld-tag';
      tag.innerHTML = `${m.text} <span class="remove-meld" data-idx="${i}">&times;</span>`;
      meldDisplay.appendChild(tag);
    });
    meldDisplay.querySelectorAll('.remove-meld').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        melds.splice(idx, 1);
        meldsRaw.splice(idx, 1);
        renderMelds();
        updateCount();
      });
    });
  }

  function getWinMethod() {
    return document.querySelector('input[name="winMethod"]:checked').value;
  }

  async function doCalculate() {
    if (!handTiles.length) return;
    if (!winTile.value.trim()) {
      showError('Please enter a win tile (和牌)');
      return;
    }

    showLoading();
    try {
      const data = {
        hand: formatCompact(handTiles),
        melds: meldsRaw.join(', '),
        win_tile: winTile.value.trim(),
        is_tsumo: getWinMethod() === 'tsumo',
        flower_count: parseInt(document.getElementById('flowerCount').value),
        seat_wind: document.getElementById('seatWind').value,
        prevalent_wind: document.getElementById('prevalentWind').value,
        is_4th_tile: document.getElementById('is4thTile').checked,
        is_about_kong: document.getElementById('isAboutKong').checked,
        is_wall_last: document.getElementById('isWallLast').checked,
      };

      const result = await apiCall('/mcr/score', data);
      if (result.error) {
        showError(result.error);
        return;
      }
      showScoreResult(result);
    } catch (e) {
      showError('Connection error: ' + e.message);
    }
  }

  async function doTenpai() {
    if (!handTiles.length) return;

    showLoading();
    try {
      const data = {
        hand: formatCompact(handTiles),
        melds: meldsRaw.join(', '),
        seat_wind: document.getElementById('seatWind').value,
        prevalent_wind: document.getElementById('prevalentWind').value,
      };

      const result = await apiCall('/mcr/tenpai', data);
      if (result.error) {
        showError(result.error);
        return;
      }
      showTenpaiResult(result);
    } catch (e) {
      showError('Connection error: ' + e.message);
    }
  }

  function showScoreResult(result) {
    resultsCard.style.display = '';
    let html = '<div class="card-title">计算结果 Score Result</div>';

    if (!result.fans || !result.fans.length) {
      html += '<div class="result-empty">不是和牌 (Not a winning hand)</div>';
      resultsContent.innerHTML = html;
      return;
    }

    html += '<table class="fan-table"><thead><tr><th>番种 Pattern</th><th>EN</th><th>番</th></tr></thead><tbody>';
    for (const f of result.fans) {
      const countStr = f.count > 1 ? ` ×${f.count}` : '';
      html += `<tr><td>${f.name_cn}${countStr}</td><td class="text-muted">${f.name_en}</td><td>${f.total}</td></tr>`;
    }
    html += `<tr class="fan-total"><td colspan="2">合计 Total</td><td>${result.total_fan}番</td></tr>`;
    html += '</tbody></table>';

    const validity = result.is_valid_win
      ? '<span class="fan-valid">✓ 可和 (≥8番)</span>'
      : '<span class="fan-invalid">✗ 不可和 (&lt;8番，不含花)</span>';
    html += `<div style="text-align:right;margin-top:8px">${validity}</div>`;

    resultsContent.innerHTML = html;
    resultsCard.classList.add('animate-in');
  }

  function showTenpaiResult(result) {
    resultsCard.style.display = '';
    let html = '<div class="card-title">听牌分析 Tenpai Analysis</div>';

    if (!result.is_tenpai) {
      html += `<div class="result-empty">未听牌 (Not tenpai)<br><span class="text-muted">向听数: ${result.shanten}</span></div>`;
      resultsContent.innerHTML = html;
      return;
    }

    const validCount = result.valid_waits ? result.valid_waits.length : 0;
    const totalWaits = result.waits ? result.waits.length : 0;
    html += `<div class="tenpai-info">听牌! 共 ${totalWaits} 种待牌`;
    if (validCount < totalWaits) {
      html += ` (${validCount} 种可和 ≥8番)`;
    }
    html += '</div>';

    html += '<div class="wait-list">';
    for (const w of (result.waits || [])) {
      const cls = w.can_win ? 'valid' : 'invalid';
      const badge = w.can_win
        ? `<span class="fan-valid">${w.best_fan}番 ✓</span>`
        : `<span class="fan-invalid">${w.best_fan}番 ✗</span>`;

      html += `<div class="wait-item ${cls}">`;
      html += `<div class="wait-info">`;
      html += `<span class="tile-name">${w.tile_cn}(${w.tile})</span>`;
      html += ` <span class="text-muted">×${w.remaining}</span> ${badge}`;

      // Fan breakdown
      if (w.can_win) {
        const fans = w.tsumo_fan >= w.ron_fan ? w.tsumo_fans : w.ron_fans;
        const method = w.tsumo_fan >= w.ron_fan ? '自摸' : '点炮';
        if (fans && fans.length) {
          html += `<div class="fs-sm text-muted mt-sm">${method}: `;
          html += fans.map(f => `${f.name_cn}${f.count > 1 ? '×' + f.count : ''}(${f.total})`).join(' + ');
          html += '</div>';
        }
        if (w.tsumo_fan && w.ron_fan && w.tsumo_fan !== w.ron_fan) {
          html += `<div class="fs-sm text-muted">自摸 ${w.tsumo_fan}番 / 点炮 ${w.ron_fan}番</div>`;
        }
      }

      html += '</div></div>';
    }
    html += '</div>';

    resultsContent.innerHTML = html;
    resultsCard.classList.add('animate-in');
  }

  function showLoading() {
    resultsCard.style.display = '';
    resultsContent.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Calculating...</div>';
  }

  function showError(msg) {
    resultsCard.style.display = '';
    resultsContent.innerHTML = `<div class="result-empty text-danger">${msg}</div>`;
  }

  function hideResults() {
    resultsCard.style.display = 'none';
    resultsContent.innerHTML = '';
  }
})();
