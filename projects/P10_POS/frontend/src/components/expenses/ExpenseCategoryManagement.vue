<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Manage Expense Categories</h2>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>

      <div class="category-management">
        <!-- Add Category Form -->
        <div class="add-category-form">
          <h3>{{ editingCategory ? 'Edit Category' : 'Add Category' }}</h3>
          <form @submit.prevent="handleCategorySubmit">
            <div class="form-group">
              <label>Name *</label>
              <input
                v-model="categoryForm.name"
                type="text"
                required
                placeholder="Category name"
              />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea
                v-model="categoryForm.description"
                rows="2"
                placeholder="Category description"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="cancelEdit" class="btn btn-secondary" v-if="editingCategory">
                Cancel
              </button>
              <button type="submit" :disabled="submitting" class="btn btn-primary">
                {{ submitting ? 'Saving...' : (editingCategory ? 'Update' : 'Add') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Categories List -->
        <div class="categories-list">
          <h3>Categories</h3>
          <AppLoading v-if="loading" />
          <AppError v-else-if="error" :message="error" />
          <div v-else class="categories-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="category in categories" :key="category.id">
                  <td>{{ category.name }}</td>
                  <td>{{ category.description || '-' }}</td>
                  <td>
                    <button @click="editCategory(category)" class="btn btn-sm btn-secondary">Edit</button>
                    <button @click="deleteCategory(category.id)" class="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import expenseService, { type ExpenseCategory } from '@/services/expenseService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const emit = defineEmits<{
  close: []
  updated: []
}>()

const categories = ref<ExpenseCategory[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const submitting = ref(false)
const editingCategory = ref<ExpenseCategory | null>(null)

const categoryForm = ref({
  name: '',
  description: ''
})

const loadCategories = async () => {
  loading.value = true
  error.value = null
  try {
    categories.value = await expenseService.getExpenseCategories()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load categories'
  } finally {
    loading.value = false
  }
}

const handleCategorySubmit = async () => {
  submitting.value = true
  try {
    if (editingCategory.value) {
      await expenseService.updateExpenseCategory(editingCategory.value.id, categoryForm.value)
    } else {
      await expenseService.createExpenseCategory(categoryForm.value)
    }
    categoryForm.value = { name: '', description: '' }
    editingCategory.value = null
    await loadCategories()
    emit('updated')
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to save category')
  } finally {
    submitting.value = false
  }
}

const editCategory = (category: ExpenseCategory) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    description: category.description || ''
  }
}

const cancelEdit = () => {
  editingCategory.value = null
  categoryForm.value = { name: '', description: '' }
}

const deleteCategory = async (id: number) => {
  if (!confirm('Are you sure you want to delete this category?')) return

  try {
    await expenseService.deleteExpenseCategory(id)
    await loadCategories()
    emit('updated')
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to delete category')
  }
}

onMounted(() => {
  loadCategories()
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
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
}

.category-management {
  padding: 1.5rem;
}

.add-category-form {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.categories-list h3 {
  margin-bottom: 1rem;
}

.categories-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f5f5f5;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  margin: 0 0.25rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

