<template>
  <div class="product-variants-view">
    <div v-if="variants.length === 0" class="empty-state">
      <p>No variants available</p>
    </div>

    <div v-else class="variants-list">
      <div
        v-for="variant in variants"
        :key="variant.id"
        class="variant-item"
      >
        <div class="variant-info">
          <div class="variant-name">{{ variant.variant_name }}: {{ variant.variant_value }}</div>
          <div class="variant-details">
            <span class="price-adjustment">
              Price Adjustment: ${{ parseFloat(variant.price_adjustment || '0').toFixed(2) }}
            </span>
            <span v-if="variant.sku_suffix" class="sku-suffix">
              SKU Suffix: {{ variant.sku_suffix }}
            </span>
          </div>
        </div>
        <div class="variant-actions">
          <button
            v-if="canManage"
            @click="handleDelete(variant)"
            class="btn btn-sm btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductStore } from '@/stores/product'
import productService, { type ProductVariant } from '@/services/productService'

const props = defineProps<{
  productId: number
  variants: ProductVariant[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

const productStore = useProductStore()

const canManage = computed(() => productStore.canManageProducts)

const handleDelete = async (variant: ProductVariant) => {
  if (!confirm(`Delete variant "${variant.variant_name}: ${variant.variant_value}"?`)) {
    return
  }

  try {
    await productService.deleteVariant(props.productId, variant.id)
    emit('refresh')
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to delete variant')
  }
}
</script>

<style scoped>
.product-variants-view {
  margin-top: 1rem;
}

.variants-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.variant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.variant-info {
  flex: 1;
}

.variant-name {
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.variant-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.price-adjustment {
  color: var(--color-primary);
  font-weight: 500;
}

.variant-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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

