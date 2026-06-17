const { defineConfig } = require('vite');
const vue2 = require('@vitejs/plugin-vue2').default;

module.exports = defineConfig({
  base: './',
  plugins: [vue2()],
  server: {
    host: true,
  },
});
