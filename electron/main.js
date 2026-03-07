const { app, BrowserWindow, Tray, ipcMain, nativeImage, screen, dialog } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let mainWindow = null;
let tray = null;
let isQuitting = false;
let isDialogOpen = false;

const isDev = !app.isPackaged;

function createTrayIcon() {
  // Create a simple 22x22 template icon for macOS menu bar
  const iconSize = 22;
  const canvas = Buffer.alloc(iconSize * iconSize * 4, 0);

  // Draw a simple lock shape pixel by pixel (white on transparent)
  // Shackle (top arc)
  for (let y = 2; y <= 9; y++) {
    for (let x = 6; x <= 15; x++) {
      const isEdge =
        (x === 6 || x === 7 || x === 14 || x === 15) && y >= 4 ||
        (y === 2 || y === 3) && x >= 8 && x <= 13;
      if (isEdge) {
        const idx = (y * iconSize + x) * 4;
        canvas[idx] = 255;     // R
        canvas[idx + 1] = 255; // G
        canvas[idx + 2] = 255; // B
        canvas[idx + 3] = 255; // A
      }
    }
  }

  // Body (rectangle)
  for (let y = 10; y <= 19; y++) {
    for (let x = 4; x <= 17; x++) {
      const idx = (y * iconSize + x) * 4;
      canvas[idx] = 255;
      canvas[idx + 1] = 255;
      canvas[idx + 2] = 255;
      canvas[idx + 3] = 255;
    }
  }

  // Keyhole (dark circle + line in body)
  for (let y = 13; y <= 17; y++) {
    for (let x = 9; x <= 12; x++) {
      const isKeyhole =
        (y <= 15 && ((x - 10.5) ** 2 + (y - 14) ** 2) <= 3) ||
        (y > 15 && x >= 10 && x <= 11);
      if (isKeyhole) {
        const idx = (y * iconSize + x) * 4;
        canvas[idx] = 0;
        canvas[idx + 1] = 0;
        canvas[idx + 2] = 0;
        canvas[idx + 3] = 255;
      }
    }
  }

  const icon = nativeImage.createFromBuffer(canvas, {
    width: iconSize,
    height: iconSize,
  });
  icon.setTemplateImage(true);
  return icon;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 480,
    show: isDev,
    frame: isDev,
    transparent: !isDev,
    resizable: isDev,
    skipTaskbar: !isDev,
    alwaysOnTop: !isDev,
    hasShadow: true,
    vibrancy: isDev ? undefined : "under-window",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist-vue", "index.html"));
  }

  mainWindow.on("blur", () => {
    if (isDev) return;
    if (!mainWindow.webContents.isDevToolsOpened() && !isDialogOpen) {
      mainWindow.hide();
    }
  });

  mainWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip("Lock It");

  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      positionWindow();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function positionWindow() {
  if (!tray || !mainWindow) return;
  const trayBounds = tray.getBounds();
  const windowBounds = mainWindow.getBounds();
  const display = screen.getDisplayMatching(trayBounds);

  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  );
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  mainWindow.setPosition(
    Math.max(display.bounds.x, Math.min(x, display.bounds.x + display.bounds.width - windowBounds.width)),
    y
  );
}

// ===== IPC HANDLERS =====

// Toggle macOS grayscale
ipcMain.handle("toggle-grayscale", async (_event, enable) => {
  return new Promise((resolve, reject) => {
    const val = enable ? "true" : "false";
    exec(
      `osascript -e 'tell application "System Events" to tell every desktop to set picture rotation to 0' && defaults write com.apple.universalaccess grayscale -bool ${val} && osascript -e 'tell application "System Preferences" to quit'`,
      (error) => {
        if (error) {
          // Fallback: try AppleScript approach
          const script = enable
            ? `do shell script "defaults write com.apple.universalaccess grayscale -bool true"`
            : `do shell script "defaults write com.apple.universalaccess grayscale -bool false"`;
          exec(`osascript -e '${script}'`, (err2) => {
            if (err2) reject(err2.message);
            else resolve(true);
          });
        } else {
          resolve(true);
        }
      }
    );
  });
});

// Open an application
ipcMain.handle("open-app", async (_event, appPath) => {
  return new Promise((resolve, reject) => {
    exec(`open -a "${appPath}"`, (error) => {
      if (error) reject(error.message);
      else resolve(true);
    });
  });
});

// Open a folder
ipcMain.handle("open-folder", async (_event, folderPath) => {
  return new Promise((resolve, reject) => {
    exec(`open "${folderPath}"`, (error) => {
      if (error) reject(error.message);
      else resolve(true);
    });
  });
});

// Pick an application via file dialog
ipcMain.handle("pick-app", async () => {
  isDialogOpen = true;
  await app.dock?.show();
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select Application",
    defaultPath: "/Applications",
    properties: ["openFile"],
  });
  app.dock?.hide();
  isDialogOpen = false;
  if (result.canceled || result.filePaths.length === 0) return null;
  const fullPath = result.filePaths[0];
  const name = path.basename(fullPath, ".app");
  return { name, path: fullPath };
});

// Auto-launch toggle
ipcMain.handle("set-auto-launch", async (_event, enable) => {
  app.setLoginItemSettings({ openAtLogin: enable });
  return true;
});

ipcMain.handle("get-auto-launch", async () => {
  return app.getLoginItemSettings().openAtLogin;
});

// ===== APP LIFECYCLE =====

app.dock?.hide(); // Hide dock icon — menu bar app only

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("window-all-closed", (e) => {
  e.preventDefault(); // Keep running as tray app
});

app.on("activate", () => {
  if (!mainWindow) createWindow();
});
