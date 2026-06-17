<template>
  <div class="receitas">
    <div class="lista-receitas">
      <div class="topo-lista">
        <h2>Receitas</h2>
        <button @click="novaReceita">Nova receita</button>
      </div>
      <div class="scroll-lista">
        <div
          v-for="r in receitas"
          :key="r.id"
          class="item-receita"
          :class="{ ativa: receitaSelecionada && r.id === receitaSelecionada.id }"
          @click="selecionarReceita(r)"
        >
          <div class="info">
            <strong>{{ r.nome }}</strong>
            <span>Rendimento: {{ r.rendimento }} {{ r.unidadeRendimento }}</span>
          </div>
          <button class="perigo btn-mini" @click.stop="excluirReceita(r.id)">×</button>
        </div>
      </div>
    </div>

    <div class="detalhe-receita" v-if="receitaSelecionada">
      <div class="card">
        <div class="campo">
          <label>Nome da receita</label>
          <input v-model="receitaSelecionada.nome" @change="salvar" />
        </div>
        <div class="flex-row">
          <div class="campo">
            <label>Rende quanto? (ex: 10 fatias)</label>
            <input type="number" v-model.number="receitaSelecionada.rendimento" @change="salvar" />
          </div>
          <div class="campo">
            <label>Unidade</label>
            <select v-model="receitaSelecionada.unidadeRendimento" @change="salvar">
              <option v-for="opt in unidadesRendimento" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Ingredientes</h3>
        <table class="tabela-itens" v-show="receitaSelecionada.itens.length">
          <thead>
            <tr>
              <th>Ingrediente</th>
              <th>Qtd</th>
              <th>Custo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in receitaSelecionada.itens" :key="idx">
              <td>{{ nomeIngrediente(item.ingredienteId) }}</td>
              <td>{{ item.quantidade }} {{ item.unidade }}</td>
              <td>{{ formatarMoeda(custoItem(item)) }}</td>
              <td>
                <button class="perigo btn-mini" @click="removerItem(idx)">×</button>
              </td>
            </tr>
          </tbody>
        </table>

        <form class="add-item" @submit.prevent="adicionarItem">
          <div class="campo">
            <label>Ingrediente</label>
            <select v-model="novoItem.ingredienteId" required>
              <option disabled value="">Selecione...</option>
              <option v-for="i in ingredientes" :key="i.id" :value="i.id">{{ i.nome }}</option>
            </select>
          </div>
			<div class="campo">
			  <label>Quantidade</label>

			  <div class="qtd-com-unidade">
			    <input
			      type="number"
			      step="any"
			      v-model.number="novoItem.quantidade"
			      required
			    />

			    <span class="unidade-label">
			      {{ unidadeBaseNovoItem || 'unidade' }}
			    </span>
			  </div>
			</div>
          <button type="submit" :disabled="!ingredientes.length">Adicionar Ingrediente</button>
        </form>

        <p v-if="!ingredientes.length" class="dica">Cadastre ingredientes primeiro pra poder usá-los aqui.</p>
      </div>

      <div class="card">
        <h3>Resumo Financeiro</h3>
        <dl class="resumo">
          <dt>Custo dos ingredientes</dt>
          <dd>{{ formatarMoeda(resultadoPreco.custoIngredientes) }}</dd>
          <div class="campo-inline">
            <dt>Outros custos (R$)</dt>
            <input
              type="number"
              step="any"
              v-model.number="receitaSelecionada.custosAdicionais"
              @change="salvar"
            />
          </div>
          <div class="campo-inline lucro-campo">
            <dt>Lucro desejado (Markup)</dt>
            <div class="markup-input">
              <input
                type="number"
                step="0.1"
                min="1"
                v-model.number="receitaSelecionada.markup"
                @change="salvar"
              />
            </div>
          </div>
          <hr />
          <dt class="total">Custo Total</dt>
          <dd class="total">{{ formatarMoeda(resultadoPreco.custoTotal) }}</dd>
          <dt>Preço Sugerido</dt>
          <dd class="sugerido">{{ formatarMoeda(resultadoPreco.precoSugerido) }}</dd>
          <dt class="unitario">Custo por {{ receitaSelecionada.unidadeRendimento }}</dt>
          <dd class="unitario">
            {{ formatarMoeda(resultadoPreco.custoTotal / (receitaSelecionada.rendimento || 1)) }}
          </dd>
        </dl>
      </div>
    </div>
    <div class="sem-selecao" v-else>
      <p>Selecione uma receita ao lado ou crie uma nova.</p>
    </div>
  </div>
</template>

<script>
import db from '../db';
import { calcularReceita, custoItem, venderReceita, converterParaBase } from '../calc';

