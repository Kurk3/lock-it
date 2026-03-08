<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted } from "vue";
import { useSettingsStore } from "../stores/settingsStore";
import * as SettingsRepo from "../services/SettingsRepository";

const settings = useSettingsStore();
const mode = ref(null);

const name = ref("");
const desc = ref("");
const sound = ref("none");
const volume = ref(60);
const closeOtherApps = ref(false);
const nameError = ref("");

const screens = reactive([
  { layout: "fullscreen", nativeFullscreen: false, apps: [null] },
]);

const showAddApp = ref(false);
const newAppName = ref("");
const newAppPath = ref("");
const newAppType = ref("app");

// Which slot is being picked: { screenIdx, slotIdx } or null
const pickingSlot = ref(null);
const showPickerAddApp = ref(false);
const pickerAppName = ref("");
const pickerAppPath = ref("");
const pickerAppType = ref("app");

const sounds = [
  { id: "none", label: "No Sound" },
  { id: "rain", label: "Rain" },
  { id: "river", label: "River Stream" },
  { id: "forest", label: "Forest Birds" },
];

onMounted(() => {
  if (settings.editingModeId) {
    const m = settings.modes.find((x) => x.id === settings.editingModeId);
    if (m) {
      mode.value = m;
      name.value = m.name;
      desc.value = m.desc || "";
      sound.value = m.sound || "none";
      volume.value = m.volume ?? 60;
      closeOtherApps.value = m.closeOtherApps || false;
      if (m.screens && m.screens.length > 0) {
        screens.length = 0;
        m.screens.forEach((s) => screens.push({ layout: s.layout, nativeFullscreen: s.nativeFullscreen || false, apps: [...s.apps] }));
      }
    }
  }
  settings.profileSaveHandler = saveProfile;
});

onUnmounted(() => {
  settings.profileSaveHandler = null;
});

function addScreen() {
  screens.push({ layout: "fullscreen", nativeFullscreen: false, apps: [null] });
}

function removeScreen(idx) {
  if (screens.length <= 1) return;
  screens.splice(idx, 1);
  pickingSlot.value = null;
}

function setScreenLayout(screenIdx, layoutId) {
  const screen = screens[screenIdx];
  screen.layout = layoutId;
  if (layoutId === "fullscreen") {
    screen.apps = [screen.apps[0] || null];
  } else {
    screen.apps = [screen.apps[0] || null, screen.apps[1] || null];
    screen.nativeFullscreen = false;
  }
  pickingSlot.value = null;
}

function startPicking(screenIdx, slotIdx) {
  pickingSlot.value = { screenIdx, slotIdx };
  showPickerAddApp.value = false;
}

function assignApp(app) {
  if (!pickingSlot.value) return;
  const { screenIdx, slotIdx } = pickingSlot.value;
  screens[screenIdx].apps[slotIdx] = { name: app.name, path: app.path, type: app.type };
  pickingSlot.value = null;
}

function clearSlot(screenIdx, slotIdx) {
  screens[screenIdx].apps[slotIdx] = null;
}

function isPicking(screenIdx, slotIdx) {
  return pickingSlot.value && pickingSlot.value.screenIdx === screenIdx && pickingSlot.value.slotIdx === slotIdx;
}

