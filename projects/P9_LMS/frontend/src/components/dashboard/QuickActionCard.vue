<template>
  <div class="quick-action-card" @click="handleClick">
    <div class="action-icon" :class="iconClass">
      <i :class="icon"></i>
    </div>
    <div class="action-content">
      <h4 class="action-title">{{ title }}</h4>
      <p class="action-description">{{ description }}</p>
    </div>
    <div class="action-arrow">
      <i class="fas fa-chevron-right"></i>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  iconClass: {
    type: String,
    default: 'primary'
  },
  route: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (props.route) {
    emit('click', props.route)
  } else {
    emit('click')
  }
}
</script>

<style scoped>
.quick-action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.action-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-icon.success {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.action-icon.info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.action-icon.warning {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.action-description {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.action-arrow {
  color: #999;
  font-size: 14px;
  flex-shrink: 0;
}

.quick-action-card:hover .action-arrow {
  color: #667eea;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .quick-action-card {
    padding: 16px;
  }

  .action-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .action-title {
    font-size: 14px;
  }

  .action-description {
    font-size: 12px;
  }
}
</style>

