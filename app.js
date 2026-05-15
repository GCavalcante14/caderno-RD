/* ═══════════════════════════════════════════════
   Caderno RD · app.js
   ═══════════════════════════════════════════════ */

const SUPABASE_URL = 'https://hkrbvgahmvhvcerthler.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f8BD685R8Tx7clXMKvGvtA_lYu4njJy';

const SEMANAS_DISPONIVEIS = [
  { numero: 1, titulo: 'Sono', emoji: '🌙', arquivo: 'semana-01.js' },
  { numero: 2, titulo: 'Hábitos', emoji: '🔁', arquivo: 'semana-02.js' },
];

let db, semanaAtual = 1, diaAtual = 1, semanaData = null, saveTimers = {};

/* ── INIT ─────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  renderWeekNav();
  db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  carregarSemana(1);
});

/* ── WEEK NAV ─────────────────────────────────── */
function renderWeekNav() {
  const inner = document.getElementById('week-nav-inner');
  inner.innerHTML = SEMANAS_DISPONIVEIS.map(s =>
    `<button class="week-btn${s.numero === 1 ? ' active' : ''}"
      onclick="carregarSemana(${s.numero})" id="wbtn-${s.numero}">
      ${s.emoji} S${s.numero} · ${s.titulo}
    </button>`
  ).join('');
}

/* ── LOAD SEMANA ──────────────────────────────── */
function carregarSemana(numero) {
  semanaAtual = numero;
  diaAtual = 1;
  setStatus('loading');
  showOverlay();

  document.querySelectorAll('.week-btn').forEach(b => b.classList.remove('active'));
  const wb = document.getElementById('wbtn-' + numero);
  if (wb) wb.classList.add('active');

  const semanaInfo = SEMANAS_DISPONIVEIS.find(s => s.numero === numero);
  if (!semanaInfo) return;

  const existing = document.getElementById('semana-script');
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.id = 'semana-script';
  script.src = semanaInfo.arquivo;
  script.onload = async () => {
    semanaData = window.SEMANA_DATA;
    renderApp();
    await loadAll();
    hideOverlay();
  };
  script.onerror = () => {
    hideOverlay();
    setStatus('error');
  };
  document.body.appendChild(script);
}

/* ── RENDER APP ───────────────────────────────── */
function renderApp() {
  const sd = semanaData;
  document.getElementById('week-badge').textContent = `${sd.emoji} Semana ${sd.numero}`;
  document.getElementById('week-title').textContent = sd.titulo;
  document.getElementById('week-sub').textContent = sd.sprint;

  renderDayNav();
  renderDay(1);
}

/* ── DAY NAV ──────────────────────────────────── */
function renderDayNav() {
  const inner = document.getElementById('day-nav-inner');
  const dias = [...semanaData.dias.map((_, i) =>
    `<button class="day-btn${i === 0 ? ' active' : ''}"
      onclick="renderDay(${i+1})" id="dbtn-${i+1}">Dia ${i+1}</button>`
  ), `<button class="day-btn" onclick="renderSemanal()" id="dbtn-8">📓 Semanal</button>`].join('');
  inner.innerHTML = dias;
}

