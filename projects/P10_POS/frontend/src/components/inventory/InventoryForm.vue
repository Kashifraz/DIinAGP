<template>
  <div class="inventory-form">
    <div class="form-group">
      <label for="product_id">Product *</label>
      <select
        id="product_id"
        v-model="form.product_id"
        required
        :disabled="loadingProducts"
        @change="handleProductChange"
      >
        <option value="">Select a product</option>
        <option
          v-for="product in products"
          :key="product.id"
          :value="product.id"
        >
          {{ product.name }} ({{ product.sku || 'N/A' }})
        </option>
      </select>
      <small v-if="loadingProducts">Loading products...</small>
    </div>

    <div class="form-group">
      <label for="quantity">Quantity *</label>
      <input
        id="quantity"
        v-model.number="form.quantity"
        type="number"
        min="0"
        required
        placeholder="0"
      />
    </div>

    <div class="form-group">
      <label for="reorder_level">Reorder Level</label>
      <input
        id="reorder_level"
        v-model.number="form.reorder_level"
        type="number"
        min="0"
        placeholder="0"
      />
      <small>Alert when quantity falls below this level</small>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        Cancel
      </button>
      <button
        type="submit"
        @click.prevent="handleSubmit"
        :disabled="loading || !form.product_id"
        class="btn btn-primary"
      >
        {{ loading ? 'Saving...' : 'Save Inventory' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import inventoryService from '@/services/inventoryService'

const props = defineProps<{
  storeId: number
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const productStore = useProductStore()

const form = ref({
  product_id: '',
  variant_id: null as number | null,
  quantity: 0,
  reorder_level: 0,
})

const products = ref<any[]>([])
const loadingProducts = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const loadProducts = async () => {
  loadingProducts.value = true
  try {
    const response = await productStore.fetchProducts({ per_page: 100, status: 'active' })
    products.value = response.data
  } catch (err) {
    console.error('Failed to load products:', err)
  } finally {
    loadingProducts.value = false
  }
}

const handleProductChange = () => {
  // Reset variant when product changes
  form.value.variant_id = null
}

const handleSubmit = async () => {
  if (!form.value.product_id) {
    error.value = 'Please select a product'
    return
  }

  loading.value = true
  error.value = null

  try {
    await inventoryService.createInventory(props.storeId, {
      product_id: parseInt(form.value.product_id),
      variant_id: form.value.variant_id || undefined,
      quantity: form.value.quantity,
      reorder_level: form.value.reorder_level || 0,
    })

    emit('success')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save inventory item'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.inventory-form {
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

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group input:disabled,
.form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

