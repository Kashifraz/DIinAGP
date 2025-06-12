'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { categoryService } from '../services/postService'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const data = await categoryService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(path)
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/80 backdrop-blur-sm shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Blog Platform</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Read, Discover, Learn</p>
            </div>
          </Link>

          {/* Navigation - All items with consistent styling */}
          <nav className="flex items-center space-x-2 overflow-x-auto scrollbar-hide flex-1 justify-end ml-6">
            {/* Home Link */}
            <Link
              href="/"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap border ${
                isActive('/')
                  ? 'text-blue-700 bg-blue-50 border-blue-200'
                  : 'text-gray-700 bg-transparent border-transparent hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200'
              }`}
            >
              Home
            </Link>

            {/* Categories as Nav Items */}
            {loadingCategories ? (
              <div className="flex items-center space-x-2 px-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600"></div>
              </div>
            ) : (
              categories.map((category) => {
                const categoryPath = `/category/${category.slug}`
                return (
                  <Link
                    key={category._id}
                    href={categoryPath}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap border ${
                      isActive(categoryPath)
                        ? 'text-blue-700 bg-blue-50 border-blue-200'
                        : 'text-gray-700 bg-transparent border-transparent hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200'
                    }`}
                  >
                    {category.name}
                  </Link>
                )
              })
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
