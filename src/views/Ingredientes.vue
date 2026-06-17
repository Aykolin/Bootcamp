<template>
  <div>
    <h2>Ingredientes</h2>

    <form class="form-card" @submit.prevent="salvar">
      <div class="campo">
        <label>Nome</label>
        <input v-model="formulario.nome" required placeholder="ex.: Arroz" />
      </div>

      <div class="campo">
        <label>Unidade</label>
        <select v-model="formulario.unidadeCompra">
          <option v-for="u in todasUnidades" :key="u" :value="u">{{ u }}</option>
        </select>
      </div>

      <div class="campo">
        <label>Quantidade</label>
        <input
          type="number"
          min="0"
          step="any"
          v-model.number="formulario.quantidadeCompra"
          required
        />
      </div>

      <div class="campo">
        <label>Preço (R$)</label>
        <input
          type="number"
          min="0"
          step="any"
          v-model.number="formulario.precoCompra"
          required
        />
      </div>

      <div class="campo">
        <label>Estoque ({{ unidadeBaseDoFormulario }})</label>
        <input
          type="number"
          min="0"
          step="any"
          v-model.number="formulario.estoque"
          required
        />
      </div>

      <div class="acoes-form">
        <span class="custo-base-preview" v-if="custoBaseFormulario !== null">
          Custo base: {{ formatarMoeda(custoBaseFormulario) }} / {{ unidadeBaseDoFormulario }}
        </span>
        <button class="submit" type="submit">{{ editandoId ? 'Salvar alterações' : 'Adicionar' }}</button>
        <button type="button" v-if="editandoId" @click="cancelar">Cancelar</button>
      </div>
    </form>

    <div class="lista-container" v-if="ingredientes.length">
      <!-- Desktop Header -->
      <div class="header-desktop">
        <span>Nome</span>
        <span>Compra</span>
        <span>Custo base</span>
        <span>Estoque</span>
        <span>Ações</span>
      </div>

      <!-- Ingredientes Items -->
      <div v-for="i in ingredientes" :key="i.id" class="item-ingrediente">
        <div class="info-principal">
          <strong class="nome">{{ i.nome }}</strong>
          <div class="detalhes-mobile">
            <span class="label">Compra:</span> {{ i.quantidadeCompra }} {{ i.unidadeCompra }} por {{ formatarMoeda(i.precoCompra) }}
          </div>
          <div class="detalhes-mobile">
            <span class="label">Custo base:</span> {{ formatarMoeda(custoBase(i)) }} / {{ unidadeBase(i) }}
          </div>
        </div>

        <div class="col-compra desktop-only">
          {{ i.quantidadeCompra }} {{ i.unidadeCompra }} por {{ formatarMoeda(i.precoCompra) }}
        </div>

        <div class="col-custo desktop-only">
          {{ formatarMoeda(custoBase(i)) }} / {{ unidadeBase(i) }}
        </div>

        <div class="col-estoque">
          <span class="label-mobile">Estoque:</span>
          <span :class="{ 'baixo-estoque': i.estoque <= 0 }">
            {{ i.estoque }} {{ unidadeBase(i) }}
          </span>
        </div>

        <div class="acoes-linha">
          <button @click="editar(i)">Editar</button>
          <button class="perigo" @click="excluir(i.id)">Excluir</button>
        </div>
      </div>
    </div>
    <p v-else>Nenhum ingrediente cadastrado ainda.</p>
  </div>
</template>

<script>
import db from '../db';
import { custoBaseIngrediente, converterParaBase } from '../calc';

function formularioVazio() {
  return {
    nome: '',
    unidadeCompra: 'kg',
    quantidadeCompra: null,
    precoCompra: null,
    estoque: 0,
  };
}

