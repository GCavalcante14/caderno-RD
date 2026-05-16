/* ═══════════════════════════════════════════════
   LifeOS · nav.js
   Sidebar compartilhada entre todas as páginas
   ═══════════════════════════════════════════════ */

const SUPABASE_URL = 'https://hkrbvgahmvhvcerthler.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f8BD685R8Tx7clXMKvGvtA_lYu4njJy';

// Detecta a página atual
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

const NAV_ITEMS = [
  {
    section: 'Estudo',
    items: [
      { href: 'index.html', icon: 'ti-brain', label: 'Caderno RD', id: 'index.html' },
    ]
  },
  {
    section: 'Vida Diária',
    items: [
      { href: 'diario.html', icon: 'ti-calendar-event', label: 'Diário', id: 'diario.html' },
      { href: 'habitos.html', icon: 'ti-checkbox', label: 'Hábitos', id: 'habitos.html' },
    ]
  },
  {
    section: 'Revisões',
    items: [
      { href: 'semanal.html', icon: 'ti-calendar-week', label: 'Semanal', id: 'semanal.html', badge: 'novo' },
    ]
  },
  {
    section: 'Sistema',
    items: [
      { href: '#', icon: 'ti-map', label: 'Áreas', locked: true },
      { href: '#', icon: 'ti-target', label: 'OKRs', locked: true },
      { href: '#', icon: 'ti-rocket', label: 'Projetos', locked: true },
    ]
  },
  {
    section: 'Identidade',
    items: [
      { href: '#', icon: 'ti-diamond', label: 'Valores', locked: true },
      { href: '#', icon: 'ti-user-heart', label: 'Eu', locked: true },
      { href: '#', icon: 'ti-notebook', label: 'Diário Livre', locked: true },
    ]
  },
];

function renderNav() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  let html = `
    <div class="sb-logo">
      <div class="sb-logo-icon"><i class="ti ti-brain" aria-hidden="true"></i></div>
      <div>
        <div class="sb-logo-text">LifeOS</div>
        <div class="sb-logo-sub">Médico Arquiteto</div>
      </div>
    </div>`;

  NAV_ITEMS.forEach(group => {
    html += `<div class="sb-section">${group.section}</div>`;
    group.items.forEach(item => {
      const isActive = item.id === currentPage;
      const isLocked = item.locked;
      const badge = item.badge ? `<span class="sb-badge">${item.badge}</span>` : '';
      html += `
        <a href="${isLocked ? '#' : item.href}"
          class="sb-item${isActive ? ' active' : ''}${isLocked ? ' locked' : ''}"
          ${isLocked ? 'onclick="return false"' : ''}>
          <i class="ti ${item.icon}" aria-hidden="true"></i>
          ${item.label}
          ${badge}
        </a>`;
    });
  });

  html += `
    <div class="sb-divider"></div>
    <div class="sb-bottom">
      <button class="sb-theme-btn" onclick="toggleTheme()">
        <i class="ti ti-moon-stars" id="sb-theme-icon" aria-hidden="true"></i>
        <span id="sb-theme-label">Modo escuro</span>
      </button>
    </div>`;

  sidebar.innerHTML = html;

  // Apply saved theme
  const theme = localStorage.getItem('rd-theme') || 'light';
  applyTheme(theme, false);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next, true);
  // Sync to Supabase if db available
  if (window.db) window.db.from('caderno_respostas')
    .upsert({ campo: 'pref-theme', valor: next }, { onConflict: 'campo' });
}

function applyTheme(theme, save) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('sb-theme-icon') || document.getElementById('theme-icon');
  const label = document.getElementById('sb-theme-label');
  if (icon) icon.className = `ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon-stars'}`;
  if (label) label.textContent = theme === 'dark' ? 'Modo claro' : 'Modo escuro';
  if (save) localStorage.setItem('rd-theme', theme);
}

// Init Supabase compartilhado
function initSupabase() {
  if (window.supabase && !window.db) {
    window.db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return window.db;
}

// Utilitários de data
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(isoDate) {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function addDays(isoDate, n) {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function weekStart(isoDate) {
  const d = new Date(isoDate + 'T12:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function weekDays(monday) {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

function shortDay(isoDate) {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
}

function isToday(isoDate) {
  return isoDate === todayISO();
}

// Auto-render sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  initSupabase();
});
