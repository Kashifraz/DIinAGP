import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Get default route based on user role
 */
function getDefaultRoute(role: string | undefined): string {
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

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: (to) => {
      const authStore = useAuthStore()
      return getDefaultRoute(authStore.user?.role)
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/TestView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/password/reset-request',
    name: 'password-reset-request',
    component: () => import('@/views/PasswordResetRequestView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/password/reset',
    name: 'password-reset',
    component: () => import('@/views/PasswordResetView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
    children: [
      {
        path: '',
        name: 'users-list',
        component: () => import('@/views/users/UserListView.vue')
      },
      {
        path: 'create',
        name: 'users-create',
        component: () => import('@/views/users/UserFormView.vue')
      },
      {
        path: ':id/edit',
        name: 'users-edit',
        component: () => import('@/views/users/UserFormView.vue'),
        props: true
      }
    ]
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'profile-view',
        component: () => import('@/views/ProfileView.vue')
      }
    ]
  },
  {
    path: '/stores',
    name: 'stores',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'stores-list',
        component: () => import('@/views/stores/StoreListView.vue')
      },
      {
        path: 'new',
        name: 'stores-create',
        component: () => import('@/views/stores/StoreFormView.vue'),
        meta: { requiresRole: 'admin' }
      },
      {
        path: ':id',
        name: 'stores-detail',
        component: () => import('@/views/stores/StoreDetailView.vue'),
        props: true
      },
      {
        path: ':id/edit',
        name: 'stores-edit',
        component: () => import('@/views/stores/StoreFormView.vue'),
        props: true,
        meta: { requiresRole: 'admin' }
      }
    ]
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'products-list',
        component: () => import('@/views/products/ProductListView.vue')
      },
      {
        path: 'new',
        name: 'products-create',
        component: () => import('@/views/products/ProductFormView.vue')
      },
      {
        path: ':id',
        name: 'products-detail',
        component: () => import('@/views/products/ProductDetailView.vue'),
        props: true
      },
      {
        path: ':id/edit',
        name: 'products-edit',
        component: () => import('@/views/products/ProductFormView.vue'),
        props: true
      }
    ]
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'inventory-list',
        component: () => import('@/views/inventory/InventoryListView.vue')
      },
      {
        path: 'stores/:storeId/items/:id',
        name: 'inventory-detail',
        component: () => import('@/views/inventory/InventoryDetailView.vue'),
        props: true
      }
    ]
  },
  {
    path: '/pos',
    name: 'pos',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true, requiresRole: 'cashier' },
    children: [
      {
        path: '',
        name: 'pos-view',
        component: () => import('@/views/pos/POSView.vue')
      }
    ]
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'transaction-list',
        component: () => import('@/views/transactions/TransactionListView.vue')
      },
      {
        path: ':id',
        name: 'transaction-detail',
        component: () => import('@/views/receipts/ReceiptView.vue'),
        props: true
      }
    ]
  },
  {
    path: '/receipts',
    name: 'receipts',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'transactions/:id',
        name: 'receipt-view',
        component: () => import('@/views/receipts/ReceiptView.vue'),
        props: true
      }
    ]
  },
  {
    path: '/discounts',
    name: 'discounts',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'manager'] },
    children: [
      {
        path: '',
        name: 'discount-list',
        component: () => import('@/views/discounts/DiscountListView.vue')
      }
    ]
  },
  {
    path: '/expenses',
    name: 'expenses',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'manager'] },
    children: [
      {
        path: '',
        name: 'expense-list',
        component: () => import('@/views/expenses/ExpenseListView.vue')
      },
      {
        path: 'summary',
        name: 'expense-summary',
        component: () => import('@/views/expenses/ExpenseSummaryView.vue')
      }
    ]
  },
  {
    path: '/transfers',
    name: 'transfers',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'manager'] },
    children: [
      {
        path: '',
        name: 'transfer-list',
        component: () => import('@/views/transfers/TransferListView.vue')
      },
      {
        path: ':id',
        name: 'transfer-detail',
        component: () => import('@/views/transfers/TransferDetailView.vue'),
        props: true
      }
    ]
  },
  {
    path: '/sync',
    name: 'sync',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'sync-management',
        component: () => import('@/views/sync/SyncManagementView.vue')
      }
    ]
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'manager'] },
    children: [
      {
        path: '',
        name: 'reports-dashboard',
        component: () => import('@/views/reports/ReportsDashboardView.vue')
      },
      {
        path: 'sales',
        name: 'sales-report',
        component: () => import('@/views/reports/SalesReportView.vue')
      },
      {
        path: 'inventory',
        name: 'inventory-report',
        component: () => import('@/views/reports/InventoryReportView.vue')
      },
      {
        path: 'expenses',
        name: 'expense-report',
        component: () => import('@/views/reports/ExpenseReportView.vue')
      },
      {
        path: 'financial',
        name: 'financial-report',
        component: () => import('@/views/reports/FinancialReportView.vue')
      },
      {
        path: 'products',
        name: 'product-performance',
        component: () => import('@/views/reports/ProductPerformanceView.vue')
      },
      {
        path: 'cashiers',
        name: 'cashier-performance',
        component: () => import('@/views/reports/CashierPerformanceView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Route guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check authentication status if token exists
  if (authStore.token && !authStore.user) {
    const isAuthenticated = await authStore.checkAuth()
    if (!isAuthenticated) {
      authStore.token = null
      localStorage.removeItem('token')
    }
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  // Check if route requires specific role
  if (to.meta.requiresRole) {
    const requiredRoles = Array.isArray(to.meta.requiresRole) 
      ? to.meta.requiresRole 
      : [to.meta.requiresRole]
    
    if (!authStore.user || !requiredRoles.includes(authStore.user.role)) {
      next({ path: getDefaultRoute(authStore.user?.role) })
      return
    }
  }
  
  // Redirect to default route if already logged in and trying to access login
  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ path: getDefaultRoute(authStore.user?.role) })
    return
  }
  
  next()
})

export default router

