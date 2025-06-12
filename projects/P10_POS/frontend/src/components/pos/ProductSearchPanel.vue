<template>
  <div class="product-search-panel">
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search products by name, SKU, or scan barcode..."
        class="search-input"
        @input="handleSearch"
        @keyup.enter="handleEnter"
        ref="searchInput"
      />
      <button @click="handleSearch" class="btn btn-search">Search</button>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Searching...</p>
    </div>

    <div v-else-if="searchResults.length > 0" class="search-results">
      <div
        v-for="product in searchResults"
        :key="product.id"
        class="product-item"
        @click="selectProduct(product)"
      >
        <div class="product-info">
          <h4>{{ product.name }}</h4>
          <p class="product-details">
            <span v-if="product.sku">SKU: {{ product.sku }}</span>
            <span v-if="product.barcode"> | Barcode: {{ product.barcode }}</span>
          </p>
          <p class="product-price">${{ product.base_price }}</p>
        </div>
        <button class="btn btn-add">Add</button>
      </div>
    </div>

    <div v-else-if="searchQuery && !loading" class="empty-state">
      <p>No products found</p>
    </div>

    <div v-else class="empty-state">
      <p>Search for products or scan barcode to add to cart</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useProductStore } from '@/stores/product'

const emit = defineEmits<{
  productSelected: [product: any]
  barcodeScanned: [barcode: string]
}>()

const productStore = useProductStore()

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const loading = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  loading.value = true
  try {
    // Check if it looks like a barcode (numeric)
    if (/^\d+$/.test(searchQuery.value.trim())) {
      emit('barcodeScanned', searchQuery.value.trim())
    }

    const results = await productStore.searchProducts(searchQuery.value)
    searchResults.value = results
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const handleEnter = () => {
  if (searchResults.value.length === 1) {
    selectProduct(searchResults.value[0])
  }
}

const selectProduct = (product: any) => {
  emit('productSelected', product)
  searchQuery.value = ''
  searchResults.value = []
  nextTick(() => {
    searchInput.value?.focus()
  })
}

onMounted(() => {
  searchInput.value?.focus()
})
</script>

<style scoped>
.product-search-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-search {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-search:hover {
  opacity: 0.9;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-soft);
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 500px;
  overflow-y: auto;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s;
}

.product-item:hover {
  background: var(--color-border);
}

.product-info {
  flex: 1;
}

.product-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.product-details {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.product-price {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary);
}

.btn-add {
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-add:hover {
  opacity: 0.9;
}
</style>

