const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("lockIt", {
  toggleGrayscale: (enable) => ipcRenderer.invoke("toggle-grayscale", enable),
  openApp: (appPath) => ipcRenderer.invoke("open-app", appPath),
  openFolder: (folderPath) => ipcRenderer.invoke("open-folder", folderPath),
  setAutoLaunch: (enable) => ipcRenderer.invoke("set-auto-launch", enable),
  getAutoLaunch: () => ipcRenderer.invoke("get-auto-launch"),
  pickApp: () => ipcRenderer.invoke("pick-app"),
});
