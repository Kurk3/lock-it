<script setup>
import { useLockStore } from "../stores/lockStore";
const store = useLockStore();
</script>

<template>
  <div class="navbar">
    <button class="nav-btn" :class="{active: store.currentTab==='home'}" @click="store.currentTab='home'">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span>Home</span>
    </button>
    <button class="nav-btn" :class="{active: store.currentTab==='settings'}" @click="store.currentTab='settings'">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
      <span>Settings</span>
    </button>
  </div>
</template>

<style scoped>
.navbar { display:flex; gap:4px; margin-top:auto; padding-top:12px; border-top:1px solid var(--border); }
.nav-btn {
  flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;
  padding:8px; background:transparent; border:none; border-radius:8px;
  color:var(--text-muted); cursor:pointer; transition:all 0.15s; font-family:inherit;
}
.nav-btn span { font-size:10px; font-weight:500; letter-spacing:0.3px; }
.nav-btn:hover { color:var(--text-secondary); background:var(--bg-secondary); }
.nav-btn.active { color:var(--text-primary); background:var(--bg-secondary); }
</style>
