<template>
  <div class="professor-courses">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>My Courses</h1>
      </div>

      <div v-if="courseStore.loading" class="loading">
        Loading courses...
      </div>

      <div v-else-if="courseStore.courses.length === 0" class="no-courses">
        <p>No courses assigned to you yet.</p>
      </div>

      <div v-else class="courses-grid">
        <CourseCard
          v-for="course in courseStore.courses"
          :key="course.id"
          :course="course"
          :user-role="'PROFESSOR'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCourseStore } from '@/stores/course'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import CourseCard from '@/components/course/CourseCard.vue'

const courseStore = useCourseStore()
const authStore = useAuthStore()
const toast = useToast()

onMounted(async () => {
  try {
    const user = authStore.user
    if (user && user.role === 'PROFESSOR') {
      await courseStore.fetchCoursesByProfessor(user.id)
    } else {
      toast.error('Access denied. Only professors can view this page.')
    }
  } catch (err) {
    toast.error('Failed to load courses')
    console.error('Failed to load courses:', err)
  }
})
</script>

<style scoped>
.professor-courses {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin: 0;
}

.loading,
.no-courses {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #666;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .courses-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>

