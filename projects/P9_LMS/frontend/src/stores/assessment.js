import { defineStore } from 'pinia'
import { ref } from 'vue'
import { assessmentService } from '@/services/assessmentService'

export const useAssessmentStore = defineStore('assessment', () => {
  const assessments = ref([])
  const currentAssessment = ref(null)
  const questions = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchAssessmentsByCourse(courseId) {
    loading.value = true
    error.value = null
    try {
      const data = await assessmentService.getAssessmentsByCourse(courseId)
      assessments.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch assessments'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAssessmentById(assessmentId) {
    loading.value = true
    error.value = null
    try {
      const assessment = await assessmentService.getAssessmentById(assessmentId)
      currentAssessment.value = assessment
      return assessment
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch assessment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createAssessment(courseId, assessmentData) {
    loading.value = true
    error.value = null
    try {
      const assessment = await assessmentService.createAssessment(courseId, assessmentData)
      assessments.value.push(assessment)
      return assessment
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to create assessment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAssessment(assessmentId, assessmentData) {
    loading.value = true
    error.value = null
    try {
      const updatedAssessment = await assessmentService.updateAssessment(assessmentId, assessmentData)
      const index = assessments.value.findIndex(a => a.id === assessmentId)
      if (index !== -1) {
        assessments.value[index] = updatedAssessment
      }
      if (currentAssessment.value && currentAssessment.value.id === assessmentId) {
        currentAssessment.value = updatedAssessment
      }
      return updatedAssessment
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to update assessment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAssessment(assessmentId) {
    loading.value = true
    error.value = null
    try {
      await assessmentService.deleteAssessment(assessmentId)
      assessments.value = assessments.value.filter(a => a.id !== assessmentId)
      if (currentAssessment.value && currentAssessment.value.id === assessmentId) {
        currentAssessment.value = null
      }
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to delete assessment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function publishAssessment(assessmentId) {
    loading.value = true
    error.value = null
    try {
      const assessment = await assessmentService.publishAssessment(assessmentId)
      const index = assessments.value.findIndex(a => a.id === assessmentId)
      if (index !== -1) {
        assessments.value[index] = assessment
      }
      if (currentAssessment.value && currentAssessment.value.id === assessmentId) {
        currentAssessment.value = assessment
      }
      return assessment
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to publish assessment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function closeAssessment(assessmentId) {
    loading.value = true
    error.value = null
    try {
      const assessment = await assessmentService.closeAssessment(assessmentId)
      const index = assessments.value.findIndex(a => a.id === assessmentId)
      if (index !== -1) {
        assessments.value[index] = assessment
      }
      if (currentAssessment.value && currentAssessment.value.id === assessmentId) {
        currentAssessment.value = assessment
      }
      return assessment
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to close assessment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function validateWeights(courseId) {
    try {
      const totalWeight = await assessmentService.validateWeights(courseId)
      return totalWeight
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to validate weights'
      throw err
    }
  }

  async function fetchQuestionsByAssessment(assessmentId) {
    loading.value = true
    error.value = null
    try {
      const data = await assessmentService.getQuestionsByAssessment(assessmentId)
      questions.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch questions'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addQuestion(assessmentId, questionData) {
    loading.value = true
    error.value = null
    try {
      const question = await assessmentService.addQuestion(assessmentId, questionData)
      questions.value.push(question)
      return question
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to add question'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateQuestion(questionId, questionData) {
    loading.value = true
    error.value = null
    try {
      const updatedQuestion = await assessmentService.updateQuestion(questionId, questionData)
      const index = questions.value.findIndex(q => q.id === questionId)
      if (index !== -1) {
        questions.value[index] = updatedQuestion
      }
      return updatedQuestion
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to update question'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteQuestion(questionId) {
    loading.value = true
    error.value = null
    try {
      await assessmentService.deleteQuestion(questionId)
      questions.value = questions.value.filter(q => q.id !== questionId)
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to delete question'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function reorderQuestions(assessmentId, questionIds) {
    loading.value = true
    error.value = null
    try {
      await assessmentService.reorderQuestions(assessmentId, questionIds)
      await fetchQuestionsByAssessment(assessmentId) // Refresh questions
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to reorder questions'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    assessments,
    currentAssessment,
    questions,
    loading,
    error,
    fetchAssessmentsByCourse,
    fetchAssessmentById,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    publishAssessment,
    closeAssessment,
    validateWeights,
    fetchQuestionsByAssessment,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    clearError
  }
})

