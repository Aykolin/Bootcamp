const DB_KEY = 'confeitomatic_db';

function get(key) {
  const data = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
  return data[key] || [];
}

function set(key, value) {
  const data = JSON.parse(localStorage.getItem(DB_KEY) || '{}');
  data[key] = value;
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

export default {
  getIngredientes: () => get('ingredientes'),
  setIngredientes: (v) => set('ingredientes', v),

  getReceitas: () => get('receitas'),
  setReceitas: (v) => set('receitas', v),
};