function saveProfile() {
  nameError.value = "";
  if (!name.value.trim()) {
    nameError.value = "Profile name is required";
    nextTick(() => {
      const el = document.querySelector(".input-error-msg");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return;
  }
  const updated = {
    id: mode.value ? mode.value.id : Date.now().toString(),
    name: name.value.trim(),
    desc: desc.value.trim(),
    screens: screens.map((s) => ({ layout: s.layout, nativeFullscreen: s.nativeFullscreen || false, apps: [...s.apps] })),
    sound: sound.value,
    volume: volume.value,
    closeOtherApps: closeOtherApps.value,
  };
  if (mode.value) {
    settings.updateMode(updated);
  } else {
    settings.addMode(updated);
  }
  settings.editingModeId = null;
  settings.currentTab = "home";
}

function cancel() {
  settings.editingModeId = null;
  settings.currentTab = "home";
}

function addApp() {
  if (!newAppName.value.trim() || !newAppPath.value.trim()) return;
  settings.addApp(newAppName.value.trim(), newAppPath.value.trim(), newAppType.value);
  newAppName.value = "";
  newAppPath.value = "";
  newAppType.value = "app";
  showAddApp.value = false;
}

async function browseApp() {
  const result = await SettingsRepo.pickApp();
  if (result) {
    newAppName.value = result.name;
    newAppPath.value = result.path;
  }
}

function addAppFromPicker() {
  if (!pickerAppName.value.trim() || !pickerAppPath.value.trim()) return;
  settings.addApp(pickerAppName.value.trim(), pickerAppPath.value.trim(), pickerAppType.value);
  pickerAppName.value = "";
  pickerAppPath.value = "";
  pickerAppType.value = "app";
  showPickerAddApp.value = false;
}

async function browseAppForPicker() {
  const result = await SettingsRepo.pickApp();
  if (result) {
    pickerAppName.value = result.name;
    pickerAppPath.value = result.path;
  }
}
</script>

<template>
  <div class="profile-editor">
    <div class="editor-header">
      <span class="editor-title">{{ mode ? 'Edit Profile' : 'New Profile' }}</span>
    </div>

    <div class="editor-scroll">
      <!-- NAME & DESCRIPTION -->
      <div class="section">
        <label class="section-label">Profile</label>
        <input v-model="name" type="text" placeholder="Profile name" class="form-input" :class="{ 'input-error': nameError }" @input="nameError = ''" />
        <span v-if="nameError" class="input-error-msg">{{ nameError }}</span>
        <input v-model="desc" type="text" placeholder="Short description" class="form-input" />
      </div>

      <!-- APPS (shared across profiles) -->
      <div class="section">
        <div class="section-header">
          <label class="section-label">Apps</label>
          <span class="section-hint">Shared across all profiles</span>
        </div>
        <div v-if="settings.apps.length > 0" class="app-list-section">
          <div v-for="(app, i) in settings.apps" :key="i" class="app-item">
            <div class="app-item-icon">
              <svg v-if="app.type==='folder'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <span class="app-item-name">{{ app.name }}</span>
            <button class="app-item-remove" @click="settings.removeApp(i)">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div v-if="showAddApp" class="add-form">
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
            <button class="btn-form-cancel" @click="showAddApp=false">Cancel</button>
            <button class="btn-form-save" @click="addApp">Add</button>
          </div>
        </div>
        <button v-else class="add-app-btn" @click="showAddApp=true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add App or Folder</span>
        </button>
      </div>

      <!-- SCREENS / DESKTOPS -->
      <div class="section">
        <label class="section-label">Desktops</label>

        <div v-for="(screen, si) in screens" :key="si" class="screen-card">
          <div class="screen-top">
            <span class="screen-label">Desktop {{ si + 1 }}</span>
            <button v-if="screens.length > 1" class="screen-remove" @click="removeScreen(si)">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Layout toggle inside card -->
          <div class="screen-layout-toggle">
            <button :class="{ active: screen.layout === 'fullscreen' }" @click="setScreenLayout(si, 'fullscreen')">
              <div class="mini-preview"><div class="mp-full"></div></div>
              <span>Full Screen</span>
            </button>
            <button :class="{ active: screen.layout === 'split' }" @click="setScreenLayout(si, 'split')">
              <div class="mini-preview"><div class="mp-half"></div><div class="mp-half"></div></div>
              <span>Split View</span>
            </button>
          </div>

          <!-- Fullscreen mode toggle (only when layout is fullscreen) -->
          <div v-if="screen.layout === 'fullscreen'" class="fullscreen-mode-toggle">
            <button :class="{ active: !screen.nativeFullscreen }" @click="screen.nativeFullscreen = false">
              <span>Maximized</span>
            </button>
            <button :class="{ active: screen.nativeFullscreen }" @click="screen.nativeFullscreen = true">
              <span>Native Fullscreen</span>
            </button>
          </div>

          <!-- App slots -->
          <div class="screen-slots" :class="'layout-' + screen.layout">
            <button
              v-for="(app, ai) in screen.apps"
              :key="ai"
              class="slot-box"
              :class="{ picking: isPicking(si, ai), filled: app }"
              @click="startPicking(si, ai)"
            >
              <template v-if="app">
                <span class="slot-app-name">{{ app.name }}</span>
                <button class="slot-clear" @click.stop="clearSlot(si, ai)">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </template>
              <span v-else class="slot-placeholder">
                {{ screen.layout === 'fullscreen' ? 'Choose app' : (ai === 0 ? 'Left app' : 'Right app') }}
              </span>
            </button>
          </div>

          <!-- App picker (shows when a slot in this screen is being picked) -->
          <div v-if="pickingSlot && pickingSlot.screenIdx === si" class="app-picker">
            <div v-if="settings.apps.length > 0" class="app-list">
              <button
                v-for="(app, i) in settings.apps"
                :key="i"
                class="app-row"
                @click="assignApp(app)"
              >
                <div class="app-row-icon">
                  <svg v-if="app.type==='folder'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <span class="app-row-name">{{ app.name }}</span>
              </button>
            </div>
            <!-- Inline add app form inside picker -->
            <div v-if="showPickerAddApp" class="picker-add-form">
              <div class="type-toggle">
                <button :class="{active: pickerAppType==='app'}" @click="pickerAppType='app'">App</button>
                <button :class="{active: pickerAppType==='folder'}" @click="pickerAppType='folder'">Folder</button>
              </div>
              <input v-model="pickerAppName" type="text" :placeholder="pickerAppType==='app'?'App name':'Folder name'" class="form-input"/>
              <div class="path-row">
                <input v-model="pickerAppPath" type="text" :placeholder="pickerAppType==='app'?'App name or path':'e.g. ~/Projects/myapp'" class="form-input path-input"/>
                <button v-if="pickerAppType==='app'" class="btn-browse" @click="browseAppForPicker">Browse</button>
              </div>
              <div class="form-actions">
                <button class="btn-form-cancel" @click="showPickerAddApp=false">Cancel</button>
                <button class="btn-form-save" @click="addAppFromPicker">Add</button>
              </div>
            </div>
            <!-- Add app button at bottom of picker -->
            <button v-else class="picker-add-btn" @click.stop="showPickerAddApp=true">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Add App</span>
            </button>
          </div>
        </div>

        <!-- Add screen button -->
        <button class="add-screen-btn" @click="addScreen">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Desktop</span>
        </button>
      </div>

      <!-- CLOSE OTHER APPS -->
      <div class="section">
        <div class="toggle-row">
          <div class="toggle-info">
            <label class="section-label">Close Other Apps</label>
            <span class="toggle-desc">Quit other running apps when session starts</span>
          </div>
          <button class="toggle-switch" :class="{ active: closeOtherApps }" @click="closeOtherApps = !closeOtherApps">
            <span class="toggle-knob"></span>
          </button>
        </div>
      </div>

      <!-- BACKGROUND SOUND -->
      <div class="section">
        <label class="section-label">Background Sound</label>
        <div class="sound-select-wrap">
          <select v-model="sound" class="sound-select">
            <option v-for="s in sounds" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div v-if="sound !== 'none'" class="volume-row">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path v-if="volume > 0" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path v-if="volume > 40" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          <input type="range" v-model.number="volume" min="0" max="100" class="volume-slider" />
          <span class="volume-val">{{ volume }}%</span>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.profile-editor { flex: 1; display: flex; flex-direction: column; min-height: 0; }

.editor-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.editor-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }

.editor-scroll {
  flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;
  padding-right: 4px; padding-bottom: 12px; max-height: 300px;
}
.editor-scroll::-webkit-scrollbar { width: 4px; }
.editor-scroll::-webkit-scrollbar-track { background: transparent; }
.editor-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.section { display: flex; flex-direction: column; gap: 6px; }
.section-header { display: flex; align-items: baseline; justify-content: space-between; }
.section-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.section-hint { font-size: 10px; color: var(--text-muted); }

.form-input {
  background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px;
  padding: 8px 10px; font-size: 12px; color: var(--text-primary); outline: none;
  font-family: inherit; transition: border-color 0.15s;
}
.form-input::placeholder { color: var(--text-muted); }
.form-input:focus { border-color: var(--border-light); }
.form-input.input-error { border-color: var(--danger); }
.form-input.input-error:focus { border-color: var(--danger); }
.input-error-msg { font-size: 11px; color: var(--danger); margin-top: -2px; }

/* Screen Card */
.screen-card {
  background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px;
  padding: 10px; display: flex; flex-direction: column; gap: 8px;
}

.screen-top { display: flex; align-items: center; justify-content: space-between; }
.screen-label { font-size: 11px; font-weight: 600; color: var(--text-primary); }
.screen-remove {
  background: transparent; border: none; color: var(--text-muted); cursor: pointer;
  padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.screen-remove:hover { color: var(--danger); background: rgba(255,68,68,0.1); }

/* Layout toggle inside screen card */
.screen-layout-toggle { display: flex; gap: 4px; background: var(--bg-primary); border-radius: 6px; padding: 2px; }
.screen-layout-toggle button {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
  padding: 5px 6px; font-size: 10px; font-weight: 500; background: transparent; border: none;
  color: var(--text-muted); border-radius: 4px; cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.screen-layout-toggle button.active { background: var(--bg-tertiary); color: var(--text-primary); }

/* Fullscreen mode sub-toggle */
.fullscreen-mode-toggle { display: flex; gap: 4px; background: var(--bg-primary); border-radius: 6px; padding: 2px; }
.fullscreen-mode-toggle button {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
  padding: 4px 6px; font-size: 10px; font-weight: 500; background: transparent; border: none;
  color: var(--text-muted); border-radius: 4px; cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.fullscreen-mode-toggle button.active { background: var(--bg-tertiary); color: var(--text-primary); }

.mini-preview { display: flex; gap: 1px; width: 20px; height: 14px; }
.mp-full { flex: 1; background: var(--border-light); border-radius: 2px; }
.mp-half { flex: 1; background: var(--border-light); border-radius: 2px; }
.screen-layout-toggle button.active .mp-full,
.screen-layout-toggle button.active .mp-half { background: var(--text-secondary); }

/* App slots inside screen */
.screen-slots { display: flex; gap: 3px; height: 44px; }
.screen-slots .slot-box { flex: 1; }

.slot-box {
  position: relative; display: flex; align-items: center; justify-content: center;
  background: var(--bg-primary); border: 1px dashed var(--border-dashed); border-radius: 6px;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.slot-box:hover { border-color: var(--border-light); }
.slot-box.picking { border-color: var(--text-primary); border-style: solid; background: var(--bg-tertiary); }
.slot-box.filled { border-style: solid; border-color: var(--border-light); }
.slot-placeholder { font-size: 10px; color: var(--text-muted); }
.slot-app-name { font-size: 11px; font-weight: 500; color: var(--text-primary); }
.slot-clear {
  position: absolute; top: 2px; right: 2px; width: 14px; height: 14px;
  background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 3px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  color: var(--text-muted); transition: all 0.15s;
}
.slot-clear:hover { color: var(--danger); border-color: var(--danger); }

/* App picker dropdown */
.app-picker {
  background: var(--bg-primary); border: 1px solid var(--border); border-radius: 6px;
  padding: 4px; max-height: 200px; overflow-y: auto;
}
.app-picker::-webkit-scrollbar { width: 3px; }
.app-picker::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.app-list { display: flex; flex-direction: column; gap: 2px; }
.app-row {
  display: flex; align-items: center; gap: 8px; padding: 5px 8px;
  background: transparent; border: none; border-radius: 4px;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.app-row:hover { background: var(--bg-tertiary); }
.app-row-icon { color: var(--text-muted); display: flex; align-items: center; flex-shrink: 0; }
.app-row-name { flex: 1; font-size: 11px; color: var(--text-primary); text-align: left; }

.empty-hint { font-size: 11px; color: var(--text-muted); padding: 8px; text-align: center; }

.picker-add-btn {
  display: flex; align-items: center; gap: 5px; width: 100%; padding: 5px 8px;
  background: transparent; border: none; border-top: 1px solid var(--border);
  color: var(--text-muted); font-size: 11px; cursor: pointer; font-family: inherit;
  transition: all 0.15s; margin-top: 2px;
}
.picker-add-btn:hover { color: var(--text-primary); background: var(--bg-tertiary); }

.picker-add-form {
  display: flex; flex-direction: column; gap: 5px; padding: 6px;
  border-top: 1px solid var(--border); margin-top: 2px;
}

/* Add Screen / Add App buttons */
.add-screen-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px;
  background: transparent; border: 1px dashed var(--border-dashed); border-radius: 8px;
  color: var(--text-muted); font-size: 11px; cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.add-screen-btn:hover { border-color: var(--border-light); color: var(--text-primary); background: var(--bg-secondary); }

.add-app-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px;
  background: transparent; border: 1px dashed var(--border-dashed); border-radius: 8px;
  color: var(--text-muted); font-size: 11px; cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.add-app-btn:hover { border-color: var(--border-light); color: var(--text-primary); background: var(--bg-secondary); }

/* App list section */
.app-list-section { display: flex; flex-direction: column; gap: 3px; }
.app-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px;
  background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px;
}
.app-item-icon { color: var(--text-muted); display: flex; align-items: center; flex-shrink: 0; }
.app-item-name { flex: 1; font-size: 12px; color: var(--text-primary); }
.app-item-remove {
  background: transparent; border: none; color: var(--text-muted); cursor: pointer;
  padding: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.app-item-remove:hover { color: var(--danger); background: rgba(255,68,68,0.1); }

/* Add App Form */
.add-form { display: flex; flex-direction: column; gap: 6px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; }
.type-toggle { display: flex; gap: 4px; background: var(--bg-primary); border-radius: 6px; padding: 2px; }
.type-toggle button { flex: 1; padding: 5px; font-size: 11px; font-weight: 500; background: transparent; border: none; color: var(--text-muted); border-radius: 4px; cursor: pointer; transition: all 0.15s; font-family: inherit; }
.type-toggle button.active { background: var(--bg-tertiary); color: var(--text-primary); }
.path-row { display: flex; gap: 6px; }
.path-input { flex: 1; min-width: 0; }
.btn-browse { padding: 8px 12px; font-size: 11px; font-weight: 500; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 6px; color: var(--text-secondary); cursor: pointer; font-family: inherit; white-space: nowrap; transition: all 0.15s; }
.btn-browse:hover { background: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-light); }
.form-actions { display: flex; gap: 6px; justify-content: flex-end; margin-top: 4px; }
.btn-form-cancel, .btn-form-save { padding: 6px 14px; font-size: 11px; font-weight: 500; border-radius: 6px; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.btn-form-cancel { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }
.btn-form-cancel:hover { background: var(--bg-tertiary); }
.btn-form-save { background: var(--text-primary); border: none; color: var(--bg-primary); }
.btn-form-save:hover { opacity: 0.9; }

/* Toggle */
.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; }
.toggle-info { display: flex; flex-direction: column; gap: 2px; }
.toggle-desc { font-size: 10px; color: var(--text-muted); }
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

/* Sound Select */
.sound-select-wrap { position: relative; }
.sound-select {
  width: 100%; appearance: none; -webkit-appearance: none;
  background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 6px;
  padding: 8px 28px 8px 10px; font-size: 12px; color: var(--text-primary);
  outline: none; font-family: inherit; cursor: pointer; transition: border-color 0.15s;
}
.sound-select:focus { border-color: var(--border-light); }
.sound-select option { background: var(--bg-secondary); color: var(--text-primary); }
.select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }

/* Volume */
.volume-row { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
.volume-slider {
  flex: 1; -webkit-appearance: none; appearance: none; height: 4px;
  background: var(--bg-tertiary); border-radius: 2px; outline: none;
}
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none; width: 14px; height: 14px;
  border-radius: 50%; background: var(--text-primary); cursor: pointer; border: none;
}
.volume-val { font-size: 11px; color: var(--text-muted); min-width: 30px; text-align: right; }

</style>
