import { defineStore } from "pinia";
import { ref } from "vue";
import * as SettingsRepo from "../services/SettingsRepository";

const DEFAULT_MODES = [
  { id: "deep", name: "Deep Work", desc: "Full focus \u00b7 Grayscale", sound: "none", volume: 60, closeOtherApps: false, screens: [{ layout: "fullscreen", nativeFullscreen: false, apps: [null] }] },
  { id: "shallow", name: "Shallow Work", desc: "Light focus \u00b7 Grayscale", sound: "none", volume: 60, closeOtherApps: false, screens: [{ layout: "fullscreen", nativeFullscreen: false, apps: [null] }] },
];

export const useSettingsStore = defineStore("settings", () => {
  const currentTab = ref("home");
  const editingModeId = ref(null);
  const profileSaveHandler = ref(null);

  const apps = ref([]);
  const autoLaunch = ref(false);
  const modes = ref([]);

  async function load() {
    const data = await SettingsRepo.load();
    if (data) {
      if (data.apps) apps.value = data.apps;
      if (data.modes && data.modes.length > 0) {
        modes.value = data.modes;
      } else {
        modes.value = JSON.parse(JSON.stringify(DEFAULT_MODES));
      }
    } else {
      modes.value = JSON.parse(JSON.stringify(DEFAULT_MODES));
    }
    SettingsRepo.getAutoLaunch().then((v) => {
      autoLaunch.value = v;
    });
  }

  async function save() {
    await SettingsRepo.save({
      apps: apps.value,
      modes: modes.value,
    });
  }

  function addApp(name, appPath, type = "app") {
    apps.value.push({ name, path: appPath, type });
    save();
  }

  function removeApp(index) {
    apps.value.splice(index, 1);
    save();
  }

  async function toggleAutoLaunch(val) {
    autoLaunch.value = val;
    await SettingsRepo.setAutoLaunch(val);
  }

  function deleteMode(modeId) {
    modes.value = modes.value.filter((m) => m.id !== modeId);
    save();
  }

  function addMode(newMode) {
    modes.value.push(newMode);
    save();
  }

  function updateMode(updated) {
    const idx = modes.value.findIndex((m) => m.id === updated.id);
    if (idx >= 0) {
      modes.value[idx] = updated;
    }
    save();
  }

  return {
    currentTab, editingModeId, profileSaveHandler, apps, autoLaunch, modes,
    load, save, addApp, removeApp, toggleAutoLaunch, deleteMode, addMode, updateMode,
  };
});
