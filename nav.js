/* ═══════════════════════════════════════════════
   LifeOS · nav.js v3
   Sidebar + ⌘K Busca Global + Tema
   ═══════════════════════════════════════════════ */

const SUPABASE_URL = 'https://hkrbvgahmvhvcerthler.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f8BD685R8Tx7clXMKvGvtA_lYu4njJy';

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// ── NAVEGAÇÃO ────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Visão Geral',
    items: [
      { href:'dashboard.html', icon:'ti-layout-dashboard', label:'Dashboard', id:'dashboard.html' },
    ]
  },
  {
    label: 'Estudo',
    items: [
      { href:'index.html', icon:'ti-brain', label:'Caderno RD', id:'index.html' },
    ]
  },
  {
    label: 'Vida Diária',
    items: [
      { href:'diario.html',     icon:'ti-calendar-event', label:'Diário',     id:'diario.html'     },
      { href:'habitos.html',    icon:'ti-checkbox',        label:'Hábitos',    id:'habitos.html'    },
      { href:'calendario.html', icon:'ti-calendar',        label:'Calendário', id:'calendario.html', badge:'novo' },
    ]
  },
  {
    label: 'Revisões',
    items: [
      { href:'semanal.html', icon:'ti-calendar-week', label:'Semanal', id:'semanal.html' },
    ]
  },
  {
    label: 'Sistema',
    items: [
      { href:'#', icon:'ti-map',      label:'Áreas',     locked:true },
      { href:'#', icon:'ti-target',   label:'OKRs',      locked:true },
      { href:'#', icon:'ti-rocket',   label:'Projetos',  locked:true },
      { href:'#', icon:'ti-checkbox', label:'Tarefas',   locked:true },
    ]
  },
  {
    label: 'Identidade',
    items: [
      { href:'#', icon:'ti-diamond',    label:'Valores',    locked:true },
      { href:'#', icon:'ti-user-heart', label:'Eu',         locked:true },
      { href:'#', icon:'ti-notebook',   label:'Diário Livre', locked:true },
    ]
  },
];

// Itens para o ⌘K (todos os módulos + ações rápidas)
const SEARCH_ITEMS = [
  { label:'Dashboard',      href:'dashboard.html',   icon:'ti-layout-dashboard', cat:'Módulos'      },
  { label:'Caderno RD',     href:'index.html',        icon:'ti-brain',            cat:'Módulos'      },
  { label:'Diário',         href:'diario.html',       icon:'ti-calendar-event',   cat:'Módulos'      },
  { label:'Hábitos',        href:'habitos.html',      icon:'ti-checkbox',         cat:'Módulos'      },
  { label:'Calendário',     href:'calendario.html',   icon:'ti-calendar',         cat:'Módulos'      },
  { label:'Semanal',        href:'semanal.html',      icon:'ti-calendar-week',    cat:'Módulos'      },
  { label:'Configurações',  href:'settings.html',     icon:'ti-settings',         cat:'Sistema'      },
  { label:'Semana 1 · Sono',    href:'index.html?s=1', icon:'ti-moon',   cat:'Caderno RD'   },
  { label:'Semana 2 · Hábitos', href:'index.html?s=2', icon:'ti-refresh',cat:'Caderno RD'   },
  { label:'Diário — Hoje',      href:'diario.html',    icon:'ti-sun',    cat:'Ação Rápida'  },
  { label:'Revisão Semanal',    href:'semanal.html',   icon:'ti-calendar-week', cat:'Ação Rápida' },
  { label:'Mudar tema',         href:'#',              icon:'ti-moon-stars',     cat:'Sistema',    action:'toggleTheme' },
];

