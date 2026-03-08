const { app, BrowserWindow, Tray, ipcMain, nativeImage, screen, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { exec, spawn } = require("child_process");

let mainWindow = null;
let tray = null;
let isQuitting = false;
let isDialogOpen = false;

const isDev = process.env.LOCK_IT_DEV === "1";

// Prevent EPIPE crashes from killing the app
process.on("uncaughtException", (err) => {
  if (err.code === "EPIPE") return;
  console.error("Uncaught exception:", err);
});

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
  return new Promise((resolve) => {
    const val = enable ? "true" : "false";
    exec(`defaults write com.apple.universalaccess grayscale -bool ${val}`, () => {
      resolve(true);
    });
  });
});

// Open an application
ipcMain.handle("open-app", async (_event, appPath) => {
  return new Promise((resolve) => {
    exec(`open -a "${appPath}"`, (error) => {
      if (error) {
        // Try without -a flag in case it's a direct path
        exec(`open "${appPath}"`, () => resolve(true));
      } else {
        resolve(true);
      }
    });
  });
});

// Open a folder
ipcMain.handle("open-folder", async (_event, folderPath) => {
  return new Promise((resolve) => {
    exec(`open "${folderPath}"`, () => resolve(true));
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
  // Re-show and reposition the window after dialog closes
  if (!isDev) positionWindow();
  mainWindow.show();
  mainWindow.focus();
  // Delay resetting isDialogOpen so the blur handler doesn't hide the window
  setTimeout(() => { isDialogOpen = false; }, 500);
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

// ===== FILE STORAGE =====

function getDataPath(filename) {
  return path.join(app.getPath("userData"), filename);
}

ipcMain.handle("store-read", async (_event, filename) => {
  const filePath = getDataPath(filename);
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
});

ipcMain.handle("store-write", async (_event, filename, data) => {
  fs.writeFileSync(getDataPath(filename), JSON.stringify(data, null, 2), "utf-8");
  return true;
});

// ===== WINDOW ARRANGEMENT =====

function runAppleScript(script) {
  return new Promise((resolve) => {
    const proc = spawn("osascript", ["-"]);
    let stderr = "";
    proc.stdin.on("error", () => {}); // suppress EPIPE
    proc.stdin.write(script);
    proc.stdin.end();
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("error", () => resolve(false));
    proc.on("close", (code) => {
      resolve(code === 0);
    });
  });
}

ipcMain.handle("get-work-area", async () => {
  return screen.getPrimaryDisplay().workArea;
});

// Arrange app window to given bounds
ipcMain.handle("arrange-app", async (_event, appName, bounds) => {
  const w = bounds.right - bounds.left;
  const h = bounds.bottom - bounds.top;
  const script = `
tell application "${appName}" to activate
delay 0.3

-- Check if window is accessible via System Events (if not, it may be in native fullscreen)
set windowAccessible to false
try
  tell application "System Events"
    tell process "${appName}"
      get position of window 1
    end tell
  end tell
  set windowAccessible to true
end try

-- If window not accessible, quit and reopen to exit native fullscreen
if not windowAccessible then
  tell application "${appName}" to quit
  delay 1
  tell application "${appName}" to activate
  delay 1
end if

-- Now arrange: try app scripting first, fallback to System Events
set didArrange to false
try
  tell application "${appName}"
    set bounds of window 1 to {${bounds.left}, ${bounds.top}, ${bounds.right}, ${bounds.bottom}}
  end tell
  set didArrange to true
on error
  try
    tell application "${appName}"
      make new window
      delay 0.3
      set bounds of window 1 to {${bounds.left}, ${bounds.top}, ${bounds.right}, ${bounds.bottom}}
    end tell
    set didArrange to true
  end try
end try

if not didArrange then
  try
    tell application "System Events"
      tell process "${appName}"
        set position of window 1 to {${bounds.left}, ${bounds.top}}
        set size of window 1 to {${w}, ${h}}
      end tell
    end tell
  end try
end if
`;
  return runAppleScript(script);
});

// Native macOS fullscreen (Ctrl+Cmd+F)
ipcMain.handle("fullscreen-app", async (_event, appName) => {
  const script = `
tell application "${appName}" to activate
delay 0.3

-- If window not accessible (stuck in fullscreen), quit and reopen
set windowAccessible to false
try
  tell application "System Events"
    tell process "${appName}"
      get position of window 1
    end tell
  end tell
  set windowAccessible to true
end try

if not windowAccessible then
  tell application "${appName}" to quit
  delay 1
  tell application "${appName}" to activate
  delay 1
end if

-- Ensure app has a window
try
  tell application "${appName}"
    if (count windows) is 0 then
      make new window
      delay 0.3
    end if
  end tell
end try

-- Enter native fullscreen
tell application "System Events"
  keystroke "f" using {control down, command down}
end tell
`;
  return runAppleScript(script);
});

// ===== DESKTOP MANAGEMENT =====

// Ensure N desktops exist via Mission Control
ipcMain.handle("create-desktops", async (_event, count) => {
  const script = `
tell application "System Events"
  key code 126 using {control down}
end tell
delay 2.5

tell application "System Events"
  tell process "Dock"
    set allButtons to every button of list 1 of group "Spaces Bar" of group 1 of group "Mission Control"
    set desktopCount to 0
    repeat with b in allButtons
      if name of b starts with "Desktop" then
        set desktopCount to desktopCount + 1
      end if
    end repeat

    repeat while desktopCount < ${count}
      click button 1 of group "Spaces Bar" of group 1 of group "Mission Control"
      delay 0.8
      set desktopCount to desktopCount + 1
    end repeat
  end tell
end tell

tell application "System Events"
  key code 53
end tell
delay 1
`;
  return runAppleScript(script);
});

// Switch to a specific desktop by index (1-based)
ipcMain.handle("switch-desktop", async (_event, desktopIndex) => {
  let script = `
repeat 20 times
  tell application "System Events"
    key code 123 using {control down}
  end tell
  delay 0.15
end repeat
delay 0.5
`;
  if (desktopIndex > 1) {
    script += `
repeat ${desktopIndex - 1} times
  tell application "System Events"
    key code 124 using {control down}
  end tell
  delay 0.5
end repeat
delay 0.5
`;
  }
  return runAppleScript(script);
});

// ===== CLOSE OTHER APPS =====

ipcMain.handle("close-other-apps", async () => {
  return new Promise((resolve) => {
    exec(
      `osascript -e 'tell application "System Events" to get name of every application process whose background only is false'`,
      (error, stdout) => {
        if (error) {
          console.warn("Failed to get running apps:", error.message);
          resolve(false);
          return;
        }

        const runningApps = stdout.trim().split(", ").map((a) => a.trim());
        const exclude = [
          "Finder",
          "Lock It",
          "Electron",
          "SystemUIServer",
          "Dock",
          "loginwindow",
          "Control Center",
          "Notification Center",
        ];
        const toClose = runningApps.filter((a) => !exclude.includes(a));

        if (toClose.length === 0) {
          resolve(true);
          return;
        }

        let closeScript = "";
        for (const name of toClose) {
          closeScript += `try\ntell application "${name}" to quit\nend try\n`;
        }

        const proc = spawn("osascript", ["-"]);
        proc.stdin.on("error", () => {});
        proc.stdin.write(closeScript);
        proc.stdin.end();
        proc.on("error", () => resolve(true));
        proc.on("close", () => resolve(true));
      }
    );
  });
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
