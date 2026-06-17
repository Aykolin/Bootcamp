# Confeit-o-matic

App desktop pra confeitaria do bootcamp, feito em Electron + Vue 2.


### Como roda na prática

1. `npm install` instala tudo (Electron, Vue, Vite, electron-store...).
2. `npm run dev` faz duas coisas ao mesmo tempo:
   - o **Vite** sobe um servidor local (tipo `http://localhost:5173`) servindo
     o Vue com hot-reload — assim como um projeto Vue/React comum;
   - o **Electron** abre, roda o `main.js`, e a janela carrega essa URL do
     Vite em vez de um arquivo `.html` fixo. Toda vez que você salva um
     arquivo `.vue`, a tela atualiza sozinha, sem precisar reiniciar o app.
3. Pra fechar, é só fechar a janela (ou Ctrl+C no terminal onde rodou
   `npm run dev`).

## Como rodar

```sh
npm install # só na primeira vez (ou quando mudar dependências)
npm run dev  # abre o app
```

## Estrutura do projeto

```
src/
  main.js            # processo principal: cria a janela do Electron
  db.js               # lê/grava as listas no electron-store
  calc.js             # as contas: conversão de unidade, custo, preço, venda
  renderer.js          # ponto de entrada do Vue (monta o App.vue na página)
  App.vue              # layout com as abas (Insumos, Receitas, ...)
  views/
    Insumos.vue
    Receitas.vue
    CustosFixos.vue
    Caixa.vue
index.html             # página HTML que o Vite/Electron carregam
vite.config.js         # configuração do Vite + plugins do Electron
```

## Onde ficam os dados

Não tem banco de dados nem servidor: o `db.js` usa **electron-store**, que
salva tudo num arquivo JSON simples na pasta de dados do usuário do Windows
(algo como `%APPDATA%\confeit-o-matic\config.json`). Apagar esse arquivo
"zera" o app.

## Empacotar (gerar o .exe)

```sh
npm run build
```

Isso builda o Vue (Vite) e empacota tudo com `electron-builder`, alvo
Windows, conforme o spec.
