<script setup>
import { useStatsStore } from "../stores/statsStore";
const stats = useStatsStore();

function formatDuration(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m`;
  return "<1m";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function chartBarHeight(mins) {
  const max = Math.max(...stats.dailyTotals.map((d) => d.totalMins), 1);
  if (mins <= 0) return "0%";
  return Math.max(4, (mins / max) * 100) + "%";
}
</script>

<template>
  <div class="stats-view">
    <!-- Empty state -->
    <div v-if="stats.totalSessions === 0" class="stats-empty">
      <div class="stats-icon">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
        </svg>
      </div>
      <span class="stats-title">No stats yet</span>
      <span class="stats-desc">Complete a focus session to see your stats</span>
    </div>

    <!-- Stats content -->
    <div v-else class="stats-content">
      <!-- Summary cards -->
      <div class="stat-cards">
        <div class="stat-card">
          <span class="stat-value">{{ stats.totalSessions }}</span>
          <span class="stat-label">Sessions</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.totalHours }}h {{ stats.totalMinutes }}m</span>
          <span class="stat-label">Total Focus</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.currentStreak }}</span>
          <span class="stat-label">Day Streak</span>
        </div>
      </div>

      <!-- Weekly chart -->
      <div class="section">
        <span class="section-label">This Week</span>
        <div class="weekly-chart">
          <div v-for="day in stats.dailyTotals" :key="day.dateStr" class="chart-col">
            <div class="chart-bar-wrap">
              <div class="chart-bar" :style="{ height: chartBarHeight(day.totalMins) }"></div>
            </div>
            <span class="chart-label">{{ day.dayLabel }}</span>
          </div>
        </div>
      </div>

      <!-- By profile -->
      <div v-if="stats.profileBreakdown.length > 0" class="section">
        <span class="section-label">By Profile</span>
        <div class="profile-list">
          <div v-for="p in stats.profileBreakdown" :key="p.name" class="profile-row">
            <span class="profile-name">{{ p.name }}</span>
            <span class="profile-stats">{{ p.count }} sessions &middot; {{ formatDuration(p.totalSeconds) }}</span>
          </div>
        </div>
      </div>

      <!-- Recent sessions -->
      <div class="section">
        <span class="section-label">Recent</span>
        <div class="recent-list">
          <div v-for="s in stats.sessions.slice(-5).reverse()" :key="s.id" class="recent-row">
            <span class="recent-name">{{ s.modeName }}</span>
            <span class="recent-dur">{{ formatDuration(s.durationSeconds) }}</span>
            <span class="recent-date">{{ formatDate(s.startedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-view { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }

.stats-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 40px 0;
}
.stats-icon { color: var(--text-muted); opacity: 0.4; margin-bottom: 4px; }
.stats-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); }
.stats-desc { font-size: 12px; color: var(--text-muted); }

.stats-content { display: flex; flex-direction: column; gap: 16px; }

/* Summary cards */
.stat-cards { display: flex; gap: 8px; }
.stat-card {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 12px 8px; background: var(--bg-secondary); border: 1px solid var(--border);
  border-radius: 10px;
}
.stat-value { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

/* Sections */
.section { display: flex; flex-direction: column; gap: 8px; }
.section-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

/* Weekly chart */
.weekly-chart { display: flex; gap: 4px; padding: 8px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px; }
.chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.chart-bar-wrap { width: 100%; height: 60px; display: flex; align-items: flex-end; justify-content: center; }
.chart-bar { width: 70%; max-width: 24px; background: var(--text-primary); border-radius: 3px 3px 0 0; transition: height 0.3s; min-height: 0; }
.chart-label { font-size: 9px; color: var(--text-muted); }

/* Profile breakdown */
.profile-list { display: flex; flex-direction: column; gap: 4px; }
.profile-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px; background: var(--bg-secondary); border: 1px solid var(--border);
  border-radius: 8px;
}
.profile-name { font-size: 12px; font-weight: 500; color: var(--text-primary); }
.profile-stats { font-size: 11px; color: var(--text-muted); }

/* Recent sessions */
.recent-list { display: flex; flex-direction: column; gap: 4px; }
.recent-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; background: var(--bg-secondary); border: 1px solid var(--border);
  border-radius: 8px;
}
.recent-name { flex: 1; font-size: 12px; font-weight: 500; color: var(--text-primary); }
.recent-dur { font-size: 11px; color: var(--text-secondary); }
.recent-date { font-size: 10px; color: var(--text-muted); }
</style>
