<script setup>
const props = defineProps({
  time: { type: String, required: true },
  modeLabel: { type: String, required: true },
  sound: { type: String, default: "none" },
  volume: { type: Number, default: 60 },
  showStopConfirm: { type: Boolean, default: false },
});
const emit = defineEmits(["stop", "confirm-stop", "cancel-stop", "volume-change"]);

const soundLabels = {
  none: "No Sound",
  rain: "Rain",
  river: "River Stream",
  forest: "Forest Birds",
};
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

    <!-- Sound bar with volume slider -->
    <div v-if="sound !== 'none'" class="sound-bar">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path v-if="volume > 0" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path v-if="volume > 40" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
      <span class="sound-label">{{ soundLabels[sound] || sound }}</span>
      <input
        type="range"
        :value="volume"
        min="0"
        max="100"
        class="sound-slider"
        @input="emit('volume-change', Number($event.target.value))"
      />
      <span class="sound-vol">{{ volume }}%</span>
    </div>

    <div class="stop-area">
      <button class="stop-btn" @click="$emit('stop')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
        <span>Stop Session</span>
      </button>
    </div>

    <!-- Stop confirmation overlay -->
    <div v-if="showStopConfirm" class="stop-overlay" @click.self="emit('cancel-stop')">
      <div class="stop-modal">
        <button class="modal-close" @click="emit('cancel-stop')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <span class="confirm-text">Stop {{ modeLabel }} session?</span>
        <div class="confirm-actions">
          <button class="btn-keep" @click="emit('cancel-stop')">Keep Going</button>
          <button class="btn-end" @click="emit('confirm-stop')">End Session</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.locked-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 20px 0; position: relative; }

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
.mode-indicator { font-size: 12px; color: var(--text-muted); }

/* Sound bar */
.sound-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 20px;
  background: var(--bg-secondary); border: 1px solid var(--border);
  color: var(--text-muted); margin-top: 4px;
}
.sound-label { font-size: 11px; color: var(--text-secondary); white-space: nowrap; }
.sound-slider {
  width: 80px; -webkit-appearance: none; appearance: none; height: 3px;
  background: var(--border); border-radius: 2px; outline: none;
}
.sound-slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none; width: 12px; height: 12px;
  border-radius: 50%; background: var(--text-primary); cursor: pointer; border: none;
}
.sound-vol { font-size: 10px; color: var(--text-muted); min-width: 28px; text-align: right; }

/* Stop area */
.stop-area { margin-top: 16px; }
.stop-btn {
  display: flex; align-items: center; gap: 8px;
  background: transparent; border: 1px solid rgba(255,68,68,0.3);
  color: var(--danger); padding: 10px 24px; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.2s ease; font-family: inherit;
}
.stop-btn:hover { background: rgba(255,68,68,0.1); border-color: rgba(255,68,68,0.5); }

/* Stop confirmation overlay */
.stop-overlay {
  position: absolute; inset: 0; z-index: 10;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.stop-modal {
  position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 20px 24px; background: var(--bg-primary); border: 1px solid var(--border);
  border-radius: 12px;
}
.modal-close {
  position: absolute; top: 8px; right: 8px; background: transparent; border: none;
  color: var(--text-muted); cursor: pointer; padding: 2px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.modal-close:hover { color: var(--text-primary); background: var(--bg-secondary); }
.confirm-text { font-size: 12px; color: var(--text-secondary); text-align: center; line-height: 1.4; }
.confirm-actions { display: flex; gap: 8px; }
.btn-keep, .btn-end {
  padding: 7px 16px; font-size: 12px; font-weight: 500; border-radius: 6px;
  cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap;
}
.btn-keep {
  background: transparent; border: 1px solid var(--border); color: var(--text-secondary);
}
.btn-keep:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.btn-end {
  background: var(--danger); border: none; color: #fff; font-weight: 600;
}
.btn-end:hover { opacity: 0.9; }
</style>
