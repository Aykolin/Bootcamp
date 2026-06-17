<template>
  <div>
    <h2>Insumos</h2>

    <form class="form-card" @submit.prevent="salvar">
      <div class="campo">
        <label>Nome</label>
        <input v-model="formulario.nome" required placeholder="ex.: Arroz" />
      </div>

      <div class="campo">
        <label>Tipo</label>
        <select v-model="formulario.tipoUnidade" @change="ajustarUnidade">
          <option value="massa">Massa</option>
          <option value="volume">Volume</option>
          <option value="contagem">Contagem</option>
        </select>
      </div>

      <div class="campo">
        <label>Unidade de compra</label>
        <select v-model="formulario.unidadeCompra">
          <option v-for="u in unidadesDisponiveis" :key="u" :value="u">{{ u }}</option>
        </select>
      </div>

      <div class="campo">
        <label>Quantidade comprada</label>
        <input
          type="number"
          min="0"
          step="any"
          v-model.number="formulario.quantidadeCompra"
          required
        />
      </div>

      <div class="campo">
        <label>Preço pago (R$)</label>
        <input
          type="number"
          min="0"
          step="any"
          v-model.number="formulario.precoCompra"
          required
        />
      </div>

      <div class="campo">
        <label>Estoque atual ({{ unidadeBaseDoFormulario }})</label>
        <input type="number" min="0" step="any" v-model.number="formulario.estoque" required />
      </div>

      <div class="acoes-form">
        <span class="custo-base-preview" v-if="custoBaseFormulario !== null">
          Custo base: {{ formatarMoeda(custoBaseFormulario) }} / {{ unidadeBaseDoFormulario }}
        </span>
        <button type="submit">{{ editandoId ? 'Salvar alterações' : 'Adicionar insumo' }}</button>
        <button type="button" v-if="editandoId" @click="cancelar">Cancelar</button>
      </div>
    </form>

    <table class="lista" v-if="insumos.length">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Compra</th>
          <th>Custo base</th>
          <th>Estoque</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in insumos" :key="i.id">
          <td>{{ i.nome }}</td>
          <td>{{ i.quantidadeCompra }} {{ i.unidadeCompra }} por {{ formatarMoeda(i.precoCompra) }}</td>
          <td>{{ formatarMoeda(custoBase(i)) }} / {{ unidadeBase(i) }}</td>
          <td>
            <input
              type="number"
              step="any"
              :value="i.estoque"
              @change="atualizarEstoque(i, $event.target.value)"
            />
            {{ unidadeBase(i) }}
          </td>
          <td class="acoes-linha">
            <button @click="editar(i)">Editar</button>
            <button class="perigo" @click="excluir(i.id)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Nenhum insumo cadastrado ainda.</p>
  </div>
</template>

<script>
import db from '../db';
import { custoBaseInsumo, converterParaBase } from '../calc';

const UNIDADES_POR_TIPO = {
  massa: ['kg', 'g'],
  volume: ['L', 'mL'],
  contagem: ['un', 'duzia'],
};

function formularioVazio() {
  return {
    nome: '',
    tipoUnidade: 'massa',
    unidadeCompra: 'kg',
    quantidadeCompra: null,
    precoCompra: null,
    estoque: 0,
  };
}

export default {
  name: 'Insumos',
  data() {
    return {
      insumos: db.getInsumos(),
      editandoId: null,
      formulario: formularioVazio(),
    };
  },
  computed: {
    unidadesDisponiveis() {
      return UNIDADES_POR_TIPO[this.formulario.tipoUnidade];
    },
    unidadeBaseDoFormulario() {
      return this.unidadeBase(this.formulario);
    },
    custoBaseFormulario() {
      if (!this.formulario.quantidadeCompra || !this.formulario.unidadeCompra) return null;
      return custoBaseInsumo(this.formulario);
    },
  },
  methods: {
    ajustarUnidade() {
      this.formulario.unidadeCompra = this.unidadesDisponiveis[0];
    },
    custoBase(insumo) {
      return custoBaseInsumo(insumo);
    },
    unidadeBase(insumo) {
      return converterParaBase(1, insumo.unidadeCompra).unidadeBase;
    },
    formatarMoeda(valor) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        valor || 0
      );
    },
    salvar() {
      if (this.editandoId) {
        const indice = this.insumos.findIndex((i) => i.id === this.editandoId);
        this.insumos.splice(indice, 1, { ...this.formulario, id: this.editandoId });
      } else {
        this.insumos.push({ ...this.formulario, id: Date.now().toString() });
      }
      db.setInsumos(this.insumos);
      this.cancelar();
    },
    editar(insumo) {
      this.editandoId = insumo.id;
      this.formulario = { ...insumo };
    },
    excluir(id) {
      this.insumos = this.insumos.filter((i) => i.id !== id);
      db.setInsumos(this.insumos);
    },
    atualizarEstoque(insumo, novoValor) {
      insumo.estoque = parseFloat(novoValor) || 0;
      db.setInsumos(this.insumos);
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
.acoes-form {
  display: flex;
  align-items: center;
  gap: 10px;
}
.custo-base-preview {
  font-size: 0.85rem;
  color: #6b7280;
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
.lista input[type='number'] {
  width: 80px;
  padding: 4px 6px;
}
.acoes-linha {
  display: flex;
  gap: 6px;
}
</style>
