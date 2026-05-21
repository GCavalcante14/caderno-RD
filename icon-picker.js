/* ═══════════════════════════════════════════════
   LifeOS · icon-picker.js v2
   Picker visual de ícones Tabler reutilizável
   Uso: openIconPicker(callback, currentIcon)
   ═══════════════════════════════════════════════ */

const ICON_CATEGORIES = {
  'Saúde': [
    'ti-heart','ti-heart-rate-monitor','ti-activity','ti-brain','ti-stethoscope',
    'ti-pill','ti-run','ti-yoga','ti-moon','ti-zzz','ti-flame','ti-droplet',
    'ti-apple','ti-salad','ti-dumbbell','ti-swimming','ti-bike','ti-walk',
    'ti-lungs','ti-eye','ti-ear','ti-tooth','ti-bandage','ti-vaccine','ti-bed',
  ],
  'Medicina': [
    'ti-stethoscope','ti-heartbeat','ti-first-aid-kit','ti-ambulance',
    'ti-report-medical','ti-clipboard-plus','ti-nurse','ti-baby','ti-thermometer',
    'ti-syringe','ti-pill','ti-capsule','ti-virus','ti-shield-heart',
    'ti-microscope','ti-flask','ti-dna',
  ],
  'Estudo': [
    'ti-book','ti-book-2','ti-books','ti-pencil','ti-writing','ti-notebook',
    'ti-notes','ti-article','ti-file-text','ti-clipboard','ti-school',
    'ti-certificate','ti-award','ti-bulb','ti-atom','ti-telescope',
    'ti-presentation','ti-chart-bar','ti-brand-python','ti-code','ti-terminal',
  ],
  'Hábitos': [
    'ti-checkbox','ti-checks','ti-check','ti-circle-check','ti-refresh',
    'ti-clock','ti-alarm','ti-calendar','ti-calendar-event','ti-sun',
    'ti-sunrise','ti-sunset','ti-coffee','ti-tea','ti-soup',
    'ti-bath','ti-shirt','ti-moon-stars','ti-star','ti-bolt',
  ],
  'Finanças': [
    'ti-coin','ti-coins','ti-wallet','ti-credit-card','ti-receipt',
    'ti-piggy-bank','ti-chart-line','ti-trending-up','ti-trending-down',
    'ti-currency-dollar','ti-cash','ti-bank','ti-safe',
    'ti-report','ti-calculator',
  ],
  'Relações': [
    'ti-users','ti-user','ti-user-heart','ti-friends','ti-heart-handshake',
    'ti-message','ti-message-circle','ti-phone','ti-video','ti-home',
    'ti-baby-carriage','ti-dog','ti-cat','ti-hand-holding-heart',
    'ti-gift','ti-confetti',
  ],
  'Natureza': [
    'ti-plant','ti-leaf','ti-tree','ti-mountain','ti-sun','ti-cloud',
    'ti-wind','ti-droplets','ti-snowflake','ti-flower','ti-seeding',
    'ti-world','ti-globe','ti-compass','ti-map','ti-map-pin',
  ],
  'Sistema': [
    'ti-layout-dashboard','ti-settings','ti-adjustments','ti-filter',
    'ti-search','ti-link','ti-arrow-right','ti-plus','ti-minus','ti-x',
    'ti-menu-2','ti-grid','ti-list','ti-table','ti-tag','ti-tags',
    'ti-diamond','ti-crown','ti-trophy','ti-medal','ti-target','ti-rocket',
    'ti-sparkles','ti-infinity','ti-peace',
  ],
  'Tempo': [
    'ti-clock','ti-hourglass','ti-calendar-week','ti-calendar-month',
    'ti-player-play','ti-player-pause','ti-player-stop','ti-repeat',
    'ti-history','ti-reload','ti-timeline',
  ],
};