export default {
  name: 'Receitas',
  data() {
    return {
      receitas: db.getReceitas(),
      ingredientes: db.getIngredientes(),
      config: db.getConfig(),
      receitaSelecionada: null,
      novoItem: { ingredienteId: '', quantidade: null, unidade: '' },
      unidadesRendimento: ['fatias', 'unidade', 'pedaços', 'cento', 'potes', 'caixas', 'kg', 'g'],
    };
  },
  computed: {
    resultadoPreco() {
      if (!this.receitaSelecionada) return {};
      return calcularReceita(
        this.receitaSelecionada,
        this.buscarIngrediente,
        this.receitaSelecionada.markup || this.config.markup || 2
      );
    },
    unidadeBaseNovoItem() {
      const ingrediente = this.ingredientes.find((i) => i.id === this.novoItem.ingredienteId);
      return ingrediente ? converterParaBase(1, ingrediente.unidadeCompra).unidadeBase : '';
    },
  },
  methods: {
    buscarIngrediente(id) {
      return this.ingredientes.find((i) => i.id === id);
    },
    nomeIngrediente(id) {
      const ingrediente = this.buscarIngrediente(id);
      return ingrediente ? ingrediente.nome : '(ingrediente removido)';
    },
    custoItem(item) {
      const ingrediente = this.buscarIngrediente(item.ingredienteId);
      return ingrediente ? custoItem(item, ingrediente) : 0;
    },
    formatarMoeda(valor) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        valor || 0
      );
    },
    selecionarReceita(r) {
      this.receitaSelecionada = r;
    },
    novaReceita() {
      const nova = {
        id: Date.now().toString(),
        nome: 'Nova Receita',
        rendimento: 1,
        unidadeRendimento: 'unidade',
        itens: [],
        custosAdicionais: 0,
        markup: 2,
      };
      this.receitas.push(nova);
      this.receitaSelecionada = nova;
      this.salvar();
    },
    excluirReceita(id) {
      this.receitas = this.receitas.filter((r) => r.id !== id);
      if (this.receitaSelecionada?.id === id) this.receitaSelecionada = null;
      this.salvar();
    },
    adicionarItem() {
      const ingrediente = this.buscarIngrediente(this.novoItem.ingredienteId);
      this.receitaSelecionada.itens.push({
        ...this.novoItem,
        unidade: converterParaBase(1, ingrediente.unidadeCompra).unidadeBase,
      });
      this.salvar();
      this.novoItem = { ingredienteId: '', quantidade: null, unidade: '' };
    },
    removerItem(idx) {
      this.receitaSelecionada.itens.splice(idx, 1);
      this.salvar();
    },
    salvar() {
      db.setReceitas(this.receitas);
    },
  },
};
</script>

<style scoped>
.receitas {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  height: calc(100vh - 120px);
}
.lista-receitas {
  background: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.topo-lista {
  padding: 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.topo-lista h2 {
  margin: 0;
  font-size: 1rem;
}
.scroll-lista {
  flex: 1;
  overflow-y: auto;
}
.item-receita {
  padding: 12px;
  border-bottom: 1px solid #f9f9f9;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item-receita:hover {
  background: #fff8f8;
}
.item-receita.ativa {
  background: #fdf2f4;
  border-left: 4px solid #d97a8c;
}
.item-receita .info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-receita .info span {
  font-size: 0.75rem;
  color: #888;
}
.detalhe-receita {
  overflow-y: auto;
  padding-right: 4px;
}
.card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.card h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #d97a8c;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.campo label {
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
}
.campo input,
.campo select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.flex-row {
  display: flex;
  gap: 12px;
}
.flex-row .campo {
  flex: 1;
}
.tabela-itens {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}
.tabela-itens th {
  text-align: left;
  font-size: 0.8rem;
  color: #888;
  padding: 8px;
  border-bottom: 1px solid #eee;
}
.tabela-itens td {
  padding: 8px;
  border-bottom: 1px solid #f9f9f9;
  font-size: 0.9rem;
}
.add-item {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  background: #fdfaf8;
  padding: 10px;
  border-radius: 6px;
}
.add-item .campo {
  margin-bottom: 0;
}
.add-item select {
  width: 150px;
}
.add-item input {
  width: 80px;
}
.resumo dt {
  font-size: 0.85rem;
  color: #666;
  float: left;
  clear: left;
}
.resumo dd {
  font-size: 0.85rem;
  text-align: right;
  margin-bottom: 6px;
}
.resumo .total {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
  margin-top: 8px;
}
.resumo .sugerido {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2e7d32;
}
.resumo .unitario {
  font-size: 0.8rem;
  color: #888;
}
.campo-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.campo-inline input {
  width: 80px;
  text-align: right;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.markup-input {
  display: flex;
  align-items: center;
  gap: 4px;
}
.markup-input span {
  font-weight: bold;
  color: #d97a8c;
}
.venda-estoque {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 2px dashed #eee;
}
.btn-venda {
  width: 100%;
  background: #2e7d32;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 8px;
}
.btn-mini {
  padding: 2px 6px;
  font-size: 0.8rem;
}
.dica {
  font-size: 0.8rem;
  color: #d97a8c;
  font-style: italic;
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
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.qtd-com-unidade {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qtd-com-unidade input {
  width: 80px;
}

.unidade-label {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
}

@media (max-width: 800px) {
  .receitas {
    grid-template-columns: 1fr;
    height: auto;
  }
  .lista-receitas {
    max-height: 230px;
  }
  .add-item {
    flex-wrap: wrap;
  }
  .add-item .campo {
	flex: 1 1 100%;
  }
  .add-item select,
  .add-item input {
	width: 100%;
  }

}
</style>

