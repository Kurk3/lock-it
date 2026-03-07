<script setup>
import { useSettingsStore } from "../stores/settingsStore";
const store = useSettingsStore();
</script>

<template>
  <div class="navbar">
    <button class="nav-btn add-profile" @click="store.currentTab='addProfile'">+ Add Profile</button>
    <div class="nav-right">
      <button class="nav-btn" :class="{ active: store.currentTab === 'stats' }" @click="store.currentTab='stats'">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
        </svg>
        <span>Stats</span>
      </button>
      <button class="nav-btn" :class="{ active: store.currentTab === 'settings' }" @click="store.currentTab='settings'">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>Settings</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border);
}

.nav-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 10px; background: transparent; border: none; border-radius: 8px;
  color: var(--text-muted); cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.nav-btn span { font-size: 10px; font-weight: 500; letter-spacing: 0.3px; }
.nav-btn:hover { color: var(--text-secondary); background: var(--bg-secondary); }
.nav-btn.active { color: var(--text-primary); background: var(--bg-secondary); }

.nav-btn.add-profile {
  border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px;
  background: var(--bg-tertiary); color: var(--text-secondary);
  font-size: 10px; font-weight: 500; letter-spacing: 0.3px;
}
.nav-btn.add-profile:hover { border-color: var(--border-light); color: var(--text-primary); background: var(--bg-hover); }

.nav-right { display: flex; gap: 2px; }
</style>
