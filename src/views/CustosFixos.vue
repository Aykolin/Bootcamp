<template>
  <div>
    <h2>Custos fixos</h2>

    <div class="form-card producao">
      <div class="campo">
        <label>Produção mensal estimada (porções/lotes vendidos por mês)</label>
        <input
          type="number"
          min="0"
          step="any"
          v-model.number="config.producaoMensalEstimada"
          @change="salvarConfig"
        />
      </div>
      <p class="dica">
        Usada pra ratear os custos fixos entre as receitas: se for 0, nenhuma receita recebe
        rateio.
      </p>
    </div>

    <form class="form-card" @submit.prevent="salvar">
      <div class="campo">
        <label>Nome</label>
        <input v-model="formulario.nome" required placeholder="ex.: Aluguel" />
      </div>
      <div class="campo">
        <label>Valor mensal (R$)</label>
        <input type="number" min="0" step="any" v-model.number="formulario.valorMensal" required />
      </div>
      <div class="acoes-form">
        <button type="submit">{{ editandoId ? 'Salvar alterações' : 'Adicionar custo fixo' }}</button>
        <button type="button" v-if="editandoId" @click="cancelar">Cancelar</button>
      </div>
    </form>

    <table class="lista" v-if="custosFixos.length">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Valor mensal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in custosFixos" :key="c.id">
          <td>{{ c.nome }}</td>
          <td>{{ formatarMoeda(c.valorMensal) }}</td>
          <td class="acoes-linha">
            <button @click="editar(c)">Editar</button>
            <button class="perigo" @click="excluir(c.id)">Excluir</button>
          </td>
        </tr>
        <tr class="total">
          <td>Total</td>
          <td>{{ formatarMoeda(totalMensal) }}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    <p v-else>Nenhum custo fixo cadastrado ainda.</p>
  </div>
</template>

<script>
import db from '../db';

function formularioVazio() {
  return { nome: '', valorMensal: null };
}

export default {
  name: 'CustosFixos',
  data() {
    return {
      custosFixos: db.getCustosFixos(),
      config: db.getConfig(),
      editandoId: null,
      formulario: formularioVazio(),
    };
  },
  computed: {
    totalMensal() {
      return this.custosFixos.reduce((soma, c) => soma + c.valorMensal, 0);
    },
  },
  methods: {
    formatarMoeda(valor) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        valor || 0
      );
    },
    salvarConfig() {
      db.setConfig(this.config);
    },
    salvar() {
      if (this.editandoId) {
        const indice = this.custosFixos.findIndex((c) => c.id === this.editandoId);
        this.custosFixos.splice(indice, 1, { ...this.formulario, id: this.editandoId });
      } else {
        this.custosFixos.push({ ...this.formulario, id: Date.now().toString() });
      }
      db.setCustosFixos(this.custosFixos);
      this.cancelar();
    },
    editar(custo) {
      this.editandoId = custo.id;
      this.formulario = { ...custo };
    },
    excluir(id) {
      this.custosFixos = this.custosFixos.filter((c) => c.id !== id);
      db.setCustosFixos(this.custosFixos);
    },
    cancelar() {
      this.editandoId = null;
      this.formulario = formularioVazio();
    },
  },
};
</script>

<style scoped>
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
.producao {
  align-items: flex-start;
  flex-direction: column;
}
.dica {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 4px 0 0;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
}
.campo input {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
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
.lista tr.total td {
  font-weight: bold;
  border-bottom: none;
}
.acoes-linha {
  display: flex;
  gap: 6px;
}
</style>
