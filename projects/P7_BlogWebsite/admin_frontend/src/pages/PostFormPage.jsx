import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { postService } from '../services/postService'
import { categoryService } from '../services/categoryService'
import RichTextEditor from '../components/RichTextEditor'
import TagInput from '../components/TagInput'
import { tiptapToBlocks, blocksToTipTap } from '../utils/blockConverter'

const PostFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: null, // TipTap JSON format
    status: 'draft',
    tags: [], // Array of tags
    categoryId: '',
    featuredImage: '',
    featured: false
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [publishing, setPublishing] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (isEdit) {
      fetchPost()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const data = await categoryService.getCategories({ limit: 100 })
      setCategories(data.categories)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchPost = async () => {
    try {
      setFetching(true)
      const post = await postService.getPost(id)
      
      // Convert all blocks to TipTap format (including special blocks which are now inline)
      let tiptapContent = null
      if (Array.isArray(post.content) && post.content.length > 0) {
        tiptapContent = blocksToTipTap(post.content)
      }
      
      setFormData({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: tiptapContent,
        status: post.status || 'draft',
        tags: post.tags && Array.isArray(post.tags) ? post.tags : [],
        categoryId: post.categoryId?._id || '',
        featuredImage: post.featuredImage || '',
        featured: post.featured || false
      })
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to load post')
      navigate('/posts')
    } finally {
      setFetching(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters'
    }

    if (formData.excerpt && formData.excerpt.length > 500) {
      newErrors.excerpt = 'Excerpt cannot exceed 500 characters'
    }

    if (formData.featuredImage && !isValidUrl(formData.featuredImage)) {
      newErrors.featuredImage = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Tags are already an array
      const tags = Array.isArray(formData.tags) ? formData.tags : []

      // Convert TipTap content to blocks (includes inline special blocks)
      let content = []
      if (formData.content) {
        content = tiptapToBlocks(formData.content)
      }

      const postData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content,
        status: formData.status,
        tags,
        categoryId: formData.categoryId || null,
        featuredImage: formData.featuredImage.trim() || null,
        featured: formData.featured || false
      }

      if (isEdit) {
        await postService.updatePost(id, postData)
        toast.success('Post updated successfully!')
      } else {
        await postService.createPost(postData)
        toast.success('Post created successfully!')
      }

      navigate('/posts')
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save post'
      setErrors({ submit: errorMessage })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!isEdit || !id) return

    setPublishing(true)
    try {
      const updatedPost = await postService.publishPost(id)
      setFormData(prev => ({
        ...prev,
        status: updatedPost.status,
        publishedAt: updatedPost.publishedAt
      }))
      setShowPublishConfirm(false)
      toast.success('Post published successfully!')
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to publish post'
      toast.error(errorMessage)
    } finally {
      setPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!isEdit || !id) return

    if (!window.confirm('Are you sure you want to unpublish this post? It will no longer be visible to the public.')) {
      return
    }

    setPublishing(true)
    try {
      const updatedPost = await postService.unpublishPost(id)
      setFormData(prev => ({
        ...prev,
        status: updatedPost.status
      }))
      toast.success('Post unpublished successfully!')
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to unpublish post'
      toast.error(errorMessage)
    } finally {
      setPublishing(false)
    }
  }

  const handlePreview = () => {
    if (!isEdit || !id) {
      toast.error('Please save the post first to preview it.')
      return
    }
    // Open preview in new window
    window.open(`/posts/${id}/preview`, '_blank')
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update your blog post' : 'Write and publish a new blog post'}
          </p>
        </div>
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {isEdit && id && (
            <>
              <button
                type="button"
                onClick={handlePreview}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center space-x-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Preview</span>
              </button>
              {formData.status === 'draft' ? (
                <button
                  type="button"
                  onClick={() => setShowPublishConfirm(true)}
                  disabled={publishing || loading}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Publish</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleUnpublish}
                  disabled={publishing || loading}
                  className="px-4 py-2.5 border-2 border-yellow-300 bg-yellow-50 text-yellow-700 rounded-xl font-semibold hover:bg-yellow-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span>Unpublish</span>
                </button>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Form - Two Column Layout */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Metadata (30% - 3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6 sticky top-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.title 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-primary-500 focus:border-transparent'
                  }`}
                  placeholder="Enter post title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows="4"
                  value={formData.excerpt}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                    errors.excerpt 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-primary-500 focus:border-transparent'
                  }`}
                  placeholder="Brief description (optional)"
                />
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {formData.excerpt.length}/500 characters
                  </p>
                </div>
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.excerpt}</span>
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                  disabled={loadingCategories}
                >
                  <option value="">No Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select a category (optional)
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags
                </label>
                <TagInput
                  value={formData.tags}
                  onChange={(tags) => {
                    setFormData(prev => ({
                      ...prev,
                      tags
                    }))
                  }}
                  placeholder="Add tags (e.g., tech, tutorial)"
                  maxTags={20}
                />
              </div>

              {/* Featured */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        featured: e.target.checked
                      }))
                    }}
                    className="w-5 h-5 text-primary-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-gray-700">Featured Post</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Show this post in the hero slider</span>
                  </div>
                </label>
              </div>

              {/* Featured Image */}
              <div>
                <label htmlFor="featuredImage" className="block text-sm font-semibold text-gray-700 mb-2">
                  Featured Image URL
                </label>
                <input
                  id="featuredImage"
                  name="featuredImage"
                  type="url"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.featuredImage 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-primary-500 focus:border-transparent'
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.featuredImage && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.featuredImage}</span>
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="rounded-xl bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-red-800">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading || publishing}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{isEdit ? 'Update Post' : 'Create Post'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Rich Text Editor (70% - 9 columns) */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content
                </label>
              </div>
              {/* Large Editor Container - Matches left sidebar height */}
              <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6 flex-1 min-h-[800px]">
                <div className="h-full">
                  <RichTextEditor
                    content={formData.content}
                    onChange={(tiptapContent) => {
                      setFormData(prev => ({
                        ...prev,
                        content: tiptapContent
                      }))
                    }}
                    placeholder="Start writing your post content..."
                  />
                </div>
              </div>
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Editor Tips</p>
                    <p className="text-sm text-blue-800">
                      Use the toolbar buttons to insert Code Blocks, Author Boxes, Table of Contents, Quizzes, and Carousels. Click on any block in the editor to edit it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Publish Confirmation Dialog */}
      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Publish Post</h3>
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Are you sure you want to publish this post? Once published, it will be visible to the public.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-900 mb-2 flex items-center space-x-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Before publishing, make sure:</span>
                </p>
                <ul className="text-xs text-yellow-800 list-disc list-inside space-y-1">
                  <li>Post has a title</li>
                  <li>Post has content</li>
                  <li>All information is correct</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="px-6 py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                disabled={publishing}
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
              >
                {publishing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Publish Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostFormPage
