/* ═══════════════════════════════════════════════
   LifeOS · icon-picker.js
   Modal reutilizável de seleção de ícones Tabler
   Uso: openIconPicker(currentIcon, callback)
   ═══════════════════════════════════════════════ */

const ICON_CATEGORIES = {
  'Saúde': [
    'ti-heart','ti-heart-rate','ti-moon','ti-moon-stars','ti-sun',
    'ti-run','ti-walk','ti-apple','ti-salad','ti-droplet','ti-bottle',
    'ti-bed','ti-zzz','ti-brain','ti-eye','ti-stethoscope',
    'ti-vaccine','ti-pill','ti-activity','ti-flame','ti-snowflake',
  ],
  'Medicina': [
    'ti-stethoscope','ti-microscope','ti-flask','ti-dna',
    'ti-first-aid-kit','ti-clipboard-pulse','ti-report-medical',
    'ti-building-hospital','ti-badge','ti-certificate',
    'ti-chart-line','ti-trending-up','ti-presentation',
  ],
  'Hábitos': [
    'ti-checkbox','ti-check','ti-refresh','ti-repeat','ti-loop',
    'ti-clock','ti-alarm','ti-calendar','ti-calendar-event',
    'ti-list','ti-list-check','ti-circle-check','ti-star',
    'ti-bolt','ti-sparkles','ti-trophy','ti-medal','ti-award',
  ],
  'Estudo': [
    'ti-book','ti-book-2','ti-books','ti-notebook','ti-notes',
    'ti-pencil','ti-pen','ti-writing','ti-highlight',
    'ti-bulb','ti-brain','ti-atom','ti-math',
    'ti-code','ti-terminal','ti-language','ti-world',
    'ti-headphones','ti-music',
  ],
  'Finanças': [
    'ti-currency-dollar','ti-coin','ti-credit-card','ti-wallet',
    'ti-receipt','ti-chart-bar','ti-chart-pie','ti-trending-up',
    'ti-trending-down','ti-building-bank','ti-cash','ti-pig-money',
    'ti-calculator','ti-report','ti-file-invoice',
  ],
  'Relações': [
    'ti-heart','ti-hearts','ti-users','ti-user','ti-user-heart',
    'ti-friends','ti-home','ti-home-heart',
    'ti-message','ti-messages','ti-phone','ti-mail',
    'ti-hand-love','ti-confetti','ti-gift',
  ],
  'Natureza': [
    'ti-leaf','ti-tree','ti-plant','ti-seeding',
    'ti-mountain','ti-beach','ti-waves','ti-cloud',
    'ti-sun','ti-moon','ti-stars','ti-rainbow',
    'ti-map','ti-map-pin','ti-compass','ti-globe',
  ],
  'Sistema': [
    'ti-settings','ti-adjustments','ti-sliders','ti-search',
    'ti-filter','ti-plus','ti-x','ti-check','ti-link',
    'ti-lock','ti-eye','ti-eye-off','ti-trash','ti-edit',
    'ti-copy','ti-download','ti-upload','ti-refresh',
    'ti-grid','ti-layout','ti-layout-dashboard','ti-tag',
    'ti-tags','ti-bookmark','ti-flag','ti-bell',
    'ti-info-circle','ti-dots','ti-dots-vertical',
  ],
  'Tempo': [
    'ti-calendar','ti-calendar-event','ti-calendar-week',
    'ti-clock','ti-alarm','ti-hourglass','ti-timer',
    'ti-history','ti-rotate','ti-repeat',
    'ti-player-play','ti-player-pause','ti-player-stop',
  ],
};

let _ipCallback = null;
let _ipCurrent = 'ti-check';
let _ipCategory = 'Todos';
let _ipSearchTimer = null;

