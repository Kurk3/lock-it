<script setup>
import { ref, onMounted } from "vue";
import { useSettingsStore } from "./stores/settingsStore";
import { useStatsStore } from "./stores/statsStore";
import HomeView from "./views/HomeView.vue";
import SettingsView from "./views/SettingsView.vue";
import StatsView from "./views/StatsView.vue";
import ProfileEditorView from "./views/ProfileEditorView.vue";
import NavBar from "./components/NavBar.vue";

const settings = useSettingsStore();
const stats = useStatsStore();
const isDark = ref(true);

function toggleTheme() {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute("data-theme", isDark.value ? "dark" : "light");
}

onMounted(async () => {
  await settings.load();
  await stats.load();
});
</script>

<template>
  <div class="app-container">
    <div class="app-window">
      <div class="arrow"></div>
      <div class="app-content">
        <div class="header">
          <div class="logo-area">
            <svg class="logo-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span class="logo-text">LOCK IT</span>
          </div>
          <div class="header-actions">
            <!-- Theme Switcher -->
            <button class="header-btn" @click="toggleTheme">
              <svg v-if="isDark" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
            <!-- Close -->
            <button class="header-btn close-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <HomeView v-if="settings.currentTab === 'home'" />
        <SettingsView v-else-if="settings.currentTab === 'settings'" />
        <StatsView v-else-if="settings.currentTab === 'stats'" />
        <ProfileEditorView v-else-if="settings.currentTab === 'editProfile' || settings.currentTab === 'addProfile'" />
        <NavBar />
      </div>
    </div>
  </div>
</template>

<style>
:root,
[data-theme="dark"] {
  --bg-primary: #0e0e0e;
  --bg-secondary: #1c1c1c;
  --bg-tertiary: #282828;
  --bg-hover: #303030;
  --text-primary: #ececec;
  --text-secondary: #d0d0d0;
  --text-muted: #a0a0a0;
  --border: #262626;
  --border-light: #383838;
  --border-dashed: #383838;
  --accent: #ececec;
  --danger: #e84040;
}
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #ebebeb;
  --bg-hover: #e0e0e0;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-muted: #999999;
  --border: #e0e0e0;
  --border-light: #cccccc;
  --border-dashed: #aaaaaa;
  --accent: #1a1a1a;
  --danger: #dc3545;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: transparent; -webkit-font-smoothing: antialiased; }

.app-container { display: flex; justify-content: center; padding-top: 8px; }

.app-window {
  width: 400px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8);
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
}

.arrow {
  position: absolute; top: -6px; right: 24px;
  width: 12px; height: 12px;
  background: var(--bg-primary);
  border-left: 1px solid var(--border);
  border-top: 1px solid var(--border);
  transform: rotate(45deg);
}

.app-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 440px;
}

.header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.logo-area { display: flex; align-items: center; gap: 8px; color: var(--text-primary); }
.logo-icon { opacity: 0.9; }
.logo-text { font-size: 13px; font-weight: 700; letter-spacing: 2px; }

.header-actions { display: flex; align-items: center; gap: 2px; }
.header-btn {
  width: 32px; height: 32px; border-radius: 6px; border: none;
  background: transparent; color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s;
}
.header-btn:hover { color: var(--text-secondary); background: var(--bg-secondary); }
.header-btn.close-btn:hover { color: var(--danger); background: rgba(232,64,64,0.1); }
</style>
