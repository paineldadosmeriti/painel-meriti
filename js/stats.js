/* Funções estatísticas. Convenções: se = erro-padrão; arred = meia-amplitude de arredondamento. */
(function () {
  'use strict';
  const Z = 1.959964; // quantil 97,5% da normal padrão
  const lim = (p) => (p.arred == null ? [p.valor, p.valor] : [p.valor - p.arred, p.valor + p.arred]);
  const ic = (p) => (p.se == null ? null : [p.valor - Z * p.se, p.valor + Z * p.se]);
  // Razão a/b: IC pelo método delta (log), independência assumida; faixa por arredondamento (aritmética de intervalos)
  function razao(a, b) {
    const est = a.valor / b.valor, r = { est, ic: null, rng: null };
    if (a.se != null && b.se != null) {
      const s = Math.hypot(a.se / a.valor, b.se / b.valor);
      r.ic = [est * Math.exp(-Z * s), est * Math.exp(Z * s)];
    }
    if (a.arred != null || b.arred != null) { const [al, ah] = lim(a), [bl, bh] = lim(b); r.rng = [al / bh, ah / bl]; }
    return r;
  }
  // Diferença a-b: EP = sqrt(se_a² + se_b²), independência assumida
  function dif(a, b) {
    const est = a.valor - b.valor, r = { est, ic: null, rng: null };
    if (a.se != null && b.se != null) { const s = Math.hypot(a.se, b.se); r.ic = [est - Z * s, est + Z * s]; }
    if (a.arred != null || b.arred != null) { const [al, ah] = lim(a), [bl, bh] = lim(b); r.rng = [al - bh, ah - bl]; }
    return r;
  }
  window.Stats = { Z, ic, razao, dif };
})();
