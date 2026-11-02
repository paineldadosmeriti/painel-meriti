/* Fonte única dos dados do painel.
   Campos por ponto: valor (estimativa); se = erro-padrão (preencher quando a fonte divulgar -> habilita IC 95% e barras de erro);
   arred = meia-amplitude de arredondamento (hipótese: casa decimal exibida); oficial:false = estimativa não publicada pela fonte.
   Por indicador: verificado = conferido na fonte primária? (todos false nesta versão). */
window.DADOS = {
  meta: { versao: '2.0', atualizacao: '2026-11-02', projeto: 'PIEX II — Centro Universitário UniDomBosco' },
  config: { mostrarEstimativasNaoOficiais: false },
  kpis: [
    { indicador: 'informalidade_br', rotulo: 'Informalidade no Brasil (3º tri 2025)', foot: '≈ 40 milhões de trabalhadores sem carteira, CNPJ ou proteção previdenciária.' },
    { indicador: 'sindicalizacao', ponto: '2023', rotulo: 'Sindicalização no Brasil (2023)', foot: 'Menor patamar da série histórica (era 16,1% em 2012).' },
    { indicador: 'razao_salarial', rotulo: 'Razão salarial mulher/homem', foot: 'Mulheres recebem, em média, 78,8% do salário dos homens, mesmo após a Lei 14.611/2023.' },
    { indicador: 'renda_formal', ponto: 'São João de Meriti', rotulo: 'Remuneração formal em SJM', foot: 'Apenas {razao_renda} da média do estado do Rio de Janeiro (R$ 4.000).' }
  ],
  indicadores: [
    { id: 'renda_formal', nome: 'Remuneração média formal', fonte: 'Caravela (2025), com base em RAIS/MTE', referencia: '2024', tipo: 'registro administrativo', verificado: false,
      fmt: { pre: 'R$ ', suf: '', dec: 0 }, nota: 'Arredondamento à centena (±R$ 50) é hipótese, não informação da fonte.',
      pontos: [{ rotulo: 'São João de Meriti', valor: 2100, arred: 50 }, { rotulo: 'Estado do RJ', valor: 4000, arred: 50 }] },
    { id: 'pib_pc', nome: 'PIB per capita', fonte: 'Caravela, a partir de dados do IBGE', referencia: '2023', tipo: 'estimativa oficial', verificado: false,
      fmt: { pre: 'R$ ', suf: ' mil', dec: 1 }, nota: 'Valores nominais.',
      pontos: [{ rotulo: 'SJM', valor: 26.2, arred: 0.05 }, { rotulo: 'Estado RJ', valor: 73.1, arred: 0.05 }, { rotulo: 'RM Rio', valor: 74.2, arred: 0.05 }] },
    { id: 'informalidade_raca', nome: 'Taxa de informalidade por raça (Brasil)', fonte: 'Agência Brasil / PNAD Contínua (IBGE, 2025)', referencia: '4º trimestre de 2024', tipo: 'amostral (PNAD Contínua)', verificado: false,
      fmt: { pre: '', suf: '%', dec: 1 }, nota: 'Estimativa amostral nacional; erro-padrão não obtido.',
      pontos: [{ rotulo: 'Pretos', valor: 41.9, arred: 0.05 }, { rotulo: 'Pardos', valor: 43.5, arred: 0.05 }, { rotulo: 'Brancos', valor: 32.6, arred: 0.05 }] },
    { id: 'sindicalizacao', nome: 'Taxa de sindicalização (Brasil)', fonte: 'IBGE/PNAD Contínua', referencia: '2012 e 2023', tipo: 'amostral (PNAD Contínua)', verificado: false,
      fmt: { pre: '', suf: '%', dec: 1 }, nota: '2024*: média simples entre homens e mulheres (v1), sem ponderação — não é estimativa oficial; oculta por padrão.',
      pontos: [{ rotulo: '2012', valor: 16.1, arred: 0.05 }, { rotulo: '2023', valor: 8.4, arred: 0.05 }, { rotulo: '2024*', valor: 8.9, arred: 0.05, oficial: false }] },
    { id: 'informalidade_br', nome: 'Taxa de informalidade (Brasil)', fonte: 'IBGE/PNAD Contínua (citação exata a confirmar)', referencia: '3º trimestre de 2025', tipo: 'amostral (PNAD Contínua)', verificado: false,
      fmt: { pre: '', suf: '%', dec: 1 }, pontos: [{ rotulo: 'Brasil', valor: 39.4, arred: 0.05 }] },
    { id: 'razao_salarial', nome: 'Razão salarial mulher/homem', fonte: 'MTE / Ministério das Mulheres — Lei 14.611/2023 (2025)', referencia: 'a confirmar', tipo: 'a confirmar', verificado: false,
      fmt: { pre: '', suf: '%', dec: 1 }, pontos: [{ rotulo: 'Brasil', valor: 78.8, arred: 0.05 }] },
    { id: 'pop_preta_parda_sjm', nome: 'População preta ou parda em SJM', fonte: 'IBGE, Censo 2022', referencia: '2022', tipo: 'censitário (autodeclaração)', verificado: false,
      fmt: { pre: '', suf: '%', dec: 0 }, pontos: [{ rotulo: 'São João de Meriti', valor: 70 }] },
    { id: 'sind_sem_carteira', nome: 'Sindicalização — empregados sem carteira (Brasil)', fonte: 'IBGE/PNAD Contínua', referencia: '2023', tipo: 'amostral (PNAD Contínua)', verificado: false,
      fmt: { pre: '', suf: '%', dec: 1 }, pontos: [{ rotulo: 'Brasil', valor: 3.7, arred: 0.05 }] },
    { id: 'sind_domestico', nome: 'Sindicalização — trabalhadores domésticos (Brasil)', fonte: 'IBGE/PNAD Contínua', referencia: '2023', tipo: 'amostral (PNAD Contínua)', verificado: false,
      fmt: { pre: '', suf: '%', dec: 0 }, pontos: [{ rotulo: 'Brasil', valor: 2 }] }
  ],
  notas: [
    'Estimativas da PNAD Contínua são amostrais e têm erro de amostragem. As fontes consultadas divulgam apenas estimativas pontuais; por isso o painel não exibe intervalos de confiança onde o erro-padrão (EP) não foi obtido. Quando o EP for informado em data/dados.js, o painel calcula IC 95% = estimativa ± 1,96·EP e, para razões, usa o método delta na escala logarítmica, supondo independência entre as estimativas.',
    'Os intervalos “por arredondamento” usam aritmética de intervalos sobre a casa decimal exibida (hipótese). Eles limitam apenas o erro de arredondamento, não o erro amostral nem o de medição.',
    'Comparações entre São João de Meriti e o estado são diferenças brutas, sem ajuste por composição setorial, ocupacional ou de escolaridade, e não indicam causalidade. A comparabilidade da definição de remuneração entre as duas séries deve ser confirmada na fonte.',
    'Indicadores raciais e sindicais são nacionais; não são estimativas para São João de Meriti, e a aproximação com a realidade local é inferência ecológica.',
    'A estimativa 2024* de sindicalização (média simples de homens e mulheres) não é uma estimativa oficial e fica oculta por padrão (config.mostrarEstimativasNaoOficiais).'
  ]
};
