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

  // multiplicação simples: quantidade na unidade original × fator de conversão
  // ex.: 2 kg × 1000 = 2000 g
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
  // divisão: preço total pago ÷ quantidade total comprada (na unidade base)
  // ex.: pacote de 1000 g custou R$10 → 10 / 1000 = R$0,01 por g
  return ingrediente.precoCompra / quantidadeBase;
}

/** Custo de um item da receita (quantidade na base × custo base do ingrediente). */
function custoItem(item, ingrediente) {
  const { valor: quantidadeBase } = converterParaBase(item.quantidade, item.unidade);
  // multiplicação: quantidade usada na receita (na base) × preço por unidade base
  // ex.: 200 g usados × R$0,01/g = R$2,00
  return quantidadeBase * custoBaseIngrediente(ingrediente);
}

/**
 * Calcula o custo de uma receita.
 * @param {object} receita
 * @param {(id) => object} buscarIngrediente
 * @param {number} markup
 */
function calcularReceita(receita, buscarIngrediente, markup) {
  // soma (Σ) do custo de cada item da receita
  const custoIngredientes = receita.itens.reduce((soma, item) => {
    const ingrediente = buscarIngrediente(item.ingredienteId);
    return ingrediente ? soma + custoItem(item, ingrediente) : soma;
  }, 0);

  // soma simples: custo dos ingredientes + custos extras (embalagem, energia, etc.)
  const m = markup || 2;
  const custoTotal = custoIngredientes + (receita.custosAdicionais || 0);
  // preço sugerido = custo total × markup (ex.: markup 2 = preço cobre o custo e dobra como lucro)
  const precoSugerido = custoTotal * m;

  return {
    custoIngredientes,
    custoTotal,
    precoSugerido,
  };
}

/**
 * Verifica se há estoque suficiente de todos os ingredientes para vender N lotes da receita.
 * Retorna a lista de ingredientes com estoque insuficiente (vazia se houver estoque pra todos).
 */
function ingredientesFaltantes(receita, buscarIngrediente, quantidadeLotes) {
  return receita.itens.reduce((faltantes, item) => {
    const ingrediente = buscarIngrediente(item.ingredienteId);
    if (!ingrediente) return faltantes;

    const { valor: quantidadeBase } = converterParaBase(item.quantidade, item.unidade);
    const necessario = quantidadeBase * quantidadeLotes;
    if (necessario > ingrediente.estoque) faltantes.push(ingrediente);
    return faltantes;
  }, []);
}

/** Vende N lotes de uma receita: abate o estoque dos ingredientes usados. */
function venderReceita(receita, buscarIngrediente, quantidadeLotes) {
  receita.itens.forEach((item) => {
    const ingrediente = buscarIngrediente(item.ingredienteId);
    if (!ingrediente) return;

    const { valor: quantidadeBase } = converterParaBase(item.quantidade, item.unidade);
    ingrediente.estoque -= quantidadeBase * quantidadeLotes;
  });
}

export {
  converterParaBase,
  custoBaseIngrediente,
  custoItem,
  calcularReceita,
  ingredientesFaltantes,
  venderReceita,
};
