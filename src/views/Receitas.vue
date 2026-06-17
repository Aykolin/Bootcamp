<template>
  <div class="tela-receitas">
    <div class="coluna-lista">
      <h2>Receitas</h2>

      <button class="botao-nova" @click="novaReceita">+ Nova receita</button>

      <ul class="lista-receitas">
        <li
          v-for="r in receitas"
          :key="r.id"
          :class="{ ativa: r.id === receitaSelecionadaId }"
          @click="selecionar(r.id)"
        >
          <strong>{{ r.nome }}</strong>
          <span>{{ r.rendimento }} {{ r.unidadeRendimento }}</span>
        </li>
      </ul>
      <p v-if="!receitas.length">Nenhuma receita cadastrada ainda.</p>
    </div>

    <div class="coluna-detalhe" v-if="formulario">
      <form class="form-card" @submit.prevent="salvarReceita">
        <div class="campo">
          <label>Nome</label>
          <input v-model="formulario.nome" required placeholder="ex.: Bolo de cenoura" />
        </div>
        <div class="campo">
          <label>Rendimento</label>
          <input type="number" min="1" step="1" v-model.number="formulario.rendimento" required />
        </div>
        <div class="campo">
          <label>Unidade do rendimento</label>
          <input v-model="formulario.unidadeRendimento" required placeholder="ex.: fatias" />
        </div>
        <div class="campo">
          <label>Margem (%)</label>
          <input type="number" min="0" step="any" v-model.number="formulario.margem" required />
        </div>
        <div class="campo">
          <label>Custos adicionais por lote (R$)</label>
          <input
            type="number"
            min="0"
            step="any"
            v-model.number="formulario.custosAdicionais"
          />
        </div>
        <div class="acoes-form">
          <button type="submit">{{ editandoId ? 'Salvar alterações' : 'Criar receita' }}</button>
          <button type="button" v-if="editandoId" @click="cancelarEdicao">Cancelar</button>
        </div>
      </form>
    </div>

    <div class="coluna-detalhe" v-else-if="receitaSelecionada">
      <div class="cabecalho-detalhe">
        <h3>{{ receitaSelecionada.nome }}</h3>
        <div class="acoes-form">
          <button @click="editarReceita(receitaSelecionada)">Editar</button>
          <button class="perigo" @click="excluirReceita(receitaSelecionada.id)">Excluir</button>
        </div>
      </div>
      <p class="info-receita">
        Rendimento: {{ receitaSelecionada.rendimento }} {{ receitaSelecionada.unidadeRendimento }}
        · Margem: {{ receitaSelecionada.margem }}% · Custos adicionais:
        {{ formatarMoeda(receitaSelecionada.custosAdicionais) }}
      </p>

      <h4>Itens da receita</h4>
      <table class="lista" v-if="receitaSelecionada.itens.length">
        <thead>
          <tr>
            <th>Insumo</th>
            <th>Quantidade</th>
            <th>Custo do item</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, indice) in receitaSelecionada.itens" :key="indice">
            <td>{{ nomeInsumo(item.insumoId) }}</td>
            <td>{{ item.quantidade }} {{ item.unidade }}</td>
            <td>{{ formatarMoeda(custoDoItem(item)) }}</td>
            <td>
              <button class="perigo" @click="removerItem(indice)">Remover</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Nenhum item adicionado ainda.</p>

      <form class="form-card" @submit.prevent="adicionarItem">
        <div class="campo">
          <label>Insumo</label>
          <select v-model="novoItem.insumoId" required>
            <option value="" disabled>Selecione</option>
            <option v-for="i in insumos" :key="i.id" :value="i.id">{{ i.nome }}</option>
          </select>
        </div>
        <div class="campo">
          <label>Quantidade {{ unidadeBaseDoNovoItem ? `(${unidadeBaseDoNovoItem})` : '' }}</label>
          <input type="number" min="0" step="any" v-model.number="novoItem.quantidade" required />
        </div>
        <div class="acoes-form">
          <button type="submit" :disabled="!insumos.length">Adicionar item</button>
        </div>
      </form>
      <p v-if="!insumos.length" class="dica">Cadastre insumos primeiro pra poder usá-los aqui.</p>

      <div class="painel-preco" v-if="resultadoPreco">
        <h4>Preço</h4>
        <dl>
          <dt>Custo dos insumos</dt>
          <dd>{{ formatarMoeda(resultadoPreco.custoInsumos) }}</dd>
          <dt>Rateio de custos fixos</dt>
          <dd>{{ formatarMoeda(resultadoPreco.rateioFixos) }}</dd>
          <dt>Custo total</dt>
          <dd>{{ formatarMoeda(resultadoPreco.custoTotal) }}</dd>
          <dt>Preço sugerido</dt>
          <dd class="destaque">{{ formatarMoeda(resultadoPreco.precoSugerido) }}</dd>
          <dt>Custo por {{ unidadeSingular }}</dt>
          <dd>{{ formatarMoeda(resultadoPreco.custoPorPorcao) }}</dd>
          <dt>Preço por {{ unidadeSingular }}</dt>
          <dd>{{ formatarMoeda(resultadoPreco.precoPorPorcao) }}</dd>
        </dl>

        <div class="venda">
          <label>Vender</label>
          <input type="number" min="1" step="1" v-model.number="quantidadeVenda" />
          <span>lote(s) de {{ receitaSelecionada.rendimento }} {{ receitaSelecionada.unidadeRendimento }}</span>
          <button @click="vender" :disabled="!receitaSelecionada.itens.length">Vender</button>
        </div>
        <p v-if="mensagemVenda" class="mensagem-venda">{{ mensagemVenda }}</p>
      </div>
    </div>

    <div class="coluna-detalhe vazia" v-else>
      <p>Selecione uma receita na lista ou crie uma nova.</p>
    </div>
  </div>
