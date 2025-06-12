'use client'

import { useState, useEffect } from 'react'
import { commentService } from '../services/commentService'

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    content: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (postId) {
      fetchComments()
    }
  }, [postId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await commentService.getPostComments(postId)
      setComments(response.data.comments || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.authorName.trim()) {
      newErrors.authorName = 'Name is required'
    } else if (formData.authorName.trim().length < 2) {
      newErrors.authorName = 'Name must be at least 2 characters'
    } else if (formData.authorName.trim().length > 100) {
      newErrors.authorName = 'Name cannot exceed 100 characters'
    }

    if (!formData.authorEmail.trim()) {
      newErrors.authorEmail = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.authorEmail)) {
      newErrors.authorEmail = 'Please enter a valid email address'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Comment is required'
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Comment must be at least 10 characters'
    } else if (formData.content.trim().length > 2000) {
      newErrors.content = 'Comment cannot exceed 2000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      await commentService.submitComment({
        postId,
        authorName: formData.authorName.trim(),
        authorEmail: formData.authorEmail.trim(),
        content: formData.content.trim()
      })

      setSubmitted(true)
      setFormData({
        authorName: '',
        authorEmail: '',
        content: ''
      })
      setErrors({})

      // Refresh comments after a short delay
      setTimeout(() => {
        fetchComments()
      }, 1000)
    } catch (error) {
      console.error('Failed to submit comment:', error)
      const errorMessage = error.response?.data?.message || 'Failed to submit comment. Please try again.'
      setErrors({ submit: errorMessage })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: ''
      }))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="mt-16 border-t border-gray-200 pt-12">
      <div className="max-w-3xl mx-auto">
        {/* Comments Count */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Comments ({comments.length})
          </h2>
          <p className="text-gray-600">
            Join the conversation and share your thoughts
          </p>
        </div>

        {/* Comment Form */}
        {!submitted ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Leave a Comment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="authorName"
                    name="authorName"
                    value={formData.authorName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.authorName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your name"
                  />
                  {errors.authorName && (
                    <p className="mt-1 text-sm text-red-600">{errors.authorName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="authorEmail"
                    name="authorEmail"
                    value={formData.authorEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.authorEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.authorEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.authorEmail}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Share your thoughts..."
                />
                <div className="mt-1 flex justify-between items-center">
                  {errors.content ? (
                    <p className="text-sm text-red-600">{errors.content}</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {formData.content.length}/2000 characters
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Comment'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-12">
            <div className="flex items-center space-x-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Comment Submitted!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your comment has been submitted and is pending moderation. It will appear here once approved.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-sm text-green-700 hover:text-green-900 underline"
            >
              Submit another comment
            </button>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-600">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {comment.authorName}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentSection

