const SETTINGS_FILE = "settings.json";
const STATS_FILE = "stats.json";
const LS_SETTINGS_KEY = "lockit-settings";
const LS_STATS_KEY = "lockit-stats";

export async function load() {
  if (window.lockIt?.storeRead) {
    return await window.lockIt.storeRead(SETTINGS_FILE);
  }
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function save(data) {
  if (window.lockIt?.storeWrite) {
    await window.lockIt.storeWrite(SETTINGS_FILE, JSON.parse(JSON.stringify(data)));
    return;
  }
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save settings:", e);
  }
}

export async function loadStats() {
  if (window.lockIt?.storeRead) {
    return await window.lockIt.storeRead(STATS_FILE);
  }
  try {
    const raw = localStorage.getItem(LS_STATS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveStats(data) {
  if (window.lockIt?.storeWrite) {
    await window.lockIt.storeWrite(STATS_FILE, JSON.parse(JSON.stringify(data)));
    return;
  }
  try {
    localStorage.setItem(LS_STATS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save stats:", e);
  }
}

export async function getAutoLaunch() {
  if (window.lockIt) return window.lockIt.getAutoLaunch();
  return false;
}

export async function setAutoLaunch(enable) {
  if (window.lockIt) await window.lockIt.setAutoLaunch(enable);
}

export async function pickApp() {
  if (window.lockIt) return window.lockIt.pickApp();
  return null;
}
