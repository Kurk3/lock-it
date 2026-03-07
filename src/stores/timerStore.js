import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as TimerService from "../services/TimerService";

export const useTimerStore = defineStore("timer", () => {
  const seconds = ref(0);
  const isRunning = ref(false);

  const display = computed(() => TimerService.formatTime(seconds.value));

  function start() {
    seconds.value = 0;
    isRunning.value = true;
    TimerService.start((s) => {
      seconds.value = s;
    });
  }

  function stop() {
    const finalDisplay = display.value;
    TimerService.stop();
    isRunning.value = false;
    seconds.value = 0;
    return finalDisplay;
  }

  return { seconds, isRunning, display, start, stop };
});
