import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useTimerStore } from "./timerStore";
import { useSettingsStore } from "./settingsStore";
import * as AudioService from "../services/AudioService";
import * as GrayscaleService from "../services/GrayscaleService";
import * as AppLauncherService from "../services/AppLauncherService";

export const useSessionStore = defineStore("session", () => {
  const mode = ref("idle");
  const isLocked = ref(false);

  const modeLabel = computed(() => {
    if (mode.value === "deep") return "DEEP WORK";
    if (mode.value === "shallow") return "SHALLOW WORK";
    return "READY";
  });

  async function lockIn(selectedMode) {
    const timer = useTimerStore();
    const settings = useSettingsStore();

    mode.value = selectedMode;
    isLocked.value = true;
    timer.start();
    await GrayscaleService.setGrayscale(true);
    await AppLauncherService.openItems(settings.apps);

    const audioUrl = settings.getAudioUrlForMode(selectedMode);
    if (audioUrl) await AudioService.play(audioUrl);
  }

  async function stopSession() {
    const timer = useTimerStore();

    const finalTime = timer.display;
    timer.stop();
    AudioService.stop();
    await GrayscaleService.setGrayscale(false);

    mode.value = "idle";
    isLocked.value = false;

    return finalTime;
  }

  return { mode, isLocked, modeLabel, lockIn, stopSession };
});
