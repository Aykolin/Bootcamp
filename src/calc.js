// calc.js — as contas do Confeit-o-matic (conversão, custo, precificação, venda, caixa)

const FATORES_BASE = {
  kg: 1000,
  g: 1,
  L: 1000,
  mL: 1,
  duzia: 12,
  un: 1,
};

const UNIDADE_BASE = {
  kg: 'g',
  g: 'g',
  L: 'mL',
  mL: 'mL',
  duzia: 'un',
  un: 'un',
};

/** Converte uma quantidade pra unidade base (g, mL ou un). */
function converterParaBase(quantidade, unidade) {
  const fator = FATORES_BASE[unidade];
  if (fator === undefined) {
    throw new Error(`Unidade desconhecida: ${unidade}`);
  }
  return {
    valor: quantidade * fator,
    unidadeBase: UNIDADE_BASE[unidade],
  };
}

/** Custo da unidade base do insumo (preço por g/mL/un). */
function custoBaseInsumo(insumo) {
  const { valor: quantidadeBase } = converterParaBase(
    insumo.quantidadeCompra,
    insumo.unidadeCompra
  );
  return insumo.precoCompra / quantidadeBase;
}

/** Custo de um item da receita (quantidade na base × custo base do insumo). */
function custoItem(item, insumo) {
  const { valor: quantidadeBase } = converterParaBase(item.quantidade, item.unidade);
  return quantidadeBase * custoBaseInsumo(insumo);
}

/**
 * Custo e preço de uma receita.
 * @param {object} receita
 * @param {(id) => object} buscarInsumo
 * @param {object[]} custosFixos
 * @param {object} config
 */
function calcularReceita(receita, buscarInsumo, custosFixos, config) {
  const custoInsumos = receita.itens.reduce((soma, item) => {
    const insumo = buscarInsumo(item.insumoId);
    return insumo ? soma + custoItem(item, insumo) : soma;
  }, 0);

  const totalFixos = custosFixos.reduce((soma, cf) => soma + cf.valorMensal, 0);
  const producaoMensalEstimada = config.producaoMensalEstimada || 0;
  const rateioFixos =
    producaoMensalEstimada > 0
      ? (totalFixos / producaoMensalEstimada) * receita.rendimento
      : 0;

  const custoTotal = custoInsumos + (receita.custosAdicionais || 0) + rateioFixos;
  const precoSugerido = custoTotal * (1 + receita.margem / 100);

  return {
    custoInsumos,
    rateioFixos,
    custoTotal,
    precoSugerido,
    custoPorPorcao: custoTotal / receita.rendimento,
    precoPorPorcao: precoSugerido / receita.rendimento,
  };
}

/**
 * Vende N lotes de uma receita: abate o estoque dos insumos e devolve o
 * lançamento de caixa correspondente. Não grava nada — quem chama decide
 * onde persistir.
 */
function venderReceita(receita, buscarInsumo, quantidadeLotes, precoSugerido) {
  receita.itens.forEach((item) => {
    const insumo = buscarInsumo(item.insumoId);
    if (!insumo) return;
    const { valor: quantidadeBase } = converterParaBase(item.quantidade, item.unidade);
    insumo.estoque -= quantidadeBase * quantidadeLotes;
  });

  return {
    id: Date.now().toString(),
    tipo: 'entrada',
    valor: precoSugerido * quantidadeLotes,
    data: new Date().toISOString(),
    categoria: 'venda',
    descricao: receita.nome,
  };
}

/** Totais do caixa pra um mês (formato "YYYY-MM"), a partir de lançamentos com `data` ISO. */
function totaisCaixa(caixa, anoMes) {
  const doMes = caixa.filter((lanc) => lanc.data.slice(0, 7) === anoMes);
  const entradas = doMes
    .filter((l) => l.tipo === 'entrada')
    .reduce((soma, l) => soma + l.valor, 0);
  const saidas = doMes
    .filter((l) => l.tipo === 'saida')
    .reduce((soma, l) => soma + l.valor, 0);
  return { entradas, saidas, lucro: entradas - saidas };
}

export {
  converterParaBase,
  custoBaseInsumo,
  custoItem,
  calcularReceita,
  venderReceita,
  totaisCaixa,
};
