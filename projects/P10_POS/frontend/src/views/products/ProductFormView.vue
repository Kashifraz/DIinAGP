<template>
  <div class="product-form-view">
    <div class="page-header">
      <button @click="$router.push('/products')" class="btn btn-back">
        ← Back to Products
      </button>
      <h1>{{ isEdit ? 'Edit Product' : 'Create Product' }}</h1>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Product Name *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            minlength="3"
            maxlength="255"
            placeholder="Enter product name"
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="form.description"
            rows="4"
            placeholder="Enter product description"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="sku">SKU</label>
            <input
              id="sku"
              v-model="form.sku"
              type="text"
              maxlength="100"
              placeholder="Leave empty for auto-generation"
            />
            <small>Auto-generated if left empty</small>
          </div>

          <div class="form-group">
            <label for="barcode">Barcode</label>
            <input
              id="barcode"
              v-model="form.barcode"
              type="text"
              maxlength="100"
              placeholder="Leave empty for auto-generation"
            />
            <small>Auto-generated if left empty</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="base_price">Base Price *</label>
            <input
              id="base_price"
              v-model="form.base_price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
            />
          </div>

          <div class="form-group">
            <label for="category_id">Category</label>
            <select id="category_id" v-model="form.category_id">
              <option :value="null">No Category</option>
              <option
                v-for="category in productStore.categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="image_url">Image URL</label>
            <input
              id="image_url"
              v-model="form.image_url"
              type="url"
              maxlength="500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div class="form-group">
            <label for="status">Status *</label>
            <select id="status" v-model="form.status" required>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$router.push('/products')" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product' }}
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import type { Product } from '@/services/productService'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const loading = ref(false)
const error = ref<string | null>(null)

const productId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string) : null
})

const isEdit = computed(() => !!productId.value)

const form = ref({
  name: '',
  description: '',
  sku: '',
  barcode: '',
  base_price: '',
  category_id: null as number | null,
  image_url: '',
  status: 'active' as 'active' | 'inactive',
})

const loadProduct = async () => {
  if (!productId.value) return

  loading.value = true
  try {
    const product = await productStore.fetchProduct(productId.value)
    form.value = {
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      base_price: product.base_price,
      category_id: product.category_id || null,
      image_url: product.image_url || '',
      status: product.status,
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load product'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null

  try {
    const data: any = {
      name: form.value.name,
      description: form.value.description || undefined,
      sku: form.value.sku || undefined,
      barcode: form.value.barcode || undefined,
      base_price: form.value.base_price,
      category_id: form.value.category_id || undefined,
      image_url: form.value.image_url || undefined,
      status: form.value.status,
    }

    if (isEdit.value) {
      await productStore.updateProduct(productId.value!, data)
    } else {
      await productStore.createProduct(data)
    }

    router.push('/products')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save product'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await productStore.fetchCategories()
  if (isEdit.value) {
    await loadProduct()
  }
})
</script>

<style scoped>
.product-form-view {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
}

.form-container {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: var(--color-text-soft);
  font-size: 0.875rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
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

.btn-back {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-back:hover {
  background-color: var(--color-background-soft);
}
</style>

