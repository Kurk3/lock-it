<script setup>
import { ref } from "vue";
import { useSettingsStore } from "../stores/settingsStore";
import { useStatsStore } from "../stores/statsStore";
import * as SettingsRepo from "../services/SettingsRepository";

const settings = useSettingsStore();
const stats = useStatsStore();
const showResetConfirm = ref(false);

async function handleAutoLaunch() {
  await settings.toggleAutoLaunch(!settings.autoLaunch);
}

async function resetAllData() {
  settings.modes = [];
  settings.apps = [];
  await settings.save();
  stats.sessions = [];
  await SettingsRepo.saveStats({ sessions: [] });
  showResetConfirm.value = false;
}
</script>

<template>
  <div class="settings-view">
    <div class="settings-content">
      <!-- Auto-launch -->
      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Launch on Login</span>
          <span class="setting-desc">Start Lock It when you log in to your Mac</span>
        </div>
        <button class="toggle-switch" :class="{ active: settings.autoLaunch }" @click="handleAutoLaunch">
          <span class="toggle-knob"></span>
        </button>
      </div>

      <!-- Danger zone -->
      <div class="danger-zone">
        <span class="danger-title">Danger Zone</span>
        <div class="setting-row danger">
          <div class="setting-info">
            <span class="setting-label">Reset All Data</span>
            <span class="setting-desc">Delete all profiles, apps, and session history</span>
          </div>
          <button v-if="!showResetConfirm" class="btn-danger" @click="showResetConfirm = true">Reset</button>
          <div v-else class="confirm-actions">
            <button class="btn-cancel" @click="showResetConfirm = false">Cancel</button>
            <button class="btn-danger-confirm" @click="resetAllData">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view { flex: 1; display: flex; flex-direction: column; }
.settings-content { display: flex; flex-direction: column; gap: 20px; }

.setting-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border);
  border-radius: 10px;
}
.setting-info { display: flex; flex-direction: column; gap: 2px; }
.setting-label { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.setting-desc { font-size: 11px; color: var(--text-muted); }

.toggle-switch {
  width: 36px; height: 20px; border-radius: 10px; border: none;
  background: var(--bg-tertiary); cursor: pointer; position: relative;
  transition: background 0.2s; flex-shrink: 0;
}
.toggle-switch.active { background: var(--text-primary); }
.toggle-knob {
  position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
  border-radius: 50%; background: var(--bg-primary); transition: transform 0.2s;
}
.toggle-switch.active .toggle-knob { transform: translateX(16px); }

/* Danger zone */
.danger-zone { display: flex; flex-direction: column; gap: 8px; }
.danger-title { font-size: 11px; font-weight: 600; color: var(--danger); text-transform: uppercase; letter-spacing: 0.5px; }
.setting-row.danger { border-color: rgba(232,64,64,0.2); }

.btn-danger {
  padding: 6px 14px; font-size: 12px; font-weight: 500; border-radius: 6px;
  background: transparent; border: 1px solid rgba(232,64,64,0.35); color: var(--danger);
  cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap;
}
.btn-danger:hover { background: rgba(255,68,68,0.1); border-color: rgba(255,68,68,0.5); }

.confirm-actions { display: flex; gap: 6px; }
.btn-cancel {
  padding: 6px 12px; font-size: 12px; font-weight: 500; border-radius: 6px;
  background: transparent; border: 1px solid var(--border); color: var(--text-secondary);
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-cancel:hover { background: var(--bg-tertiary); }
.btn-danger-confirm {
  padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 6px;
  background: var(--danger); border: none; color: #fff;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-danger-confirm:hover { opacity: 0.9; }
</style>