</template>

<script>
import db from '../db';
import { calcularReceita, converterParaBase, custoItem, venderReceita } from '../calc';

function formularioVazio() {
  return {
    nome: '',
    rendimento: null,
    unidadeRendimento: '',
    margem: 0,
    custosAdicionais: 0,
    itens: [],
  };
}

export default {
  name: 'Receitas',
  data() {
    return {
      receitas: db.getReceitas(),
      insumos: db.getInsumos(),
      custosFixos: db.getCustosFixos(),
      config: db.getConfig(),
      receitaSelecionadaId: null,
      editandoId: null,
      formulario: null,
      novoItem: { insumoId: '', quantidade: null, unidade: '' },
      quantidadeVenda: 1,
      mensagemVenda: '',
    };
  },
  computed: {
    receitaSelecionada() {
      return this.receitas.find((r) => r.id === this.receitaSelecionadaId) || null;
    },
    unidadeSingular() {
      if (!this.receitaSelecionada) return '';
      return this.receitaSelecionada.unidadeRendimento;
    },
    unidadeBaseDoNovoItem() {
      const insumo = this.insumos.find((i) => i.id === this.novoItem.insumoId);
      return insumo ? converterParaBase(1, insumo.unidadeCompra).unidadeBase : '';
    },
    resultadoPreco() {
      if (!this.receitaSelecionada) return null;
      return calcularReceita(
        this.receitaSelecionada,
        this.buscarInsumo,
        this.custosFixos,
        this.config
      );
    },
  },
  methods: {
    buscarInsumo(id) {
      return this.insumos.find((i) => i.id === id);
    },
    nomeInsumo(id) {
      const insumo = this.buscarInsumo(id);
      return insumo ? insumo.nome : '(insumo removido)';
    },
    custoDoItem(item) {
      const insumo = this.buscarInsumo(item.insumoId);
      return insumo ? custoItem(item, insumo) : 0;
    },
    formatarMoeda(valor) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        valor || 0
      );
    },
    selecionar(id) {
      this.receitaSelecionadaId = id;
      this.formulario = null;
      this.editandoId = null;
      this.mensagemVenda = '';
    },
    novaReceita() {
      this.receitaSelecionadaId = null;
      this.editandoId = null;
      this.formulario = formularioVazio();
    },
    editarReceita(receita) {
      this.editandoId = receita.id;
      this.formulario = { ...receita, itens: receita.itens.slice() };
    },
    cancelarEdicao() {
      this.formulario = null;
      this.editandoId = null;
    },
    salvarReceita() {
      if (this.editandoId) {
        const indice = this.receitas.findIndex((r) => r.id === this.editandoId);
        this.receitas.splice(indice, 1, { ...this.formulario, id: this.editandoId });
        this.receitaSelecionadaId = this.editandoId;
      } else {
        const nova = { ...this.formulario, id: Date.now().toString() };
        this.receitas.push(nova);
        this.receitaSelecionadaId = nova.id;
      }
      db.setReceitas(this.receitas);
      this.formulario = null;
      this.editandoId = null;
    },
    excluirReceita(id) {
      this.receitas = this.receitas.filter((r) => r.id !== id);
      db.setReceitas(this.receitas);
      if (this.receitaSelecionadaId === id) this.receitaSelecionadaId = null;
    },
    adicionarItem() {
      this.receitaSelecionada.itens.push({
        ...this.novoItem,
        unidade: this.unidadeBaseDoNovoItem,
      });
      db.setReceitas(this.receitas);
      this.novoItem = { insumoId: '', quantidade: null, unidade: '' };
    },
    removerItem(indice) {
      this.receitaSelecionada.itens.splice(indice, 1);
      db.setReceitas(this.receitas);
    },
    vender() {
      const lancamento = venderReceita(
        this.receitaSelecionada,
        this.buscarInsumo,
        this.quantidadeVenda,
        this.resultadoPreco.precoSugerido
      );
      db.setInsumos(this.insumos);
      const caixa = db.getCaixa();
      caixa.push(lancamento);
      db.setCaixa(caixa);
      this.mensagemVenda = `Venda registrada: ${this.formatarMoeda(lancamento.valor)} no caixa.`;
    },
  },
};
</script>

