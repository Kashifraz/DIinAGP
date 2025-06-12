<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">POS System</h1>
      <p class="login-subtitle">Sign in to your account</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
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
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            class="form-input"
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" :disabled="loading" class="login-btn">
          <span v-if="loading">Signing in...</span>
          <span v-else>Sign In</span>
        </button>
        
        <div class="login-footer">
          <router-link to="/password/reset-request" class="forgot-password-link">
            Forgot your password?
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.login(email.value, password.value)
    // Get default route based on user role
    const getDefaultRoute = (role: string | undefined): string => {
      switch (role) {
        case 'cashier':
          return '/pos'
        case 'admin':
          return '/stores'
        case 'manager':
          return '/reports'
        default:
          return '/login'
      }
    }
    const redirect = route.query.redirect as string || getDefaultRoute(authStore.user?.role)
    router.push(redirect)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 8px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.login-title {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.login-subtitle {
  text-align: center;
  color: var(--color-text-soft);
  margin: 0 0 2rem;
}

.login-form {
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

.login-btn {
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

.login-btn:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 1rem;
  text-align: center;
}

.forgot-password-link {
  color: var(--color-primary);
  font-size: 0.875rem;
  text-decoration: none;
}

.forgot-password-link:hover {
  text-decoration: underline;
}
</style>

