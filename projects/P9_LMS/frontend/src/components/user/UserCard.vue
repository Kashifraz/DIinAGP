<template>
  <div class="user-card">
    <div class="user-info">
      <div class="user-avatar">
        <img v-if="user.profilePictureUrl" :src="user.profilePictureUrl" :alt="user.firstName" />
        <div v-else class="avatar-placeholder">
          {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
        </div>
      </div>
      <div class="user-details">
        <h3>{{ user.firstName }} {{ user.lastName }}</h3>
        <p class="user-email">{{ user.email }}</p>
        <div class="user-meta">
          <span class="role-badge" :class="user.role.toLowerCase()">{{ user.role }}</span>
          <span class="status-badge" :class="user.status.toLowerCase()">{{ user.status }}</span>
        </div>
      </div>
    </div>
    <div v-if="showActions" class="user-actions">
      <button @click="$emit('view', user)" class="btn-view">View</button>
      <button @click="$emit('edit', user)" class="btn-edit">Edit</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

defineEmits(['view', 'edit'])
</script>

<style scoped>
.user-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  transition: box-shadow 0.3s;
}

.user-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
  overflow: hidden;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 24px;
  font-weight: bold;
  color: #666;
}

.user-details h3 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 18px;
}

.user-email {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.user-meta {
  display: flex;
  gap: 10px;
}

.role-badge,
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.role-badge.coordinator {
  background: #ff9800;
  color: white;
}

.role-badge.professor {
  background: #2196f3;
  color: white;
}

.role-badge.student {
  background: #4caf50;
  color: white;
}

.status-badge.active {
  background: #4caf50;
  color: white;
}

.status-badge.inactive {
  background: #f44336;
  color: white;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.btn-view,
.btn-edit {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-view {
  background: #2196f3;
  color: white;
}

.btn-view:hover {
  background: #1976d2;
}

.btn-edit {
  background: #4caf50;
  color: white;
}

.btn-edit:hover {
  background: #45a049;
}
</style>

