<script setup>
import { computed } from "vue";
import { useSettingsStore } from "../stores/settingsStore";
const store = useSettingsStore();

const isEditing = computed(() => store.currentTab === 'editProfile' || store.currentTab === 'addProfile');

function cancel() {
  store.editingModeId = null;
  store.currentTab = "home";
}

function save() {
  if (store.profileSaveHandler) store.profileSaveHandler();
}
</script>

<template>
  <div class="navbar">
    <!-- Profile editor mode: Cancel / Save -->
    <template v-if="isEditing">
      <div></div>
      <div class="editor-actions">
        <button class="nav-btn cancel-btn" @click="cancel">Cancel</button>
        <button class="nav-btn save-btn" @click="save">Save Profile</button>
      </div>
    </template>

    <!-- Normal mode: Add Profile / Stats / Settings -->
    <template v-else>
      <button class="nav-btn add-profile" @click="store.editingModeId = null; store.currentTab='addProfile'">+ Add Profile</button>
      <div class="nav-right">
        <button class="nav-btn" :class="{ active: store.currentTab === 'home' }" @click="store.currentTab='home'">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4M4 7l8 4M4 7v10l8 4m0-10v10"/>
          </svg>
          <span>Profiles</span>
        </button>
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
    </template>
  </div>
</template>

<style scoped>
.navbar {
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0; padding-top: 12px; border-top: 1px solid var(--border);
}

.nav-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 10px; background: transparent; border: none; border-radius: 8px;
  color: var(--text-secondary); cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.nav-btn span { font-size: 12px; font-weight: 500; letter-spacing: 0.3px; }
.nav-btn:hover { color: var(--text-secondary); background: var(--bg-secondary); }
.nav-btn.active { color: var(--text-primary); }

.nav-btn.add-profile {
  border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px;
  background: var(--bg-tertiary); color: var(--text-secondary);
  font-size: 12px; font-weight: 500; letter-spacing: 0.3px;
}
.nav-btn.add-profile:hover { border-color: var(--border-light); color: var(--text-primary); background: var(--bg-hover); }

.nav-right { display: flex; gap: 2px; }

.editor-actions { display: flex; gap: 6px; }

/* Editor actions */
.cancel-btn {
  border: 1px solid var(--border); padding: 7px 16px; border-radius: 8px;
  font-size: 12px; font-weight: 500;
}
.cancel-btn:hover { background: var(--bg-tertiary); color: var(--text-primary); }

.save-btn {
  padding: 7px 16px; border-radius: 8px;
  background: var(--text-primary); color: var(--bg-primary);
  font-size: 12px; font-weight: 600; border: none;
}
.save-btn:hover { opacity: 0.9; }
</style>
