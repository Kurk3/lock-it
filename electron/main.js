const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen, dialog, systemPreferences } = require("electron");
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
  const iconPath = path.join(__dirname, "..", "build", "trayTemplate.png");
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);
  return icon;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 500,
    show: isDev,
    frame: false,
    resizable: isDev,
    skipTaskbar: !isDev,
    alwaysOnTop: !isDev,
    backgroundColor: "#0e0e0e",
    hasShadow: true,
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

  // Block Cmd+R reload in production
  if (!isDev) {
    mainWindow.webContents.on("before-input-event", (event, input) => {
      if (input.key === "r" && input.meta) event.preventDefault();
    });
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

  const contextMenu = Menu.buildFromTemplate([
    { label: "Show App", click: () => { positionWindow(); mainWindow.show(); mainWindow.focus(); } },
    { type: "separator" },
    { label: "Quit", click: () => { isQuitting = true; app.quit(); } },
  ]);
  tray.on("right-click", () => {
    tray.popUpContextMenu(contextMenu);
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

// Hide the window (for X button in renderer)
ipcMain.handle("hide-window", async () => {
  if (mainWindow) mainWindow.hide();
  return true;
});

// Quit an app and wait for it to close
ipcMain.handle("quit-app", async (_event, appName) => {
  return new Promise((resolve) => {
    const script = `
try
  if application "${appName}" is running then
    tell application "${appName}" to quit
    repeat 30 times
      delay 0.2
      if application "${appName}" is not running then exit repeat
    end repeat
  end if
end try
`;
    const proc = spawn("osascript", ["-"]);
    proc.stdin.on("error", () => {});
    proc.stdin.write(script);
    proc.stdin.end();
    proc.on("error", () => resolve(true));
    proc.on("close", () => resolve(true));
  });
});

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

// Wait until an app has a visible window (poll up to timeout ms)
ipcMain.handle("wait-for-app", async (_event, appName, timeout = 5000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const hasWindow = await new Promise((resolve) => {
      const proc = spawn("osascript", ["-e",
        `tell application "System Events" to (count of windows of process "${appName}") > 0`
      ]);
      let out = "";
      proc.stdout.on("data", (d) => (out += d));
      proc.on("error", () => resolve(false));
      proc.on("close", () => resolve(out.trim() === "true"));
    });
    if (hasWindow) return true;
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
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
  try {
    const dir = app.getPath("userData");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("store-write failed:", e);
    return false;
  }
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
delay 0.15

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
      delay 0.2
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

// Arrange two apps side-by-side in one script (faster than two separate calls)
ipcMain.handle("arrange-split", async (_event, leftApp, leftBounds, rightApp, rightBounds) => {
  const lw = leftBounds.right - leftBounds.left;
  const lh = leftBounds.bottom - leftBounds.top;
  const rw = rightBounds.right - rightBounds.left;
  const rh = rightBounds.bottom - rightBounds.top;
  const script = `
tell application "${leftApp}" to activate
delay 0.15
try
  tell application "${leftApp}"
    set bounds of window 1 to {${leftBounds.left}, ${leftBounds.top}, ${leftBounds.right}, ${leftBounds.bottom}}
  end tell
on error
  try
    tell application "System Events"
      tell process "${leftApp}"
        set position of window 1 to {${leftBounds.left}, ${leftBounds.top}}
        set size of window 1 to {${lw}, ${lh}}
      end tell
    end tell
  end try
end try

tell application "${rightApp}" to activate
delay 0.15
try
  tell application "${rightApp}"
    set bounds of window 1 to {${rightBounds.left}, ${rightBounds.top}, ${rightBounds.right}, ${rightBounds.bottom}}
  end tell
on error
  try
    tell application "System Events"
      tell process "${rightApp}"
        set position of window 1 to {${rightBounds.left}, ${rightBounds.top}}
        set size of window 1 to {${rw}, ${rh}}
      end tell
    end tell
  end try
end try
`;
  return runAppleScript(script);
});

// Native macOS fullscreen (Ctrl+Cmd+F)
ipcMain.handle("fullscreen-app", async (_event, appName) => {
  const script = `
tell application "${appName}" to activate
delay 0.15

-- Ensure app has a window
try
  tell application "${appName}"
    if (count windows) is 0 then
      make new window
      delay 0.2
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

// Create one new desktop via Mission Control and switch to it (all in one action)
ipcMain.handle("create-and-switch-desktop", async () => {
  // Hide main window so it doesn't block Mission Control (alwaysOnTop in production)
  if (mainWindow && mainWindow.isVisible()) {
    mainWindow.hide();
  }

  const script = `
-- Open Mission Control
tell application "System Events"
  key code 126 using {control down}
end tell
delay 1.5

-- Click "+" to add a new desktop
tell application "System Events"
  tell process "Dock"
    click button 1 of group "Spaces Bar" of group 1 of group "Mission Control"
  end tell
end tell
delay 0.8

-- Click the last (newly created) desktop to switch to it
tell application "System Events"
  tell process "Dock"
    set allButtons to every button of list 1 of group "Spaces Bar" of group 1 of group "Mission Control"
    set lastDesktop to missing value
    repeat with b in allButtons
      if name of b starts with "Desktop" then
        set lastDesktop to b
      end if
    end repeat
    if lastDesktop is not missing value then
      click lastDesktop
    end if
  end tell
end tell
delay 0.8
`;
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

// ===== PERMISSIONS =====

function ensurePermissions() {
  const isTrusted = systemPreferences.isTrustedAccessibilityClient(false);
  console.log("[Lock It] Accessibility trusted:", isTrusted);

  if (!isTrusted) {
    // Show dock so dialogs are visible (menu bar apps have no presence otherwise)
    app.dock?.show();

    // Step 1: Explain what's needed
    const response = dialog.showMessageBoxSync(null, {
      type: "info",
      title: "Welcome to Lock It!",
      message: "One quick setup step",
      detail:
        "Lock It needs Accessibility permission to manage your windows and desktops.\n\n" +
        "We'll open System Settings for you — just toggle Lock It ON in the list.",
      buttons: ["Let's do it", "Later"],
      defaultId: 0,
      cancelId: 1,
    });

    if (response === 0) {
      // Trigger the native macOS prompt (adds Lock It to the list automatically)
      systemPreferences.isTrustedAccessibilityClient(true);

      // Open System Settings to the right pane
      exec(
        'open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"'
      );

      // Step 2: Poll until user grants permission
      const pollInterval = setInterval(() => {
        if (systemPreferences.isTrustedAccessibilityClient(false)) {
          clearInterval(pollInterval);

          // Step 3: Confirm success
          dialog.showMessageBoxSync(null, {
            type: "info",
            title: "You're all set!",
            message: "Accessibility permission granted.",
            detail: "Lock It is ready to manage your desktops and windows.",
            buttons: ["OK"],
          });

          app.dock?.hide();

          // Trigger Automation permissions now that accessibility works
          exec(
            'osascript -e \'tell application "System Events" to get name of first application process\'',
            () => {}
          );
        }
      }, 1000);
    } else {
      app.dock?.hide();
    }

    return;
  }

  // Already trusted — just trigger Automation permission if needed
  exec(
    'osascript -e \'tell application "System Events" to get name of first application process\'',
    () => {}
  );
}

ipcMain.handle("check-accessibility", async () => {
  return systemPreferences.isTrustedAccessibilityClient(false);
});

// ===== APP LIFECYCLE =====

app.dock?.hide(); // Hide dock icon — menu bar app only

// Single instance lock — prevent multiple copies
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  // In production, ensure app is running from /Applications
  if (!isDev && app.isPackaged) {
    try {
      if (!app.isInApplicationsFolder()) {
        const moved = app.moveToApplicationsFolder({
          conflictHandler: (conflictType) => {
            // Overwrite existing version
            return conflictType === "exists";
          },
        });
        if (moved) return; // App relaunches from /Applications
      }
    } catch (e) {
      console.warn("[Lock It] Could not check/move to Applications:", e.message);
    }
  }

  createWindow();
  createTray();

  // Delay permissions check so window + tray are fully initialized
  setTimeout(() => {
    ensurePermissions();
  }, 1500);
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
