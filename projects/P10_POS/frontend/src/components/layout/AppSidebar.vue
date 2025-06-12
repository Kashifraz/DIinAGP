<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        active-class="active"
      >
        <SidebarIcon :name="item.icon" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import SidebarIcon from '@/components/icons/SidebarIcons.vue'

const authStore = useAuthStore()

interface MenuItem {
  path: string
  label: string
  icon: string
  roles?: string[]
}

const allMenuItems: MenuItem[] = [
  { path: '/users', label: 'Users', icon: 'users', roles: ['admin'] },
  { path: '/stores', label: 'Stores', icon: 'store', roles: ['admin'] },
  { path: '/products', label: 'Products', icon: 'package', roles: ['admin', 'manager'] },
  { path: '/inventory', label: 'Inventory', icon: 'inventory', roles: ['admin', 'manager'] },
  { path: '/discounts', label: 'Discounts', icon: 'tag', roles: ['admin', 'manager'] },
  { path: '/pos', label: 'POS', icon: 'cart', roles: ['cashier'] },
  { path: '/transactions', label: 'Transactions', icon: 'receipt', roles: ['admin', 'manager', 'cashier'] },
  { path: '/reports', label: 'Reports', icon: 'chart', roles: ['admin', 'manager'] },
  { path: '/expenses', label: 'Expenses', icon: 'dollar', roles: ['admin', 'manager'] },
  { path: '/transfers', label: 'Stock Transfers', icon: 'transfer', roles: ['admin', 'manager'] },
  { path: '/sync', label: 'Sync Management', icon: 'sync', roles: ['admin', 'manager', 'cashier'] },
  { path: '/profile', label: 'Profile', icon: 'user', roles: ['admin', 'manager', 'cashier'] }
]

const menuItems = computed(() => {
  if (!authStore.user) return []
  return allMenuItems.filter(item => 
    !item.roles || item.roles.includes(authStore.user!.role)
  )
})
</script>

<style scoped>
.app-sidebar {
  width: 250px;
  background-color: var(--color-background);
  border-right: 1px solid var(--color-border);
  padding: 1rem 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: var(--color-text);
  text-decoration: none;
  transition: background-color 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: var(--color-background-soft);
}

.nav-item.active {
  background-color: var(--color-background-soft);
  border-left-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 500;
}

.nav-icon {
  flex-shrink: 0;
  color: inherit;
  transition: color 0.2s;
}

.nav-item.active .nav-icon {
  color: var(--color-primary);
}

.nav-label {
  font-size: 0.9375rem;
}
</style>

