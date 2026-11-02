(function () {
  'use strict';
  const D = window.DADOS, S = window.Stats, C = D.config;
  const NAVY = '#1B1B2F', MAG = '#DD1367', SOFT = '#C9C6D6';
  const f = (v, d) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  const fv = (F, v) => F.pre + f(v, F.dec) + F.suf;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ind = (id) => D.indicadores.find((i) => i.id === id);
  const pts = (i) => i.pontos.filter((p) => p.oficial !== false || C.mostrarEstimativasNaoOficiais);
  const pt = (id, r) => ind(id).pontos.find((p) => p.rotulo === r);
  const faixa = (r, t) => t(r[0]) + ' a ' + t(r[1]);
  const sg = (v) => (v > 0 ? '+' : '');
  const T = { pct: (v) => f(v * 100, 1) + '%', x: (v) => f(v, 2) + '×', pp: (v) => sg(v) + f(v, 1) + ' p.p.', var: (v) => sg(v - 1) + f((v - 1) * 100, 1) + '%' };

  // KPIs
  const razaoRenda = S.razao(pt('renda_formal', 'São João de Meriti'), pt('renda_formal', 'Estado do RJ'));
  document.getElementById('kpis').innerHTML = D.kpis.map((k) => {
    const i = ind(k.indicador), p = k.ponto ? pt(k.indicador, k.ponto) : i.pontos[0], F = i.fmt;
    return `<div class="kpi"><div class="label">${esc(k.rotulo)}</div><div class="value">${F.pre}<span>${f(p.valor, F.dec)}</span>${F.suf}</div><div class="foot">${esc(k.foot.replace('{razao_renda}', T.pct(razaoRenda.est)))}</div></div>`;
  }).join('');

  // Tabela acessível por gráfico
  function tabela(i) {
    const rows = pts(i).map((p) => {
      const c = S.ic(p);
      return `<tr><th scope="row">${esc(p.rotulo)}</th><td>${fv(i.fmt, p.valor)}</td><td>${c ? faixa(c, (v) => fv(i.fmt, v)) : 'não divulgado'}</td></tr>`;
    }).join('');
    return `<table><caption>${esc(i.nota || '')}</caption><thead><tr><th>Categoria</th><th>Valor</th><th>IC 95%</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  // Barras de erro (ativas só quando há EP)
  const whisk = (ics) => ({ id: 'ic', afterDatasetsDraw(ch) {
    const m = ch.getDatasetMeta(0), y = ch.scales.y, c = ch.ctx;
    c.save(); c.strokeStyle = NAVY; c.lineWidth = 1.5;
    ics.forEach((r, k) => { if (!r) return; const x = m.data[k].x, a = y.getPixelForValue(r[0]), b = y.getPixelForValue(r[1]);
      c.beginPath(); c.moveTo(x, a); c.lineTo(x, b); c.moveTo(x - 5, a); c.lineTo(x + 5, a); c.moveTo(x - 5, b); c.lineTo(x + 5, b); c.stroke(); });
    c.restore();
  } });

  Chart.defaults.font.family = "Calibri, 'Segoe UI', Arial, sans-serif";
  Chart.defaults.color = '#6B6B7B';
  [['chartRenda', 'renda_formal', [MAG, NAVY]], ['chartPib', 'pib_pc', [MAG, NAVY, SOFT]],
   ['chartRaca', 'informalidade_raca', [NAVY, MAG, SOFT]], ['chartMeta101', 'sindicalizacao', [NAVY, MAG, SOFT]]].forEach(([cid, id, cores]) => {
    const i = ind(id), P = pts(i), F = i.fmt, el = document.getElementById(cid), ics = P.map(S.ic);
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', i.nome + ' (' + i.referencia + '): ' + P.map((p) => p.rotulo + ' ' + fv(F, p.valor)).join('; ') + '.');
    new Chart(el, {
      type: 'bar', plugins: [whisk(ics)],
      data: { labels: P.map((p) => p.rotulo), datasets: [{ data: P.map((p) => p.valor), backgroundColor: cores.slice(0, P.length), borderRadius: 6, maxBarThickness: 60 }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => fv(F, c.parsed.y) + (ics[c.dataIndex] ? ' (IC 95%: ' + faixa(ics[c.dataIndex], (v) => fv(F, v)) + ')' : '') } } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => F.pre + new Intl.NumberFormat('pt-BR').format(v) + F.suf }, grid: { color: '#EDEAF0' } }, x: { grid: { display: false } } } }
    });
    const card = el.closest('.card');
    card.querySelector('.src').textContent = 'Fonte: ' + i.fonte + ' · Referência: ' + i.referencia;
    card.insertAdjacentHTML('beforeend', `<details class="tabela"><summary>Ver dados em tabela</summary>${tabela(i)}</details>`);
  });

  // Medidas derivadas
  const R = 'renda_formal', B = 'pib_pc', I = 'informalidade_raca', U = 'sindicalizacao';
  const DER = [
    ['Remuneração formal: SJM ÷ Estado do RJ', 'razao', R, 'São João de Meriti', 'Estado do RJ', 'pct'],
    ['PIB per capita: SJM ÷ Estado do RJ', 'razao', B, 'SJM', 'Estado RJ', 'pct'],
    ['PIB per capita: SJM ÷ RM do Rio', 'razao', B, 'SJM', 'RM Rio', 'pct'],
    ['Informalidade: pretos ÷ brancos (razão de prevalências)', 'razao', I, 'Pretos', 'Brancos', 'x'],
    ['Informalidade: pardos ÷ brancos (razão de prevalências)', 'razao', I, 'Pardos', 'Brancos', 'x'],
    ['Informalidade: pretos − brancos', 'dif', I, 'Pretos', 'Brancos', 'pp'],
    ['Informalidade: pardos − brancos', 'dif', I, 'Pardos', 'Brancos', 'pp'],
    ['Sindicalização: 2023 − 2012', 'dif', U, '2023', '2012', 'pp'],
    ['Sindicalização: variação relativa 2012→2023', 'razao', U, '2023', '2012', 'var']
  ];
  document.getElementById('derivados').innerHTML = '<table><thead><tr><th>Medida</th><th>Estimativa</th><th>IC 95% (EP)</th><th>Intervalo por arredondamento</th></tr></thead><tbody>' +
    DER.map(([n, op, id, a, b, t]) => { const r = S[op](pt(id, a), pt(id, b)), tf = T[t];
      return `<tr><th scope="row">${esc(n)}</th><td>${tf(r.est)}</td><td>${r.ic ? faixa(r.ic, tf) : 'não calculável (EP não divulgado)'}</td><td>${r.rng ? faixa(r.rng, tf) : '—'}</td></tr>`; }).join('') + '</tbody></table>';
  document.getElementById('notas').innerHTML = D.notas.map((n) => `<li>${esc(n)}</li>`).join('');
  document.getElementById('versao').textContent = `Versão ${D.meta.versao} · atualizado em ${D.meta.atualizacao.split('-').reverse().join('/')} · ${D.meta.projeto}`;

  // Downloads
  const cel = (v) => (v == null ? '' : typeof v === 'number' ? String(v).replace('.', ',') : '"' + String(v).replace(/"/g, '""') + '"');
  function baixar(nome, txt, mime) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: mime })); a.download = nome;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  document.getElementById('dl-json').onclick = () => baixar('painel-meriti-dados.json', JSON.stringify(D, null, 2), 'application/json');
  document.getElementById('dl-csv').onclick = () => {
    const h = ['indicador', 'categoria', 'valor', 'unidade', 'erro_padrao', 'ic95_inferior', 'ic95_superior', 'referencia', 'fonte', 'tipo', 'oficial', 'verificado_fonte_primaria'];
    const L = [h.join(';')];
    D.indicadores.forEach((i) => i.pontos.forEach((p) => { const c = S.ic(p) || [null, null];
      L.push([i.id, p.rotulo, p.valor, [i.fmt.pre, i.fmt.suf].map((s) => s.trim()).filter(Boolean).join(' '), p.se, c[0], c[1], i.referencia, i.fonte, i.tipo, p.oficial === false ? 'não' : 'sim', i.verificado ? 'sim' : 'não'].map(cel).join(';')); }));
    baixar('painel-meriti-dados.csv', '\ufeff' + L.join('\r\n'), 'text/csv;charset=utf-8');
  };
})();
