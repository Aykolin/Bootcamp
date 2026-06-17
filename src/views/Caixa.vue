<template>
  <div>
    <h2>Caixa</h2>

    <div class="campo filtro-mes">
      <label>Mês</label>
      <select v-model="mesSelecionado">
        <option v-for="m in mesesDisponiveis" :key="m" :value="m">{{ formatarMes(m) }}</option>
      </select>
    </div>

    <div class="totais">
      <div class="cartao-total">
        <span>Entradas</span>
        <strong class="valor-entrada">{{ formatarMoeda(totais.entradas) }}</strong>
      </div>
      <div class="cartao-total">
        <span>Saídas</span>
        <strong class="valor-saida">{{ formatarMoeda(totais.saidas) }}</strong>
      </div>
      <div class="cartao-total">
        <span>Lucro do mês</span>
        <strong :class="totais.lucro >= 0 ? 'valor-entrada' : 'valor-saida'">
          {{ formatarMoeda(totais.lucro) }}
        </strong>
      </div>
    </div>

    <form class="form-card" @submit.prevent="adicionarLancamento">
      <div class="campo">
        <label>Tipo</label>
        <select v-model="formulario.tipo">
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
      </div>
      <div class="campo">
        <label>Valor (R$)</label>
        <input type="number" min="0" step="any" v-model.number="formulario.valor" required />
      </div>
      <div class="campo">
        <label>Data</label>
        <input type="date" v-model="formulario.data" required />
      </div>
      <div class="campo">
        <label>Categoria</label>
        <input v-model="formulario.categoria" placeholder="ex.: venda, insumos" />
      </div>
      <div class="campo">
        <label>Descrição</label>
        <input v-model="formulario.descricao" placeholder="ex.: Bolo de cenoura" />
      </div>
      <div class="acoes-form">
        <button type="submit">Lançar</button>
      </div>
    </form>

    <table class="lista" v-if="lancamentosDoMes.length">
      <thead>
        <tr>
          <th>Data</th>
          <th>Tipo</th>
          <th>Categoria</th>
          <th>Descrição</th>
          <th>Valor</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="l in lancamentosDoMes" :key="l.id">
          <td>{{ formatarData(l.data) }}</td>
          <td>{{ l.tipo === 'entrada' ? 'Entrada' : 'Saída' }}</td>
          <td>{{ l.categoria }}</td>
          <td>{{ l.descricao }}</td>
          <td :class="l.tipo === 'entrada' ? 'valor-entrada' : 'valor-saida'">
            {{ formatarMoeda(l.valor) }}
          </td>
          <td>
            <button class="perigo" @click="excluir(l.id)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Nenhum lançamento neste mês.</p>
  </div>
</template>

<script>
import db from '../db';
import { totaisCaixa } from '../calc';

function mesAtual() {
  return new Date().toISOString().slice(0, 7);
}

function formularioVazio() {
  return {
    tipo: 'entrada',
    valor: null,
    data: new Date().toISOString().slice(0, 10),
    categoria: '',
    descricao: '',
  };
}

export default {
  name: 'Caixa',
  data() {
    return {
      caixa: db.getCaixa(),
      mesSelecionado: mesAtual(),
      formulario: formularioVazio(),
    };
  },
  computed: {
    mesesDisponiveis() {
      const meses = new Set(this.caixa.map((l) => l.data.slice(0, 7)));
      meses.add(this.mesSelecionado);
      return Array.from(meses).sort((a, b) => (a < b ? 1 : -1));
    },
    lancamentosDoMes() {
      return this.caixa
        .filter((l) => l.data.slice(0, 7) === this.mesSelecionado)
        .slice()
        .sort((a, b) => (a.data < b.data ? 1 : -1));
    },
    totais() {
      return totaisCaixa(this.caixa, this.mesSelecionado);
    },
  },
  methods: {
    formatarMoeda(valor) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        valor || 0
      );
    },
    formatarData(iso) {
      const [ano, mes, dia] = iso.slice(0, 10).split('-');
      return `${dia}/${mes}/${ano}`;
    },
    formatarMes(anoMes) {
      const texto = new Date(`${anoMes}-01T00:00:00`).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    },
    adicionarLancamento() {
      this.caixa.push({ ...this.formulario, id: Date.now().toString() });
      db.setCaixa(this.caixa);
      this.mesSelecionado = this.formulario.data.slice(0, 7);
      this.formulario = formularioVazio();
    },
    excluir(id) {
      this.caixa = this.caixa.filter((l) => l.id !== id);
      db.setCaixa(this.caixa);
    },
  },
};
</script>

<style scoped>
.filtro-mes {
  margin-bottom: 16px;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
}
.campo input,
.campo select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}
.totais {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}
.cartao-total {
  background: white;
  border-radius: 8px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  min-width: 160px;
}
.cartao-total span {
  font-size: 0.8rem;
  color: #6b7280;
}
.cartao-total strong {
  font-size: 1.2rem;
}
.valor-entrada {
  color: #2f7a3a;
}
.valor-saida {
  color: #b3413a;
}
.form-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.acoes-form {
  display: flex;
  align-items: center;
  gap: 10px;
}
button {
  background: #d97a8c;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}
button.perigo {
  background: #b3413a;
}
.lista {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}
.lista th,
.lista td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #f0e7e2;
  font-size: 0.9rem;
}
</style>
