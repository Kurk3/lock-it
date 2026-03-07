<script setup>
defineProps({
  modeName: { type: String, required: true },
});
defineEmits(["confirm", "cancel"]);
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal">
      <div class="modal-title">Delete mode</div>
      <div class="modal-text">Are you sure you want to delete <strong>{{ modeName }}</strong>?</div>
      <div class="modal-actions">
        <button class="btn-secondary" @click="$emit('cancel')">Cancel</button>
        <button class="btn-confirm-delete" @click="$emit('confirm')">Delete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px;
  padding: 20px; width: 260px; display: flex; flex-direction: column; gap: 12px;
}
.modal-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.modal-text { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }

.btn-secondary {
  padding: 7px 12px; font-size: 11px; font-weight: 500; border-radius: 6px;
  background: transparent; border: 1px solid var(--border); color: var(--text-secondary);
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-secondary:hover { background: var(--bg-tertiary); color: var(--text-primary); border-color: var(--border-light); }

.btn-confirm-delete {
  padding: 7px 16px; font-size: 12px; font-weight: 600; border-radius: 6px;
  background: var(--danger); color: white; border: none;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-confirm-delete:hover { opacity: 0.9; }
</style>
