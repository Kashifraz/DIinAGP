<template>
  <div class="product-variant-form">
    <div class="form-group">
      <label for="variant_name">Variant Name *</label>
      <input
        id="variant_name"
        v-model="form.variant_name"
        type="text"
        required
        maxlength="100"
        placeholder="e.g., Color, Size"
      />
    </div>

    <div class="form-group">
      <label for="variant_value">Variant Value *</label>
      <input
        id="variant_value"
        v-model="form.variant_value"
        type="text"
        required
        maxlength="100"
        placeholder="e.g., Red, Large"
      />
    </div>

    <div class="form-group">
      <label for="price_adjustment">Price Adjustment</label>
      <input
        id="price_adjustment"
        v-model="form.price_adjustment"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
      <small>Enter positive or negative value to adjust base price</small>
    </div>

    <div class="form-group">
      <label for="sku_suffix">SKU Suffix</label>
      <input
        id="sku_suffix"
        v-model="form.sku_suffix"
        type="text"
        maxlength="50"
        placeholder="Optional SKU suffix"
      />
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        Cancel
      </button>
      <button
        type="submit"
        @click.prevent="handleSubmit"
        :disabled="loading || !form.variant_name || !form.variant_value"
        class="btn btn-primary"
      >
        {{ loading ? 'Creating...' : 'Create Variant' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import productService from '@/services/productService'

const props = defineProps<{
  productId: number
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const form = ref({
  variant_name: '',
  variant_value: '',
  price_adjustment: '0.00',
  sku_suffix: '',
})

const loading = ref(false)
const error = ref<string | null>(null)

const handleSubmit = async () => {
  if (!form.value.variant_name || !form.value.variant_value) {
    error.value = 'Variant name and value are required'
    return
  }

  loading.value = true
  error.value = null

  try {
    await productService.createVariant(props.productId, {
      variant_name: form.value.variant_name,
      variant_value: form.value.variant_value,
      price_adjustment: form.value.price_adjustment || '0.00',
      sku_suffix: form.value.sku_suffix || undefined,
    })

    emit('success')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to create variant'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.product-variant-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--color-text);
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group small {
  color: var(--color-text-soft);
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.error-message {
  padding: 1rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 0.875rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-border);
}
</style>