/* ── RENDER DAY ───────────────────────────────── */
function renderDay(n) {
  diaAtual = n;
  const dia = semanaData.dias[n - 1];
  const s = semanaAtual, d = n;
  const total = semanaData.dias.length;

  document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
  const db2 = document.getElementById('dbtn-' + n);
  if (db2) { db2.classList.add('active'); db2.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }

  const pct = Math.round((n / (total + 1)) * 100);
  document.getElementById('prog').style.width = pct + '%';

  const tagClass = `tag-${semanaData.tagClass || 'sono'}`;

  let html = `
    <div class="breadcrumb">Caderno RD › Semana ${s} · ${semanaData.temaShort} › <strong>Dia ${n}</strong></div>
    <div class="tags">
      <span class="tag ${tagClass}">${semanaData.emoji} ${semanaData.temaShort}</span>
      <span class="tag tag-dia">Dia ${n} de ${total}</span>
    </div>
    <h1 class="dia-titulo">${dia.titulo}</h1>
    <p class="dia-sub">${dia.subtitulo}</p>
    <div class="divider"></div>
    ${htmlCheckin(s, d)}
    <div class="divider"></div>
    ${htmlResumo(dia)}
    <div class="divider"></div>
    ${htmlAncora(dia)}
    <div class="divider"></div>
    ${htmlArtigo(dia)}
    <div class="divider"></div>
    ${htmlReflexao(dia, s, d)}
    ${dia.tcc ? '<div class="divider"></div>' + htmlTCC(dia, s, d) : ''}
    <div class="divider"></div>
    ${htmlTensao(s, d)}
    <div class="divider"></div>
    ${htmlExperimento(semanaData.experimento, s, d)}
    <div class="divider"></div>
    ${htmlMateriais(dia)}
    <div class="done-toggle">
      <input type="checkbox" id="done-${d}" onchange="saveDone(${d}, this.checked)">
      <label for="done-${d}">Dia ${d} concluído</label>
    </div>
    <div class="nav-bottom">
      <button class="nav-btn" ${n === 1 ? 'disabled' : `onclick="renderDay(${n-1})"`}>← Anterior</button>
      <span class="nav-pos">${n} / ${total}</span>
      <button class="nav-btn primary" onclick="${n === total ? 'renderSemanal()' : `renderDay(${n+1})`}">
        ${n === total ? 'Reflexão semanal →' : `Dia ${n+1} →`}
      </button>
    </div>`;

  document.getElementById('content').innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setupDots(s, d);
  loadDayData(s, d);
}

/* ── RENDER SEMANAL ───────────────────────────── */
function renderSemanal() {
  const s = semanaAtual;
  document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
  const db2 = document.getElementById('dbtn-8');
  if (db2) db2.classList.add('active');
  document.getElementById('prog').style.width = '100%';

  const revisao = semanaData.dias.map((d, i) =>
    `<div class="rev-item"><span class="rev-dia">Dia ${i+1}</span>${d.conceito_revisao || d.ancora.titulo}</div>`
  ).join('');

  let secoesHtml = semanaData.reflexao_semanal.secoes.map((sec, i) => `
    <div>
      <div class="sem-section-title">${sec.titulo}</div>
      <p class="sem-section-prompt">${sec.prompt}</p>
      <textarea id="ta-s${s}-sem-${i+1}" style="min-height:80px;width:100%"
        placeholder="${sec.placeholder}" oninput="save(this, 's${s}-sem-${i+1}')"></textarea>
    </div>`).join('');

  let html = `
    <div class="breadcrumb">Caderno RD › Semana ${s} · ${semanaData.temaShort} › <strong>Reflexão Semanal</strong></div>
    <div class="tags">
      <span class="tag tag-int">📓 Reflexão Semanal</span>
      <span class="tag tag-dia">45–60 min</span>
    </div>
    <h1 class="dia-titulo">${semanaData.reflexao_semanal.titulo}</h1>
    <p class="dia-sub">${semanaData.reflexao_semanal.subtitulo}</p>
    <div class="divider"></div>
    <div class="slabel">🔁 Revisão dos conceitos da semana</div>
    <div class="ancora-card" style="border-left:3px solid #1D9E75;border-radius:0 12px 12px 0">
      <div class="rev-grid">${revisao}</div>
    </div>
    <div class="divider"></div>
    <div class="sem-card">
      <div class="sem-header">
        <h2>${semanaData.reflexao_semanal.titulo}</h2>
        <p>Dedique 45–60 min. Pode ser dividida em dois blocos.</p>
      </div>
      <div class="sem-body">${secoesHtml}</div>
    </div>
    <div class="nav-bottom">
      <button class="nav-btn" onclick="renderDay(${semanaData.dias.length})">← Dia ${semanaData.dias.length}</button>
      <span class="nav-pos">Semana ${s} completa</span>
      <button class="nav-btn primary" style="opacity:0.4;cursor:default" disabled>Semana ${s+1} →</button>
    </div>`;

  document.getElementById('content').innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadSemanalData(s);
}

