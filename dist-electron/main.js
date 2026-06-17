"use strict";
const { app, BrowserWindow } = require("electron");
const path = require("path");
const Store = require("electron-store");
Store.initRenderer();
function criarJanela() {
  const janela = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    janela.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    janela.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
app.whenReady().then(criarJanela);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) criarJanela();
});
