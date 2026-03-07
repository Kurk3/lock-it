<script setup>
import { ref, watch } from "vue";
import { useSettingsStore } from "../stores/settingsStore";
import * as SettingsRepo from "../services/SettingsRepository";

const settings = useSettingsStore();

const newAppName = ref("");
const newAppPath = ref("");
const newAppType = ref("app");
const showAddForm = ref(false);

function addApp() {
  if (!newAppName.value.trim() || !newAppPath.value.trim()) return;
  settings.addApp(newAppName.value.trim(), newAppPath.value.trim(), newAppType.value);
  newAppName.value = "";
  newAppPath.value = "";
  newAppType.value = "app";
  showAddForm.value = false;
}

async function browseApp() {
  const result = await SettingsRepo.pickApp();
  if (result) {
    newAppName.value = result.name;
    newAppPath.value = result.path;
  }
}

watch(() => settings.deepWorkAudioUrl, () => settings.save());
</script>

<template>
  <div class="settings-panel">
    <!-- APPS & FOLDERS -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">Apps & Folders</span>
        <span class="section-subtitle">Opened when you lock in</span>
      </div>
      <div class="app-list">
        <div v-if="settings.apps.length === 0" class="empty-state">No apps configured yet</div>
        <div v-for="(app, i) in settings.apps" :key="i" class="app-item">
          <div class="app-icon-box">
            <svg v-if="app.type==='folder'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div class="app-details">
            <span class="app-name">{{ app.name }}</span>
            <span class="app-path">{{ app.path }}</span>
          </div>
          <button class="remove-btn" @click="settings.removeApp(i)">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div v-if="showAddForm" class="add-form">
        <div class="type-toggle">
          <button :class="{active: newAppType==='app'}" @click="newAppType='app'">App</button>
          <button :class="{active: newAppType==='folder'}" @click="newAppType='folder'">Folder</button>
        </div>
        <input v-model="newAppName" type="text" :placeholder="newAppType==='app'?'App name (e.g. Google Chrome)':'Folder name'" class="form-input"/>
        <div class="path-row">
          <input v-model="newAppPath" type="text" :placeholder="newAppType==='app'?'App name or path':'e.g. ~/Projects/myapp'" class="form-input path-input"/>
          <button v-if="newAppType==='app'" class="btn-browse" @click="browseApp">Browse</button>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="showAddForm=false">Cancel</button>
          <button class="btn-save" @click="addApp">Add</button>
        </div>
      </div>
      <button v-else class="add-btn" @click="showAddForm=true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>Add App or Folder</span>
      </button>
    </div>

    <!-- AUDIO -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">Deep Work Audio</span>
        <span class="section-subtitle">Direct MP3 stream URL</span>
      </div>
      <input v-model="settings.deepWorkAudioUrl" type="text" placeholder="https://example.com/ambient.mp3" class="form-input" @blur="settings.save()"/>
    </div>

    <!-- AUTO LAUNCH -->
    <div class="section">
      <div class="setting-row">
        <div class="setting-info">
          <span class="section-title">Launch at Login</span>
          <span class="section-subtitle">Start Lock It when Mac boots</span>
        </div>
        <label class="toggle">
          <input type="checkbox" :checked="settings.autoLaunch" @change="settings.toggleAutoLaunch($event.target.checked)"/>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel { flex:1; display:flex; flex-direction:column; gap:16px; overflow-y:auto; max-height:340px; padding-right:4px; }
.settings-panel::-webkit-scrollbar { width:4px; }
.settings-panel::-webkit-scrollbar-track { background:transparent; }
.settings-panel::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }

.section { display:flex; flex-direction:column; gap:8px; }
.section-header { display:flex; flex-direction:column; gap:2px; }
.section-title { font-size:13px; font-weight:600; color:var(--text-primary); }
.section-subtitle { font-size:11px; color:var(--text-muted); }

.app-list { display:flex; flex-direction:column; gap:4px; }
.empty-state { font-size:12px; color:var(--text-muted); padding:12px; text-align:center; background:var(--bg-secondary); border-radius:8px; border:1px dashed var(--border); }

.app-item { display:flex; align-items:center; gap:10px; padding:8px 10px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:8px; }
.app-icon-box { width:32px; height:32px; border-radius:6px; background:var(--bg-tertiary); display:flex; align-items:center; justify-content:center; color:var(--text-secondary); flex-shrink:0; }
.app-details { flex:1; display:flex; flex-direction:column; min-width:0; }
.app-name { font-size:12px; font-weight:500; color:var(--text-primary); }
.app-path { font-size:10px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

.remove-btn { background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:4px; border-radius:4px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
.remove-btn:hover { color:var(--danger); background:rgba(255,68,68,0.1); }

.add-form { display:flex; flex-direction:column; gap:6px; padding:10px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:8px; }
.type-toggle { display:flex; gap:4px; background:var(--bg-primary); border-radius:6px; padding:2px; }
.type-toggle button { flex:1; padding:5px; font-size:11px; font-weight:500; background:transparent; border:none; color:var(--text-muted); border-radius:4px; cursor:pointer; transition:all 0.15s; font-family:inherit; }
.type-toggle button.active { background:var(--bg-tertiary); color:var(--text-primary); }

.form-input { background:var(--bg-primary); border:1px solid var(--border); border-radius:6px; padding:8px 10px; font-size:12px; color:var(--text-primary); outline:none; font-family:inherit; transition:border-color 0.15s; }
.form-input::placeholder { color:var(--text-muted); }
.form-input:focus { border-color:#444; }

.path-row { display:flex; gap:6px; }
.path-input { flex:1; min-width:0; }
.btn-browse { padding:8px 12px; font-size:11px; font-weight:500; background:var(--bg-tertiary); border:1px solid var(--border); border-radius:6px; color:var(--text-secondary); cursor:pointer; font-family:inherit; white-space:nowrap; transition:all 0.15s; }
.btn-browse:hover { background:var(--bg-secondary); color:var(--text-primary); border-color:#444; }

.form-actions { display:flex; gap:6px; justify-content:flex-end; margin-top:4px; }
.btn-cancel,.btn-save { padding:6px 14px; font-size:11px; font-weight:500; border-radius:6px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.btn-cancel { background:transparent; border:1px solid var(--border); color:var(--text-secondary); }
.btn-cancel:hover { background:var(--bg-tertiary); }
.btn-save { background:var(--text-primary); border:none; color:var(--bg-primary); }
.btn-save:hover { opacity:0.9; }

.add-btn { display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; background:transparent; border:1px dashed var(--border); border-radius:8px; color:var(--text-secondary); font-size:12px; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.add-btn:hover { border-color:#444; color:var(--text-primary); background:var(--bg-secondary); }

.setting-row { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:var(--bg-secondary); border:1px solid var(--border); border-radius:8px; }
.setting-info { display:flex; flex-direction:column; gap:2px; }

.toggle { position:relative; width:40px; height:22px; flex-shrink:0; }
.toggle input { opacity:0; width:0; height:0; }
.toggle-slider { position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:var(--bg-tertiary); border:1px solid var(--border); border-radius:11px; transition:all 0.3s; }
.toggle-slider::before { content:""; position:absolute; height:16px; width:16px; left:2px; bottom:2px; background:var(--text-muted); border-radius:50%; transition:all 0.3s; }
.toggle input:checked + .toggle-slider { background:var(--text-primary); border-color:var(--text-primary); }
.toggle input:checked + .toggle-slider::before { transform:translateX(18px); background:var(--bg-primary); }
</style>
