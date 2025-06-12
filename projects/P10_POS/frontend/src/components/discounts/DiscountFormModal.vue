<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ discount ? 'Edit Discount' : 'Create Discount' }}</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="discount-form">
        <div class="form-group">
          <label>Name *</label>
          <input v-model="formData.name" type="text" required />
        </div>

        <div class="form-group">
          <label>Type *</label>
          <select v-model="formData.type" required>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Value *</label>
          <input v-model.number="formData.value" type="number" step="0.01" min="0" required />
        </div>

        <div class="form-group">
          <label>Store *</label>
          <select v-model.number="formData.store_id" required>
            <option value="">Select Store</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Scope (Select One)</label>
          <div class="scope-options">
            <label class="radio-label">
              <input
                type="radio"
                v-model="scopeType"
                value="store"
                @change="clearScope"
              />
              Store-wide (applies to all products)
            </label>
            <label class="radio-label">
              <input
                type="radio"
                v-model="scopeType"
                value="category"
                @change="clearScope"
              />
              Category
            </label>
            <label class="radio-label">
              <input
                type="radio"
                v-model="scopeType"
                value="product"
                @change="clearScope"
              />
              Product
            </label>
          </div>
        </div>

        <div v-if="scopeType === 'category'" class="form-group">
          <label>Category</label>
          <select v-model.number="formData.category_id">
            <option value="">Select Category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div v-if="scopeType === 'product'" class="form-group">
          <label>Product</label>
          <input
            v-model="productSearch"
            type="text"
            placeholder="Search products..."
            @input="searchProducts"
            class="product-search"
          />
          <div v-if="productSearchResults.length > 0" class="search-results">
            <div
              v-for="product in productSearchResults"
              :key="product.id"
              class="search-result-item"
              @click="selectProduct(product)"
            >
              {{ product.name }} - ${{ product.base_price }}
            </div>
          </div>
          <div v-if="selectedProduct" class="selected-product">
            Selected: {{ selectedProduct.name }}
            <button type="button" @click="clearProduct" class="btn-clear">Clear</button>
          </div>
        </div>

        <div class="form-group">
          <label>Minimum Purchase Amount</label>
          <input v-model.number="formData.min_purchase" type="number" step="0.01" min="0" />
          <small>Leave empty for no minimum</small>
        </div>

        <div class="form-group">
          <label>Valid From</label>
          <input v-model="formData.valid_from" type="datetime-local" />
          <small>Leave empty to start immediately</small>
        </div>

        <div class="form-group">
          <label>Valid To</label>
          <input v-model="formData.valid_to" type="datetime-local" />
          <small>Leave empty for no expiration</small>
        </div>

        <div class="form-group">
          <label>Status *</label>
          <select v-model="formData.status" required>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Saving...' : (discount ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import discountService, { type Discount, type CreateDiscountData } from '@/services/discountService'
import { useProductStore } from '@/stores/product'
import categoryService from '@/services/categoryService'

const props = defineProps<{
  discount?: Discount | null
  stores: any[]
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const productStore = useProductStore()

const loading = ref(false)
const scopeType = ref<'store' | 'category' | 'product'>('store')
const productSearch = ref('')
const productSearchResults = ref<any[]>([])
const selectedProduct = ref<any>(null)
const categories = ref<any[]>([])

const formData = reactive<CreateDiscountData>({
  name: '',
  type: 'percentage',
  value: 0,
  store_id: undefined,
  category_id: undefined,
  product_id: undefined,
  min_purchase: undefined,
  valid_from: undefined,
  valid_to: undefined,
  status: 'active',
})

const loadCategories = async () => {
  try {
    categories.value = await categoryService.getCategories()
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const searchProducts = async () => {
  if (!productSearch.value.trim()) {
    productSearchResults.value = []
    return
  }
  try {
    const results = await productStore.searchProducts(productSearch.value)
    productSearchResults.value = results.slice(0, 10)
  } catch (error) {
    console.error('Failed to search products:', error)
    productSearchResults.value = []
  }
}

const selectProduct = (product: any) => {
  selectedProduct.value = product
  formData.product_id = product.id
  productSearch.value = ''
  productSearchResults.value = []
}

const clearProduct = () => {
  selectedProduct.value = null
  formData.product_id = undefined
  productSearch.value = ''
}

const clearScope = () => {
  formData.product_id = undefined
  formData.category_id = undefined
  selectedProduct.value = null
  productSearch.value = ''
  productSearchResults.value = []
}

const handleSubmit = async () => {
  // Validate mutual exclusivity
  if (scopeType.value === 'product' && !formData.product_id) {
    alert('Please select a product')
    return
  }
  if (scopeType.value === 'category' && !formData.category_id) {
    alert('Please select a category')
    return
  }

  // Ensure only one scope is set
  if (scopeType.value === 'store') {
    formData.product_id = undefined
    formData.category_id = undefined
  } else if (scopeType.value === 'category') {
    formData.product_id = undefined
  } else if (scopeType.value === 'product') {
    formData.category_id = undefined
  }

  loading.value = true
  try {
    if (props.discount) {
      await discountService.updateDiscount(props.discount.id, formData)
    } else {
      await discountService.createDiscount(formData)
    }
    emit('saved')
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to save discount')
  } finally {
    loading.value = false
  }
}

const formatDateTimeLocal = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

onMounted(() => {
  loadCategories()
  
  if (props.discount) {
    formData.name = props.discount.name
    formData.type = props.discount.type
    formData.value = parseFloat(props.discount.value)
    formData.store_id = props.discount.store_id
    formData.min_purchase = props.discount.min_purchase ? parseFloat(props.discount.min_purchase) : undefined
    formData.valid_from = formatDateTimeLocal(props.discount.valid_from)
    formData.valid_to = formatDateTimeLocal(props.discount.valid_to)
    formData.status = props.discount.status

    if (props.discount.product_id) {
      scopeType.value = 'product'
      formData.product_id = props.discount.product_id
    } else if (props.discount.category_id) {
      scopeType.value = 'category'
      formData.category_id = props.discount.category_id
    } else {
      scopeType.value = 'store'
    }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: var(--color-background);
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
}

.discount-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.scope-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: auto;
}

.product-search {
  margin-bottom: 0.5rem;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  margin-top: 0.5rem;
}

.search-result-item {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
}

.search-result-item:hover {
  background: var(--color-background-soft);
}

.search-result-item:last-child {
  border-bottom: none;
}

.selected-product {
  padding: 0.75rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-clear {
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