<style scoped>
.tela-receitas {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.coluna-lista {
  width: 260px;
  flex-shrink: 0;
}
.coluna-detalhe {
  flex: 1;
  min-width: 0;
}
.coluna-detalhe.vazia {
  color: #6b7280;
}
.botao-nova {
  width: 100%;
  margin-bottom: 12px;
}
.lista-receitas {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lista-receitas li {
  background: white;
  border-radius: 6px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.lista-receitas li.ativa {
  outline: 2px solid #d97a8c;
}
.lista-receitas li span {
  font-size: 0.8rem;
  color: #6b7280;
}
.cabecalho-detalhe {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.info-receita {
  color: #6b7280;
  font-size: 0.9rem;
}
.form-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 16px;
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
button {
  background: #d97a8c;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}
button:disabled {
  background: #ccc;
  cursor: not-allowed;
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
  margin-bottom: 16px;
}
.lista th,
.lista td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #f0e7e2;
  font-size: 0.9rem;
}
.dica {
  font-size: 0.8rem;
  color: #6b7280;
}
.painel-preco {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.painel-preco dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 16px;
  margin: 0 0 16px;
}
.painel-preco dt {
  color: #6b7280;
  font-size: 0.85rem;
}
.painel-preco dd {
  margin: 0;
  font-weight: 600;
}
.painel-preco dd.destaque {
  color: #d97a8c;
  font-size: 1.1rem;
}
.venda {
  display: flex;
  align-items: center;
  gap: 8px;
}
.venda input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.mensagem-venda {
  margin-top: 10px;
  color: #2f7a3a;
  font-weight: 600;
}
</style>
