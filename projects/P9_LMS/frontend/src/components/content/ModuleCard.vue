<template>
  <div class="module-card" :class="{ expanded: isExpanded }">
    <div class="module-header" @click="toggleExpand">
      <div class="module-title-section">
        <h3>{{ module.name }}</h3>
        <span v-if="module.contents && module.contents.length > 0" class="content-count">
          {{ module.contents.length }} item(s)
        </span>
      </div>
      <div class="module-actions">
        <button
          v-if="canEdit"
          @click.stop="editModule"
          class="btn-icon"
          title="Edit Module"
        >
          <i class="fas fa-edit"></i>
        </button>
        <button
          v-if="canEdit"
          @click.stop="deleteModule"
          class="btn-icon btn-delete"
          title="Delete Module"
        >
          <i class="fas fa-trash"></i>
        </button>
        <i class="fas expand-icon" :class="isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
      </div>
    </div>
    
    <div v-if="module.description" class="module-description">
      {{ module.description }}
    </div>

    <div v-if="isExpanded" class="module-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  module: {
    type: Object,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'expand'])

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value && props.module && props.module.id) {
    emit('expand', props.module.id)
  }
}

const editModule = () => {
  emit('edit', props.module)
}

const deleteModule = () => {
  emit('delete', props.module)
}
</script>

<style scoped>
.module-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  transition: box-shadow 0.3s;
}

.module-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  user-select: none;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 768px) {
  .module-header {
    padding: 12px 15px;
  }
}

.module-title-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .module-title-section {
    gap: 10px;
    width: 100%;
  }
  
  .module-title-section h3 {
    font-size: 16px;
    flex: 1;
    min-width: 0;
    word-break: break-word;
  }
  
  .content-count {
    font-size: 11px;
    padding: 3px 8px;
  }
}

.module-title-section h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.content-count {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.module-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .module-actions {
    gap: 8px;
  }
  
  .btn-icon {
    width: 28px;
    height: 28px;
    font-size: 14px;
    padding: 6px;
  }
  
  .expand-icon {
    font-size: 12px;
    margin-left: 5px;
  }
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
  color: #666;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.btn-icon:hover {
  background: #f5f5f5;
  color: #333;
}

.btn-delete {
  color: #f44336;
}

.btn-delete:hover {
  background: #ffebee;
  color: #d32f2f;
}

.expand-icon {
  color: #666;
  font-size: 14px;
  margin-left: 10px;
  transition: transform 0.2s;
}

.module-description {
  padding: 0 20px 15px 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.module-content {
  padding: 20px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
}

@media (max-width: 768px) {
  .module-content {
    padding: 15px;
  }
  
  .module-description {
    padding: 0 15px 12px 15px;
    font-size: 13px;
  }
}
</style>

