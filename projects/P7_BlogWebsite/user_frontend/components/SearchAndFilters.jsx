'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { postService } from '../services/postService'

export default function SearchAndFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [availableTags, setAvailableTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(true)

  useEffect(() => {
    // Get tag from URL params
    const tagParam = searchParams.get('tag')
    if (tagParam) {
      setSelectedTag(tagParam)
    }

    // Fetch available tags
    fetchAvailableTags()
  }, [searchParams])

  const fetchAvailableTags = async () => {
    try {
      setLoadingTags(true)
      // Fetch posts to extract tags
      const data = await postService.getPublishedPosts({ limit: 100 })
      const tagsSet = new Set()
      data.posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => tagsSet.add(tag))
        }
      })
      setAvailableTags(Array.from(tagsSet).sort())
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setLoadingTags(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      // Deselect if already selected
      setSelectedTag('')
      router.push('/')
    } else {
      setSelectedTag(tag)
      router.push(`/?tag=${encodeURIComponent(tag)}`)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTag('')
    router.push('/')
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Search & Filter</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by title, content, or tags..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tag Filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Filter by Tags</h3>
        {loadingTags ? (
          <div className="flex items-center space-x-2 py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600"></div>
            <span className="text-sm text-gray-600">Loading tags...</span>
          </div>
        ) : availableTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-2">No tags available</p>
        )}
      </div>

      {/* Active Filters */}
      {(selectedTag || searchQuery) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  Tag: #{selectedTag}
                  <button
                    onClick={() => {
                      setSelectedTag('')
                      router.push('/')
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

