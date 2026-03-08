<script setup>
defineProps({
  mode: { type: Object, required: true },
});
defineEmits(["start", "modify", "delete"]);
</script>

<template>
  <div class="mode-card">
    <div class="mode-card-info">
      <span class="mode-card-name">{{ mode.name }}</span>
      <span class="mode-card-desc">{{ mode.desc }}</span>
    </div>
    <div class="mode-card-actions">
      <button class="btn-start" @click="$emit('start')">Start</button>
      <div class="btn-group">
        <button class="btn-secondary" @click="$emit('modify')">Modify</button>
        <button class="btn-delete" @click="$emit('delete')">Delete</button>
      </div>
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
  padding: 6px 12px; font-size: 12px; font-weight: 500; border-radius: 6px;
  background: transparent; border: 1px dashed var(--border-dashed); color: var(--text-muted);
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-secondary:hover { background: var(--bg-tertiary); color: var(--text-primary); border-color: var(--text-secondary); }

.btn-delete {
  padding: 6px 12px; font-size: 12px; font-weight: 500; border-radius: 6px;
  background: transparent; border: 1px solid rgba(232,64,64,0.35); color: var(--danger);
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-delete:hover { background: rgba(255,68,68,0.1); border-color: rgba(255,68,68,0.4); }
</style>
