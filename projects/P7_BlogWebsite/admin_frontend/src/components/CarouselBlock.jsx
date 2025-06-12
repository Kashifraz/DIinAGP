import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { mediaService } from '../services/mediaService'

const CarouselBlock = forwardRef(({ block, onUpdate, onDelete, index, onValidityChange }, ref) => {
  // Initialize state from block or create default
  const getInitialData = () => {
    if (block && block.data && block.data.items) {
      return {
        items: block.data.items.map(item => ({
          imageUrl: item.imageUrl || '',
          alt: item.alt || '',
          link: item.link || '',
          title: item.title || '',
          description: item.description || ''
        }))
      }
    }
    return {
      items: []
    }
  }

  const [data, setData] = useState(getInitialData())
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [mediaFiles, setMediaFiles] = useState([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const dataRef = useRef(data)
  const [isValid, setIsValid] = useState(false)

  // Update ref whenever data changes
  useEffect(() => {
    dataRef.current = data
    // Check validity
    const valid = data.items.length > 0 && data.items.every(item => 
      item.imageUrl && item.imageUrl.trim() && item.alt && item.alt.trim()
    )
    setIsValid(valid)
    // Notify parent
    if (onValidityChange) {
      onValidityChange(valid)
    }
  }, [data, onValidityChange])

  // Update when block changes
  useEffect(() => {
    const newData = getInitialData()
    const dataChanged = JSON.stringify(newData) !== JSON.stringify(data)
    if (dataChanged) {
      setData(newData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block?.data?.items])

  // Expose method to get current data via ref
  useImperativeHandle(ref, () => ({
    getData: () => {
      return {
        type: 'carousel',
        data: {
          items: dataRef.current.items
            .filter(item => item.imageUrl && item.imageUrl.trim())
            .map(item => {
              // Clean up the item data - remove empty optional fields
              const cleanedItem = {
                imageUrl: item.imageUrl.trim(),
                alt: item.alt.trim()
              }
              
              // Only include optional fields if they have values
              if (item.link && item.link.trim()) {
                cleanedItem.link = item.link.trim()
              }
              if (item.title && item.title.trim()) {
                cleanedItem.title = item.title.trim()
              }
              if (item.description && item.description.trim()) {
                cleanedItem.description = item.description.trim()
              }
              
              return cleanedItem
            })
        }
      }
    },
    isValid: () => {
      const current = dataRef.current
      return current.items.length > 0 && current.items.every(item => 
        item.imageUrl && item.imageUrl.trim() && item.alt && item.alt.trim()
      )
    }
  }))

  // Load media files
  const loadMediaFiles = async () => {
    setLoadingMedia(true)
    try {
      const response = await mediaService.getMedia({ limit: 100 })
      setMediaFiles(response.media || [])
    } catch (error) {
      console.error('Failed to load media:', error)
    } finally {
      setLoadingMedia(false)
    }
  }

  const handleAddItem = () => {
    if (data.items.length >= 50) {
      alert('Maximum 50 items allowed')
      return
    }
    setData(prev => ({
      ...prev,
      items: [...prev.items, { imageUrl: '', alt: '', link: '', title: '', description: '' }]
    }))
  }

  const handleRemoveItem = (index) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index, field, value) => {
    setData(prev => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      return { ...prev, items: newItems }
    })
  }

  const handleSelectFromMedia = (media) => {
    const lastIndex = data.items.length - 1
    if (lastIndex >= 0) {
      handleItemChange(lastIndex, 'imageUrl', media.url)
      setShowMediaLibrary(false)
    } else {
      // Add new item with selected media
      setData(prev => ({
        ...prev,
        items: [...prev.items, { 
          imageUrl: media.url, 
          alt: media.originalName || '', 
          link: '', 
          title: '', 
          description: '' 
        }]
      }))
      setShowMediaLibrary(false)
    }
  }

  const handleMoveItem = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return
    
    setData(prev => {
      const newItems = [...prev.items]
      const [movedItem] = newItems.splice(fromIndex, 1)
      newItems.splice(toIndex, 0, movedItem)
      return { ...prev, items: newItems }
    })
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

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Carousel Block</h3>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Remove block"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Add Item Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {data.items.length} / 50 items
          </p>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowMediaLibrary(true)
                loadMediaFiles()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Select from Media Library
            </button>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={data.items.length >= 50}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              + Add Item
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {data.items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, index - 1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  )}
                  {index < data.items.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveItem(index, index + 1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={item.imageUrl}
                      onChange={(e) => handleItemChange(index, 'imageUrl', e.target.value)}
                      placeholder="/uploads/image.jpg or https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowMediaLibrary(true)
                        loadMediaFiles()
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Browse
                    </button>
                  </div>
                  {item.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={getMediaUrl(item.imageUrl)}
                        alt="Preview"
                        className="max-w-full h-32 object-cover rounded border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Alt Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Text <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.alt}
                    onChange={(e) => handleItemChange(index, 'alt', e.target.value)}
                    placeholder="Image description"
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{item.alt.length}/200 characters</p>
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={item.link}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleItemChange(index, 'link', value);
                    }}
                    placeholder="https://example.com or /page or #section"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      item.link && item.link.trim() && 
                      !item.link.trim().startsWith('http://') && 
                      !item.link.trim().startsWith('https://') && 
                      !item.link.trim().startsWith('/') && 
                      !item.link.trim().startsWith('#') &&
                      !item.link.trim().startsWith('mailto:') &&
                      !item.link.trim().startsWith('tel:')
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-primary-500'
                    }`}
                  />
                  {item.link && item.link.trim() && 
                   !item.link.trim().startsWith('http://') && 
                   !item.link.trim().startsWith('https://') && 
                   !item.link.trim().startsWith('/') && 
                   !item.link.trim().startsWith('#') &&
                   !item.link.trim().startsWith('mailto:') &&
                   !item.link.trim().startsWith('tel:') && (
                    <p className="mt-1 text-xs text-red-600">
                      Link must start with http://, https://, /, #, mailto:, or tel:
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                    placeholder="Item title"
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{item.title.length}/200 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Item description"
                    maxLength={500}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{item.description.length}/500 characters</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Message */}
        {!isValid && data.items.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Please provide image URL and alt text for all items.
            </p>
          </div>
        )}

        {data.items.length === 0 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-sm text-gray-600">No items added yet. Click "Add Item" to get started.</p>
          </div>
        )}
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Image from Media Library</h3>
              <button
                type="button"
                onClick={() => setShowMediaLibrary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {loadingMedia ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading media...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mediaFiles.map((media) => (
                  <button
                    key={media._id}
                    type="button"
                    onClick={() => handleSelectFromMedia(media)}
                    className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-primary-500 transition-colors"
                  >
                    <img
                      src={getMediaUrl(media.url)}
                      alt={media.originalName}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">Select</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

CarouselBlock.displayName = 'CarouselBlock'

export default CarouselBlock

