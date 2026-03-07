const STORAGE_KEY = "lockit-settings";

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save settings:", e);
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