// ── CSS INJETADO UMA VEZ ─────────────────────────
(function injectStyles() {
  if (document.getElementById('ip-styles')) return;
  const s = document.createElement('style');
  s.id = 'ip-styles';
  s.textContent = `
  .ip-overlay {
    position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;
    display:flex;align-items:center;justify-content:center;
    backdrop-filter:blur(4px);
  }
  .ip-modal {
    background:var(--surface);border:1px solid var(--border);border-radius:12px;
    width:540px;max-width:95vw;max-height:82vh;display:flex;flex-direction:column;
    box-shadow:0 24px 64px rgba(0,0,0,.4);position:relative;z-index:10000;
  }
  .ip-header {
    padding:.9rem 1rem;border-bottom:1px solid var(--border);
    display:flex;align-items:center;gap:10px;flex-shrink:0;
  }
  .ip-search {
    flex:1;border:1px solid var(--border);border-radius:8px;
    padding:7px 12px;font-size:14px;font-family:inherit;
    background:var(--surface2);color:var(--text);outline:none;transition:border .15s;
  }
  .ip-search:focus{border-color:var(--acc);}
  .ip-close-btn {
    width:30px;height:30px;border-radius:7px;border:1px solid var(--border);
    background:var(--surface2);color:var(--text-muted);cursor:pointer;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
    transition:all .15s;
  }
  .ip-close-btn:hover{border-color:var(--acc);color:var(--acc);}
  .ip-cats {
    display:flex;gap:6px;padding:.6rem 1rem;flex-wrap:wrap;flex-shrink:0;
    border-bottom:1px solid var(--border);
  }
  .ip-cat-btn {
    padding:3px 10px;border-radius:20px;font-size:12px;font-weight:500;
    border:1px solid var(--border);background:var(--surface2);color:var(--text-muted);
    cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap;
  }
  .ip-cat-btn.active{background:var(--acc);color:#fff;border-color:var(--acc);}
  .ip-cat-btn:hover:not(.active){border-color:var(--acc);color:var(--acc);}
  .ip-body{overflow-y:auto;padding:.8rem 1rem;flex:1;}
  .ip-cat-title {
    font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
    color:var(--text-muted);margin:0 0 .4rem;padding-left:2px;
  }
  .ip-grid{display:grid;grid-template-columns:repeat(auto-fill,40px);gap:4px;margin-bottom:.8rem;}
  .ip-icon {
    width:40px;height:40px;border-radius:8px;border:1px solid transparent;
    background:var(--surface2);display:flex;align-items:center;justify-content:center;
    cursor:pointer;transition:all .12s;font-size:20px;color:var(--text2);
  }
  .ip-icon:hover{background:var(--acc-soft);border-color:var(--acc);color:var(--acc);}
  .ip-icon.selected{background:var(--acc)!important;color:#fff!important;border-color:var(--acc)!important;}
  .ip-empty{text-align:center;padding:2rem;color:var(--text-muted);font-size:13px;}
  .ip-footer {
    padding:.7rem 1rem;border-top:1px solid var(--border);flex-shrink:0;
    display:flex;align-items:center;gap:10px;
  }
  .ip-footer-icon{font-size:22px;color:var(--text);}
  .ip-footer-name{font-family:monospace;font-size:12px;color:var(--text-muted);flex:1;}
  .ip-footer-count{font-size:11px;color:var(--text-muted);}
  .ip-confirm-btn {
    padding:7px 18px;border-radius:8px;background:var(--acc);color:#fff;
    border:none;font-size:13px;font-weight:600;font-family:inherit;
    cursor:pointer;transition:opacity .15s;flex-shrink:0;
  }
  .ip-confirm-btn:hover{opacity:.88;}
  .ip-confirm-btn:disabled{opacity:.35;cursor:default;}
  `;
  document.head.appendChild(s);
})();

// ── STATE ────────────────────────────────────────
let _ipCallback = null;
let _ipSelected = null;
let _ipCat = 'Todos';

// ── ABRIR ────────────────────────────────────────
function openIconPicker(callback, currentIcon) {
  _ipCallback = callback || null;
  _ipSelected = currentIcon || null;
  _ipCat = 'Todos';

  // Remove anterior
  document.getElementById('ip-overlay')?.remove();

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'ip-overlay';
  overlay.id = 'ip-overlay';

  // Modal
  const modal = document.createElement('div');
  modal.className = 'ip-modal';
  modal.addEventListener('click', e => e.stopPropagation());

  // Header
  const header = document.createElement('div');
  header.className = 'ip-header';
  header.innerHTML = `
    <i class="ti ti-icons" style="font-size:18px;color:var(--acc);flex-shrink:0"></i>
    <input class="ip-search" id="ip-search" placeholder="Buscar ícone... ex: moon, heart, brain" autocomplete="off">
    <button class="ip-close-btn" id="ip-close-btn" title="Fechar (Esc)">
      <i class="ti ti-x" style="font-size:14px"></i>
    </button>`;

  // Categorias
  const cats = document.createElement('div');
  cats.className = 'ip-cats';
  const allCats = ['Todos', ...Object.keys(ICON_CATEGORIES)];
  allCats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'ip-cat-btn' + (cat === 'Todos' ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      _ipCat = cat;
      cats.querySelectorAll('.ip-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid('');
      header.querySelector('.ip-search').value = '';
      header.querySelector('.ip-search').focus();
    });
    cats.appendChild(btn);
  });

  // Body
  const body = document.createElement('div');
  body.className = 'ip-body';
  body.id = 'ip-body';

  // Footer
  const footer = document.createElement('div');
  footer.className = 'ip-footer';
  footer.innerHTML = `
    <i class="ip-footer-icon ti ${_ipSelected || 'ti-click'}" id="ip-footer-icon"></i>
    <span class="ip-footer-name" id="ip-footer-name">${_ipSelected || 'Nenhum selecionado'}</span>
    <span class="ip-footer-count" id="ip-footer-count"></span>
    <button class="ip-confirm-btn" id="ip-confirm-btn" ${!_ipSelected ? 'disabled' : ''}>Confirmar</button>`;

  // Monta
  modal.appendChild(header);
  modal.appendChild(cats);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Render inicial
  renderGrid('');

  // ── EVENT LISTENERS (sem inline onclick) ──
  overlay.addEventListener('click', () => closeIconPicker());

  header.querySelector('#ip-close-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeIconPicker();
  });

  header.querySelector('#ip-search').addEventListener('input', (e) => {
    _ipCat = 'Todos';
    cats.querySelectorAll('.ip-cat-btn').forEach(b =>
      b.classList.toggle('active', b.textContent === 'Todos'));
    renderGrid(e.target.value.toLowerCase().trim());
  });

  footer.querySelector('#ip-confirm-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    confirmIcon();
  });

  // Focus
  setTimeout(() => header.querySelector('.ip-search')?.focus(), 50);

  // ESC
  document.addEventListener('keydown', ipKeyDown);
}

