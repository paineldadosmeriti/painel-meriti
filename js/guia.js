(function () {
  'use strict';
  const G = window.GUIA, D = window.DADOS, S = window.Stats;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f = (v, d) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  const pt = (id, r) => D.indicadores.find((i) => i.id === id).pontos.find((p) => p.rotulo === r);
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } },
                  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  // Resumo para pauta sindical (gerado dos dados)
  const rr = S.razao(pt('renda_formal', 'São João de Meriti'), pt('renda_formal', 'Estado do RJ')).est;
  const dp = S.dif(pt('informalidade_raca', 'Pretos'), pt('informalidade_raca', 'Brancos')).est;
  const dpa = S.dif(pt('informalidade_raca', 'Pardos'), pt('informalidade_raca', 'Brancos')).est;
  const resumo = `Resumo para pauta — Painel Meriti em Dados (ODS 10.3)\n• Remuneração formal em São João de Meriti: ${f(rr * 100, 1)}% da média do estado do RJ (RAIS/MTE, 2024).\n• Informalidade no Brasil: pretos +${f(dp, 1)} p.p. e pardos +${f(dpa, 1)} p.p. acima de brancos (PNAD Contínua, 4º tri 2024).\n• Mulheres recebem ${f(pt('razao_salarial', 'Brasil').valor, 1)}% do salário dos homens, mesmo após a Lei 14.611/2023.\n• Sindicalização no Brasil: ${f(pt('sindicalizacao', '2012').valor, 1)}% (2012) → ${f(pt('sindicalizacao', '2023').valor, 1)}% (2023); apenas ${f(pt('sind_sem_carteira', 'Brasil').valor, 1)}% entre empregados sem carteira.\nObs.: dados raciais, de gênero e sindicais são nacionais. Fontes e método: ${location.href.split('#')[0]}#metodologia`;

  // Guias por público (abas acessíveis)
  const abas = G.publicos, saved = store.get('painel-checks');
  $('guia').innerHTML = `<div role="tablist" class="tabs" aria-label="Orientações por público">${abas.map((a, k) =>
    `<button role="tab" id="tab-${a.id}" aria-controls="pn-${a.id}" aria-selected="${k === 0}" tabindex="${k === 0 ? 0 : -1}">${esc(a.rotulo)}</button>`).join('')}</div>` +
    abas.map((a, k) => `<div role="tabpanel" id="pn-${a.id}" aria-labelledby="tab-${a.id}" class="painel" ${k ? 'hidden' : ''}>
      <h4>${esc(a.titulo)}</h4><p>${esc(a.intro)}</p>
      <ol class="checks">${a.passos.map((p, j) => `<li><label><input type="checkbox" data-k="${a.id}-${j}" ${saved[a.id + '-' + j] ? 'checked' : ''}> ${esc(p)}</label></li>`).join('')}</ol>
      <div class="prog" aria-live="polite"></div>
      ${a.direitos.length ? `<h5>${a.id === 'formal' ? 'Direitos garantidos pela CLT' : 'Bom saber'}</h5><ul>${a.direitos.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
      ${a.id === 'sindicato' ? `<pre id="resumo" class="resumo">${esc(resumo)}</pre><button type="button" class="btn" id="cp-resumo">Copiar resumo</button> <span id="cp-ok" role="status"></span>` : ''}
      <p class="links">${a.links.map((l) => `<a href="${l[1]}" target="_blank" rel="noopener">${esc(l[0])} ↗</a>`).join(' ')}</p></div>`).join('');
  const tabs = [...document.querySelectorAll('[role=tab]')];
  const abrir = (t) => { tabs.forEach((b) => { const on = b === t; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; $(b.getAttribute('aria-controls')).hidden = !on; }); t.focus(); };
  tabs.forEach((t, k) => { t.onclick = () => abrir(t);
    t.onkeydown = (e) => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); abrir(tabs[(k + d + tabs.length) % tabs.length]); } }; });
  const prog = () => document.querySelectorAll('.painel').forEach((p) => { const c = p.querySelectorAll('input'), n = [...c].filter((i) => i.checked).length;
    p.querySelector('.prog').textContent = n + ' de ' + c.length + ' passos concluídos'; });
  document.querySelectorAll('.checks input').forEach((i) => i.onchange = () => { saved[i.dataset.k] = i.checked; store.set('painel-checks', saved); prog(); });
  prog();
  const copiar = (txt, ok) => (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => ok('Copiado!'), () => ok('Não foi possível copiar; selecione o texto manualmente.'));
  $('cp-resumo').onclick = () => copiar(resumo, (m) => { $('cp-ok').textContent = m; });

  // Comparador de renda
  const A = pt('renda_formal', 'São João de Meriti').valor, B = pt('renda_formal', 'Estado do RJ').valor;
  $('comp-in').oninput = (e) => { const v = parseFloat(String(e.target.value).replace(/\./g, '').replace(',', '.'));
    $('comp-out').innerHTML = v > 0 ? `Sua renda equivale a <b>${f(v / A * 100, 0)}%</b> da remuneração média formal de São João de Meriti e a <b>${f(v / B * 100, 0)}%</b> da média do estado do RJ.<br><small>Médias gerais não são referência para a sua ocupação específica; use como ponto de partida para conversar com o sindicato ou o Sebrae.</small>` : ''; };

  // Divulgação
  $('divulgacao').innerHTML = G.divulgacao.map((d) => `<li><b>${esc(d[0])}:</b> ${esc(d[1])}</li>`).join('');
  const msg = 'Painel Meriti em Dados: veja como raça, gênero e território afetam o trabalho em São João de Meriti.';
  $('sh-wpp').href = 'https://wa.me/?text=' + encodeURIComponent(msg + ' ' + location.href.split('#')[0]);
  $('sh-link').onclick = () => copiar(location.href.split('#')[0], (m) => { $('sh-ok').textContent = m; });
  $('sh-print').onclick = () => window.print();
  $('refs').innerHTML = G.referencias.map((r) => `<li>${esc(r)}</li>`).join('');
})();
