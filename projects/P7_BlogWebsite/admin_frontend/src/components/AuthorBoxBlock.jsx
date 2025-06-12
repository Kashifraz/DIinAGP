import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiClient } from '../utils/apiClient'

const AuthorBoxBlock = ({ block, onUpdate, onDelete, index }) => {
  const { user } = useAuth()
  
  // Initialize state from block or create default
  const getInitialData = () => {
    if (block && block.data) {
      return {
        mode: block.data.authorId ? 'authorId' : 'custom',
        authorId: block.data.authorId || '',
        name: block.data.name || '',
        bio: block.data.bio || '',
        avatar: block.data.avatar || ''
      }
    }
    // Default: use current user
    return {
      mode: 'authorId',
      authorId: user?._id || '',
      name: user?.name || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    }
  }

  const [data, setData] = useState(getInitialData())
  const [loadingAuthor, setLoadingAuthor] = useState(false)

  // Initialize block on mount if it's new
  useEffect(() => {
    if (!block && user) {
      const initialBlock = {
        type: 'authorBox',
        data: {
          authorId: user._id
        }
      }
      if (onUpdate) {
        onUpdate(initialBlock)
      }
    }
  }, []) // Only run once on mount

  // Update parent when data changes
  useEffect(() => {
    if (onUpdate) {
      const blockData = {
        type: 'authorBox',
        data: data.mode === 'authorId' 
          ? { authorId: data.authorId }
          : {
              name: data.name,
              bio: data.bio,
              avatar: data.avatar || undefined
            }
      }
      onUpdate(blockData)
    }
  }, [data, onUpdate])

  const fetchAuthorProfile = async (authorId) => {
    if (!authorId || !authorId.trim()) return

    try {
      setLoadingAuthor(true)
      const response = await apiClient.get(`/auth/authors/${authorId.trim()}`)
      if (response.data.success) {
        const author = response.data.data.author
        setData(prev => ({
          ...prev,
          name: author.name,
          bio: author.bio || '',
          avatar: author.avatar || ''
        }))
      }
    } catch (error) {
      console.error('Failed to fetch author profile:', error)
      alert('Failed to load author profile. Please check the author ID.')
    } finally {
      setLoadingAuthor(false)
    }
  }

  const handleModeChange = (newMode) => {
    setData(prev => ({ ...prev, mode: newMode }))
    
    // If switching to authorId mode and we have an authorId, fetch the profile
    if (newMode === 'authorId' && data.authorId) {
      fetchAuthorProfile(data.authorId)
    }
  }

  const handleFieldChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
    
    // Auto-fetch author profile when authorId changes in authorId mode
    if (field === 'authorId' && data.mode === 'authorId' && value && value.trim()) {
      fetchAuthorProfile(value)
    }
  }

  const useCurrentUser = () => {
    if (user) {
      setData({
        mode: 'authorId',
        authorId: user._id,
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      })
      fetchAuthorProfile(user._id)
    }
  }

  return (
    <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 my-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900">Author Box #{index + 1}</h3>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
            type="button"
          >
            Remove
          </button>
        )}
      </div>

      {/* Mode Selection */}
      <div className="mb-4 flex items-center space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            checked={data.mode === 'authorId'}
            onChange={() => handleModeChange('authorId')}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Use Author ID</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            checked={data.mode === 'custom'}
            onChange={() => handleModeChange('custom')}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Custom Data</span>
        </label>
      </div>

      {data.mode === 'authorId' ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author ID *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={data.authorId}
                onChange={(e) => handleFieldChange('authorId', e.target.value)}
                onBlur={() => {
                  if (data.authorId && data.authorId.trim()) {
                    fetchAuthorProfile(data.authorId)
                  }
                }}
                placeholder="Enter author ID (24 character MongoDB ObjectId)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
              <button
                onClick={() => fetchAuthorProfile(data.authorId)}
                disabled={!data.authorId || loadingAuthor}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                type="button"
              >
                {loadingAuthor ? 'Loading...' : 'Load'}
              </button>
            </div>
            {user && (
              <button
                onClick={useCurrentUser}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                type="button"
              >
                Use Current User ({user.name})
              </button>
            )}
          </div>

          {/* Preview */}
          {(data.name || data.bio) && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start space-x-4">
                {data.avatar && (
                  <img
                    src={data.avatar}
                    alt={data.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{data.name || 'Author Name'}</h4>
                  {data.bio && (
                    <p className="text-sm text-gray-600 mt-2">{data.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author Name *
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Enter author name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author Bio *
            </label>
            <textarea
              value={data.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              placeholder="Enter author bio"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL (optional)
            </label>
            <input
              type="text"
              value={data.avatar}
              onChange={(e) => handleFieldChange('avatar', e.target.value)}
              placeholder="https://example.com/avatar.jpg or /uploads/avatar.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start space-x-4">
              {data.avatar && (
                <img
                  src={data.avatar}
                  alt={data.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg">{data.name || 'Author Name'}</h4>
                {data.bio && (
                  <p className="text-sm text-gray-600 mt-2">{data.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthorBoxBlock
