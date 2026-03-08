import { defineStore } from "pinia";
import { ref } from "vue";
import { useTimerStore } from "./timerStore";
import { useSettingsStore } from "./settingsStore";
import { useStatsStore } from "./statsStore";
import * as GrayscaleService from "../services/GrayscaleService";
import * as AppLauncherService from "../services/AppLauncherService";

export const useSessionStore = defineStore("session", () => {
  const mode = ref("idle");
  const isLocked = ref(false);
  const sessionStartTime = ref(null);

  async function lockIn(selectedMode) {
    const timer = useTimerStore();
    const settings = useSettingsStore();

    const profile = settings.modes.find((m) => m.id === selectedMode);
    if (!profile) return;

    mode.value = selectedMode;
    isLocked.value = true;
    sessionStartTime.value = new Date().toISOString();

    timer.start();
    await GrayscaleService.setGrayscale(true);

    if (profile.closeOtherApps) {
      await AppLauncherService.closeOtherApps();
    }

    if (profile.screens && profile.screens.length > 0) {
      await AppLauncherService.executeDesktopLayout(profile.screens);
    }
  }

  async function stopSession() {
    const timer = useTimerStore();
    const settings = useSettingsStore();
    const stats = useStatsStore();

    const durationSeconds = timer.seconds;
    const profile = settings.modes.find((m) => m.id === mode.value);

    timer.stop();

    try {
      await GrayscaleService.setGrayscale(false);
    } catch (e) {
      console.warn("Failed to disable grayscale:", e);
    }

    try {
      if (sessionStartTime.value && durationSeconds > 0) {
        await stats.addSession({
          id: "sess_" + Date.now(),
          modeId: mode.value,
          modeName: profile ? profile.name : mode.value,
          startedAt: sessionStartTime.value,
          endedAt: new Date().toISOString(),
          durationSeconds,
        });
      }
    } catch (e) {
      console.warn("Failed to save session stats:", e);
    }

    mode.value = "idle";
    isLocked.value = false;
    sessionStartTime.value = null;
  }

  return { mode, isLocked, lockIn, stopSession };
});
