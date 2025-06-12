import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to get auth store (lazy loaded to avoid circular dependency)
const getAuthStore = async () => {
  try {
    const authModule = await import("@/stores/auth");
    return authModule.useAuthStore();
  } catch (e) {
    // Store might not be initialized yet
    return null;
  }
};

// Request interceptor: Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage directly to avoid async issues
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    throw error;
  }
);

// Response interceptor: Handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and we haven't retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (refreshToken) {
          // Use direct axios call to avoid interceptors
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/jwt/refresh`,
            { refresh: refreshToken }
          );

          const { access, refresh } = response.data;
          
          // Update localStorage
          localStorage.setItem("accessToken", access);
          if (refresh) {
            localStorage.setItem("refreshToken", refresh);
          }

          // Update store if available
          try {
            const store = await getAuthStore();
            if (store) {
              store.updateAccessToken(access);
              if (refresh) {
                store.setTokens({ access, refresh });
              }
            }
          } catch (e) {
            // Store might not be available yet, that's ok
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        
        // Update store if available
        try {
          const store = await getAuthStore();
          if (store) {
            store.logout();
          }
        } catch (e) {
          // Store might not be available yet, that's ok
        }
        
        // Only redirect if not already on login/signup page
        if (!globalThis.location.pathname.includes("/login") && !globalThis.location.pathname.includes("/signup")) {
          globalThis.location.href = "/login";
        }
        throw refreshError;
      }
    }

    throw error;
  }
);

export default apiClient;

