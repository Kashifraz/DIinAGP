'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { postService } from '../../services/postService'
import Header from '../../components/Header'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearchQuery(q)
      fetchSearchResults(q, 1)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const fetchSearchResults = async (query, page = 1) => {
    if (!query || !query.trim()) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const data = await postService.searchPosts({
        q: query.trim(),
        page,
        limit: pagination.limit
      })
      
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to search posts')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      fetchSearchResults(searchQuery.trim(), 1)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMediaUrl = (url) => {
    if (!url) return ''
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'
    const apiBase = baseURL.replace('/api', '')
    return `${apiBase}${url.startsWith('/') ? url : '/' + url}`
  }

  const currentQuery = searchParams.get('q') || ''

  if (!currentQuery && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Posts</h1>
          <p className="text-gray-600 mb-8">Enter a search query to find posts</p>
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Searching...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Search Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="btn btn-primary inline-block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      {/* Search Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Search Results
            </h1>
            {currentQuery && (
              <p className="text-gray-600">
                Found <span className="font-semibold">{pagination.total}</span> result{pagination.total !== 1 ? 's' : ''} for "{currentQuery}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Search Results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">Try different keywords or search terms.</p>
            <Link href="/" className="btn btn-primary">
              Browse All Posts
            </Link>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post, index) => (
                <article
                  key={post._id}
                  className="post-card group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <Link href={`/posts/${post.slug}`}>
                      <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden relative">
                        <img
                          src={getMediaUrl(post.featuredImage)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </Link>
                  )}

                  {/* Post Content */}
                  <div className="p-6">
                    {/* Category */}
                    {post.categoryId && (
                      <Link
                        href={`/category/${post.categoryId.slug}`}
                        className="category-badge mb-3 inline-block"
                      >
                        {post.categoryId.name}
                      </Link>
                    )}

                    {/* Title */}
                    <Link href={`/posts/${post.slug}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-3">
                        {post.authorId && (
                          <div className="flex items-center space-x-2">
                            {post.authorId.avatar && (
                              <img
                                src={post.authorId.avatar}
                                alt={post.authorId.name}
                                className="h-6 w-6 rounded-full ring-2 ring-gray-200"
                              />
                            )}
                            <span className="font-medium">{post.authorId.name}</span>
                          </div>
                        )}
                        {post.publishedAt && (
                          <span>• {formatDate(post.publishedAt)}</span>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Link
                            key={tagIndex}
                            href={`/?tag=${encodeURIComponent(tag)}`}
                            className="tag-badge hover:bg-blue-200 transition-colors"
                          >
                            #{tag}
                          </Link>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-500 self-center">+{post.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-8">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-semibold">{pagination.total}</span> results
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      const newPage = pagination.page - 1
                      setPagination(prev => ({ ...prev, page: newPage }))
                      fetchSearchResults(currentQuery, newPage)
                    }}
                    disabled={pagination.page === 1}
                    className="px-5 py-2.5 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-medium disabled:hover:border-gray-300 disabled:hover:text-gray-900"
                  >
                    Previous
                  </button>
                  <span className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => {
                      const newPage = pagination.page + 1
                      setPagination(prev => ({ ...prev, page: newPage }))
                      fetchSearchResults(currentQuery, newPage)
                    }}
                    disabled={pagination.page === pagination.pages}
                    className="px-5 py-2.5 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-medium disabled:hover:border-gray-300 disabled:hover:text-gray-900"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

