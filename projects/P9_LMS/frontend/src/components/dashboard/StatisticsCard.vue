<template>
  <div class="statistics-card">
    <div class="statistics-icon" :class="iconClass">
      <i :class="icon"></i>
    </div>
    <div class="statistics-content">
      <h3 class="statistics-value">{{ value }}</h3>
      <p class="statistics-label">{{ label }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: [String, Number],
    required: true
  },
  label: {
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
  }
})
</script>

<style scoped>
.statistics-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.statistics-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.statistics-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.statistics-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.statistics-icon.success {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.statistics-icon.info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.statistics-icon.warning {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.statistics-content {
  flex: 1;
}

.statistics-value {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.statistics-label {
  font-size: 14px;
  color: #666;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .statistics-card {
    padding: 20px;
  }

  .statistics-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }

  .statistics-value {
    font-size: 28px;
  }
}
</style>

