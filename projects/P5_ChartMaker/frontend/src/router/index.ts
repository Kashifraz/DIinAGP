import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/Home.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/Login.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/signup",
      name: "SignUp",
      component: () => import("@/views/SignUp.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () => import("@/views/Dashboard.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/projects",
      name: "Projects",
      component: () => import("@/views/Projects.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/projects/:id",
      name: "ProjectDetail",
      component: () => import("@/views/ProjectDetail.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

// Navigation guard: Check authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Wait for auth initialization if not done yet
  if (!authStore.initialized) {
    console.log('Router guard: Waiting for auth initialization');
    await authStore.initialize();
  }

  console.log('Router guard check:', to.name, 'authenticated:', authStore.isAuthenticated);

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirecting to login - not authenticated');
    next({ name: "Login" });
  } else if (
    (to.name === "Home" || to.name === "Login" || to.name === "SignUp") &&
    authStore.isAuthenticated
  ) {
    console.log('Redirecting to dashboard - already authenticated');
    next({ name: "Dashboard" });
  } else {
    console.log('Proceeding to route');
    next();
  }
});

export default router;