// ── RENDER SIDEBAR ────────────────────────────────
function renderNav() {
  const sb = document.getElementById('sidebar');
  if (!sb) return;

  let html = `
    <div class="sb-logo">
      <div class="sb-logo-icon"><i class="ti ti-brain"></i></div>
      <div>
        <div class="sb-logo-text">LifeOS</div>
        <div class="sb-logo-sub" id="sb-papel">Médico Arquiteto</div>
      </div>
    </div>
    <div class="sb-search-btn" onclick="openSearch()" title="Busca global · ⌘K">
      <i class="ti ti-search"></i>
      <span>Buscar...</span>
      <kbd>⌘K</kbd>
    </div>`;

  NAV_GROUPS.forEach(g => {
    html += `<div class="sb-section">${g.label}</div>`;
    g.items.forEach(item => {
      const active  = item.id === currentPage;
      const locked  = item.locked;
      const badge   = item.badge ? `<span class="sb-badge">${item.badge}</span>` : '';
      html += `
        <a href="${locked ? '#' : item.href}"
          class="sb-item${active ? ' active' : ''}${locked ? ' locked' : ''}"
          ${locked ? 'onclick="return false" title="Em breve"' : 'onclick="closeSidebar()"'}>
          <i class="ti ${item.icon}"></i>
          ${item.label}
          ${locked ? '<i class="ti ti-lock" style="font-size:11px;margin-left:auto;opacity:.4"></i>' : badge}
        </a>`;
    });
  });

  html += `
    <div class="sb-divider"></div>
    <div class="sb-bottom">
      <a href="settings.html" class="sb-item${currentPage==='settings.html'?' active':''}" onclick="closeSidebar()">
        <i class="ti ti-settings"></i> Configurações
      </a>
      <button class="sb-theme-btn" onclick="toggleTheme()">
        <i class="ti ti-moon-stars" id="sb-theme-icon"></i>
        <span id="sb-theme-label">Modo escuro</span>
      </button>
    </div>`;

  sb.innerHTML = html;

  // Aplica papel guardado
  const prefs = JSON.parse(localStorage.getItem('lifeos-prefs') || '{}');
  if (prefs.papel) {
    const el = document.getElementById('sb-papel');
    if (el) el.textContent = prefs.papel;
  }

  applyTheme(localStorage.getItem('rd-theme') || 'light', false);
}

// ── MOBILE ────────────────────────────────────────
function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sb-overlay')?.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sb-overlay')?.classList.remove('show');
  document.body.style.overflow = '';
}

// ── TEMA ──────────────────────────────────────────
function toggleTheme() {
  const cur  = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'light' ? 'dark' : 'light';
  applyTheme(next, true);
  if (window.db) window.db.from('caderno_respostas')
    .upsert({ campo:'pref-theme', valor:next }, { onConflict:'campo' });
}

function applyTheme(theme, save) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon  = document.getElementById('sb-theme-icon');
  const label = document.getElementById('sb-theme-label');
  const themeIcon = theme === 'dark' ? 'ti-sun' : 'ti-moon-stars';
  if (icon)  icon.className  = `ti ${themeIcon}`;
  if (label) label.textContent = theme === 'dark' ? 'Modo claro' : 'Modo escuro';
  if (save)  localStorage.setItem('rd-theme', theme);
}

// ── ⌘K BUSCA GLOBAL ─────────────────────────────
let _searchIdx = -1;
let _searchResults = [];

function openSearch() {
  const old = document.getElementById('gk-overlay');
  if (old) { old.remove(); return; }

  const overlay = document.createElement('div');
  overlay.id = 'gk-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:400;display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;backdrop-filter:blur(3px);';
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });

  overlay.innerHTML = `
    <div id="gk-modal" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:520px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);">
      <div style="display:flex;align-items:center;gap:10px;padding:.8rem 1rem;border-bottom:1px solid var(--border);">
        <i class="ti ti-search" style="font-size:18px;color:var(--text-muted)"></i>
        <input id="gk-input" placeholder="Buscar módulos, seções, ações..." autocomplete="off"
          style="flex:1;border:none;background:none;color:var(--text);font-size:15px;font-family:inherit;outline:none;">
        <kbd style="font-size:11px;color:var(--text-muted);background:var(--surface2);padding:2px 6px;border-radius:5px;border:1px solid var(--border);">ESC</kbd>
      </div>
      <div id="gk-results" style="max-height:360px;overflow-y:auto;padding:.4rem 0;"></div>
      <div style="padding:.5rem 1rem;border-top:1px solid var(--border);display:flex;gap:1rem;font-size:11px;color:var(--text-muted);">
        <span><kbd style="background:var(--surface2);padding:1px 5px;border-radius:4px;border:1px solid var(--border)">↑↓</kbd> navegar</span>
        <span><kbd style="background:var(--surface2);padding:1px 5px;border-radius:4px;border:1px solid var(--border)">↵</kbd> abrir</span>
        <span><kbd style="background:var(--surface2);padding:1px 5px;border-radius:4px;border:1px solid var(--border)">ESC</kbd> fechar</span>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const input = document.getElementById('gk-input');
  input.addEventListener('input', () => renderResults(input.value));
  input.addEventListener('keydown', handleSearchKey);
  document.addEventListener('keydown', _gkEsc);

  renderResults('');
  input.focus();
}

function renderResults(q) {
  const query = q.toLowerCase().trim();
  _searchResults = query
    ? SEARCH_ITEMS.filter(i =>
        i.label.toLowerCase().includes(query) ||
        i.cat.toLowerCase().includes(query))
    : SEARCH_ITEMS;

  _searchIdx = -1;

  // Agrupa por categoria
  const grouped = {};
  _searchResults.forEach(item => {
    if (!grouped[item.cat]) grouped[item.cat] = [];
    grouped[item.cat].push(item);
  });

  const container = document.getElementById('gk-results');
  if (!container) return;

  let flatIdx = 0;
  let html = '';

  if (_searchResults.length === 0) {
    html = '<div style="padding:1.5rem;text-align:center;color:var(--text-muted);font-size:13px">Nenhum resultado</div>';
  } else {
    Object.entries(grouped).forEach(([cat, items]) => {
      html += `<div style="padding:4px 1rem 2px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted)">${cat}</div>`;
      items.forEach(item => {
        html += `<div class="gk-item" data-idx="${flatIdx}" data-href="${item.href}" data-action="${item.action||''}"
          onclick="gkSelect(${flatIdx})"
          style="display:flex;align-items:center;gap:10px;padding:8px 1rem;cursor:pointer;transition:background .1s;">
          <div style="width:32px;height:32px;border-radius:7px;background:var(--surface2);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="ti ${item.icon}" style="font-size:16px;color:var(--acc)"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500;color:var(--text)">${highlightMatch(item.label, q)}</div>
          </div>
          <i class="ti ti-corner-down-left" style="font-size:13px;color:var(--text-muted);opacity:.5"></i>
        </div>`;
        flatIdx++;
      });
    });
  }

  container.innerHTML = html;
}

function highlightMatch(text, q) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return text.slice(0, idx) +
    `<mark style="background:var(--acc-soft);color:var(--acc-text);border-radius:2px">${text.slice(idx, idx+q.length)}</mark>` +
    text.slice(idx + q.length);
}

function handleSearchKey(e) {
  const items = document.querySelectorAll('.gk-item');
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    _searchIdx = Math.min(_searchIdx + 1, items.length - 1);
    updateSearchHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    _searchIdx = Math.max(_searchIdx - 1, 0);
    updateSearchHighlight(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (_searchIdx >= 0 && items[_searchIdx]) {
      const idx = parseInt(items[_searchIdx].dataset.idx);
      gkSelect(idx);
    } else if (items.length > 0) {
      gkSelect(0);
    }
  }
}

function updateSearchHighlight(items) {
  items.forEach((el, i) => {
    el.style.background = i === _searchIdx ? 'var(--acc-soft)' : '';
  });
  if (_searchIdx >= 0 && items[_searchIdx]) {
    items[_searchIdx].scrollIntoView({ block:'nearest' });
  }
}

function gkSelect(idx) {
  const item = _searchResults[idx];
  if (!item) return;
  if (item.action === 'toggleTheme') {
    toggleTheme();
    closeSearch();
    return;
  }
  closeSearch();
  if (item.href && item.href !== '#') {
    window.location.href = item.href;
  }
}

function _gkEsc(e) { if (e.key === 'Escape') closeSearch(); }

function closeSearch() {
  document.getElementById('gk-overlay')?.remove();
  document.removeEventListener('keydown', _gkEsc);
}

// ── SUPABASE ──────────────────────────────────────
function initSupabase() {
  if (window.supabase && !window.db) {
    window.db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return window.db;
}

// ── UTILS DE DATA ─────────────────────────────────
function todayISO() { return new Date().toISOString().split('T')[0]; }

function formatDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' });
}

function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function weekStart(iso) {
  const d = new Date(iso + 'T12:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function weekDays(monday) { return Array.from({length:7},(_,i) => addDays(monday, i)); }

function shortDay(iso) {
  return new Date(iso+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','');
}

function isToday(iso) { return iso === todayISO(); }

// ── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  initSupabase();
});

// ⌘K atalho global
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
});
