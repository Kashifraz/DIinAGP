import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient from "@/services/api";
import type { LoginCredentials, SignUpData, AuthTokens, User } from "@/types/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem("accessToken"));
  const refreshToken = ref<string | null>(localStorage.getItem("refreshToken"));
  const initialized = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  // Initialize user on store creation if token exists
  const initialize = async () => {
    console.log('Auth store initialize - checking for existing tokens');
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    console.log('Stored tokens found:', !!storedAccessToken, !!storedRefreshToken);

    if (storedAccessToken) {
      accessToken.value = storedAccessToken;
      refreshToken.value = storedRefreshToken || null;

      try {
        console.log('Fetching user data');
        await fetchUser();
        console.log('User data fetched successfully');
      } catch (error) {
        console.log('Failed to fetch user, logging out:', error);
        logout();
      }
    } else {
      console.log('No stored tokens found');
    }

    initialized.value = true;
    console.log('Auth store initialization complete');
  };

  // Login
  async function login(credentials: LoginCredentials) {
    try {
      const response = await apiClient.post<AuthTokens>("/api/auth/jwt/create", {
        username: credentials.username,
        password: credentials.password,
      });

      const tokens = response.data;
      setTokens(tokens);

      // Fetch user info
      await fetchUser();

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed. Please check your credentials.",
      };
    }
  }

  // Sign up
  async function signUp(data: SignUpData) {
    try {
      await apiClient.post("/api/auth/users/", {
        username: data.username,
        email: data.email || "",
        password: data.password,
      });

      // After signup, automatically log in
      return await login({
        username: data.username,
        password: data.password,
      });
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData) {
        // Handle validation errors
        const fieldErrors = Object.keys(errorData)
          .filter((key) => key !== "detail")
          .map((key) => {
            const value = errorData[key];
            if (Array.isArray(value)) {
              return `${key}: ${value.join(", ")}`;
            }
            return `${key}: ${value}`;
          });

        if (fieldErrors.length > 0) {
          return {
            success: false,
            error: fieldErrors.join("; "),
          };
        } else {
          return {
            success: false,
            error: errorData.detail || "Sign up failed",
          };
        }
      } else {
        return {
          success: false,
          error: "Sign up failed. Please try again.",
        };
      }
    }
  }

  // Fetch current user
  async function fetchUser() {
    try {
      const response = await apiClient.get<User>("/api/auth/users/me");
      user.value = response.data;
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
      throw error;
    }
  }

  // Set tokens
  function setTokens(tokens: AuthTokens) {
    accessToken.value = tokens.access;
    if (tokens.refresh) {
      refreshToken.value = tokens.refresh;
      localStorage.setItem("refreshToken", tokens.refresh);
    }
    localStorage.setItem("accessToken", tokens.access);
  }

  // Update access token (used by refresh interceptor)
  function updateAccessToken(token: string) {
    accessToken.value = token;
    localStorage.setItem("accessToken", token);
  }

  // Logout
  function logout() {
    console.log('Logging out user');
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    initialized.value = false;
    console.log('Clearing tokens from localStorage');
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    initialized,
    login,
    signUp,
    fetchUser,
    setTokens,
    updateAccessToken,
    logout,
    initialize,
  };
});