export default {
  name: 'Ingredientes',
  data() {
    return {
      ingredientes: db.getIngredientes(),
      editandoId: null,
      formulario: formularioVazio(),
      todasUnidades: ['unidade', 'kg', 'g', 'L', 'mL'],
    };
  },
  computed: {
    unidadeBaseDoFormulario() {
      return this.unidadeBase(this.formulario);
    },
    custoBaseFormulario() {
      if (!this.formulario.quantidadeCompra || !this.formulario.unidadeCompra) return null;
      return custoBaseIngrediente(this.formulario);
    },
  },
  methods: {
    custoBase(ingrediente) {
      return custoBaseIngrediente(ingrediente);
    },
    unidadeBase(ingrediente) {
      return converterParaBase(1, ingrediente.unidadeCompra).unidadeBase;
    },
    formatarMoeda(valor) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        valor || 0
      );
    },
    salvar() {
      const ingredienteParaSalvar = { ...this.formulario };

      if (!this.editandoId) {
        if (ingredienteParaSalvar.estoque === 0) {
          const { valor } = converterParaBase(
            ingredienteParaSalvar.quantidadeCompra,
            ingredienteParaSalvar.unidadeCompra
          );
          ingredienteParaSalvar.estoque = valor;
        }
      }

      if (this.editandoId) {
        const indice = this.ingredientes.findIndex((i) => i.id === this.editandoId);
        this.ingredientes.splice(indice, 1, { ...ingredienteParaSalvar, id: this.editandoId });
      } else {
        this.ingredientes.push({ ...ingredienteParaSalvar, id: Date.now().toString() });
      }
      db.setIngredientes(this.ingredientes);
      this.cancelar();
    },
    editar(ingrediente) {
      this.editandoId = ingrediente.id;
      this.formulario = { ...ingrediente };
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    excluir(id) {
      if (confirm('Tem certeza que deseja excluir este ingrediente?')) {
        this.ingredientes = this.ingredientes.filter((i) => i.id !== id);
        db.setIngredientes(this.ingredientes);
      }
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
  gap: 8px; /* Reduzido de 12px para 8px */
  align-items: flex-end;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.85rem;
  flex: 1 1 auto; /* Alterado de 200px para auto */
  width: 100%; /* Garante que ocupe a largura total no mobile */
  margin-bottom: 4px;
}
.campo input,
.campo select {
  padding: 8px 10px; /* Reduzido de 10px 12px para 8px 10px */
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem; /* Levemente menor para mobile */
}
.acoes-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px; /* Reduzido de 12px para 8px */
  width: 100%;
  margin-top: 4px; /* Reduzido de 8px para 4px */
}
.custo-base-preview {
  font-size: 0.9rem;
  color: #d97a8c;
  font-weight: bold;
}
button {
  background: #d97a8c;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}
button:active {
  opacity: 0.8;
}
button.perigo {
  background: #b3413a;
}

/* Lista Responsiva */
.lista-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-desktop {
  display: none;
  padding: 12px;
  font-weight: bold;
  color: #666;
  font-size: 0.85rem;
  border-bottom: 2px solid #eee;
}

.item-ingrediente {
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-principal .nome {
  font-size: 1.1rem;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.detalhes-mobile {
  font-size: 0.85rem;
  color: #666;
  margin-top: 2px;
}

.label {
  font-weight: bold;
  color: #888;
}

.label-mobile {
  font-weight: bold;
  margin-right: 4px;
  color: #888;
}

.baixo-estoque {
  color: #b3413a;
  font-weight: bold;
}

.acoes-linha {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  border-top: 1px solid #f5f5f5;
  padding-top: 12px;
}

.acoes-linha button {
  flex: 1;
  padding: 8px;
}

.desktop-only {
  display: none;
}

.submit {
  align-self: flex-end;
}

/* Desktop Styles */
@media (min-width: 768px) {
  .header-desktop {
    display: grid;
    grid-template-columns: 2fr 2fr 1.5fr 1fr 1.5fr;
    gap: 16px;
  }

  .item-ingrediente {
    flex-direction: row;
    align-items: center;
    display: grid;
    grid-template-columns: 2fr 2fr 1.5fr 1fr 1.5fr;
    gap: 16px;
    padding: 12px 16px;
    border-left: none;
    border-bottom: 1px solid #eee;
    border-radius: 0;
    box-shadow: none;
  }
  
  .item-ingrediente:last-child {
    border-bottom: none;
  }

  .detalhes-mobile, .label-mobile {
    display: none;
  }

  .desktop-only {
    display: block;
    font-size: 0.9rem;
    color: #444;
  }

  .col-estoque {
    font-size: 0.9rem;
  }

  .acoes-linha {
    margin-top: 0;
    border-top: none;
    padding-top: 0;
  }

  .acoes-form {
    flex-direction: row;
    align-items: center;
  }
}

@media (max-width: 600px) {
  .form-card {
    flex-direction: column;
    align-items: stretch;
  }
  .campo {
    width: 100%;
  }
}
</style>