function openIconPicker(currentIcon, callback) {
  _ipCallback = callback;
  _ipCurrent  = currentIcon || 'ti-check';
  _ipCategory = 'Todos';

  const old = document.getElementById('ip-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'ip-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:500;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);padding:1rem;';
  overlay.addEventListener('click', e => { if (e.target === overlay) closeIconPicker(); });

  overlay.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:520px;max-height:82vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);">
      <div style="padding:.8rem .8rem .5rem;border-bottom:1px solid var(--border);flex-shrink:0">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:.5rem">
          <div id="ip-preview" style="width:36px;height:36px;border-radius:8px;background:var(--acc-soft);display:flex;align-items:center;justify-content:center;border:1px solid var(--border);flex-shrink:0">
            <i class="ti ${_ipCurrent}" style="font-size:18px;color:var(--acc-text)"></i>
          </div>
          <input id="ip-search" placeholder="Buscar ícone... ex: moon, heart, book" autocomplete="off"
            style="flex:1;padding:7px 12px;border:1px solid var(--border);border-radius:7px;background:var(--surface2);color:var(--text);font-size:13px;font-family:inherit;outline:none;">
          <button onclick="closeIconPicker()" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;">
            <i class="ti ti-x" style="font-size:14px"></i>
          </button>
        </div>
        <div id="ip-cats" style="display:flex;gap:4px;flex-wrap:wrap"></div>
      </div>
      <div id="ip-grid" style="flex:1;overflow-y:auto;padding:.5rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:3px;"></div>
      <div style="padding:.5rem .8rem;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
        <span id="ip-count" style="font-size:11px;color:var(--text-muted)">— ícones</span>
        <div style="display:flex;gap:8px;align-items:center">
          <code id="ip-name" style="font-size:11px;color:var(--text-muted)"></code>
          <button id="ip-confirm" onclick="ipConfirm()" disabled style="padding:5px 14px;border-radius:7px;border:none;background:var(--acc);color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;opacity:.4">Confirmar</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // Renderiza categorias
  function renderCats() {
    const cats = ['Todos', ...Object.keys(ICON_CATEGORIES)];
    document.getElementById('ip-cats').innerHTML = cats.map(c => `
      <button onclick="ipCat('${c}')" style="padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;border:1px solid ${_ipCategory===c?'var(--acc)':'var(--border)'};background:${_ipCategory===c?'var(--acc-soft)':'var(--surface2)'};color:${_ipCategory===c?'var(--acc-text)':'var(--text-muted)'};">${c}</button>
    `).join('');
  }

  function renderGrid(q = '') {
    const query = q.toLowerCase().replace('ti-', '');
    let icons = _ipCategory === 'Todos'
      ? [...new Set(Object.values(ICON_CATEGORIES).flat())]
      : (ICON_CATEGORIES[_ipCategory] || []);
    if (query) icons = icons.filter(i => i.replace('ti-','').includes(query));
    icons.sort();

    document.getElementById('ip-count').textContent = `${icons.length} ícones`;
    document.getElementById('ip-grid').innerHTML = icons.map(ic => {
      const sel = ic === _ipCurrent;
      return `<button onclick="ipSelect('${ic}')" title="${ic.replace('ti-','')}"
        style="width:40px;height:40px;border-radius:7px;border:1px solid ${sel?'var(--acc)':'transparent'};background:${sel?'var(--acc-soft)':'transparent'};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .1s;"
        onmouseover="this.style.background='var(--surface2)'"
        onmouseout="this.style.background='${sel?'var(--acc-soft)':'transparent'}'">
        <i class="ti ${ic}" style="font-size:18px;color:${sel?'var(--acc)':'var(--text-muted)'}"></i>
      </button>`;
    }).join('');
  }

  window.ipCat = c => { _ipCategory = c; renderCats(); renderGrid(document.getElementById('ip-search').value); };
  window.ipSelect = ic => {
    _ipCurrent = ic;
    document.getElementById('ip-preview').innerHTML = `<i class="ti ${ic}" style="font-size:18px;color:var(--acc-text)"></i>`;
    document.getElementById('ip-name').textContent = ic;
    const btn = document.getElementById('ip-confirm');
    btn.disabled = false; btn.style.opacity = '1';
    renderGrid(document.getElementById('ip-search').value);
  };
  window.ipConfirm = () => { if (_ipCallback) _ipCallback(_ipCurrent); closeIconPicker(); };

  document.getElementById('ip-search').addEventListener('input', e => {
    clearTimeout(_ipSearchTimer);
    _ipSearchTimer = setTimeout(() => renderGrid(e.target.value), 150);
  });

  document.addEventListener('keydown', _ipKey);
  renderCats(); renderGrid();
  document.getElementById('ip-search').focus();
}

function _ipKey(e) {
  if (e.key === 'Escape') closeIconPicker();
  if (e.key === 'Enter') { const b = document.getElementById('ip-confirm'); if (b && !b.disabled) ipConfirm(); }
}

function closeIconPicker() {
  const o = document.getElementById('ip-overlay');
  if (o) o.remove();
  document.removeEventListener('keydown', _ipKey);
}

// Helper: cria botão que abre o picker
function createIconPickerBtn(currentIcon, onChange) {
  let icon = currentIcon || 'ti-check';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.title = 'Escolher ícone';
  btn.style.cssText = 'width:36px;height:36px;border-radius:7px;border:1px solid var(--border);background:var(--surface2);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:border-color .15s;';
  btn.innerHTML = `<i class="ti ${icon}" style="font-size:18px;color:var(--text-muted)"></i>`;
  btn.addEventListener('click', () => openIconPicker(icon, newIcon => {
    icon = newIcon;
    btn.innerHTML = `<i class="ti ${newIcon}" style="font-size:18px;color:var(--acc)"></i>`;
    onChange(newIcon);
  }));
  return btn;
}
