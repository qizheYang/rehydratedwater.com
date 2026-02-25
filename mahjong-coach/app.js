/**
 * Mahjong Coach — Frontend Logic
 * Live shanten analysis + discard recommendations + Riichi strategy
 *
 * Input format:  hand | melds | dora
 *   MCR:    123m456p789s11z | pon 5z, chi 2m
 *   Riichi: 123m456p789s11z | pon 5z | 3m 5p
 */

(function () {
  'use strict';

  // State
  let currentMode = 'mcr';
  let handTiles = [];
  let meldsStr = '';    // raw melds segment (second |)
  let doraStr = '';     // raw dora segment (third |, Riichi only)
  let syncing = false;
  let analyzing = false;

  // DOM refs
  const handInput = document.getElementById('handInput');
  const handDisplay = document.getElementById('handDisplay');
  const tileCount = document.getElementById('tileCount');
  const tileGrid = document.getElementById('tileGrid');
  const meldDisplay = document.getElementById('meldDisplay');
  const inputHint = document.getElementById('inputHint');
  const resultsCard = document.getElementById('resultsCard');
  const resultsContent = document.getElementById('resultsContent');
  const strategyCard = document.getElementById('strategyCard');
  const strategyContent = document.getElementById('strategyContent');
  const riichiPanel = document.getElementById('riichiPanel');
  const undoBtn = document.getElementById('undoBtn');
  const clearBtn = document.getElementById('clearBtn');
  const modeTabs = document.querySelectorAll('.mode-tab');
  const scoreToggle = document.getElementById('scoreToggle');
  const scoreSection = document.getElementById('scoreSection');

  // Init
  buildTileGrid(tileGrid, onTileClick);
  renderHand(handDisplay, handTiles, onRemoveTile);
  updateCount();
  updateHint();

  // ---------------------------------------------------------------------------
  // Input parsing: hand | melds | dora
  // ---------------------------------------------------------------------------

  function parseFullInput(text) {
    const segments = text.split('|');
    const handPart = (segments[0] || '').trim();
    meldsStr = (segments[1] || '').trim();
    doraStr = (segments[2] || '').trim();
    handTiles = parseTiles(handPart) || [];
  }

  function buildInputText() {
    let text = formatCompact(handTiles);
    if (meldsStr || doraStr) {
      text += ' | ' + meldsStr;
      if (doraStr) text += ' | ' + doraStr;
    }
    return text;
  }

  // ---------------------------------------------------------------------------
  // Mode switching
  // ---------------------------------------------------------------------------

  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMode = tab.dataset.mode;
      riichiPanel.classList.toggle('visible', currentMode === 'riichi');
      strategyCard.classList.add('hidden');
      updateHint();
      triggerAnalysis();
    });
  });

  function updateHint() {
    if (currentMode === 'riichi') {
      handInput.placeholder = '123m456p789s11z | 555z, 234m | 3m';
      inputHint.textContent = 'hand | melds (555z or pon 5z) | dora';
    } else {
      handInput.placeholder = '123m456p789s11z | 555z, 234m';
      inputHint.textContent = 'hand | melds (555z or pon 5z)';
    }
  }

  // Score section toggle
  scoreToggle.addEventListener('click', () => {
    scoreToggle.classList.toggle('collapsed');
    scoreSection.classList.toggle('collapsed');
  });

  // ---------------------------------------------------------------------------
  // Hand input (typing)
  // ---------------------------------------------------------------------------

  const debouncedAnalysis = debounce(triggerAnalysis, 400);

  handInput.addEventListener('input', () => {
    if (syncing) return;
    parseFullInput(handInput.value);
    syncing = true;
    renderHand(handDisplay, handTiles, onRemoveTile);
    renderMeldTags();
    updateCount();
    syncing = false;
    debouncedAnalysis();
  });

  // Tile click — appends to hand portion only
  function onTileClick(tile) {
    handTiles.push(tile);
    syncFromTiles();
    debouncedAnalysis();
  }

  function onRemoveTile(index) {
    handTiles.splice(index, 1);
    syncFromTiles();
    debouncedAnalysis();
  }

  function syncFromTiles() {
    syncing = true;
    handInput.value = buildInputText();
    renderHand(handDisplay, handTiles, onRemoveTile);
    renderMeldTags();
    updateCount();
    syncing = false;
  }

  function updateCount() {
    const meldCount = countMelds();
    const total = handTiles.length + meldCount * 3;
    tileCount.textContent = total;
    const validCounts = [1, 2, 4, 5, 7, 8, 10, 11, 13, 14];
    tileCount.className = 'count-badge ' + (validCounts.includes(total) ? 'valid' : 'invalid');
  }

  function countMelds() {
    if (!meldsStr.trim()) return 0;
    return meldsStr.split(',').filter(p => p.trim()).length;
  }

  function renderMeldTags() {
    meldDisplay.innerHTML = '';
    if (!meldsStr.trim()) return;
    const typeLabels = { chi: '吃', pon: '碰', kan: '明杠', minkan: '明杠', an: '暗杠', ankan: '暗杠' };
    meldsStr.split(',').forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;
      const tokens = trimmed.toLowerCase().split(/\s+/);
      let text;
      if (tokens.length === 2 && typeLabels[tokens[0]]) {
        // Explicit type: "pon 5z" or "chi 234m"
        const tiles = parseTiles(tokens[1]);
        if (tiles && tiles.length === 1) {
          text = `${typeLabels[tokens[0]]} ${TILE_CN[tiles[0]] || tiles[0]}`;
        } else {
          text = `${typeLabels[tokens[0]]} ${(tiles || []).map(t => TILE_CN[t] || t).join('')}`;
        }
      } else if (tokens.length === 1) {
        // Tile notation: 213m, 555p, 3333s
        const tiles = parseTiles(tokens[0]);
        if (tiles && tiles.length >= 3) {
          const allSame = tiles.every(t => t === tiles[0]);
          if (allSame && tiles.length === 3) text = `碰 ${TILE_CN[tiles[0]] || tiles[0]}`;
          else if (allSame && tiles.length === 4) text = `杠 ${TILE_CN[tiles[0]] || tiles[0]}`;
          else text = `吃 ${tiles.map(t => TILE_CN[t] || t).join('')}`;
        } else {
          text = trimmed;
        }
      } else {
        text = trimmed;
      }
      const tag = document.createElement('span');
      tag.className = 'meld-tag';
      tag.textContent = text;
      meldDisplay.appendChild(tag);
    });
  }

  // Undo / Clear
  undoBtn.addEventListener('click', () => {
    if (handTiles.length) {
      handTiles.pop();
      syncFromTiles();
      debouncedAnalysis();
    }
  });

  clearBtn.addEventListener('click', () => {
    handTiles = [];
    meldsStr = '';
    doraStr = '';
    syncFromTiles();
    resultsContent.innerHTML = '<div class="result-empty">Enter a hand to see analysis</div>';
    strategyCard.classList.add('hidden');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      handTiles = [];
      meldsStr = '';
      doraStr = '';
      syncFromTiles();
      resultsContent.innerHTML = '<div class="result-empty">Enter a hand to see analysis</div>';
      strategyCard.classList.add('hidden');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      if (handTiles.length) {
        handTiles.pop();
        syncFromTiles();
        debouncedAnalysis();
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Analysis
  // ---------------------------------------------------------------------------

  async function triggerAnalysis() {
    if (!handTiles.length) {
      resultsContent.innerHTML = '<div class="result-empty">Enter a hand to see analysis</div>';
      strategyCard.classList.add('hidden');
      return;
    }

    if (analyzing) return;
    analyzing = true;

    resultsContent.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Analyzing...</div>';

    try {
      const data = {
        hand: formatCompact(handTiles),
        melds: meldsStr,
        mode: currentMode,
      };

      const result = await apiCall('/coach/analyze', data);
      if (result.error) {
        resultsContent.innerHTML = `<div class="result-empty text-danger">${result.error}</div>`;
        analyzing = false;
        return;
      }
      renderAnalysis(result);

      // Strategy for Riichi mode
      if (currentMode === 'riichi') {
        await tryStrategy();
      } else {
        strategyCard.classList.add('hidden');
      }
    } catch (e) {
      resultsContent.innerHTML = `<div class="result-empty text-danger">Connection error: ${e.message}</div>`;
    }
    analyzing = false;
  }

  function renderAnalysis(result) {
    let html = '';

    // Shanten header
    const sh = result.current_shanten;
    let shantenText, shantenClass;
    if (sh === -1) {
      shantenText = '和了!';
      shantenClass = 'shanten-neg';
    } else if (sh === 0) {
      shantenText = '听牌! (Tenpai)';
      shantenClass = 'shanten-0';
    } else {
      shantenText = `向听 ${sh}`;
      shantenClass = '';
    }
    html += `<div class="result-header">`;
    html += `<span class="shanten-display ${shantenClass}">${shantenText}</span>`;
    html += `<span class="text-muted fs-sm">${result.effective_count} tiles</span>`;
    html += `</div>`;

    if (result.analysis_type === 'discard') {
      html += renderDiscards(result);
    } else if (result.analysis_type === 'acceptance') {
      html += renderAcceptance(result);
    }

    resultsContent.innerHTML = html;
    resultsCard.classList.add('animate-in');
  }

  function renderDiscards(result) {
    const discards = result.discards || [];
    if (!discards.length) return '<div class="text-muted fs-sm">No discard options</div>';

    let html = `<div class="card-title">推荐打牌 Recommended Discards</div>`;
    html += '<div class="discard-list">';

    discards.forEach((d, i) => {
      const stars = starRating(i, discards.length);

      html += `<div class="discard-item">`;
      html += `<div class="discard-header">`;
      html += `<span class="discard-stars">${stars}</span>`;
      html += `<span class="discard-tile-name">${d.tile_cn}(${d.tile})</span>`;
      html += `</div>`;

      html += `<div class="discard-stats">`;
      html += `<span><span class="stat-label">向听 </span><span class="stat-value">${d.shanten}</span></span>`;
      html += `<span><span class="stat-label">受入 </span><span class="stat-value">${d.acceptance_count}枚</span></span>`;

      // MCR win info
      if (currentMode === 'mcr' && d.shanten === 0) {
        if (d.mcr_valid_count > 0) {
          html += `<span class="text-success"><span class="stat-label">可和 </span><span class="stat-value">${d.mcr_valid_count}枚</span></span>`;
          html += `<span class="text-accent"><span class="stat-label">最高 </span><span class="stat-value">${d.mcr_best_fan}番</span></span>`;
        } else if (d.mcr_4th_valid_count > 0) {
          html += `<span class="text-accent"><span class="stat-label">和绝张可和 </span><span class="stat-value">${d.mcr_4th_valid_count}枚</span></span>`;
          html += `<span class="text-muted"><span class="stat-label">最高 </span><span class="stat-value">${d.mcr_best_fan}番</span></span>`;
        } else {
          const gap = 8 - d.mcr_best_fan;
          html += `<span class="text-danger">不可和 ${d.mcr_best_fan}番</span>`;
          html += `<span class="text-muted fs-sm">差${gap}番</span>`;
        }
      }

      // Riichi yaku info
      if (currentMode === 'riichi' && d.shanten === 0) {
        if (d.riichi_all_valid) {
          html += `<span class="text-success">全有役</span>`;
        } else if (d.riichi_valid_count > 0) {
          html += `<span class="text-accent">有役${d.riichi_valid_count}枚</span>`;
          const noYakuCount = d.acceptance_count - d.riichi_valid_count;
          html += `<span class="text-danger">無役${noYakuCount}枚</span>`;
        } else {
          html += `<span class="text-danger">ダマ不可(無役)</span>`;
        }
      }
      html += `</div>`;

      // Acceptance tiles (collapsed for non-top)
      if (d.acceptance && d.acceptance.length) {
        const showExpanded = i < 3;
        if (showExpanded) {
          html += '<div class="discard-acceptance">';
          d.acceptance.forEach(a => {
            const winInfo = a.mcr_win || a.riichi_win;
            html += makeTileHTML(a.tile, a.remaining, winInfo);
          });
          html += '</div>';
        } else {
          html += `<div class="fs-sm text-muted mt-sm">${d.acceptance.map(a => `${a.tile_cn}×${a.remaining}`).join(' ')}</div>`;
        }
      }

      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  function renderAcceptance(result) {
    const acc = result.acceptance || [];
    let html = `<div class="card-title">受入 Acceptance — ${result.acceptance_count}枚</div>`;

    if (!acc.length) {
      return html + '<div class="text-muted fs-sm">No improving tiles</div>';
    }

    html += '<div class="acceptance-grid">';
    acc.forEach(a => {
      const winInfo = a.mcr_win || a.riichi_win;
      html += makeTileHTML(a.tile, a.remaining, winInfo);
    });
    html += '</div>';

    // MCR tenpai: show fan details categorized
    if (currentMode === 'mcr' && result.current_shanten === 0) {
      const validTiles = acc.filter(a => a.mcr_win && a.mcr_win.is_valid_win);
      const fourthTiles = acc.filter(a => a.mcr_win && !a.mcr_win.is_valid_win && a.mcr_win.is_valid_with_4th);
      const invalidTiles = acc.filter(a => a.mcr_win && !a.mcr_win.is_valid_win && !a.mcr_win.is_valid_with_4th);

      if (validTiles.length > 0) {
        html += `<div class="mt"><span class="text-success fw-bold">可和 Valid Wins (≥8番):</span></div>`;
        html += '<div class="wait-list">';
        validTiles.forEach(a => { html += renderMCRWinDetail(a); });
        html += '</div>';
      }

      if (fourthTiles.length > 0) {
        html += `<div class="mt"><span class="text-accent fw-bold">和绝张可和 Valid with Last Tile (+4番):</span></div>`;
        html += '<div class="wait-list">';
        fourthTiles.forEach(a => { html += renderMCRWinDetail(a); });
        html += '</div>';
      }

      if (invalidTiles.length > 0) {
        html += `<div class="mt"><span class="text-danger fw-bold">不可和 Invalid (&lt;8番):</span></div>`;
        html += '<div class="wait-list">';
        invalidTiles.forEach(a => { html += renderMCRWinDetail(a); });
        html += '</div>';
      }

      // Summary when no valid wins at all
      if (validTiles.length === 0 && fourthTiles.length === 0) {
        html += `<div class="mt" style="padding:10px;background:rgba(230,57,70,0.08);border:1px solid rgba(230,57,70,0.3);border-radius:var(--radius)">`;
        html += `<span class="text-danger fw-bold">不可和 — 番数不足8番</span>`;
        html += `<div class="fs-sm text-muted mt-sm">需要更多番种: 和绝张(+4), 或改变手牌结构争取更高番种</div>`;
        html += `</div>`;
      }
    }

    // Riichi tenpai: show yaku details
    if (currentMode === 'riichi' && result.current_shanten === 0) {
      const withYaku = acc.filter(a => a.riichi_win && a.riichi_win.has_yaku_ron);
      const tsumoOnly = acc.filter(a => a.riichi_win && !a.riichi_win.has_yaku_ron && a.riichi_win.has_yaku_tsumo);
      const noYaku = acc.filter(a => a.riichi_win && !a.riichi_win.is_valid_win);

      if (noYaku.length === acc.length) {
        html += `<div class="mt" style="padding:10px;background:rgba(230,57,70,0.08);border:1px solid rgba(230,57,70,0.3);border-radius:var(--radius)">`;
        html += `<span class="text-danger fw-bold">無役 — No yaku without riichi</span>`;
        html += `<div class="fs-sm text-muted mt-sm">立直(リーチ)宣言が必要 — Must declare riichi to win</div>`;
        html += `</div>`;
      } else if (tsumoOnly.length > 0 || (withYaku.length > 0 && withYaku.length < acc.length)) {
        if (withYaku.length > 0) {
          html += `<div class="mt"><span class="text-success fw-bold">有役 Valid (ダマ可):</span></div>`;
          html += '<div class="wait-list">';
          withYaku.forEach(a => { html += renderRiichiWinDetail(a); });
          html += '</div>';
        }
        if (tsumoOnly.length > 0) {
          html += `<div class="mt"><span class="text-accent fw-bold">自摸のみ Tsumo only:</span></div>`;
          html += '<div class="wait-list">';
          tsumoOnly.forEach(a => { html += renderRiichiWinDetail(a); });
          html += '</div>';
        }
        const ronless = acc.filter(a => a.riichi_win && !a.riichi_win.has_yaku_ron && !a.riichi_win.has_yaku_tsumo);
        if (ronless.length > 0) {
          html += `<div class="mt"><span class="text-danger fw-bold">無役 No yaku (リーチ必要):</span></div>`;
          html += '<div class="wait-list">';
          ronless.forEach(a => { html += renderRiichiWinDetail(a); });
          html += '</div>';
        }
      } else if (withYaku.length === acc.length) {
        html += `<div class="mt"><span class="text-success fw-bold">全有役 All waits have yaku:</span></div>`;
        html += '<div class="wait-list">';
        withYaku.forEach(a => { html += renderRiichiWinDetail(a); });
        html += '</div>';
      }
    }

    return html;
  }

  function renderMCRWinDetail(a) {
    if (!a.mcr_win) return '';
    const w = a.mcr_win;
    const cls = w.is_valid_win ? 'valid' : (w.is_valid_with_4th ? '' : 'invalid');
    let badge;
    if (w.is_valid_win) {
      badge = `<span class="fan-valid">${w.best_fan}番 ✓</span>`;
    } else if (w.is_valid_with_4th) {
      badge = `<span class="text-accent">${w.best_fan}番 → 绝张${w.best_fan_4th}番 ✓</span>`;
    } else {
      badge = `<span class="fan-invalid">${w.best_fan}番 ✗</span>`;
    }

    let html = `<div class="wait-item ${cls}">`;
    html += `<div class="wait-info">`;
    html += `<span class="tile-name">${TILE_CN[a.tile] || a.tile}(${a.tile})</span>`;
    html += ` <span class="text-muted">×${a.remaining}</span> ${badge}`;

    const bestFans = w.total_fan_tsumo >= w.total_fan_ron ? w.fans_tsumo : w.fans_ron;
    const method = w.total_fan_tsumo >= w.total_fan_ron ? '自摸' : '点炮';
    if (bestFans && bestFans.length) {
      html += `<div class="fs-sm text-muted mt-sm">${method}: `;
      html += bestFans.map(f => `${f.name_cn}${f.count > 1 ? '×' + f.count : ''}(${f.fan_point * f.count})`).join(' + ');
      html += '</div>';
    }

    if (w.total_fan_tsumo && w.total_fan_ron && w.total_fan_tsumo !== w.total_fan_ron) {
      html += `<div class="fs-sm text-muted">自摸 ${w.total_fan_tsumo}番 / 点炮 ${w.total_fan_ron}番</div>`;
    }

    // Show fan gap hint for invalid wins
    if (!w.is_valid_win && !w.is_valid_with_4th) {
      const gap = 8 - w.best_fan;
      html += `<div class="fs-sm text-danger mt-sm">差${gap}番 — 需和绝张(+4)或其他番种</div>`;
    }

    html += '</div></div>';
    return html;
  }

  function renderRiichiWinDetail(a) {
    if (!a.riichi_win) return '';
    const w = a.riichi_win;
    const hasRon = w.has_yaku_ron;
    const hasTsumo = w.has_yaku_tsumo;
    const cls = hasRon ? 'valid' : (hasTsumo ? '' : 'invalid');

    let badge;
    if (hasRon) {
      badge = `<span class="fan-valid">${w.han_ron}翻 ✓</span>`;
    } else if (hasTsumo) {
      badge = `<span class="text-accent">${w.han_tsumo}翻 (自摸のみ)</span>`;
    } else {
      badge = `<span class="fan-invalid">無役 ✗</span>`;
    }

    let html = `<div class="wait-item ${cls}">`;
    html += `<div class="wait-info">`;
    html += `<span class="tile-name">${TILE_CN[a.tile] || a.tile}(${a.tile})</span>`;
    html += ` <span class="text-muted">×${a.remaining}</span> ${badge}`;

    if (hasRon && w.yaku_ron && w.yaku_ron.length) {
      html += `<div class="fs-sm text-muted mt-sm">ロン: `;
      html += w.yaku_ron.map(y => `${y.name_jp}(${y.han})`).join(' + ');
      html += ` = ${w.han_ron}翻`;
      if (w.cost_ron) html += ` / ${w.cost_ron}点`;
      html += '</div>';
    }
    if (hasTsumo && w.yaku_tsumo && w.yaku_tsumo.length) {
      html += `<div class="fs-sm text-muted${hasRon ? '' : ' mt-sm'}">ツモ: `;
      html += w.yaku_tsumo.map(y => `${y.name_jp}(${y.han})`).join(' + ');
      html += ` = ${w.han_tsumo}翻`;
      if (w.cost_tsumo_main) {
        html += ` / ${w.cost_tsumo_main}`;
        if (w.cost_tsumo_add && w.cost_tsumo_add !== w.cost_tsumo_main) {
          html += `-${w.cost_tsumo_add}点`;
        } else {
          html += '点all';
        }
      }
      html += '</div>';
    }
    if (!hasRon && !hasTsumo) {
      html += `<div class="fs-sm text-danger mt-sm">リーチ宣言が必要 (Must declare riichi)</div>`;
    }

    html += '</div></div>';
    return html;
  }

  function makeTileHTML(tile, remaining, winInfo) {
    const suit = tile[tile.length - 1];
    const colors = SUIT_COLORS[suit] || SUIT_COLORS.z;
    const label = TILE_LABELS[tile] || tile;
    let inner;
    if (label.includes('\n')) {
      const [top, bot] = label.split('\n');
      inner = `<span class="tile-rank">${top}</span><span class="tile-suit">${bot}</span>`;
    } else {
      inner = `<span class="tile-honor">${label}</span>`;
    }

    let badgeHTML = `<span class="tile-badge">×${remaining}</span>`;
    let winBadge = '';

    if (winInfo) {
      if (winInfo.best_fan !== undefined) {
        // MCR win info
        if (winInfo.is_valid_win) {
          winBadge = `<div class="win-badge valid">${winInfo.best_fan}番</div>`;
        } else if (winInfo.is_valid_with_4th) {
          winBadge = `<div class="win-badge" style="background:rgba(233,196,106,0.2);color:var(--accent)">${winInfo.best_fan}番<span class="fs-sm"> 绝张${winInfo.best_fan_4th}</span></div>`;
        } else {
          winBadge = `<div class="win-badge invalid">${winInfo.best_fan}番</div>`;
        }
      } else if (winInfo.has_yaku_ron !== undefined) {
        // Riichi win info
        if (winInfo.has_yaku_ron) {
          winBadge = `<div class="win-badge valid">${winInfo.han_ron}翻</div>`;
        } else if (winInfo.has_yaku_tsumo) {
          winBadge = `<div class="win-badge" style="background:rgba(233,196,106,0.2);color:var(--accent)">ツモ</div>`;
        } else {
          winBadge = `<div class="win-badge invalid">無役</div>`;
        }
      }
    }

    return `<div class="acceptance-tile"><div class="tile-display" style="color:${colors.fg};background:${colors.bg};border-color:${colors.fg}40">${inner}${badgeHTML}</div>${winBadge}</div>`;
  }

  // ---------------------------------------------------------------------------
  // Riichi Strategy
  // ---------------------------------------------------------------------------

  async function tryStrategy() {
    const scoreEast = document.getElementById('scoreEast').value;
    const scoreSouth = document.getElementById('scoreSouth').value;
    const scoreWest = document.getElementById('scoreWest').value;
    const scoreNorth = document.getElementById('scoreNorth').value;

    if (!scoreEast || !scoreSouth || !scoreWest || !scoreNorth) {
      strategyCard.classList.add('hidden');
      return;
    }

    try {
      const data = {
        hand: formatCompact(handTiles),
        melds: meldsStr,
        scores: {
          '0': parseInt(scoreEast),
          '1': parseInt(scoreSouth),
          '2': parseInt(scoreWest),
          '3': parseInt(scoreNorth),
        },
        player_seat: parseInt(document.getElementById('seatWind').value),
        target_placement: parseInt(document.getElementById('targetPlacement').value),
        dora_indicators: doraStr,
        aka_count: document.getElementById('akaCheck').checked ? 1 : 0,
        round_wind: parseInt(document.getElementById('roundWind').value),
      };

      const result = await apiCall('/coach/strategy', data);

      if (result.already_ahead) {
        strategyCard.classList.remove('hidden');
        strategyContent.innerHTML = `<div class="text-success fw-bold">${result.message}</div>`;
        return;
      }

      if (result.error) {
        strategyCard.classList.add('hidden');
        return;
      }

      strategyCard.classList.remove('hidden');
      let html = '';

      if (result.suggestions && result.suggestions.length) {
        html += '<div>';
        result.suggestions.forEach(s => {
          html += `<div class="strategy-suggestion">${s}</div>`;
        });
        html += '</div>';
      }

      if (result.yaku_potential && result.yaku_potential.length) {
        html += '<div class="mt"><span class="fs-sm text-muted">役种潜力 Yaku Potential:</span></div>';
        html += '<div class="yaku-list">';
        result.yaku_potential.forEach(y => {
          html += `<span class="yaku-tag ${y.confidence}">${y.name_jp} +${y.han}</span>`;
        });
        html += '</div>';
      }

      strategyContent.innerHTML = html;
    } catch (e) {
      strategyCard.classList.add('hidden');
    }
  }

  // Score input listeners for live strategy
  const scoreInputs = ['scoreEast', 'scoreSouth', 'scoreWest', 'scoreNorth',
                        'seatWind', 'roundWind', 'targetPlacement',
                        'akaCheck', 'uraCheck'];
  scoreInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => { if (handTiles.length) debouncedAnalysis(); });
      el.addEventListener('input', debounce(() => { if (handTiles.length) debouncedAnalysis(); }, 500));
    }
  });
})();
