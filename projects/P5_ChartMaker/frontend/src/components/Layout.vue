<template>
  <div class="layout">
    <header class="header">
      <div class="header-content">
        <RouterLink to="/dashboard" class="logo">
          <ChartBarIcon class="logo-icon" />
          <h2>ChartMaker</h2>
        </RouterLink>
        <nav v-if="authStore.isAuthenticated" class="nav">
          <RouterLink to="/dashboard" class="nav-link" title="Dashboard">
            <HomeIcon class="nav-icon" />
            <span class="nav-text">Dashboard</span>
          </RouterLink>
          <RouterLink to="/projects" class="nav-link" title="Projects">
            <FolderIcon class="nav-icon" />
            <span class="nav-text">Projects</span>
          </RouterLink>
        </nav>
        <div v-if="authStore.isAuthenticated" class="user-menu">
          <div class="user-info">
            <div class="user-avatar">
              {{ authStore.user?.username?.charAt(0).toUpperCase() || "U" }}
            </div>
            <span class="username">{{ authStore.user?.username }}</span>
          </div>
          <div class="dropdown-menu" v-if="showDropdown">
            <button @click="handleLogout" class="dropdown-item">
              <ArrowRightOnRectangleIcon class="dropdown-icon" />
              <span>Logout</span>
            </button>
          </div>
          <button @click="showDropdown = !showDropdown" class="menu-toggle" title="User menu">
            <ChevronDownIcon class="menu-icon" />
          </button>
        </div>
      </div>
    </header>
    <main class="main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  ChartBarIcon,
  HomeIcon,
  FolderIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";

const authStore = useAuthStore();
const router = useRouter();
const showDropdown = ref(false);

function handleLogout() {
  authStore.logout();
  router.push("/login");
  showDropdown.value = false;
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest(".user-menu")) {
    showDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo {
  text-decoration: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.9;
}

.logo-icon {
  width: 28px;
  height: 28px;
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.nav {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  justify-content: center;
  margin: 0 24px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.25);
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: "";
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
}

.nav-icon {
  width: 20px;
  height: 20px;
}

.nav-text {
  font-size: 0.95rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.2s;
  cursor: pointer;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.username {
  font-weight: 500;
  font-size: 0.9rem;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-toggle {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
}

.menu-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.2s;
}

.menu-toggle:hover .menu-icon {
  transform: translateY(2px);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  min-width: 180px;
  overflow: hidden;
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-icon {
  width: 18px;
  height: 18px;
}

.main {
  flex: 1;
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    height: 56px;
  }

  .logo h2 {
    font-size: 1.3rem;
  }

  .logo-icon {
    width: 24px;
    height: 24px;
  }

  .nav {
    gap: 4px;
    margin: 0 12px;
  }

  .nav-link {
    padding: 8px 12px;
  }

  .nav-text {
    display: none;
  }

  .username {
    display: none;
  }

  .user-info {
    padding: 6px;
  }
}
</style>

