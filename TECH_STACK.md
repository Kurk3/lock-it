# Lock It — Tech Stack

## Prehľad

**Lock It** je macOS menu bar aplikácia zameraná na produktivitu a focus management. Beží ako tray appka v hornej lište macOS.

---

## Frontend (Renderer Process)

| Technológia | Verzia | Účel |
|---|---|---|
| **Vue 3** | ^3.4.0 | UI framework (Composition API, `<script setup>`) |
| **Pinia** | ^2.1.0 | State management (stores pre timer, settings, stats, session) |
| **Vite** | ^5.4.0 | Dev server a build tool |
| **@vitejs/plugin-vue** | ^5.0.0 | Vue SFC podpora pre Vite |

### Štruktúra Vue aplikácie

- **Views:** `HomeView`, `SettingsView`, `StatsView`, `ProfileEditorView`
- **Components:** `NavBar`, `TimerDisplay`, `ModeCard`, `DeleteModal`
- **Stores (Pinia):** `settingsStore`, `timerStore`, `statsStore`, `sessionStore`
- **Services:** `TimerService`, `GrayscaleService`, `AudioService`, `AppLauncherService`, `SettingsRepository`

---

## Backend (Main Process)

| Technológia | Verzia | Účel |
|---|---|---|
| **Electron** | ^32.2.0 | Desktop runtime, tray management, IPC, system integrácia |
| **electron-builder** | 24.13.3 | Packaging a distribúcia (.dmg) |

### Electron architektúra

- **Main process** (`electron/main.js`) — CommonJS, spravuje okno, tray, IPC handlery
- **Preload** (`electron/preload.js`) — CommonJS, `contextBridge` API (`window.lockIt`)
- **Renderer** — Vue app bežiaca v BrowserWindow

### IPC API (preload → main)

| Kanál | Funkcia |
|---|---|
| `hide-window` | Skryť okno (X button) |
| `toggle-grayscale` | Prepnúť macOS grayscale |
| `open-app` / `quit-app` | Otvoriť/zavrieť aplikáciu |
| `wait-for-app` | Počkať kým app má viditeľné okno |
| `open-folder` | Otvoriť priečinok vo Finderi |
| `pick-app` | Natívny file dialog na výber .app |
| `set-auto-launch` / `get-auto-launch` | Auto-start pri prihlásení |
| `store-read` / `store-write` | Perzistentné JSON úložisko (userData) |
| `get-work-area` | Rozmery obrazovky |
| `arrange-app` / `arrange-split` | Usporiadanie okien (AppleScript) |
| `fullscreen-app` | Natívny fullscreen (Ctrl+Cmd+F) |
| `create-desktops` / `switch-desktop` | Správa virtuálnych desktopov (Mission Control) |
| `close-other-apps` | Zavrieť všetky ostatné appky |

---

## Systémové integrácie (macOS)

| Funkcia | Implementácia |
|---|---|
| **Menu bar tray** | Electron `Tray` s custom ikonu zámku |
| **Window arrangement** | AppleScript cez `osascript` |
| **Desktop management** | AppleScript + Mission Control |
| **Grayscale toggle** | `defaults write com.apple.universalaccess grayscale` |
| **App launch/quit** | `open -a` + AppleScript `tell application ... to quit` |
| **Auto-start** | Electron `app.setLoginItemSettings` |

---

## Modulový systém

| Súbor | Systém | Dôvod |
|---|---|---|
| `electron/main.js` | **CommonJS** (`require`) | Electron main process vyžaduje CJS |
| `electron/preload.js` | **CommonJS** (`require`) | Preload musí byť CJS |
| `vite.config.mjs` | **ESM** (`import`) | Vite config, `.mjs` kvôli ESM/CJS konfliktu |
| `src/**/*.vue`, `src/**/*.js` | **ESM** (`import`) | Vue/Vite ekosystém |
| `package.json` | Bez `"type": "module"` | Aby Electron fungoval s CJS |

---

## Dev Workflow

```bash
# Vývoj (Vite + Electron spolu)
npm run dev

# Len Vite dev server
npm run dev:vue

# Build Vue pre produkciu
npm run build:vue

# Build macOS .dmg
npm run build:dmg
```

### Dev vs Produkcia

| Vlastnosť | Dev (`LOCK_IT_DEV=1`) | Produkcia |
|---|---|---|
| Okno | Viditeľné hneď, resizable | Skryté, popup z tray |
| DevTools | Auto-open (detach) | Vypnuté |
| URL | `localhost:5173` | `dist-vue/index.html` |
| Blur hide | Vypnuté | Aktívne |
| Dock icon | Skrytý | Skrytý |

---

## Build & Distribúcia

- **Platform:** macOS (universal — Intel + Apple Silicon)
- **Output:** `.dmg` installer
- **App ID:** `com.lockit.app`
- **Kategória:** Productivity
- **Build tool:** electron-builder
- **Vue build output:** `dist-vue/`
- **Electron build output:** `dist/`

---

## Nástroje pre vývoj

| Nástroj | Účel |
|---|---|
| **concurrently** | Paralelné spustenie Vite + Electron |
| **env -u ELECTRON_RUN_AS_NODE** | Workaround pre Claude Code prostredie |
