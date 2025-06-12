<template>
  <div class="store-team-view">
    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />

    <div v-else-if="team.length === 0" class="empty-state">
      <p>No team members assigned</p>
    </div>

    <div v-else class="team-list">
      <div
        v-for="member in team"
        :key="member.assignment_id"
        class="team-member"
      >
        <div class="member-info">
          <div class="member-name">{{ member.name }}</div>
          <div class="member-details">
            <span class="member-role" :class="member.role">
              {{ member.role }}
            </span>
            <span class="member-email">{{ member.email }}</span>
            <span v-if="member.phone" class="member-phone">{{ member.phone }}</span>
          </div>
        </div>
        <div class="member-actions">
          <span class="assigned-date">
            Assigned: {{ formatDate(member.assigned_at) }}
          </span>
          <button
            v-if="authStore.isAdmin"
            @click="handleRemove(member)"
            class="btn btn-sm btn-danger"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreStore } from '@/stores/store'
import { useAuthStore } from '@/stores/auth'
import storeService, { type StoreTeamMember } from '@/services/storeService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const props = defineProps<{
  storeId: number
}>()

const emit = defineEmits<{
  refresh: []
}>()

const storeStore = useStoreStore()
const authStore = useAuthStore()

const team = ref<StoreTeamMember[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadTeam = async () => {
  loading.value = true
  error.value = null
  try {
    team.value = await storeService.getStoreTeam(props.storeId)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load team'
  } finally {
    loading.value = false
  }
}

const handleRemove = async (member: StoreTeamMember) => {
  if (!confirm(`Remove ${member.name} from this store?`)) {
    return
  }

  try {
    await storeService.removeUserAssignment(props.storeId, member.user_id)
    await loadTeam()
    emit('refresh')
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to remove team member')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadTeam()
})
</script>

<style scoped>
.store-team-view {
  margin-top: 1rem;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.team-member {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.member-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.member-role {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.member-role.manager {
  background-color: #3b82f6;
  color: white;
}

.member-role.cashier {
  background-color: #10b981;
  color: white;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.assigned-date {
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-soft);
}

.btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8125rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}
</style>

