'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { postService } from '../services/postService'
import Header from '../components/Header'
import SearchAndFilters from '../components/SearchAndFilters'

export default function HomePage() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState([])
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTag, setSelectedTag] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    // Check for tag in URL params
    const tagParam = searchParams.get('tag')
    if (tagParam) {
      setSelectedTag(tagParam)
    } else {
      setSelectedTag('')
    }
  }, [searchParams])

  useEffect(() => {
    fetchFeaturedPosts()
    fetchPosts()
  }, [pagination.page, selectedTag])

  const fetchFeaturedPosts = async () => {
    try {
      setLoadingFeatured(true)
      const featured = await postService.getFeaturedPosts()
      setFeaturedPosts(featured)
    } catch (err) {
      console.error('Failed to load featured posts:', err)
    } finally {
      setLoadingFeatured(false)
    }
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      
      if (selectedTag) {
        params.tag = selectedTag
      }
      
      const data = await postService.getPublishedPosts(params)
      
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load posts')
    } finally {
      setLoading(false)
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

  if (loading && posts.length === 0 && loadingFeatured) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading amazing content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchPosts}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Filter out featured posts from regular posts list
  const featuredPostIds = featuredPosts.map(p => p._id)
  const otherPosts = posts.filter(post => !featuredPostIds.includes(post._id))

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section - Featured Posts Slider */}
      {featuredPosts.length > 0 && (
        <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden group">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto py-20 md:py-28">
            <div className="relative px-4 sm:px-6 lg:px-8">
              <Swiper
                modules={[Navigation, Pagination, Autoplay, Keyboard]}
                spaceBetween={30}
                slidesPerView={1}
                navigation={{
                  nextEl: '.hero-swiper-button-next',
                  prevEl: '.hero-swiper-button-prev',
                }}
                pagination={{ 
                  clickable: true,
                  el: '.hero-swiper-pagination',
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                keyboard={{ enabled: true }}
                loop={featuredPosts.length > 1}
                className="hero-swiper"
              >
                {featuredPosts.map((post) => (
                  <SwiperSlide key={post._id}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      <div className="space-y-6">
                        {post.categoryId && (
                          <Link
                            href={`/category/${post.categoryId.slug}`}
                            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/95 text-blue-700 border-2 border-white/50 backdrop-blur-sm hover:bg-white transition-all shadow-lg"
                          >
                            {post.categoryId.name}
                          </Link>
                        )}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                          {post.title}
                        </h1>
                        {post.excerpt && (
                          <p className="text-xl text-white/90 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center space-x-6 text-white/80">
                          {post.authorId && (
                            <div className="flex items-center space-x-3">
                              {post.authorId.avatar && (
                                <img
                                  src={post.authorId.avatar}
                                  alt={post.authorId.name}
                                  className="h-10 w-10 rounded-full ring-2 ring-white/50"
                                />
                              )}
                              <span className="font-medium">{post.authorId.name}</span>
                            </div>
                          )}
                          {post.publishedAt && (
                            <span>{formatDate(post.publishedAt)}</span>
                          )}
                        </div>
                        <Link
                          href={`/posts/${post.slug}`}
                          className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          <span>Read More</span>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      </div>
                      {post.featuredImage && (
                        <div className="relative">
                          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                            <img
                              src={getMediaUrl(post.featuredImage)}
                              alt={post.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Custom Navigation Buttons - Positioned outside content */}
              {featuredPosts.length > 1 && (
                <>
                  <button className="hero-swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/25 hover:border-white/60 transition-all duration-300 shadow-lg hover:scale-110">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="hero-swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/25 hover:border-white/60 transition-all duration-300 shadow-lg hover:scale-110">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Custom Pagination */}
              <div className="hero-swiper-pagination flex justify-center items-center space-x-2 mt-8"></div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Search and Filters Section */}
        <div className="mb-12">
          <SearchAndFilters />
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Check back soon for amazing content!</p>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {featuredPosts.length > 0 ? 'More Articles' : 'Latest Posts'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post, index) => (
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
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-8">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-semibold">{pagination.total}</span> posts
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-5 py-2.5 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-medium disabled:hover:border-gray-300 disabled:hover:text-gray-900"
                  >
                    Previous
                  </button>
                  <span className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 gradient-text">Blog Platform</h3>
            <p className="text-gray-400 mb-6">Read, Discover, Learn</p>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Blog Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
