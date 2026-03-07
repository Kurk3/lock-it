<script setup>
import { onMounted } from "vue";
import { useLockStore } from "./stores/lockStore";
import HomePanel from "./components/HomePanel.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import NavBar from "./components/NavBar.vue";

const store = useLockStore();
onMounted(() => store.loadSettings());
</script>

<template>
  <div class="app-container">
    <div class="app-window">
      <div class="arrow"></div>
      <div class="app-content">
        <div class="header">
          <div class="logo-area">
            <svg class="logo-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1.5" />
            </svg>
            <span class="logo-text">LOCK IT</span>
          </div>
          <div class="mode-badge" :class="store.mode">{{ store.modeLabel }}</div>
        </div>
        <HomePanel v-if="store.currentTab === 'home'" />
        <SettingsPanel v-else-if="store.currentTab === 'settings'" />
        <NavBar />
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-tertiary: #1a1a1a;
  --bg-hover: #222222;
  --text-primary: #ffffff;
  --text-secondary: #888888;
  --text-muted: #555555;
  --border: #2a2a2a;
  --accent: #ffffff;
  --danger: #ff4444;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: transparent; -webkit-font-smoothing: antialiased; }

.app-container { display: flex; justify-content: center; padding-top: 8px; }

.app-window {
  width: 340px;
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
  min-height: 440px;
}

.header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.logo-area { display: flex; align-items: center; gap: 8px; color: var(--text-primary); }
.logo-icon { opacity: 0.9; }
.logo-text { font-size: 13px; font-weight: 700; letter-spacing: 2px; }

.mode-badge {
  font-size: 10px; font-weight: 600; letter-spacing: 1.5px;
  padding: 4px 10px; border-radius: 20px;
  background: var(--bg-tertiary); color: var(--text-muted);
  border: 1px solid var(--border); transition: all 0.3s ease;
}
.mode-badge.deep { background: rgba(255,255,255,0.1); color: var(--text-primary); border-color: rgba(255,255,255,0.2); }
.mode-badge.shallow { background: rgba(255,255,255,0.05); color: var(--text-secondary); border-color: rgba(255,255,255,0.1); }
</style>
