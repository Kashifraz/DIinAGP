<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content large">
      <div class="modal-header">
        <h2>Initiate Stock Transfer</h2>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="transfer-form">
        <div class="form-row">
          <div class="form-group">
            <label>From Store *</label>
            <select v-model="formData.from_store_id" required @change="loadSourceInventory">
              <option value="">Select Source Store</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>To Store *</label>
            <select v-model="formData.to_store_id" required>
              <option value="">Select Destination Store</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea
            v-model="formData.notes"
            rows="3"
            placeholder="Optional notes about this transfer..."
          ></textarea>
        </div>

        <div class="items-section">
          <div class="section-header">
            <h3>Transfer Items</h3>
            <button type="button" @click="addItem" class="btn btn-secondary btn-sm">
              + Add Item
            </button>
          </div>

          <div v-if="items.length === 0" class="empty-state">
            <p>No items added. Click "Add Item" to start.</p>
          </div>

          <div v-else class="items-list">
            <div v-for="(item, index) in items" :key="index" class="item-row">
              <div class="item-product">
                <label>Product *</label>
                <input
                  v-model="item.productSearch"
                  type="text"
                  placeholder="Search product..."
                  @input="searchProduct(index)"
                  class="product-search"
                />
                <div v-if="item.searchResults.length > 0" class="search-results">
                  <div
                    v-for="product in item.searchResults"
                    :key="product.id"
                    class="search-result-item"
                    @click="selectProduct(index, product)"
                  >
                    {{ product.name }} ({{ product.sku || 'N/A' }})
                  </div>
                </div>
                <div v-if="item.selectedProduct" class="selected-product">
                  {{ item.selectedProduct.name }}
                </div>
              </div>

              <div class="item-variant" v-if="item.selectedProduct?.variants?.length">
                <label>Variant</label>
                <select v-model="item.variant_id">
                  <option :value="null">No Variant</option>
                  <option
                    v-for="variant in item.selectedProduct.variants"
                    :key="variant.id"
                    :value="variant.id"
                  >
                    {{ variant.variant_name }}: {{ variant.variant_value }}
                  </option>
                </select>
              </div>

              <div class="item-quantity">
                <label>Quantity *</label>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  required
                  placeholder="0"
                  @change="checkAvailability(index)"
                />
                <small v-if="item.availableQuantity !== null" class="availability">
                  Available: {{ item.availableQuantity }}
                </small>
              </div>

              <div class="item-actions">
                <button type="button" @click="removeItem(index)" class="btn btn-danger btn-sm">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancel</button>
          <button type="submit" :disabled="submitting || items.length === 0" class="btn btn-primary">
            {{ submitting ? 'Creating...' : 'Create Transfer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import inventoryService from '@/services/inventoryService'
import transferService, { type CreateTransferData } from '@/services/transferService'

interface Props {
  stores: any[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: []
}>()

const productStore = useProductStore()

const submitting = ref(false)
const sourceInventory = ref<any[]>([])

const formData = ref({
  from_store_id: '',
  to_store_id: '',
  notes: ''
})

interface TransferItem {
  productSearch: string
  searchResults: any[]
  selectedProduct: any | null
  variant_id: number | null
  quantity: number
  availableQuantity: number | null
}

const items = ref<TransferItem[]>([])

const loadSourceInventory = async () => {
  if (!formData.value.from_store_id) {
    sourceInventory.value = []
    return
  }

  try {
    const response = await inventoryService.getInventory(parseInt(formData.value.from_store_id), { per_page: 1000 })
    sourceInventory.value = response.data
  } catch (err) {
    console.error('Failed to load inventory:', err)
    sourceInventory.value = []
  }
}

const searchProduct = async (index: number) => {
  const item = items.value[index]
  if (!item.productSearch.trim()) {
    item.searchResults = []
    return
  }

  try {
    const results = await productStore.searchProducts(item.productSearch)
    item.searchResults = results.slice(0, 10)
  } catch (error) {
    console.error('Failed to search products:', error)
    item.searchResults = []
  }
}

const selectProduct = async (index: number, product: any) => {
  const item = items.value[index]
  item.selectedProduct = product
  item.productSearch = ''
  item.searchResults = []
  item.variant_id = null
  item.quantity = 0
  item.availableQuantity = null

  // Load product details with variants
  try {
    const fullProduct = await productStore.fetchProduct(product.id)
    item.selectedProduct = fullProduct
    await checkAvailability(index)
  } catch (err) {
    console.error('Failed to load product details:', err)
  }
}

const checkAvailability = async (index: number) => {
  const item = items.value[index]
  if (!item.selectedProduct || !formData.value.from_store_id) {
    item.availableQuantity = null
    return
  }

  const inventoryItem = sourceInventory.value.find(
    inv => inv.product_id === item.selectedProduct.id &&
           (item.variant_id ? inv.variant_id === item.variant_id : !inv.variant_id)
  )

  item.availableQuantity = inventoryItem ? inventoryItem.quantity : 0
}

const addItem = () => {
  items.value.push({
    productSearch: '',
    searchResults: [],
    selectedProduct: null,
    variant_id: null,
    quantity: 0,
    availableQuantity: null
  })
}

const removeItem = (index: number) => {
  items.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (formData.value.from_store_id === formData.value.to_store_id) {
    alert('Source and destination stores must be different')
    return
  }

  if (items.value.length === 0) {
    alert('Please add at least one item')
    return
  }

  // Validate all items
  for (const item of items.value) {
    if (!item.selectedProduct) {
      alert('Please select a product for all items')
      return
    }
    if (item.quantity <= 0) {
      alert('Please enter a valid quantity for all items')
      return
    }
    if (item.availableQuantity !== null && item.quantity > item.availableQuantity) {
      alert(`Insufficient inventory for ${item.selectedProduct.name}. Available: ${item.availableQuantity}`)
      return
    }
  }

  submitting.value = true
  try {
    const transferData: CreateTransferData = {
      from_store_id: parseInt(formData.value.from_store_id),
      to_store_id: parseInt(formData.value.to_store_id),
      items: items.value.map(item => ({
        product_id: item.selectedProduct.id,
        variant_id: item.variant_id || null,
        quantity: item.quantity
      })),
      notes: formData.value.notes || undefined
    }

    await transferService.createTransfer(transferData)
    emit('saved')
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to create transfer')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  addItem()
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.transfer-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 500;
}

.form-group select,
.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.items-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #eee;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  align-items: start;
}

.item-product {
  position: relative;
}

.product-search {
  width: 100%;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  padding: 0.5rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.search-result-item:hover {
  background: #f5f5f5;
}

.selected-product {
  padding: 0.5rem;
  background: #e7f3ff;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-weight: 500;
}

.item-variant,
.item-quantity {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-quantity small.availability {
  color: #666;
  font-size: 0.875rem;
}

.item-actions {
  display: flex;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

