import { apiClient } from '../utils/apiClient'

/**
 * Submit a quiz/poll response
 * @param {string} postId - Post ID
 * @param {string} blockId - Block ID (index or identifier)
 * @param {string|number|Array} answers - Selected answer(s)
 * @param {string} identifier - Optional identifier for preventing duplicates
 * @returns {Promise} API response
 */
export const submitQuizResponse = async (postId, blockId, answers, identifier = null) => {
  try {
    const response = await apiClient.post(`/quizzes/${postId}/${blockId}/respond`, {
      answers,
      identifier
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get quiz/poll statistics
 * @param {string} postId - Post ID
 * @param {string} blockId - Block ID (index or identifier)
 * @returns {Promise} API response with statistics
 */
export const getQuizStats = async (postId, blockId) => {
  try {
    const response = await apiClient.get(`/quizzes/${postId}/${blockId}/stats`)
    return response.data
  } catch (error) {
    throw error
  }
}

