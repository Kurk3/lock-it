<script setup>
import { ref } from "vue";
import { useLockStore } from "../stores/lockStore";

const store = useLockStore();
const lastSession = ref(null);

async function handleLockIn(m) { await store.lockIn(m); }
async function handleStop() {
  const prevMode = store.mode;
  const time = await store.stopSession();
  lastSession.value = { mode: prevMode, time };
}
</script>

<template>
  <div class="home-panel">
    <!-- IDLE -->
    <div v-if="!store.isLocked" class="idle-state">
      <div class="prompt-text">Choose your focus mode</div>

      <button class="mode-btn deep" @click="handleLockIn('deep')">
        <div class="mode-btn-inner">
          <div class="mode-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div class="mode-info">
            <span class="mode-name">Deep Work</span>
            <span class="mode-desc">Full focus · Grayscale · Sound</span>
          </div>
          <svg class="mode-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6" /></svg>
        </div>
      </button>

      <button class="mode-btn shallow" @click="handleLockIn('shallow')">
        <div class="mode-btn-inner">
          <div class="mode-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div class="mode-info">
            <span class="mode-name">Shallow Work</span>
            <span class="mode-desc">Light focus · Grayscale · No sound</span>
          </div>
          <svg class="mode-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6" /></svg>
        </div>
      </button>

      <div v-if="lastSession" class="last-session">
        <span class="last-label">Last session</span>
        <span class="last-time">{{ lastSession.time }}</span>
      </div>
    </div>

    <!-- LOCKED IN -->
    <div v-else class="locked-state">
      <div class="lock-animation">
        <div class="pulse-ring"></div>
        <div class="pulse-ring delay"></div>
        <div class="lock-icon-container">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            <circle cx="12" cy="16" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
      <div class="locked-label">LOCKED IN</div>
      <div class="timer-display">{{ store.timerDisplay }}</div>
      <div class="mode-indicator">{{ store.mode === 'deep' ? 'Deep Work' : 'Shallow Work' }}</div>
      <button class="stop-btn" @click="handleStop">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
        <span>Stop Session</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.home-panel { flex: 1; display: flex; flex-direction: column; }
.idle-state { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.prompt-text { font-size: 12px; color: var(--text-secondary); letter-spacing: 0.5px; margin-bottom: 4px; }

.mode-btn {
  background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px;
  padding: 14px; cursor: pointer; transition: all 0.2s ease; color: var(--text-primary); text-align: left;
}
.mode-btn:hover { background: var(--bg-hover); border-color: #333; transform: translateY(-1px); }
.mode-btn:active { transform: translateY(0); }
.mode-btn-inner { display: flex; align-items: center; gap: 12px; }

.mode-icon {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mode-btn.deep .mode-icon { background: rgba(255,255,255,0.08); }
.mode-btn.shallow .mode-icon { background: rgba(255,255,255,0.04); }

.mode-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.mode-name { font-size: 14px; font-weight: 600; }
.mode-desc { font-size: 11px; color: var(--text-secondary); }
.mode-arrow { color: var(--text-muted); flex-shrink: 0; }

.last-session {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: auto; padding: 10px 0; border-top: 1px solid var(--border);
}
.last-label { font-size: 11px; color: var(--text-muted); }
.last-time { font-size: 12px; color: var(--text-secondary); font-variant-numeric: tabular-nums; font-family: 'SF Mono', monospace; }

/* LOCKED STATE */
.locked-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 20px 0; }

.lock-animation { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.pulse-ring {
  position: absolute; width: 100%; height: 100%;
  border: 1px solid rgba(255,255,255,0.1); border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}
.pulse-ring.delay { animation-delay: 1.5s; }
@keyframes pulse { 0%,100% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } }

.lock-icon-container {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--bg-secondary); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-primary); z-index: 1;
}

.locked-label { font-size: 11px; font-weight: 700; letter-spacing: 3px; color: var(--text-secondary); }
.timer-display {
  font-size: 48px; font-weight: 200; letter-spacing: 2px; color: var(--text-primary);
  font-variant-numeric: tabular-nums; line-height: 1;
}
.mode-indicator { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; }

.stop-btn {
  display: flex; align-items: center; gap: 8px;
  background: transparent; border: 1px solid rgba(255,68,68,0.3);
  color: var(--danger); padding: 10px 24px; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.2s ease; font-family: inherit;
}
.stop-btn:hover { background: rgba(255,68,68,0.1); border-color: rgba(255,68,68,0.5); }
</style>
