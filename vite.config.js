const { defineConfig } = require('vite');
const vue2 = require('@vitejs/plugin-vue2').default;
const electron = require('vite-plugin-electron/simple').default;
const renderer = require('vite-plugin-electron-renderer').default;

module.exports = defineConfig({
  plugins: [
    vue2(),
    electron({
      main: {
        entry: 'src/main.js',
      },
    }),
    renderer(),
  ],
});
