// db.js — lê/grava as listas no electron-store.
// Roda no processo de renderer (nodeIntegration: true, contextIsolation: false),
// então dá pra falar com o electron-store direto, sem precisar de ponte/IPC.
import Store from 'electron-store';

const store = new Store({ name: 'confeit-o-matic' });

const padroes = {
  insumos: [],
  receitas: [],
  custosFixos: [],
  config: { producaoMensalEstimada: 0 },
  caixa: [],
};

function get(chave) {
  return store.get(chave, padroes[chave]);
}

function set(chave, valor) {
  store.set(chave, valor);
}

export default {
  getInsumos: () => get('insumos'),
  setInsumos: (v) => set('insumos', v),

  getReceitas: () => get('receitas'),
  setReceitas: (v) => set('receitas', v),

  getCustosFixos: () => get('custosFixos'),
  setCustosFixos: (v) => set('custosFixos', v),

  getConfig: () => get('config'),
  setConfig: (v) => set('config', v),

  getCaixa: () => get('caixa'),
  setCaixa: (v) => set('caixa', v),
};
