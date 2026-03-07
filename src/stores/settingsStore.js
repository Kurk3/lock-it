import { defineStore } from "pinia";
import { ref } from "vue";
import * as SettingsRepo from "../services/SettingsRepository";

export const useSettingsStore = defineStore("settings", () => {
  const currentTab = ref("home");

  const apps = ref([]);
  const autoLaunch = ref(false);
  const deepWorkAudioUrl = ref("");
  const shallowWorkAudioUrl = ref("");

  const modes = ref([
    { id: "deep", name: "Deep Work", desc: "Full focus \u00b7 Grayscale \u00b7 Sound", icon: "clock" },
    { id: "shallow", name: "Shallow Work", desc: "Light focus \u00b7 Grayscale \u00b7 No sound", icon: "book" },
  ]);

  function load() {
    const data = SettingsRepo.load();
    if (data) {
      if (data.apps) apps.value = data.apps;
      if (data.deepWorkAudioUrl) deepWorkAudioUrl.value = data.deepWorkAudioUrl;
      if (data.shallowWorkAudioUrl) shallowWorkAudioUrl.value = data.shallowWorkAudioUrl;
    }
    SettingsRepo.getAutoLaunch().then((v) => {
      autoLaunch.value = v;
    });
  }

  function save() {
    SettingsRepo.save({
      apps: apps.value,
      deepWorkAudioUrl: deepWorkAudioUrl.value,
      shallowWorkAudioUrl: shallowWorkAudioUrl.value,
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
  }

  function addMode(newMode) {
    modes.value.push(newMode);
  }

  function getAudioUrlForMode(modeId) {
    if (modeId === "deep") return deepWorkAudioUrl.value;
    if (modeId === "shallow") return shallowWorkAudioUrl.value;
    return "";
  }

  return {
    currentTab, apps, autoLaunch, deepWorkAudioUrl, shallowWorkAudioUrl, modes,
    load, save, addApp, removeApp, toggleAutoLaunch, deleteMode, addMode, getAudioUrlForMode,
  };
});