// ── RENDER GRID ──────────────────────────────────
function renderGrid(q) {
  const body = document.getElementById('ip-body');
  if (!body) return;

  let icons;
  if (q) {
    const all = [...new Set(Object.values(ICON_CATEGORIES).flat())];
    icons = all.filter(ic => ic.replace('ti-', '').includes(q));
  } else if (_ipCat === 'Todos') {
    icons = [...new Set(Object.values(ICON_CATEGORIES).flat())];
  } else {
    icons = ICON_CATEGORIES[_ipCat] || [];
  }

  // Atualiza contador
  const count = document.getElementById('ip-footer-count');
  if (count) count.textContent = `${icons.length} ícones`;

  if (icons.length === 0) {
    body.innerHTML = `<div class="ip-empty">
      <i class="ti ti-search-off" style="font-size:28px;display:block;margin-bottom:8px;opacity:.4"></i>
      Nenhum ícone encontrado${q ? ` para "${q}"` : ''}
    </div>`;
    return;
  }

  // Monta grid com event delegation
  let html = '';
  if (!q && _ipCat === 'Todos') {
    Object.entries(ICON_CATEGORIES).forEach(([cat, catIcons]) => {
      html += `<div class="ip-cat-title">${cat}</div><div class="ip-grid">`;
      catIcons.forEach(ic => { html += iconBtnHtml(ic); });
      html += '</div>';
    });
  } else {
    html += `<div class="ip-grid">`;
    icons.forEach(ic => { html += iconBtnHtml(ic); });
    html += '</div>';
  }
  body.innerHTML = html;

  // Event delegation no body — sem inline onclick
  body.addEventListener('click', (e) => {
    const btn = e.target.closest('.ip-icon');
    if (!btn) return;
    selectIcon(btn.dataset.icon, btn);
  });
}

function iconBtnHtml(ic) {
  const sel = _ipSelected === ic ? ' selected' : '';
  return `<div class="ip-icon${sel}" data-icon="${ic}" title="${ic.replace('ti-','')}">
    <i class="ti ${ic}"></i>
  </div>`;
}

// ── SELECT ───────────────────────────────────────
function selectIcon(ic, el) {
  _ipSelected = ic;

  // Atualiza visual
  document.querySelectorAll('#ip-body .ip-icon').forEach(b => b.classList.remove('selected'));
  if (el) el.classList.add('selected');

  // Atualiza footer
  const icon = document.getElementById('ip-footer-icon');
  const name = document.getElementById('ip-footer-name');
  const btn  = document.getElementById('ip-confirm-btn');
  if (icon) { icon.className = `ip-footer-icon ti ${ic}`; }
  if (name) name.textContent = ic;
  if (btn)  btn.disabled = false;
}

// ── CONFIRMAR ────────────────────────────────────
function confirmIcon() {
  if (_ipSelected && _ipCallback) {
    _ipCallback(_ipSelected);
  }
  closeIconPicker();
}

// ── FECHAR ───────────────────────────────────────
function closeIconPicker() {
  document.getElementById('ip-overlay')?.remove();
  document.removeEventListener('keydown', ipKeyDown);
  _ipCallback = null;
  _ipSelected = null;
}

function ipKeyDown(e) {
  if (e.key === 'Escape') closeIconPicker();
}

// Expõe globalmente por segurança
window.openIconPicker  = openIconPicker;
window.closeIconPicker = closeIconPicker;
window.confirmIcon     = confirmIcon;
