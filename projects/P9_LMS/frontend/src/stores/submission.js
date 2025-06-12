import { defineStore } from 'pinia'
import { ref } from 'vue'
import { submissionService } from '@/services/submissionService'

export const useSubmissionStore = defineStore('submission', () => {
  const submissions = ref([])
  const currentSubmission = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function submitAssignment(assessmentId, file) {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('file', file)
      const submission = await submissionService.submitAssignment(assessmentId, formData)
      submissions.value.push(submission)
      return submission
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to submit assignment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function submitQuiz(assessmentId, answers) {
    loading.value = true
    error.value = null
    try {
      const submission = await submissionService.submitQuiz(assessmentId, answers)
      submissions.value.push(submission)
      return submission
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to submit quiz'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchSubmissionsByAssessment(assessmentId) {
    loading.value = true
    error.value = null
    try {
      const data = await submissionService.getSubmissionsByAssessment(assessmentId)
      submissions.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch submissions'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchSubmissionById(submissionId) {
    loading.value = true
    error.value = null
    try {
      const submission = await submissionService.getSubmissionById(submissionId)
      currentSubmission.value = submission
      return submission
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch submission'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchSubmissionsByStudent(studentId) {
    loading.value = true
    error.value = null
    try {
      const data = await submissionService.getSubmissionsByStudent(studentId)
      submissions.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch submissions'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    submissions,
    currentSubmission,
    loading,
    error,
    submitAssignment,
    submitQuiz,
    fetchSubmissionsByAssessment,
    fetchSubmissionById,
    fetchSubmissionsByStudent,
    clearError
  }
})

