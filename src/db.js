const DB_KEY = 'confeitomatic_db';

function get(key) {
  const data = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
  return data[key] || (key === 'config' ? { markup: 2 } : []);
}

function set(key, value) {
  const data = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
  data[key] = value;
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

export default {
  getConfig: () => get('config'),
  setConfig: (v) => set('config', v),

  getIngredientes: () => get('ingredientes'),
  setIngredientes: (v) => set('ingredientes', v),

  getReceitas: () => get('receitas'),
  setReceitas: (v) => set('receitas', v),

  // Migração (opcional, mas bom para não perder dados existentes)
  migrar() {
    const data = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
    let mudou = false;

    if (data.insumos && !data.ingredientes) {
      data.ingredientes = data.insumos;
      delete data.insumos;
      mudou = true;
    }

    if (data.receitas) {
      data.receitas.forEach((r) => {
        if (r.itens) {
          r.itens.forEach((item) => {
            if (item.insumoId && !item.ingredienteId) {
              item.ingredienteId = item.insumoId;
              delete item.insumoId;
              mudou = true;
            }
          });
        }
      });
    }

    if (mudou) {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    }
  },
};
