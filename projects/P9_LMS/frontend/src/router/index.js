import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserList',
    component: () => import('@/views/UserList.vue'),
    meta: { requiresAuth: true, requiresRole: 'COORDINATOR' }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/majors',
    name: 'MajorList',
    component: () => import('@/views/MajorList.vue'),
    meta: { requiresAuth: true, requiresRole: 'COORDINATOR' }
  },
  {
    path: '/courses',
    name: 'CourseList',
    component: () => import('@/views/CourseList.vue'),
    meta: { requiresAuth: true, requiresRole: 'COORDINATOR' }
  },
  {
    path: '/enrollments',
    name: 'EnrollmentManagement',
    component: () => import('@/views/EnrollmentManagement.vue'),
    meta: { requiresAuth: true, requiresRole: 'COORDINATOR' }
  },
  {
    path: '/enrollments/course/:courseId',
    name: 'EnrollmentManagementByCourse',
    component: () => import('@/views/EnrollmentManagement.vue'),
    meta: { requiresAuth: true, requiresRole: 'COORDINATOR' }
  },
  {
    path: '/content',
    name: 'ContentManagement',
    component: () => import('@/views/ContentManagement.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  },
  {
    path: '/content/course/:courseId',
    name: 'ContentManagementByCourse',
    component: () => import('@/views/ContentManagement.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  },
  {
    path: '/assessments',
    name: 'AssessmentManagement',
    component: () => import('@/views/AssessmentManagement.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  },
  {
    path: '/assessments/course/:courseId',
    name: 'AssessmentManagementByCourse',
    component: () => import('@/views/AssessmentManagement.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  },
  {
    path: '/assessments/:assessmentId/quiz-builder',
    name: 'QuizBuilder',
    component: () => import('@/views/QuizBuilder.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  },
  {
    path: '/assessments/:assessmentId/submit',
    name: 'SubmissionView',
    component: () => import('@/views/SubmissionView.vue'),
    meta: { requiresAuth: true, requiresRole: 'STUDENT' }
  },
  {
    path: '/assessments/:assessmentId/grade',
    name: 'GradingView',
    component: () => import('@/views/GradingView.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  },
  {
    path: '/my-assessments',
    name: 'StudentAssessments',
    component: () => import('@/views/StudentAssessments.vue'),
    meta: { requiresAuth: true, requiresRole: 'STUDENT' }
  },
  {
    path: '/my-assessments/course/:courseId',
    name: 'StudentAssessmentsByCourse',
    component: () => import('@/views/StudentAssessments.vue'),
    meta: { requiresAuth: true, requiresRole: 'STUDENT' }
  },
  {
    path: '/timetable',
    name: 'TimetableManagement',
    component: () => import('@/views/TimetableManagement.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  },
  {
    path: '/timetable/course/:courseId',
    name: 'TimetableManagementByCourse',
    component: () => import('@/views/TimetableManagement.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  },
  {
    path: '/my-timetable',
    name: 'TimetableView',
    component: () => import('@/views/TimetableView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-courses',
    name: 'MyCourses',
    component: () => import('@/views/ProfessorCourses.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  },
  {
    path: '/student-courses',
    name: 'StudentCourses',
    component: () => import('@/views/StudentCourses.vue'),
    meta: { requiresAuth: true, requiresRole: 'STUDENT' }
  },
  {
    path: '/courses/:courseId/content',
    name: 'CourseContentView',
    component: () => import('@/views/CourseContentView.vue'),
    meta: { requiresAuth: true }
  },
  // Feature 10: Attendance System
  // Professor's Attendance Management
  {
    path: '/attendance',
    name: 'AttendanceSessionView',
    component: () => import('@/views/AttendanceSessionView.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  },
  {
    path: '/attendance/course/:courseId',
    name: 'AttendanceSessionViewByCourse',
    component: () => import('@/views/AttendanceSessionView.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  },
  // Student's QR Scanner
  {
    path: '/attendance/scan',
    name: 'AttendanceScannerView',
    component: () => import('@/views/AttendanceScannerView.vue'),
    meta: { requiresAuth: true, requiresRole: 'STUDENT' }
  },
  // Feature 11: Notice/Announcement System
  {
    path: '/notices',
    name: 'NoticeList',
    component: () => import('@/views/NoticeListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notices/:id',
    name: 'NoticeDetail',
    component: () => import('@/views/NoticeDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notices/management',
    name: 'NoticeManagement',
    component: () => import('@/views/NoticeManagementView.vue'),
    meta: { requiresAuth: true, requiresRole: 'COORDINATOR' }
  },
  // Feature 13: Resultsheet Generation
  {
    path: '/resultsheets',
    name: 'StudentResultsheet',
    component: () => import('@/views/StudentResultsheetView.vue'),
    meta: { requiresAuth: true, requiresRole: 'STUDENT' }
  },
  {
    path: '/resultsheets/professor',
    name: 'ProfessorResultsheet',
    component: () => import('@/views/ProfessorResultsheetView.vue'),
    meta: { requiresAuth: true, requiresRole: 'PROFESSOR' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth
  const requiresRole = to.meta.requiresRole

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (!requiresAuth && authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    next('/dashboard')
  } else if (requiresRole && authStore.userRole !== requiresRole) {
    // Redirect to dashboard if user doesn't have required role
    next('/dashboard')
  } else {
    next()
  }
})

export default router

