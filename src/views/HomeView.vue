<script setup>
import { ref } from "vue";
import { useSessionStore } from "../stores/sessionStore";
import { useTimerStore } from "../stores/timerStore";
import { useSettingsStore } from "../stores/settingsStore";
import ModeCard from "../components/ModeCard.vue";
import DeleteModal from "../components/DeleteModal.vue";
import TimerDisplay from "../components/TimerDisplay.vue";

const session = useSessionStore();
const timer = useTimerStore();
const settings = useSettingsStore();

const showDeleteConfirm = ref(null);

async function handleLockIn(modeId) {
  await session.lockIn(modeId);
}

async function handleStop() {
  await session.stopSession();
}

function confirmDelete(modeId) {
  showDeleteConfirm.value = modeId;
}

function cancelDelete() {
  showDeleteConfirm.value = null;
}

function deleteMode() {
  if (showDeleteConfirm.value) {
    settings.deleteMode(showDeleteConfirm.value);
  }
  showDeleteConfirm.value = null;
}

function getModeName(modeId) {
  const m = settings.modes.find((x) => x.id === modeId);
  return m ? m.name : modeId;
}
</script>

<template>
  <div class="home-view">
    <!-- IDLE -->
    <div v-if="!session.isLocked" class="idle-state">

      <!-- Empty State -->
      <div v-if="settings.modes.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <span class="empty-title">No modes yet</span>
        <span class="empty-desc">Create a focus profile to get started</span>
        <button class="btn-start" @click="settings.currentTab = 'addProfile'">+ Add Profile</button>
      </div>

      <!-- Mode Cards -->
      <ModeCard
        v-for="m in settings.modes"
        :key="m.id"
        :mode="m"
        @start="handleLockIn(m.id)"
        @modify="() => {}"
        @delete="confirmDelete(m.id)"
      />
    </div>

    <!-- LOCKED IN -->
    <TimerDisplay
      v-if="session.isLocked"
      :time="timer.display"
      :mode-label="getModeName(session.mode)"
      @stop="handleStop"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteModal
      v-if="showDeleteConfirm"
      :mode-name="getModeName(showDeleteConfirm)"
      @confirm="deleteMode"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.home-view { flex: 1; display: flex; flex-direction: column; position: relative; }
.idle-state { flex: 1; display: flex; flex-direction: column; gap: 14px; }

.empty-state {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 40px 0;
}
.empty-icon { color: var(--text-muted); opacity: 0.4; margin-bottom: 4px; }
.empty-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); }
.empty-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }

.btn-start {
  padding: 7px 20px; font-size: 12px; font-weight: 600; border-radius: 6px;
  background: var(--text-primary); color: var(--bg-primary); border: none;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.btn-start:hover { opacity: 0.9; }
</style>
