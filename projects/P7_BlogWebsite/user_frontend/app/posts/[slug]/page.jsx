'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { postService } from '../../../services/postService'
import { submitQuizResponse, getQuizStats } from '../../../services/quizService'
import Header from '../../../components/Header'
import CommentSection from '../../../components/CommentSection'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
// Prism.js will be loaded dynamically on client side only

export default function PostPage() {
  const params = useParams()
  const slug = params.slug
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tocData, setTocData] = useState(null)
  const [activeHeadingId, setActiveHeadingId] = useState('')
  const viewCountIncremented = useRef(false)
  const currentSlug = useRef(null)

  useEffect(() => {
    // Reset ref if slug changes
    if (slug !== currentSlug.current) {
      viewCountIncremented.current = false
      currentSlug.current = slug
    }
    
    if (slug) {
      fetchPost()
    }
    
    // Cleanup: reset ref on unmount
    return () => {
      if (slug === currentSlug.current) {
        // Only reset if we're still on the same slug
        // This prevents resetting if component unmounts due to navigation
      }
    }
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Prevent double view count increment using sessionStorage with timestamp
      // This prevents race conditions even with React StrictMode double renders
      const sessionKey = `viewed_${slug}`
      const timestampKey = `viewed_time_${slug}`
      
      let hasViewedInSession = false
      let lastViewTime = 0
      
      if (typeof window !== 'undefined') {
        const viewedFlag = sessionStorage.getItem(sessionKey)
        const viewedTime = sessionStorage.getItem(timestampKey)
        hasViewedInSession = viewedFlag === 'true'
        lastViewTime = viewedTime ? parseInt(viewedTime, 10) : 0
      }
      
      // Check if viewed in session OR if viewed very recently (within 2 seconds)
      // This prevents double counting from rapid successive calls
      const now = Date.now()
      const recentlyViewed = (now - lastViewTime) < 2000
      
      // Atomic check: if not viewed AND ref not set AND not recently viewed
      const shouldIncrement = !hasViewedInSession && !viewCountIncremented.current && !recentlyViewed
      
      let postData
      if (shouldIncrement) {
        // Mark as viewed IMMEDIATELY and synchronously before any async operations
        // Set both flag and timestamp to prevent race conditions
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(sessionKey, 'true')
          sessionStorage.setItem(timestampKey, now.toString())
        }
        viewCountIncremented.current = true
        
        // First time viewing this post in this session - increment view count
        postData = await postService.getPublishedPostBySlug(slug)
      } else {
        // Already viewed in this session - fetch without incrementing
        postData = await postService.getPublishedPostBySlugWithoutIncrement(slug)
      }
      
      setPost(postData)
      
      // Extract TOC data from content
      if (postData.content && Array.isArray(postData.content)) {
        const tocBlock = postData.content.find(block => block.type === 'tableOfContents')
        if (tocBlock) {
          setTocData(tocBlock)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  // Track active heading for TOC highlighting
  useEffect(() => {
    if (!tocData || !post) return

    const handleScroll = () => {
      const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
      const scrollPosition = window.scrollY + 150 // Offset for header

      let currentHeading = ''
      headings.forEach((heading) => {
        const headingTop = heading.offsetTop
        if (scrollPosition >= headingTop) {
          currentHeading = heading.id
        }
      })

      setActiveHeadingId(currentHeading)
    }

    // Wait for content to render
    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScroll)
      handleScroll() // Initial check
    }, 100)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [tocData, post])

  const getMediaUrl = (url) => {
    if (!url) return ''
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'
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
        // For other authors, we'd need to fetch, but for now we'll show a placeholder
        // In a full implementation, you might want to fetch all authors on component mount
        return (
          <div key={index} className="my-10 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-lg">
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
      <div key={index} className="my-10 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {authorData.avatar && (
            <div className="flex-shrink-0">
              <img
                src={getMediaUrl(authorData.avatar)}
                alt={authorData.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-xl"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{authorData.name}</h3>
            {authorData.bio && (
              <p className="text-gray-700 leading-relaxed text-lg">{authorData.bio}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Generate TOC from headings in post content
  const generateTOC = () => {
    if (!post || !post.content || !Array.isArray(post.content)) return []
    
    const headings = []
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
    
    return headings
  }

  // Get TOC items
  const getTOCItems = () => {
    if (!tocData) return []
    
    if (tocData.data?.autoGenerate !== false) {
      // Auto-generate from headings
      return generateTOC()
    } else if (tocData.data?.items && Array.isArray(tocData.data.items)) {
      // Use manual items
      return tocData.data.items
    }
    
    return []
  }

  const handleTOCClick = (e, itemId) => {
    e.preventDefault()
    const element = document.getElementById(itemId)
    if (element) {
      const headerOffset = 100 // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      
      // Update URL hash without scrolling
      window.history.pushState(null, '', `#${itemId}`)
    }
  }

  const getHeadingIcon = (level) => {
    // Green filled circle with checkmark icon for all heading levels
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#10b981" />
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    )
  }

  const CarouselRenderer = ({ block, index }) => {
    const blockData = block.data || {}
    const items = blockData.items || []

    if (items.length === 0) {
      return null
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

    return (
      <div className="my-10">
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
                  <Link 
                    href={item.link}
                    className="block"
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
                  </Link>
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

  const QuizRenderer = ({ block, index, postId }) => {
    const [selectedAnswers, setSelectedAnswers] = useState([])
    const [submitted, setSubmitted] = useState(false)
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasSubmitted, setHasSubmitted] = useState(false)

    const blockData = block.data || {}
    const isPoll = block.type === 'poll' || blockData.blockType === 'poll'
    const allowMultiple = blockData.allowMultipleAnswers || false
    const options = blockData.options || []
    const question = blockData.question || ''

    // Check if user has already submitted (using localStorage)
    useEffect(() => {
      if (postId && index !== undefined) {
        const key = `quiz_${postId}_${index}`
        const submitted = localStorage.getItem(key)
        if (submitted === 'true') {
          setHasSubmitted(true)
          // Load stats
          loadStats()
        }
      }
    }, [postId, index])

    const loadStats = async () => {
      if (!postId || index === undefined) return
      try {
        const response = await getQuizStats(postId, String(index))
        if (response.success) {
          setStats(response.data)
        }
      } catch (err) {
        console.error('Failed to load stats:', err)
      }
    }

    const handleAnswerChange = (optionValue) => {
      if (submitted || hasSubmitted) return

      if (allowMultiple) {
        setSelectedAnswers(prev => {
          const isSelected = prev.includes(optionValue) || prev.some(ans => String(ans) === String(optionValue))
          if (isSelected) {
            return prev.filter(ans => String(ans) !== String(optionValue) && String(ans) !== String(optionValue))
          } else {
            return [...prev, optionValue]
          }
        })
      } else {
        setSelectedAnswers([optionValue])
      }
    }

    const handleSubmit = async () => {
      if (selectedAnswers.length === 0) {
        setError('Please select at least one answer')
        return
      }

      if (!postId || index === undefined) {
        setError('Invalid post or block ID')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const answers = allowMultiple ? selectedAnswers : selectedAnswers[0]
        const identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        await submitQuizResponse(postId, String(index), answers, identifier)
        
        setSubmitted(true)
        setHasSubmitted(true)
        
        // Store in localStorage to prevent resubmission
        const key = `quiz_${postId}_${index}`
        localStorage.setItem(key, 'true')
        
        // Load stats
        await loadStats()
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to submit response. Please try again.')
        console.error('Submit error:', err)
      } finally {
        setLoading(false)
      }
    }

    // If stats are available, show them
    if (stats || hasSubmitted) {
      return (
        <div className="my-10 p-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 rounded-2xl border-2 border-yellow-200 shadow-lg">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900">{isPoll ? 'Poll Results' : 'Quiz Results'}</h3>
            </div>
            <p className="text-lg font-medium text-gray-800 mb-4">{question}</p>
            <p className="text-sm text-gray-600 mb-4">
              Total responses: <span className="font-semibold">{stats?.totalResponses || 0}</span>
            </p>
          </div>
          
          <div className="space-y-3">
            {options.map((option, idx) => {
              const optionValue = option.value !== undefined ? option.value : idx
              const optionStats = stats?.options?.find(opt => 
                String(opt.value) === String(optionValue) || opt.index === idx
              ) || { count: 0, percentage: 0 }
              
              const isSelected = selectedAnswers.includes(optionValue) || 
                                selectedAnswers.some(ans => String(ans) === String(optionValue))
              
              return (
                <div key={idx} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1">
                      {isSelected && (
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span className="text-gray-900 font-medium">{option.text}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{optionStats.count}</span>
                      <span className="text-sm text-gray-600 ml-1">({optionStats.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${optionStats.percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Show quiz/poll form
    return (
      <div className="my-10 p-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 rounded-2xl border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900">{isPoll ? 'Poll' : 'Quiz'}</h3>
          </div>
          <p className="text-lg font-medium text-gray-800">{question}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-3 mb-4">
          {options.map((option, idx) => {
            const optionValue = option.value !== undefined ? option.value : idx
            const isSelected = selectedAnswers.includes(optionValue) || 
                              selectedAnswers.some(ans => String(ans) === String(optionValue))
            
            return (
              <label
                key={idx}
                className={`flex items-center space-x-3 p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                }`}
              >
                <input
                  type={allowMultiple ? 'checkbox' : 'radio'}
                  name={`quiz-${index}`}
                  checked={isSelected}
                  onChange={() => handleAnswerChange(optionValue)}
                  disabled={submitted || hasSubmitted}
                  className="w-5 h-5 text-yellow-600 border-gray-300 focus:ring-yellow-500 focus:ring-2"
                />
                <span className="text-gray-900 flex-1">{option.text}</span>
              </label>
            )
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedAnswers.length === 0 || loading || submitted || hasSubmitted}
          className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : submitted || hasSubmitted ? 'Submitted' : 'Submit Answer'}
        </button>
      </div>
    )
  }

  const CodeBlockRenderer = ({ block, index }) => {
    if (!block.data?.code) {
      return null
    }

    const code = block.data.code
    const language = block.data.language || ''
    const filename = block.data.filename || ''
    const [copied, setCopied] = useState(false)
    const [prismLoaded, setPrismLoaded] = useState(false)

    // Load Prism.js and components on client side only
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const loadPrism = async () => {
          try {
            // First, load Prism.js core
            const PrismModule = await import('prismjs')
            const Prism = PrismModule.default || PrismModule
            
            // Ensure Prism is available globally for components
            if (typeof window !== 'undefined' && !window.Prism) {
              window.Prism = Prism
            }
            
            // Now load components sequentially to ensure Prism is initialized
            await import('prismjs/components/prism-javascript')
            await import('prismjs/components/prism-typescript')
            await import('prismjs/components/prism-python')
            await import('prismjs/components/prism-java')
            await import('prismjs/components/prism-cpp')
            await import('prismjs/components/prism-c')
            await import('prismjs/components/prism-csharp')
            await import('prismjs/components/prism-markup')
            await import('prismjs/components/prism-css')
            await import('prismjs/components/prism-json')
            await import('prismjs/components/prism-sql')
            await import('prismjs/components/prism-bash')
            await import('prismjs/components/prism-php')
            await import('prismjs/components/prism-ruby')
            await import('prismjs/components/prism-go')
            await import('prismjs/components/prism-rust')
            await import('prismjs/components/prism-swift')
            await import('prismjs/components/prism-kotlin')
            await import('prismjs/components/prism-markdown')
            await import('prismjs/components/prism-yaml')
            
            setPrismLoaded(true)
            // Highlight after loading
            setTimeout(() => {
              if (window.Prism && window.Prism.highlightAll) {
                window.Prism.highlightAll()
              } else if (Prism.highlightAll) {
                Prism.highlightAll()
              }
            }, 100)
          } catch (error) {
            console.error('Failed to load Prism.js:', error)
          }
        }
        
        loadPrism()
      }
    }, [])

    // Highlight code when code/language changes (after Prism is loaded)
    useEffect(() => {
      if (prismLoaded && typeof window !== 'undefined') {
        setTimeout(() => {
          if (window.Prism && window.Prism.highlightAll) {
            window.Prism.highlightAll()
          }
        }, 100)
      }
    }, [code, language, prismLoaded])

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy code:', err)
      }
    }

    // Map language aliases to Prism language names
    const getPrismLanguage = (lang) => {
      if (!lang) return ''
      const langMap = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'c++': 'cpp',
        'c#': 'csharp',
        'sh': 'bash',
        'md': 'markdown',
        'yml': 'yaml',
        'html': 'markup', // HTML uses 'markup' in Prism
        'xml': 'markup'   // XML also uses 'markup' in Prism
      }
      return langMap[lang.toLowerCase()] || lang.toLowerCase()
    }

    const prismLang = getPrismLanguage(language)

    return (
      <div key={index} className="my-10">
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          {/* Header */}
          {(language || filename) && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                {language && (
                  <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-md font-medium uppercase tracking-wide">
                    {language}
                  </span>
                )}
                {filename && (
                  <span className="text-gray-400 text-sm font-mono flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{filename}</span>
                  </span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-md transition-colors duration-200"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Code */}
          <div className="relative">
            <pre className={`language-${prismLang} ${!language && !filename ? 'p-4' : 'p-4'} overflow-x-auto`}>
              <code className={`language-${prismLang}`}>{code}</code>
            </pre>
            {!language && !filename && (
              <button
                onClick={handleCopy}
                className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-md transition-colors duration-200"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderContentBlock = (block, index) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index} className="mb-6 text-gray-700 leading-relaxed text-lg">
            {block.data?.text || ''}
          </p>
        )
      
      case 'heading':
        const HeadingTag = `h${block.data?.level || 2}`
        const headingClasses = {
          1: 'text-4xl md:text-5xl font-bold mb-8 mt-12 text-gray-900',
          2: 'text-3xl md:text-4xl font-bold mb-6 mt-10 text-gray-900',
          3: 'text-2xl md:text-3xl font-semibold mb-4 mt-8 text-gray-900'
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
          <figure key={index} className="my-10">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={getMediaUrl(block.data?.url || '')}
                alt={block.data?.alt || ''}
                className="w-full h-auto"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
            {block.data?.alt && (
              <figcaption className="text-sm text-gray-500 mt-3 text-center italic">
                {block.data.alt}
              </figcaption>
            )}
          </figure>
        )
      
      case 'authorBox':
        return renderAuthorBox(block, index, post)
      
      case 'tableOfContents':
        // TOC is rendered in sidebar, skip inline rendering
        return null
      
      case 'code':
        return <CodeBlockRenderer key={index} block={block} index={index} />
      
      case 'quiz':
      case 'poll':
        return <QuizRenderer key={index} block={block} index={index} postId={post?._id} />
      
      case 'carousel':
        return <CarouselRenderer key={index} block={block} index={index} />
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading article...</p>
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Post Not Found</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="btn btn-primary inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent z-10"></div>
          <img
            src={getMediaUrl(post.featuredImage)}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            {post.categoryId && (
              <Link
                href={`/category/${post.categoryId.slug}`}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/95 text-blue-700 border-2 border-white/50 backdrop-blur-sm hover:bg-white transition-all shadow-lg mb-4"
              >
                {post.categoryId.name}
              </Link>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-white/90 mb-6">{post.excerpt}</p>
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
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              )}
              {post.viewCount !== undefined && (
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.viewCount}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Content with Sidebar */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 gap-8">
        {/* Table of Contents Sidebar */}
        {tocData && getTOCItems().length > 0 && (
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-200">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900">
                    {tocData.data?.title || 'Table of Contents'}
                  </h3>
                </div>
                <nav aria-label="Table of contents" className="toc-sidebar max-h-[calc(100vh-200px)] overflow-y-auto">
                  <ul className="space-y-1">
                    {getTOCItems().map((item, itemIndex) => {
                      const isActive = activeHeadingId === item.id
                      return (
                        <li key={itemIndex}>
                          <a
                            href={`#${item.id}`}
                            className={`flex items-start space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm group relative ${
                              isActive
                                ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-900 font-medium shadow-sm'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-purple-700'
                            }`}
                            style={{ 
                              paddingLeft: `${(item.level - 1) * 16 + 12}px`,
                              borderLeft: isActive ? '3px solid rgb(147 51 234)' : '3px solid transparent'
                            }}
                            onClick={(e) => handleTOCClick(e, item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleTOCClick(e, item.id)
                              }
                            }}
                            tabIndex={0}
                          >
                            <span className="flex-shrink-0 mt-0.5">
                              {getHeadingIcon(item.level)}
                            </span>
                            <span className="flex-1 leading-relaxed">{item.text}</span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <article className={`flex-1 ${tocData && getTOCItems().length > 0 ? 'lg:max-w-3xl' : 'max-w-4xl'} mx-auto`}>
          {!post.featuredImage && (
            <header className="mb-12">
              {post.categoryId && (
                <Link
                  href={`/category/${post.categoryId.slug}`}
                  className="category-badge mb-4 inline-block"
                >
                  {post.categoryId.name}
                </Link>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-2xl text-gray-600 mb-8 leading-relaxed">{post.excerpt}</p>
              )}
              <div className="flex items-center space-x-6 text-gray-600 pb-6 border-b border-gray-200">
                {post.authorId && (
                  <div className="flex items-center space-x-3">
                    {post.authorId.avatar && (
                      <img
                        src={post.authorId.avatar}
                        alt={post.authorId.name}
                        className="h-12 w-12 rounded-full ring-2 ring-gray-200"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{post.authorId.name}</p>
                      {post.authorId.bio && (
                        <p className="text-sm text-gray-500">{post.authorId.bio}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex flex-col space-y-1">
                  {post.publishedAt && (
                    <span className="text-sm">{new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  )}
                  {post.viewCount !== undefined && (
                    <span className="text-sm flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{post.viewCount} views</span>
                    </span>
                  )}
                </div>
              </div>
            </header>
          )}

          {/* Post Content */}
          <div className="prose prose-lg max-w-none">
            {post.content && Array.isArray(post.content) && post.content.length > 0 ? (
              post.content.map((block, index) => {
                // Skip TOC blocks as they're rendered in sidebar
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
                  <Link
                    key={index}
                    href={`/?tag=${encodeURIComponent(tag)}`}
                    className="tag-badge text-sm hover:bg-blue-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comment Section */}
          {post?._id && (
            <CommentSection postId={post._id} />
          )}

          {/* Back to Home */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
