import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useLockStore = defineStore("lock", () => {
  // State
  const mode = ref("idle"); // 'idle' | 'deep' | 'shallow'
  const isLocked = ref(false);
  const timerSeconds = ref(0);
  const timerInterval = ref(null);
  const currentTab = ref("home"); // 'home' | 'settings'

  // Settings
  const apps = ref([]);
  const autoLaunch = ref(false);
  const deepWorkAudioUrl = ref("");
  const shallowWorkAudioUrl = ref("");

  // Audio
  const audioElement = ref(null);

  // Computed
  const timerDisplay = computed(() => {
    const hrs = Math.floor(timerSeconds.value / 3600);
    const mins = Math.floor((timerSeconds.value % 3600) / 60);
    const secs = timerSeconds.value % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  });

  const modeLabel = computed(() => {
    if (mode.value === "deep") return "DEEP WORK";
    if (mode.value === "shallow") return "SHALLOW WORK";
    return "READY";
  });

  // Timer
  function startTimer() {
    timerSeconds.value = 0;
    timerInterval.value = setInterval(() => {
      timerSeconds.value++;
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }

  // Audio
  async function startAudio(url) {
    stopAudio();
    if (!url) return;
    try {
      audioElement.value = new Audio(url);
      audioElement.value.loop = true;
      audioElement.value.volume = 0.5;
      await audioElement.value.play();
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }

  function stopAudio() {
    if (audioElement.value) {
      audioElement.value.pause();
      audioElement.value.src = "";
      audioElement.value = null;
    }
  }

  // Grayscale (via Electron IPC)
  async function enableGrayscale() {
    try {
      if (window.lockIt) await window.lockIt.toggleGrayscale(true);
    } catch (e) {
      console.warn("Grayscale toggle failed:", e);
    }
  }

  async function disableGrayscale() {
    try {
      if (window.lockIt) await window.lockIt.toggleGrayscale(false);
    } catch (e) {
      console.warn("Grayscale disable failed:", e);
    }
  }

  // Open configured apps/folders
  async function openConfiguredApps() {
    if (!window.lockIt) return;
    for (const a of apps.value) {
      try {
        if (a.type === "folder") {
          await window.lockIt.openFolder(a.path);
        } else {
          await window.lockIt.openApp(a.path);
        }
      } catch (e) {
        console.warn(`Failed to open ${a.name}:`, e);
      }
    }
  }

  // Lock in
  async function lockIn(selectedMode) {
    mode.value = selectedMode;
    isLocked.value = true;
    startTimer();
    await enableGrayscale();
    await openConfiguredApps();

    if (selectedMode === "deep" && deepWorkAudioUrl.value) {
      await startAudio(deepWorkAudioUrl.value);
    }
    if (selectedMode === "shallow" && shallowWorkAudioUrl.value) {
      await startAudio(shallowWorkAudioUrl.value);
    }
  }

  // Stop session
  async function stopSession() {
    const finalTime = timerDisplay.value;
    stopTimer();
    stopAudio();
    await disableGrayscale();
    mode.value = "idle";
    isLocked.value = false;
    timerSeconds.value = 0;
    return finalTime;
  }

  // Settings persistence (localStorage)
  function loadSettings() {
    try {
      const saved = localStorage.getItem("lockit-settings");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.apps) apps.value = data.apps;
        if (data.deepWorkAudioUrl) deepWorkAudioUrl.value = data.deepWorkAudioUrl;
        if (data.shallowWorkAudioUrl) shallowWorkAudioUrl.value = data.shallowWorkAudioUrl;
      }
      // Auto-launch from Electron
      if (window.lockIt) {
        window.lockIt.getAutoLaunch().then((val) => {
          autoLaunch.value = val;
        });
      }
    } catch (e) {
      console.warn("Failed to load settings:", e);
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        "lockit-settings",
        JSON.stringify({
          apps: apps.value,
          deepWorkAudioUrl: deepWorkAudioUrl.value,
          shallowWorkAudioUrl: shallowWorkAudioUrl.value,
        })
      );
    } catch (e) {
      console.warn("Failed to save settings:", e);
    }
  }

  function addApp(name, appPath, type = "app") {
    apps.value.push({ name, path: appPath, type });
    saveSettings();
  }

  function removeApp(index) {
    apps.value.splice(index, 1);
    saveSettings();
  }

  async function toggleAutoLaunch(val) {
    autoLaunch.value = val;
    if (window.lockIt) await window.lockIt.setAutoLaunch(val);
  }

  return {
    mode, isLocked, timerSeconds, timerDisplay, modeLabel, currentTab,
    apps, autoLaunch, deepWorkAudioUrl, shallowWorkAudioUrl,
    lockIn, stopSession, loadSettings, saveSettings, addApp, removeApp, toggleAutoLaunch,
  };
});
