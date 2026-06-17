# Confeit-o-matic

App pra confeitaria do bootcamp, feito em Vue 2 + Vite, empacotado pra Android
com **Capacitor**.

### Como roda na prática

Por baixo dos panos, isso aqui é uma página web (Vue) normal. O Capacitor só
empacota essa página dentro de um WebView nativo e dá acesso a APIs do
celular quando precisar (hoje o app não usa nenhuma — só guarda dados no
`localStorage` do dispositivo).

1. `npm install` instala tudo (Vue, Vite, Capacitor...).
2. `npm run dev` sobe o Vite com hot-reload — dá pra desenvolver e testar
   tudo direto no navegador (`http://localhost:5173`), sem precisar de
   celular nem emulador.
3. Quando quiser testar/empacotar pra Android de verdade, ver a seção
   **Build pra Android** abaixo.

## Como rodar (desenvolvimento, no navegador)

```sh
npm install # só na primeira vez (ou quando mudar dependências)
npm run dev  # abre http://localhost:5173 com hot-reload
```

## Estrutura do projeto

```
src/
  db.js               # lê/grava as listas no localStorage do dispositivo
  calc.js             # as contas: conversão de unidade, custo, preço, venda
  renderer.js          # ponto de entrada do Vue (monta o App.vue na página)
  App.vue              # layout com as abas (Ingredientes, Receitas, ...)
  views/
    Ingredientes.vue   # cadastro de ingredientes (preço, unidade, estoque)
    Receitas.vue
index.html             # página HTML que o Vite/Capacitor carregam
vite.config.js         # configuração do Vite
capacitor.config.json  # configuração do Capacitor (nome do app, pasta web)
android/                # projeto nativo Android gerado pelo Capacitor
```

> O layout é responsivo: empilha colunas, encolhe formulários e deixa
> tabelas largas com rolagem horizontal em telas estreitas (celular).

## Onde ficam os dados

Não tem banco de dados nem servidor: o `db.js` usa o **localStorage** do
navegador/WebView. No celular isso persiste entre aberturas do app
normalmente (fica salvo nos dados do app). Desinstalar o app ou limpar os
dados dele no Android "zera" o conteúdo.

## Build pra Android

Já está tudo instalado e configurado nesta máquina (JDK 17 + Android SDK
command-line, sem precisar da instalação completa do Android Studio):

- JDK 17: `C:\dev-tools\jdk-17.0.19+10`
- Android SDK: `C:\dev-tools\android-sdk`
- As variáveis `JAVA_HOME` e `ANDROID_HOME` foram salvas como variáveis de
  ambiente do usuário (`setx`/Painel de Controle) — **abra um terminal novo**
  pra elas valerem (terminais já abertos antes da configuração não veem a
  mudança).

Pra gerar o `.apk` de debug (instalável direto, sem precisar assinar):

```sh
npm run build              # builda o Vue (gera dist/)
npx cap sync android        # copia o build pro projeto Android
cd android
./gradlew assembleDebug     # gera o APK
```

O APK fica em `android/app/build/outputs/apk/debug/app-debug.apk`. Copie esse
arquivo pro celular (ou `adb install app-debug.apk` com o celular em modo
desenvolvedor/USB debugging conectado) pra instalar.

Se quiser uma interface gráfica em vez de linha de comando (emulador visual,
editar o ícone do app, gerar `.apk` assinado pra publicar na Play Store),
instale o **Android Studio** (https://developer.android.com/studio) — ele
detecta o SDK que já está em `C:\dev-tools\android-sdk` automaticamente, e
`npm run android:open` abre o projeto direto nele.

### Se quiser reinstalar/atualizar o SDK depois

```sh
npm run android:sync   # builda o Vue e copia pro projeto Android
```

### Dica: testar no celular sem instalar nada

Com o celular na mesma rede Wi-Fi do PC, `npm run dev` expõe o app em
`http://<ip-do-pc>:5173` (o terminal mostra esse endereço como "Network").
Dá pra abrir direto no navegador do celular pra conferir o layout, sem
precisar gerar APK.
