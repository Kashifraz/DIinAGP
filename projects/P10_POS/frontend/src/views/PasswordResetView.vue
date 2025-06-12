<template>
  <div class="reset-container">
    <div class="reset-card">
      <h1 class="reset-title">Reset Password</h1>
      <p class="reset-subtitle">Enter your new password</p>
      
      <form @submit.prevent="handleReset" class="reset-form">
        <div class="form-group">
          <label for="token">Reset Token</label>
          <input
            id="token"
            v-model="token"
            type="text"
            required
            placeholder="Enter reset token"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="password">New Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="8"
            placeholder="Enter new password (min 8 characters)"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="passwordConfirm">Confirm Password</label>
          <input
            id="passwordConfirm"
            v-model="passwordConfirm"
            type="password"
            required
            minlength="8"
            placeholder="Confirm new password"
            class="form-input"
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" :disabled="loading || !isFormValid" class="reset-btn">
          <span v-if="loading">Resetting...</span>
          <span v-else>Reset Password</span>
        </button>
        
        <div class="reset-footer">
          <router-link to="/login" class="back-link">Back to Login</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '@/services/authService'

const router = useRouter()
const route = useRoute()

const token = ref(route.query.token as string || '')
const email = ref(route.query.email as string || '')
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const error = ref('')

const isFormValid = computed(() => {
  return token.value && email.value && password.value && password.value === passwordConfirm.value && password.value.length >= 8
})

const handleReset = async () => {
  if (password.value !== passwordConfirm.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await authService.resetPassword(token.value, email.value, password.value)
    router.push({ name: 'login', query: { message: 'Password reset successful. Please login.' } })
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to reset password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  padding: 2rem;
}

.reset-card {
  background: white;
  border-radius: 8px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.reset-title {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.reset-subtitle {
  text-align: center;
  color: var(--color-text-soft);
  margin: 0 0 2rem;
}

.reset-form {
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

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.reset-btn {
  padding: 0.75rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-btn:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-footer {
  margin-top: 1rem;
  text-align: center;
}

.back-link {
  color: var(--color-primary);
  font-size: 0.875rem;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>

