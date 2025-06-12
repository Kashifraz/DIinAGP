<template>
  <div class="product-list-view">
    <div class="page-header">
      <h1>Products</h1>
      <button
        v-if="productStore.canManageProducts"
        @click="$router.push('/products/new')"
        class="btn btn-primary"
      >
        Add Product
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products by name, SKU, or barcode..."
          class="search-input"
          @input="handleSearch"
        />
      </div>
      <div class="filter-box">
        <label for="category-filter">Category:</label>
        <select id="category-filter" v-model="categoryFilter" class="filter-select" @change="applyFilters">
          <option value="">All Categories</option>
          <option v-for="category in productStore.categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      <div class="filter-box">
        <label for="status-filter">Status:</label>
        <select id="status-filter" v-model="statusFilter" class="filter-select" @change="applyFilters">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <AppLoading v-if="productStore.loading && !productStore.products.length" />
    <AppError v-else-if="productStore.error" :message="productStore.error" />

    <div v-else class="products-container">
      <div v-if="filteredProducts.length === 0" class="empty-state">
        <p>No products found</p>
      </div>

      <div v-else class="products-grid">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
          @click="viewProduct(product.id)"
        >
          <div class="product-image" v-if="product.image_url">
            <img :src="product.image_url" :alt="product.name" />
          </div>
          <div class="product-image placeholder" v-else>
            <span>No Image</span>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="product-sku" v-if="product.sku">SKU: {{ product.sku }}</p>
            <p class="product-barcode" v-if="product.barcode">Barcode: {{ product.barcode }}</p>
            <p class="product-price">${{ parseFloat(product.base_price).toFixed(2) }}</p>
            <span
              :class="['status-badge', product.status === 'active' ? 'active' : 'inactive']"
            >
              {{ product.status }}
            </span>
          </div>
          <div class="product-actions">
            <button
              @click.stop="viewProduct(product.id)"
              class="btn btn-sm btn-secondary"
            >
              View Details
            </button>
            <button
              v-if="productStore.canManageProducts"
              @click.stop="handleDelete(product)"
              class="btn btn-sm btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.last_page > 1" class="pagination">
        <button
          @click="changePage(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="btn btn-sm"
        >
          Previous
        </button>
        <span>Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
        <button
          @click="changePage(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="btn btn-sm"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'
import type { Product } from '@/services/productService'

const router = useRouter()
const productStore = useProductStore()

const searchQuery = ref('')
const categoryFilter = ref<number | ''>('')
const statusFilter = ref<'active' | 'inactive' | ''>('')
const currentPage = ref(1)
const pagination = ref<any>(null)

const filteredProducts = computed(() => {
  return productStore.products
})

const handleSearch = () => {
  applyFilters()
}

const applyFilters = async () => {
  currentPage.value = 1
  await loadProducts()
}

const loadProducts = async () => {
  const params: any = {
    page: currentPage.value,
    per_page: 12,
  }
  
  if (categoryFilter.value) {
    params.category_id = categoryFilter.value
  }
  
  if (statusFilter.value) {
    params.status = statusFilter.value
  }
  
  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  try {
    const response = await productStore.fetchProducts(params)
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

const changePage = async (page: number) => {
  currentPage.value = page
  await loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const viewProduct = (id: number) => {
  router.push({ name: 'products-detail', params: { id } })
}

const handleDelete = async (product: Product) => {
  if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
    return
  }

  try {
    await productStore.deleteProduct(product.id)
    await loadProducts()
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to delete product')
  }
}

onMounted(async () => {
  await productStore.fetchCategories()
  await loadProducts()
})
</script>

<style scoped>
.product-list-view {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-box label {
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.products-container {
  margin-top: 2rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 200px;
  background: var(--color-background-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image.placeholder {
  color: var(--color-text-soft);
  font-size: 0.875rem;
}

.product-info {
  padding: 1rem;
  flex: 1;
}

.product-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: var(--color-text);
}

.product-sku,
.product-barcode {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.product-price {
  margin: 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  margin-top: 0.5rem;
}

.status-badge.active {
  background-color: #10b981;
  color: white;
}

.status-badge.inactive {
  background-color: #ef4444;
  color: white;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--color-border);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-soft);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: var(--color-border);
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