/* ── HTML BUILDERS ────────────────────────────── */
function htmlCheckin(s, d) {
  const tipos = [
    { key: 'sleep', label: 'Sono ontem', hint: 'péssimo → ótimo' },
    { key: 'energy', label: 'Energia agora', hint: 'vazio → cheio' },
    { key: 'humor', label: 'Humor', hint: 'baixo → ótimo' },
  ];
  const cols = tipos.map(t => `
    <div>
      <span class="ci-label">${t.label}</span>
      <div class="dots" id="ci-${d}-${t.key}"></div>
      <div class="dot-hint">${t.hint}</div>
    </div>`).join('');
  return `
    <div class="slabel">⚡ Check-in · 2 min</div>
    <div class="ci-card">
      <div class="ci-header"><span class="ci-title">Como você chegou hoje</span><span class="ci-hint">não tem resposta certa</span></div>
      <div class="ci-grid">${cols}</div>
    </div>`;
}

function htmlResumo(dia) {
  return `
    <div class="slabel">📄 Resumo da aula</div>
    <div class="resumo-box">
      <div class="resumo-ref">${dia.aula} — você não precisa rever</div>
      ${dia.resumo}
    </div>`;
}

function htmlAncora(dia) {
  return `
    <div class="slabel">⚓ Conceito âncora</div>
    <div class="ancora-card">
      <span class="ancora-badge">${dia.ancora.badge}</span>
      <div class="ancora-titulo">${dia.ancora.titulo}</div>
      <div class="ancora-desc">${dia.ancora.desc}</div>
    </div>`;
}

function htmlArtigo(dia) {
  const a = dia.artigo;
  return `
    <div class="slabel">📑 Artigo de referência</div>
    <div class="art-card">
      <div class="art-nome">${a.nome}</div>
      <div class="art-fonte">${a.fonte}</div>
      <div class="art-focal">${a.focal}</div>
      <div class="frase">${a.frase}<span class="frase-fonte">${a.frase_fonte}</span></div>
    </div>`;
}

function htmlReflexao(dia, s, d) {
  const r = dia.reflexao;
  const modos = (r.modos || ['escrever', 'lista']).map((m, i) => {
    const labels = { escrever: '✍️ Escrever', lista: '📋 Lista', diagrama: '🗺 Diagrama' };
    return `<button class="mbtn${i === 0 ? ' active' : ''}" onclick="setModo('${d}-r','${m}',this)">${labels[m]}</button>`;
  }).join('');

  const areas = (r.modos || ['escrever', 'lista']).map((m, i) => {
    if (m === 'diagrama') {
      return `<div class="area${i === 0 ? ' active' : ''}" id="${d}-r-${m}">
        <div class="diag-ph">🗺 GoodNotes ou papel<div class="diag-hint">${r.diagrama_hint || ''}</div></div>
      </div>`;
    }
    return `<div class="area${i === 0 ? ' active' : ''}" id="${d}-r-${m}">
      <textarea id="ta-s${s}-d${d}-r-${m}" placeholder="${r['placeholder_' + m] || ''}" oninput="save(this, 's${s}-d${d}-r-${m}')"></textarea>
    </div>`;
  }).join('');

  return `
    <div class="slabel">✏️ Reflexão do dia · 10–15 min</div>
    <div class="refl-card">
      <div class="refl-header"><span class="refl-title">🧠 Reflexão</span><span class="refl-tempo">⏱ 10–15 min</span></div>
      <div class="refl-body">
        <div class="contexto">${r.contexto}</div>
        <div class="pergunta">${r.pergunta}</div>
        <div class="modo-label">Modo de hoje</div>
        <div class="modos">${modos}</div>
        ${areas}
        <div class="refl-hint">💡 ${r.hint || 'Não force uma resposta correta. A honestidade aqui é o exercício.'}</div>
      </div>
    </div>`;
}

function htmlTCC(dia, s, d) {
  const t = dia.tcc;
  const campos = t.campos.map((campo, i) => `
    <div class="tcc-field">
      <label>${campo}</label>
      <textarea id="ta-s${s}-d${d}-tcc-${i+1}" placeholder="${t.placeholders[i]}" oninput="save(this, 's${s}-d${d}-tcc-${i+1}')"></textarea>
    </div>`).join('');
  return `
    <div class="slabel">🧩 Conexão TCC</div>
    <div class="tcc-card">
      <div class="tcc-header"><span class="tcc-title">${t.titulo}</span><span class="tcc-badge">Judith Beck</span></div>
      <div class="tcc-grid">${campos}<div class="tcc-hint">ℹ️ ${t.hint}</div></div>
    </div>`;
}

