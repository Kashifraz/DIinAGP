<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>ChartMaker</h1>
      <h2>Login</h2>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            required
            autocomplete="username"
            placeholder="Enter your username"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
          />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" :disabled="loading" class="submit-button">
          {{ loading ? "Logging in..." : "Login" }}
        </button>
      </form>
      <p class="auth-footer">
        Don't have an account?
        <RouterLink to="/signup">Sign up</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import type { LoginCredentials } from "@/types/auth";

const router = useRouter();
const authStore = useAuthStore();

const credentials = ref<LoginCredentials>({
  username: "",
  password: "",
});

const loading = ref(false);
const error = ref<string>("");

async function handleLogin() {
  error.value = "";
  loading.value = true;

  try {
    const result = await authStore.login(credentials.value);
    if (result.success) {
      router.push("/dashboard");
    } else {
      error.value = result.error || "Login failed";
    }
  } catch (err: any) {
    error.value = err.message || "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

h1 {
  text-align: center;
  color: #667eea;
  font-size: 2rem;
  margin-bottom: 10px;
}

h2 {
  text-align: center;
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 30px;
  font-weight: 600;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: #555;
  font-weight: 500;
  font-size: 0.9rem;
}

input {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  color: #e74c3c;
  background: #ffeaea;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.submit-button {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 0.9rem;
}

.auth-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>

