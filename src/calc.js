/**
 * Converte uma quantidade (ex.: 500) de uma unidade (ex.: 'g')
 * para a unidade base ('g', 'mL' ou 'unidade') e retorna { valor, unidadeBase }.
 */
function converterParaBase(quantidade, unidade) {
  const conversoes = {
    // massa
    kg: { fator: 1000, base: 'g' },
    g: { fator: 1, base: 'g' },
    // volume
    L: { fator: 1000, base: 'mL' },
    mL: { fator: 1, base: 'mL' },
    // contagem
    unidade: { fator: 1, base: 'unidade' },
    un: { fator: 1, base: 'unidade' },
  };

  const c = conversoes[unidade];
  if (!c) return { valor: quantidade, unidadeBase: unidade };

  return {
    valor: quantidade * c.fator,
    unidadeBase: c.base,
  };
}

/** Custo da unidade base do ingrediente (preço por g/mL/unidade). */
function custoBaseIngrediente(ingrediente) {
  const { valor: quantidadeBase } = converterParaBase(
    ingrediente.quantidadeCompra,
    ingrediente.unidadeCompra
  );
  return ingrediente.precoCompra / quantidadeBase;
}

/** Custo de um item da receita (quantidade na base × custo base do ingrediente). */
function custoItem(item, ingrediente) {
  const { valor: quantidadeBase } = converterParaBase(item.quantidade, item.unidade);
  return quantidadeBase * custoBaseIngrediente(ingrediente);
}

/**
 * Calcula o custo de uma receita.
 * @param {object} receita
 * @param {(id) => object} buscarIngrediente
 * @param {number} markup
 */
function calcularReceita(receita, buscarIngrediente, markup) {
  const custoIngredientes = receita.itens.reduce((soma, item) => {
    const ingrediente = buscarIngrediente(item.ingredienteId);
    return ingrediente ? soma + custoItem(item, ingrediente) : soma;
  }, 0);

  const m = markup || 2;
  const custoTotal = custoIngredientes + (receita.custosAdicionais || 0);
  const precoSugerido = custoTotal * m;

  return {
    custoIngredientes,
    custoTotal,
    precoSugerido,
  };
}

export { converterParaBase, custoBaseIngrediente, custoItem, calcularReceita };
