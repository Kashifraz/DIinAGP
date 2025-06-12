import { useState, useRef, useEffect } from 'react'
import { mediaService } from '../services/mediaService'

const MediaUpload = ({ onUploadSuccess, onUploadError, multiple = false }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState({})
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFiles = (files) => {
    if (files.length === 0) return

    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      setError('Please select image files only')
      setTimeout(() => setError(null), 5000)
      return
    }

    // Validate each file
    const validFiles = []
    const errors = []

    imageFiles.forEach(file => {
      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        errors.push(`"${file.name}" exceeds the maximum size of 10MB`)
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(file.type)) {
        errors.push(`"${file.name}" is not a supported image type`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      setError(errors.join(', '))
      setTimeout(() => setError(null), 5000)
    }

    if (validFiles.length > 0) {
      // Create preview URLs for new files
      const newPreviewUrls = {}
      validFiles.forEach((file, idx) => {
        const fileIndex = multiple ? selectedFiles.length + idx : idx
        newPreviewUrls[fileIndex] = URL.createObjectURL(file)
      })

      if (multiple) {
        setSelectedFiles(prev => [...prev, ...validFiles])
        setPreviewUrls(prev => ({ ...prev, ...newPreviewUrls }))
      } else {
        // Clean up old preview URLs when replacing files
        Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url))
        setSelectedFiles(validFiles)
        setPreviewUrls(newPreviewUrls)
      }
      setError(null)
    }
  }

  const removeFile = (index) => {
    // Revoke object URL before removing file
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index])
    }
    
    // Remove file and update preview URLs
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      const newUrls = {}
      let newIndex = 0
      Object.keys(prev).forEach(key => {
        const oldIndex = parseInt(key)
        if (oldIndex !== index) {
          newUrls[newIndex] = prev[oldIndex]
          newIndex++
        }
      })
      return newUrls
    })
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setError(null)
    const newProgress = {}
    selectedFiles.forEach((_, index) => {
      newProgress[index] = 0
    })
    setUploadProgress(newProgress)

    const uploadedMedia = []
    const errors = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      try {
        const media = await mediaService.uploadFile(file, (progress) => {
          setUploadProgress(prev => ({ ...prev, [i]: progress }))
        })

        uploadedMedia.push(media)
        
        if (onUploadSuccess) {
          onUploadSuccess(media)
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to upload file'
        errors.push(`"${file.name}": ${errorMsg}`)
        
        if (onUploadError) {
          onUploadError(err)
        }
      }
    }

    if (errors.length > 0) {
      setError(errors.join('; '))
    }

    // Clear selected files if all uploads succeeded
    if (errors.length === 0) {
      // Clean up all preview URLs
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url))
      setSelectedFiles([])
      setPreviewUrls({})
      setUploadProgress({})
    }

    setUploading(false)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF, WebP, SVG up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Selected Files ({selectedFiles.length})
            </h3>
            <button
              onClick={() => {
                // Clean up all preview URLs
                Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url))
                setSelectedFiles([])
                setPreviewUrls({})
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
              disabled={uploading}
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => {
              const previewUrl = previewUrls[index]
              const progress = uploadProgress[index] || 0
              const isUploading = uploading && progress < 100

              return (
                <div
                  key={`${file.name}-${index}`}
                  className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  {/* Image Preview */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={previewUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Upload Progress Overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="text-center space-y-2 w-full px-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-white">{progress}%</p>
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    {!uploading && (
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Upload Button */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                // Clean up all preview URLs
                Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url))
                setSelectedFiles([])
                setPreviewUrls({})
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaUpload

