<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ expense ? 'Edit Expense' : 'Create Expense' }}</h2>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="expense-form">
        <div class="form-group">
          <label>Store *</label>
          <select v-model="formData.store_id" required :disabled="!!expense">
            <option value="">Select Store</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Category *</label>
          <select v-model="formData.category_id" required>
            <option value="">Select Category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Amount *</label>
          <input
            v-model.number="formData.amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
          />
        </div>

        <div class="form-group">
          <label>Expense Date *</label>
          <input
            v-model="formData.expense_date"
            type="date"
            required
          />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="formData.description"
            rows="3"
            placeholder="Enter expense description..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Receipt URL</label>
          <input
            v-model="formData.receipt_url"
            type="url"
            placeholder="https://example.com/receipt.jpg"
          />
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancel</button>
          <button type="submit" :disabled="submitting" class="btn btn-primary">
            {{ submitting ? 'Saving...' : (expense ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import expenseService, { type Expense, type ExpenseCategory } from '@/services/expenseService'

interface Props {
  expense?: Expense | null
  stores: any[]
  categories: ExpenseCategory[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: []
}>()

const submitting = ref(false)

const formData = ref({
  store_id: '',
  category_id: '',
  amount: 0,
  expense_date: new Date().toISOString().split('T')[0],
  description: '',
  receipt_url: ''
})

onMounted(() => {
  if (props.expense) {
    formData.value = {
      store_id: props.expense.store_id.toString(),
      category_id: props.expense.category_id.toString(),
      amount: parseFloat(props.expense.amount),
      expense_date: props.expense.expense_date,
      description: props.expense.description || '',
      receipt_url: props.expense.receipt_url || ''
    }
  }
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    const data = {
      store_id: parseInt(formData.value.store_id),
      category_id: parseInt(formData.value.category_id),
      amount: formData.value.amount,
      expense_date: formData.value.expense_date,
      description: formData.value.description || undefined,
      receipt_url: formData.value.receipt_url || undefined
    }

    if (props.expense) {
      await expenseService.updateExpense(props.expense.id, data)
    } else {
      await expenseService.createExpense(data)
    }

    emit('saved')
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to save expense')
  } finally {
    submitting.value = false
  }
}
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
  max-width: 600px;
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

.expense-form {
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

