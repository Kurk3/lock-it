<script setup>
defineProps({
  time: { type: String, required: true },
  modeLabel: { type: String, required: true },
});
defineEmits(["stop"]);
</script>

<template>
  <div class="locked-state">
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
    <div class="timer-display">{{ time }}</div>
    <div class="mode-indicator">{{ modeLabel }}</div>
    <button class="stop-btn" @click="$emit('stop')">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
      <span>Stop Session</span>
    </button>
  </div>
</template>

<style scoped>
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
