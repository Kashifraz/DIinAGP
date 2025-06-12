<template>
  <div class="product-detail-view">
    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />
    <div v-else-if="!product && !loading" class="empty-state">
      <p>Product not found</p>
      <button @click="$router.push('/products')" class="btn btn-secondary">
        Back to Products
      </button>
    </div>

    <div v-else-if="product" class="product-detail">
      <div class="page-header">
        <button @click="$router.push('/products')" class="btn btn-back">
          ← Back to Products
        </button>
        <div class="header-actions">
          <button
            v-if="productStore.canManageProducts"
            @click="$router.push(`/products/${product.id}/edit`)"
            class="btn btn-primary"
          >
            Edit Product
          </button>
        </div>
      </div>

      <div class="product-content">
        <div class="product-image-section">
          <div class="product-image" v-if="product.image_url">
            <img :src="product.image_url" :alt="product.name" />
          </div>
          <div class="product-image placeholder" v-else>
            <span>No Image</span>
          </div>
        </div>

        <div class="product-info-section">
          <div class="info-header">
            <h1>{{ product.name }}</h1>
            <span
              :class="['status-badge', product.status === 'active' ? 'active' : 'inactive']"
            >
              {{ product.status }}
            </span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>Price</label>
              <p class="price">${{ parseFloat(product.base_price).toFixed(2) }}</p>
            </div>
            <div class="info-item" v-if="product.sku">
              <label>SKU</label>
              <p>{{ product.sku }}</p>
            </div>
            <div class="info-item" v-if="product.barcode">
              <label>Barcode</label>
              <p>{{ product.barcode }}</p>
            </div>
            <div class="info-item" v-if="product.category">
              <label>Category</label>
              <p>{{ product.category.name }}</p>
            </div>
            <div class="info-item">
              <label>Created</label>
              <p>{{ formatDate(product.created_at) }}</p>
            </div>
          </div>

          <div class="info-item description" v-if="product.description">
            <label>Description</label>
            <p>{{ product.description }}</p>
          </div>
        </div>
      </div>

      <!-- Variants Section -->
      <div class="product-sections">
        <div class="section">
          <div class="section-header">
            <h2>Product Variants</h2>
            <button
              v-if="productStore.canManageProducts"
              @click="showVariantModal = true"
              class="btn btn-sm btn-primary"
            >
              Add Variant
            </button>
          </div>
          <ProductVariantsView
            :product-id="product.id"
            :variants="product.variants || []"
            @refresh="loadProduct"
          />
        </div>
      </div>
    </div>

    <!-- Variant Modal -->
    <div v-if="showVariantModal" class="modal-overlay" @click="showVariantModal = false">
      <div class="modal-content" @click.stop>
        <h3>Add Product Variant</h3>
        <ProductVariantForm
          :product-id="product?.id"
          @success="handleVariantSuccess"
          @cancel="showVariantModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'
import ProductVariantsView from '@/components/products/ProductVariantsView.vue'
import ProductVariantForm from '@/components/products/ProductVariantForm.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const loading = ref(false)
const error = ref<string | null>(null)
const showVariantModal = ref(false)

const product = ref<any>(null)

const loadProduct = async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    error.value = 'Invalid product ID'
    return
  }

  loading.value = true
  error.value = null
  try {
    product.value = await productStore.fetchProduct(id)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load product'
  } finally {
    loading.value = false
  }
}

const handleVariantSuccess = () => {
  showVariantModal.value = false
  loadProduct()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadProduct()
    }
  },
  { immediate: false }
)

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-detail-view {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.product-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.product-image-section {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
}

.product-image {
  width: 100%;
  height: 300px;
  background: var(--color-background-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image.placeholder {
  color: var(--color-text-soft);
}

.product-info-section {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.info-header h1 {
  margin: 0;
  font-size: 2rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background-color: #10b981;
  color: white;
}

.status-badge.inactive {
  background-color: #ef4444;
  color: white;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-item {
  margin-bottom: 1rem;
}

.info-item label {
  display: block;
  font-weight: 500;
  color: var(--color-text-soft);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-item p {
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
}

.info-item .price {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
}

.info-item.description {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.product-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

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
  z-index: 1000;
}

.modal-content {
  background: var(--color-background);
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
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

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-soft);
}
</style>

