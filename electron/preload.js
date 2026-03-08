const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("lockIt", {
  toggleGrayscale: (enable) => ipcRenderer.invoke("toggle-grayscale", enable),
  openApp: (appPath) => ipcRenderer.invoke("open-app", appPath),
  openFolder: (folderPath) => ipcRenderer.invoke("open-folder", folderPath),
  setAutoLaunch: (enable) => ipcRenderer.invoke("set-auto-launch", enable),
  getAutoLaunch: () => ipcRenderer.invoke("get-auto-launch"),
  pickApp: () => ipcRenderer.invoke("pick-app"),
  storeRead: (filename) => ipcRenderer.invoke("store-read", filename),
  storeWrite: (filename, data) => ipcRenderer.invoke("store-write", filename, data),
  getWorkArea: () => ipcRenderer.invoke("get-work-area"),
  arrangeApp: (appName, bounds) => ipcRenderer.invoke("arrange-app", appName, bounds),
  closeOtherApps: () => ipcRenderer.invoke("close-other-apps"),
  fullscreenApp: (appName) => ipcRenderer.invoke("fullscreen-app", appName),
  createDesktops: (count) => ipcRenderer.invoke("create-desktops", count),
  switchDesktop: (desktopIndex) => ipcRenderer.invoke("switch-desktop", desktopIndex),
});