function htmlTensao(s, d) {
  return `
    <div class="slabel">❓ Tensão ou dúvida</div>
    <div class="tensao-card">
      <div class="tensao-header"><span class="tensao-title">O que não fechou, contradiz ou incomoda</span></div>
      <div class="tensao-body">
        <div class="tensao-prompt">Algo no artigo ou na aula gerou atrito com o que você já sabia? Registra — mesmo que seja só uma frase.</div>
        <textarea id="ta-s${s}-d${d}-tensao" style="min-height:65px" placeholder="..." oninput="save(this, 's${s}-d${d}-tensao')"></textarea>
      </div>
    </div>`;
}

function htmlExperimento(exp, s, d) {
  return `
    <div class="slabel">🧪 Micro-experimento da semana</div>
    <div class="exp-card">
      <div class="exp-header"><span class="exp-htitle">🧪 ${exp.titulo}</span><span class="exp-badge">dia ${d}</span></div>
      <div class="exp-body">
        ${d === 1 ? `<div class="exp-texto">${exp.descricao}</div>` : ''}
        <span class="exp-label">Observação do dia ${d}</span>
        <textarea id="ta-s${s}-d${d}-exp" style="min-height:55px" placeholder="${exp.placeholder_obs}" oninput="save(this, 's${s}-d${d}-exp')"></textarea>
      </div>
    </div>`;
}

function htmlMateriais(dia) {
  const tipos = { video: 'tv', capitulo: 'tc', artigo: 'ta', podcast: 'tv', livro: 'tc' };
  const items = dia.materiais.map(m => `
    <div class="mat-item">
      <span class="mat-tipo ${tipos[m.tipo] || 'tc'}">${m.tipo}</span>
      <div class="mat-info">
        <div class="mat-title">${m.titulo}</div>
        <div class="mat-detail">${m.detalhe}</div>
      </div>
      <span class="mat-badge ${m.principal ? 'bp' : 'be'}">${m.principal ? 'principal' : 'extra'}</span>
    </div>`).join('');
  return `
    <div class="slabel">📚 Material complementar</div>
    <div class="mat-card">${items}</div>`;
}

/* ── SUPABASE SAVE/LOAD ───────────────────────── */
function save(el, campo) {
  const valor = el.value;
  localStorage.setItem('rd-' + campo, valor);
  setStatus('saving');
  clearTimeout(saveTimers[campo]);
  saveTimers[campo] = setTimeout(() => pushSupabase(campo, valor), 900);
}

async function pushSupabase(campo, valor) {
  if (!db) return;
  try {
    const { error } = await db.from('caderno_respostas')
      .upsert({ campo, valor: String(valor) }, { onConflict: 'campo' });
    setStatus(error ? 'error' : 'saved');
  } catch (e) { setStatus('error'); }
}

async function loadAll() {
  const prefix = `s${semanaAtual}-`;
  try {
    const { data, error } = await db.from('caderno_respostas')
      .select('campo, valor')
      .like('campo', prefix + '%');
    if (error) throw error;
    data.forEach(({ campo, valor }) => {
      localStorage.setItem('rd-' + campo, valor);
      applyValue(campo, valor);
    });
    setStatus('saved');
  } catch (e) {
    loadFromLocalStorage();
    setStatus('error');
  }
}

function loadDayData(s, d) {
  const prefix = `s${s}-d${d}-`;
  Object.keys(localStorage).filter(k => k.startsWith('rd-' + prefix)).forEach(k => {
    applyValue(k.replace('rd-', ''), localStorage.getItem(k));
  });
  ['sleep','energy','humor'].forEach(tipo => {
    const v = localStorage.getItem(`rd-s${s}-d${d}-ci-${tipo}`);
    if (v) highlightDots(d, tipo, parseInt(v));
  });
  const done = localStorage.getItem(`rd-s${s}-d${d}-done`);
  if (done === '1') {
    const cb = document.getElementById(`done-${d}`);
    if (cb) { cb.checked = true; markDone(d, true); }
  }
}

function loadSemanalData(s) {
  for (let i = 1; i <= 6; i++) {
    const campo = `s${s}-sem-${i}`;
    const v = localStorage.getItem('rd-' + campo);
    const el = document.getElementById(`ta-${campo}`);
    if (el && v) el.value = v;
  }
}

