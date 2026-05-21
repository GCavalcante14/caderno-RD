/* ═══════════════════════════════════════════════
   LifeOS · lifeos-core.js
   Constantes e utilitários compartilhados entre páginas.
   Importar APÓS nav.js em todas as páginas.
   ═══════════════════════════════════════════════ */

// ── DESIGN SYSTEM — Humor ──────────────────────
const MOOD_ICONS = [
  { icon:'ti-mood-sad',   bg:'rgba(220,50,50,0.15)',  color:'#E05555' },
  { icon:'ti-mood-sad-2', bg:'rgba(220,120,50,0.15)', color:'#E08040' },
  { icon:'ti-mood-empty', bg:'rgba(180,150,50,0.15)', color:'#C8A030' },
  { icon:'ti-mood-smile', bg:'rgba(50,160,130,0.15)', color:'#32A082' },
  { icon:'ti-mood-happy', bg:'rgba(29,158,117,0.15)', color:'#1D9E75' },
];

// ── DESIGN SYSTEM — Tipo de Dia ────────────────
const TIPO_DIA = {
  'Normal':      { bg:'var(--acc-soft)',        color:'var(--acc-text)' },
  'Plantão 24h': { bg:'rgba(138,37,64,0.18)',   color:'#CC8899'         },
  'Plantão 12h': { bg:'rgba(138,37,64,0.12)',   color:'#CC8899'         },
  'Sobreaviso':  { bg:'rgba(180,140,40,0.15)',  color:'#C8A030'         },
  'Pós-plantão': { bg:'rgba(180,140,40,0.15)',  color:'#C8A030'         },
  'Folga':       { bg:'rgba(29,158,117,0.15)',  color:'#1D9E75'         },
};

// ── DESIGN SYSTEM — Dias da semana ────────────
const DNAMES = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

// ── SONO — meta e cálculos ─────────────────────
const SLEEP_GOAL = 7; // horas

/**
 * Calcula total de sono entre dois horários (HH:MM).
 * Lida com virada de meia-noite.
 * @returns {{ total: number, label: string } | null}
 */
function calcSono(dormiu, acordou) {
  if (!dormiu || !acordou) return null;
  const [dh, dm] = dormiu.split(':').map(Number);
  const [ah, am] = acordou.split(':').map(Number);
  let mins = (ah * 60 + am) - (dh * 60 + dm);
  if (mins <= 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return {
    total: parseFloat((mins / 60).toFixed(1)),
    label: m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`,
  };
}

/**
 * Formata número de horas como "7h30" ou "8h".
 * @param {number|null} horas
 */
function formatSono(horas) {
  if (horas == null) return '—';
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

/**
 * Cor semântica da barra de sono.
 * Verde ≥ meta, âmbar ≥ 5h, vermelho abaixo.
 */
function sonoColor(horas) {
  if (horas == null) return 'var(--border)';
  return horas >= SLEEP_GOAL ? '#1D9E75'
       : horas >= 5          ? '#C8A030'
       :                       '#E05555';
}

// ── STATUS UI ─────────────────────────────────
/**
 * Atualiza o indicador de save na página.
 * Requer elemento #save-status no DOM.
 * @param {'idle'|'saving'|'saved'|'error'} s
 */
function setStatus(s) {
  const el = document.getElementById('save-status');
  if (!el) return;
  const m = {
    idle:   ['<i class="ti ti-circle-dot"></i> Pronto',  'idle'  ],
    saving: ['<i class="ti ti-loader"></i> Salvando…',   'saving'],
    saved:  ['<i class="ti ti-circle-check"></i> Salvo', 'saved' ],
    error:  ['<i class="ti ti-wifi-off"></i> Erro',      'error' ],
  };
  const [h, c] = m[s] || m.idle;
  el.innerHTML = h;
  el.className = 'save-status ' + c;
  if (s === 'saved') setTimeout(() => setStatus('idle'), 2000);
}
