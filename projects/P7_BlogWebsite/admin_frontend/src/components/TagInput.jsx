import { useState, useEffect, useRef } from 'react'
import { postService } from '../services/postService'

const TagInput = ({ value = [], onChange, placeholder = "Add tags...", maxTags = 20 }) => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const [allTags, setAllTags] = useState([])

  // Fetch all existing tags from posts for autocomplete
  useEffect(() => {
    fetchAllTags()
  }, [])

  const fetchAllTags = async () => {
    try {
      const data = await postService.getPosts({ limit: 1000 })
      const tagsSet = new Set()
      data.posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => tagsSet.add(tag.toLowerCase()))
        }
      })
      setAllTags(Array.from(tagsSet).sort())
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)

    if (newValue.trim().length > 0) {
      // Filter suggestions based on input
      const filtered = allTags.filter(tag => 
        tag.toLowerCase().includes(newValue.toLowerCase()) && 
        !value.includes(tag)
      ).slice(0, 10)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        addTag(suggestions[selectedIndex])
      } else if (inputValue.trim()) {
        addTag(inputValue.trim())
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const addTag = (tag) => {
    const normalizedTag = tag.trim().toLowerCase()
    
    // Validate tag
    if (normalizedTag.length === 0) return
    if (normalizedTag.length > 50) {
      alert('Tag cannot exceed 50 characters')
      return
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(normalizedTag)) {
      alert('Tag can only contain letters, numbers, spaces, hyphens, and underscores')
      return
    }
    if (value.includes(normalizedTag)) {
      return // Tag already exists
    }
    if (value.length >= maxTags) {
      alert(`Maximum ${maxTags} tags allowed`)
      return
    }

    const newTags = [...value, normalizedTag]
    onChange(newTags)
    setInputValue('')
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const removeTag = (index) => {
    const newTags = value.filter((_, i) => i !== index)
    onChange(newTags)
  }

  const handleSuggestionClick = (tag) => {
    addTag(tag)
  }

  const handleInputFocus = () => {
    if (inputValue.trim().length > 0 && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  return (
    <div className="relative">
      {/* Tag Display */}
      <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-gray-300 rounded-lg bg-white">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none border-none bg-transparent"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((tag, index) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleSuggestionClick(tag)}
              className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <p className="mt-1 text-sm text-gray-500">
        {value.length}/{maxTags} tags. Press Enter to add a tag. Use arrow keys to navigate suggestions.
      </p>
    </div>
  )
}

export default TagInput

