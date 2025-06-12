'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { categoryService } from '../services/postService'

export default function CategoryNav() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600"></div>
        <span className="text-sm text-gray-600">Loading categories...</span>
      </div>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
      <span className="text-sm font-semibold text-gray-500 mr-2 whitespace-nowrap">Categories:</span>
      {categories.map((category) => (
        <Link
          key={category._id}
          href={`/category/${category.slug}`}
          className="category-badge whitespace-nowrap hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  )
}
