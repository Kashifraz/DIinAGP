import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { postService } from '../services/postService'
import { apiClient } from '../utils/apiClient'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const PostPreviewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)
      const postData = await postService.previewPost(id)
      setPost(postData)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load post preview')
    } finally {
      setLoading(false)
    }
  }

  const getMediaUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    const apiBase = baseURL.replace('/api', '')
    return `${apiBase}${url.startsWith('/') ? url : '/' + url}`
  }

  const renderAuthorBox = (block, index, post) => {
    let authorData = null

    // If authorId is provided, try to get from post authorId if it matches
    if (block.data?.authorId) {
      if (post.authorId && post.authorId._id === block.data.authorId) {
        authorData = {
          name: post.authorId.name,
          bio: post.authorId.bio || '',
          avatar: post.authorId.avatar || ''
        }
      } else {
        // For other authors, we'd need to fetch, but for preview we'll show a placeholder
        // In a full implementation, you might want to fetch all authors on component mount
        return (
          <div key={index} className="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <p className="text-gray-500 italic">Loading author information...</p>
          </div>
        )
      }
    } else {
      // Use custom data
      authorData = {
        name: block.data?.name || '',
        bio: block.data?.bio || '',
        avatar: block.data?.avatar || ''
      }
    }

    if (!authorData || !authorData.name) {
      return null
    }

    return (
      <div key={index} className="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-4">
          {authorData.avatar && (
            <img
              src={getMediaUrl(authorData.avatar)}
              alt={authorData.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{authorData.name}</h3>
            {authorData.bio && (
              <p className="text-gray-700 leading-relaxed">{authorData.bio}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderTableOfContents = (block, index, post) => {
    // Generate TOC from headings in post content
    const generateTOC = () => {
      const headings = []
      
      if (post.content && Array.isArray(post.content)) {
        post.content.forEach((blk, idx) => {
          if (blk.type === 'heading' && blk.data?.text) {
            const text = blk.data.text.trim()
            const level = blk.data.level || 2
            
            // Generate a URL-friendly ID from the heading text
            const id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')
            
            headings.push({
              text: text,
              id: id || `heading-${idx}`,
              level: level
            })
          }
        })
      }
      
      return headings
    }

    let items = []
    
    if (block.data?.autoGenerate !== false) {
      // Auto-generate from headings
      items = generateTOC()
    } else if (block.data?.items && Array.isArray(block.data.items)) {
      // Use manual items
      items = block.data.items
    }

    if (items.length === 0) {
      return null
    }

    const title = block.data?.title || 'Table of Contents'

    return (
      <div key={index} className="my-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <nav aria-label="Table of contents">
          <ul className="space-y-2">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} style={{ paddingLeft: `${(item.level - 1) * 16}px` }}>
                <a
                  href={`#${item.id}`}
                  className="text-purple-700 hover:text-purple-900 hover:underline transition-colors text-sm"
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.getElementById(item.id)
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    )
  }

  const renderCodeBlock = (block, index) => {
    if (!block.data?.code) {
      return null
    }

    const code = block.data.code
    const language = block.data.language || ''
    const filename = block.data.filename || ''

    return (
      <div key={index} className="my-8">
        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
          {/* Header */}
          {(language || filename) && (
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                {language && (
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded font-medium">
                    {language}
                  </span>
                )}
                {filename && (
                  <span className="text-gray-400 text-sm font-mono">
                    {filename}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Code */}
          <div className="p-4 overflow-x-auto">
            <pre className="text-gray-100 text-sm leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      </div>
    )
  }

  const renderQuizBlock = (block, index) => {
    if (!block.data) return null

    const { question, options, blockType } = block.data
    const isPoll = blockType === 'poll'

    return (
      <div key={index} className="my-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{question}</h3>
        <div className="space-y-3">
          {options && options.map((option, optIndex) => (
            <div key={optIndex} className="p-3 bg-white rounded-lg border border-purple-200">
              <span className="text-gray-700">{option.text || option}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-600 italic">
          {isPoll ? 'Poll - Submit your response to see results' : 'Quiz - Submit your answer to see results'}
        </p>
      </div>
    )
  }

  const renderCarouselBlock = (block, index) => {
    if (!block.data?.items || block.data.items.length === 0) {
      return null
    }

    const items = block.data.items

    return (
      <div key={index} className="my-10">
        <Swiper
          modules={[Navigation, Pagination, Keyboard]}
          spaceBetween={30}
          slidesPerView={1}
          navigation={true}
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="carousel-swiper"
        >
          {items.map((item, idx) => (
            <SwiperSlide key={idx}>
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                {item.link ? (
                  <a 
                    href={item.link}
                    className="block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={getMediaUrl(item.imageUrl)}
                        alt={item.alt || `Carousel image ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                    {(item.title || item.description) && (
                      <div className="p-4">
                        {item.title && (
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        )}
                        {item.description && (
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        )}
                      </div>
                    )}
                  </a>
                ) : (
                  <>
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={getMediaUrl(item.imageUrl)}
                        alt={item.alt || `Carousel image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                    {(item.title || item.description) && (
                      <div className="p-4">
                        {item.title && (
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        )}
                        {item.description && (
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    )
  }

  const renderContentBlock = (block, index) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
            {block.data?.text || ''}
          </p>
        )
      
      case 'heading':
        const HeadingTag = `h${block.data?.level || 2}`
        const headingClasses = {
          1: 'text-4xl font-bold mb-6 mt-8',
          2: 'text-3xl font-bold mb-4 mt-6',
          3: 'text-2xl font-semibold mb-3 mt-4'
        }
        // Generate ID from heading text for TOC links
        const headingText = block.data?.text || ''
        const headingId = headingText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || `heading-${index}`
        
        return (
          <HeadingTag
            key={index}
            id={headingId}
            className={headingClasses[block.data?.level || 2] || headingClasses[2]}
          >
            {headingText}
          </HeadingTag>
        )
      
      case 'image':
        return (
          <div key={index} className="my-6">
            <img
              src={block.data?.url || ''}
              alt={block.data?.alt || ''}
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
              }}
            />
            {block.data?.alt && (
              <p className="text-sm text-gray-500 mt-2 text-center italic">{block.data.alt}</p>
            )}
          </div>
        )
      
      case 'authorBox':
        return renderAuthorBox(block, index, post)
      
      case 'tableOfContents':
        return renderTableOfContents(block, index, post)
      
      case 'code':
        return renderCodeBlock(block, index)
      
      case 'quiz':
      case 'poll':
        return renderQuizBlock(block, index)
      
      case 'carousel':
        return renderCarouselBlock(block, index)
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/posts')}
            className="mt-4 btn btn-primary"
          >
            Back to Posts
          </button>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Preview Header Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-4 w-px bg-gray-300"></div>
              <span className="text-sm font-medium text-gray-700">Preview Mode</span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  post.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {post.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
            <button
              onClick={() => navigate(`/posts/${id}/edit`)}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Edit Post
            </button>
          </div>
        </div>
      </div>

      {/* Post Content - Styled to match public blog */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Image Hero Section */}
        {post.featuredImage && (
          <div className="relative h-[50vh] min-h-[300px] mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent z-10"></div>
            <img
              src={getMediaUrl(post.featuredImage)}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8">
              {post.categoryId && (
                <span className="inline-block px-3 py-1 mb-4 text-sm font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-full">
                  {post.categoryId.name}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-lg text-white/90 mb-4">{post.excerpt}</p>
              )}
              <div className="flex items-center space-x-6 text-white/80 text-sm">
                {post.authorId && (
                  <div className="flex items-center space-x-3">
                    {post.authorId.avatar && (
                      <img
                        src={getMediaUrl(post.authorId.avatar)}
                        alt={post.authorId.name}
                        className="h-10 w-10 rounded-full ring-2 ring-white/50"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    <span className="font-medium">{post.authorId.name}</span>
                  </div>
                )}
                {post.publishedAt && (
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Post Header (when no featured image) */}
        {!post.featuredImage && (
          <header className="mb-8">
            {post.categoryId && (
              <span className="inline-block px-3 py-1 mb-4 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                {post.categoryId.name}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
            )}

            <div className="flex items-center space-x-6 text-sm text-gray-600 border-b border-gray-200 pb-6">
              {post.authorId && (
                <div className="flex items-center space-x-3">
                  {post.authorId.avatar && (
                    <img
                      src={getMediaUrl(post.authorId.avatar)}
                      alt={post.authorId.name}
                      className="h-10 w-10 rounded-full ring-2 ring-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  )}
                  <span className="font-medium">{post.authorId.name}</span>
                </div>
              )}
              {post.publishedAt && (
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              )}
            </div>
          </header>
        )}

        {/* Post Content */}
        <div className="prose prose-lg max-w-none">
          {post.content && Array.isArray(post.content) && post.content.length > 0 ? (
            post.content.map((block, index) => {
              // Skip tableOfContents as it's rendered separately in sidebar (if needed)
              if (block.type === 'tableOfContents') {
                return null
              }
              if (block.type === 'authorBox') {
                return renderAuthorBox(block, index, post)
              }
              return renderContentBlock(block, index)
            })
          ) : (
            <p className="text-gray-500 italic text-center py-12">No content available.</p>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Tags</h3>
            <div className="flex flex-wrap gap-3">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}

export default PostPreviewPage

