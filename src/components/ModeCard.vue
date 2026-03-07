<script setup>
defineProps({
  mode: { type: Object, required: true },
});
defineEmits(["start", "modify", "delete"]);
</script>

<template>
  <div class="mode-card">
    <div class="mode-card-header">
      <div class="mode-card-icon">
        <svg v-if="mode.icon === 'clock'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
        <svg v-else-if="mode.icon === 'book'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
      <div class="mode-card-info">
        <span class="mode-card-name">{{ mode.name }}</span>
        <span class="mode-card-desc">{{ mode.desc }}</span>
      </div>
    </div>
    <div class="mode-card-actions">
      <div class="btn-group">
        <button class="btn-start" @click="$emit('start')">Start</button>
        <button class="btn-secondary" @click="$emit('modify')">Modify</button>
      </div>
      <button class="btn-delete" @click="$emit('delete')">Delete</button>
    </div>
  </div>
</template>

<style scoped>
.mode-card {
  background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px;
  padding: 18px; display: flex; flex-direction: column; gap: 16px;
  transition: border-color 0.15s;
}
.mode-card:hover { border-color: var(--border-light); }

.mode-card-header { display: flex; align-items: center; gap: 10px; }
.mode-card-icon {
  width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center; color: var(--text-primary); flex-shrink: 0;
}
.mode-card-info { display: flex; flex-direction: column; gap: 2px; }
.mode-card-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.mode-card-desc { font-size: 11px; color: var(--text-muted); }

.mode-card-actions { display: flex; align-items: center; justify-content: space-between; }

.btn-start {
  padding: 7px 20px; font-size: 12px; font-weight: 600; border-radius: 6px;
  background: var(--text-primary); color: var(--bg-primary); border: none;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-start:hover { opacity: 0.9; }

.btn-group { display: flex; gap: 6px; }

.btn-secondary {
  padding: 7px 12px; font-size: 11px; font-weight: 500; border-radius: 6px;
  background: transparent; border: 1px solid var(--border); color: var(--text-secondary);
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-secondary:hover { background: var(--bg-tertiary); color: var(--text-primary); border-color: var(--border-light); }

.btn-delete {
  padding: 7px 12px; font-size: 11px; font-weight: 500; border-radius: 6px;
  background: transparent; border: 1px solid rgba(255,68,68,0.2); color: var(--danger);
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-delete:hover { background: rgba(255,68,68,0.1); border-color: rgba(255,68,68,0.4); }
</style>
