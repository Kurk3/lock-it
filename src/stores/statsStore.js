import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as SettingsRepo from "../services/SettingsRepository";

export const useStatsStore = defineStore("stats", () => {
  const sessions = ref([]);

  async function load() {
    const data = await SettingsRepo.loadStats();
    if (data && data.sessions) {
      sessions.value = data.sessions;
    }
  }

  async function addSession(record) {
    sessions.value.push(record);
    await SettingsRepo.saveStats({ sessions: sessions.value });
  }

  const totalSessions = computed(() => sessions.value.length);

  const totalSeconds = computed(() =>
    sessions.value.reduce((sum, s) => sum + (s.durationSeconds || 0), 0)
  );

  const totalHours = computed(() => Math.floor(totalSeconds.value / 3600));
  const totalMinutes = computed(() => Math.floor((totalSeconds.value % 3600) / 60));

  const profileBreakdown = computed(() => {
    const map = {};
    for (const s of sessions.value) {
      const key = s.modeName || s.modeId;
      if (!map[key]) {
        map[key] = { name: key, count: 0, totalSeconds: 0 };
      }
      map[key].count++;
      map[key].totalSeconds += s.durationSeconds || 0;
    }
    return Object.values(map).sort((a, b) => b.totalSeconds - a.totalSeconds);
  });

  const dailyTotals = computed(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const daySessions = sessions.value.filter(
        (s) => s.startedAt && s.startedAt.startsWith(dateStr)
      );
      const totalMins = Math.round(
        daySessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60
      );
      days.push({ dateStr, dayLabel, totalMins, count: daySessions.length });
    }
    return days;
  });

  const currentStreak = computed(() => {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const hasSession = sessions.value.some(
        (s) => s.startedAt && s.startedAt.startsWith(dateStr)
      );
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      } else {
        break;
      }
    }
    return streak;
  });

  return {
    sessions,
    load,
    addSession,
    totalSessions,
    totalSeconds,
    totalHours,
    totalMinutes,
    profileBreakdown,
    dailyTotals,
    currentStreak,
  };
});
