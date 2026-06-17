<template>
  <div id="app">
    <header class="topo">
      <h1>🧁 Confeit-o-matic</h1>
      <nav>
        <button
          v-for="aba in abas"
          :key="aba.nome"
          :class="{ ativa: abaAtual === aba.nome }"
          @click="abaAtual = aba.nome"
        >
          {{ aba.titulo }}
        </button>
      </nav>
    </header>

    <main>
      <component :is="abaAtual" />
    </main>
  </div>
</template>

<script>
import Insumos from './views/Insumos.vue';
import Receitas from './views/Receitas.vue';
import CustosFixos from './views/CustosFixos.vue';
import Caixa from './views/Caixa.vue';

export default {
  name: 'App',
  components: { Insumos, Receitas, CustosFixos, Caixa },
  data() {
    return {
      abaAtual: 'Insumos',
      abas: [
        { nome: 'Insumos', titulo: 'Insumos' },
        { nome: 'Receitas', titulo: 'Receitas' },
        { nome: 'CustosFixos', titulo: 'Custos fixos' },
        { nome: 'Caixa', titulo: 'Caixa' },
      ],
    };
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #fdf6f0;
  color: #3a2e2c;
}
.topo {
  background: #d97a8c;
  color: white;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.topo h1 {
  margin: 0;
  font-size: 1.3rem;
}
.topo nav {
  display: flex;
  gap: 8px;
}
.topo button {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
}
.topo button.ativa {
  background: white;
  color: #d97a8c;
  font-weight: bold;
}
main {
  padding: 20px;
}
</style>