function loadFromLocalStorage() {
  Object.keys(localStorage).filter(k => k.startsWith('rd-s' + semanaAtual + '-')).forEach(k => {
    applyValue(k.replace('rd-', ''), localStorage.getItem(k));
  });
}

function applyValue(campo, valor) {
  const el = document.getElementById('ta-' + campo);
  if (el) { el.value = valor; return; }

  const ciMatch = campo.match(/^s(\d+)-d(\d+)-ci-(\w+)$/);
  if (ciMatch) { highlightDots(parseInt(ciMatch[2]), ciMatch[3], parseInt(valor)); return; }

  const doneMatch = campo.match(/^s(\d+)-d(\d+)-done$/);
  if (doneMatch && valor === '1') {
    const cb = document.getElementById('done-' + doneMatch[2]);
    if (cb) { cb.checked = true; markDone(parseInt(doneMatch[2]), true); }
  }
}

/* ── DOTS ─────────────────────────────────────── */
const DOT_COLORS = { sleep: '#1D9E75', energy: '#185FA5', humor: '#993556' };

function setupDots(s, d) {
  ['sleep','energy','humor'].forEach(tipo => {
    const cont = document.getElementById(`ci-${d}-${tipo}`);
    if (!cont) return;
    cont.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.textContent = i;
      dot.onclick = () => {
        highlightDots(d, tipo, i);
        localStorage.setItem(`rd-s${s}-d${d}-ci-${tipo}`, i);
        pushSupabase(`s${s}-d${d}-ci-${tipo}`, String(i));
      };
      cont.appendChild(dot);
    }
    const saved = localStorage.getItem(`rd-s${s}-d${d}-ci-${tipo}`);
    if (saved) highlightDots(d, tipo, parseInt(saved));
  });
}

function highlightDots(d, tipo, val) {
  const cont = document.getElementById(`ci-${d}-${tipo}`);
  if (!cont) return;
  const color = DOT_COLORS[tipo] || '#888';
  cont.querySelectorAll('.dot').forEach((dot, i) => {
    if (i < val) { dot.style.background = color; dot.style.borderColor = color; dot.style.color = '#fff'; }
    else { dot.style.background = '#fff'; dot.style.borderColor = '#e0ddd8'; dot.style.color = '#ddd'; }
  });
}

/* ── DONE ─────────────────────────────────────── */
function saveDone(dia, checked) {
  const campo = `s${semanaAtual}-d${dia}-done`;
  const valor = checked ? '1' : '0';
  localStorage.setItem('rd-' + campo, valor);
  markDone(dia, checked);
  pushSupabase(campo, valor);
}

function markDone(dia, checked) {
  const btn = document.getElementById('dbtn-' + dia);
  if (btn) btn.classList.toggle('done', checked);
}

/* ── MODO REFLEXÃO ────────────────────────────── */
function setModo(prefix, modo, btn) {
  const parent = btn.closest('.refl-body');
  parent.querySelectorAll('.mbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  parent.querySelectorAll('.area').forEach(a => a.classList.remove('active'));
  const target = document.getElementById(prefix + '-' + modo);
  if (target) target.classList.add('active');
}

/* ── STATUS ───────────────────────────────────── */
function setStatus(state) {
  const el = document.getElementById('sync');
  if (!el) return;
  const map = {
    idle:    ['● Pronto', 'idle'],
    saving:  ['⟳ Salvando…', 'saving'],
    saved:   ['✓ Salvo', 'saved'],
    error:   ['⚠ Sem conexão', 'error'],
    loading: ['⟳ Carregando…', 'saving'],
  };
  const [text, cls] = map[state] || map.idle;
  el.textContent = text;
  el.className = 'sync ' + cls;
  if (state === 'saved') setTimeout(() => setStatus('idle'), 2000);
}

/* ── OVERLAY ──────────────────────────────────── */
function showOverlay() {
  const ol = document.getElementById('overlay');
  if (ol) { ol.style.display = 'flex'; ol.classList.remove('hidden'); }
}
function hideOverlay() {
  const ol = document.getElementById('overlay');
  if (ol) { ol.classList.add('hidden'); setTimeout(() => ol.style.display = 'none', 400); }
}
