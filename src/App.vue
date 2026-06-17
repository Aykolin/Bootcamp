<template>
  <div id="app">
    <header class="topo">
      <h1>Confeit-o-matic</h1>
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
import Ingredientes from './views/Ingredientes.vue';
import Receitas from './views/Receitas.vue';

export default {
  name: 'App',
  components: { Ingredientes, Receitas },
  data() {
    return {
      abaAtual: 'Ingredientes',
      abas: [
        { nome: 'Ingredientes', titulo: 'Ingredientes' },
        { nome: 'Receitas', titulo: 'Receitas' },
      ],
    };
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}
html,
body {
  margin: 0;
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #fdf6f0;
  color: #3a2e2c;
  /* evita zoom indesejado e barra de rolagem horizontal no Android */
  overflow-x: hidden;
}
.topo {
  background: #d97a8c;
  color: white;
  padding: 12px 16px;
  padding-top: max(12px, env(safe-area-inset-top));
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.topo h1 {
  margin: 0;
  font-size: 1.1rem;
  white-space: nowrap;
}
.topo nav {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.topo button {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  flex-shrink: 0;
}
.topo button.ativa {
  background: white;
  color: #d97a8c;
  font-weight: bold;
}
main {
  padding: 16px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

@media (max-width: 600px) {
  .topo {
    padding: 10px 12px;
  }
  .topo h1 {
    font-size: 1rem;
  }
  main {
    padding: 12px;
  }
}
</style>
