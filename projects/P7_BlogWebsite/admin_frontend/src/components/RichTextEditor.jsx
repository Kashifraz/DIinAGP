import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import { useEffect, useState, useRef } from 'react'
import { mediaService } from '../services/mediaService'
import { CodeBlockExtension } from '../extensions/CodeBlockExtension'
import { AuthorBoxExtension } from '../extensions/AuthorBoxExtension'
import { TableOfContentsExtension } from '../extensions/TableOfContentsExtension'
import { QuizExtension } from '../extensions/QuizExtension'
import { CarouselExtension } from '../extensions/CarouselExtension'
import CodeBlock from './CodeBlock'
import AuthorBoxBlock from './AuthorBoxBlock'
import TableOfContentsBlock from './TableOfContentsBlock'
import QuizBlock from './QuizBlock'
import CarouselBlock from './CarouselBlock'
import { tiptapToBlocks } from '../utils/blockConverter'

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing...' }) => {
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showCodeBlockDialog, setShowCodeBlockDialog] = useState(false)
  const [showAuthorBoxDialog, setShowAuthorBoxDialog] = useState(false)
  const [showTOCDialog, setShowTOCDialog] = useState(false)
  const [showQuizDialog, setShowQuizDialog] = useState(false)
  const [showCarouselDialog, setShowCarouselDialog] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const [editingBlockType, setEditingBlockType] = useState(null)
  const quizBlockRef = useRef(null)
  const carouselBlockRef = useRef(null)
  const [carouselFormValid, setCarouselFormValid] = useState(false)
  const [quizFormValid, setQuizFormValid] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 hover:text-primary-700 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      CodeBlockExtension.configure({
        onEdit: (blockData, onUpdate) => {
          // Use setTimeout to ensure this runs after any form submission handlers
          setTimeout(() => {
            setEditingBlockType('code')
            setEditingBlock(blockData)
            setShowCodeBlockDialog(true)
            // Store the update callback
            window.__codeBlockUpdateCallback = onUpdate
          }, 0)
        }
      }),
      AuthorBoxExtension.configure({
        onEdit: (blockData, onUpdate) => {
          // Use setTimeout to ensure this runs after any form submission handlers
          setTimeout(() => {
            setEditingBlockType('authorBox')
            setEditingBlock(blockData)
            setShowAuthorBoxDialog(true)
            // Store the update callback
            window.__authorBoxUpdateCallback = onUpdate
          }, 0)
        }
      }),
      TableOfContentsExtension.configure({
        onEdit: (blockData, onUpdate) => {
          // Use setTimeout to ensure this runs after any form submission handlers
          setTimeout(() => {
            setEditingBlockType('tableOfContents')
            setEditingBlock(blockData)
            setShowTOCDialog(true)
            // Store the update callback
            window.__tocUpdateCallback = onUpdate
          }, 0)
        }
      }),
      QuizExtension.configure({
        onEdit: (blockData, onUpdate) => {
          // Use setTimeout to ensure this runs after any form submission handlers
          setTimeout(() => {
            setEditingBlockType('quiz')
            setEditingBlock(blockData)
            setShowQuizDialog(true)
            // Store the update callback
            window.__quizUpdateCallback = onUpdate
          }, 0)
        }
      }),
      CarouselExtension.configure({
        onEdit: (blockData, onUpdate) => {
          // Use setTimeout to ensure this runs after any form submission handlers
          setTimeout(() => {
            setEditingBlockType('carousel')
            setEditingBlock(blockData)
            setShowCarouselDialog(true)
            // Store the update callback
            window.__carouselUpdateCallback = onUpdate
          }, 0)
        }
      })
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      if (onChange) {
        const json = editor.getJSON()
        onChange(json)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  useEffect(() => {
    if (editor && content) {
      const currentContent = JSON.stringify(editor.getJSON())
      const newContent = JSON.stringify(content)
      if (currentContent !== newContent) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const MenuBar = () => (
    <div className="border-b border-gray-200 p-2 flex flex-wrap items-center gap-2 bg-white rounded-t-lg">
      {/* Text Formatting */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors font-bold ${
            editor.isActive('bold') ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
          }`}
          type="button"
          title="Bold"
        >
          <span className="text-base">B</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors italic ${
            editor.isActive('italic') ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
          }`}
          type="button"
          title="Italic"
        >
          <span className="text-base">I</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors underline ${
            editor.isActive('underline') ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
          }`}
          type="button"
          title="Underline"
        >
          <span className="text-base">U</span>
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
          }`}
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
          }`}
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
          }`}
          type="button"
        >
          H3
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('bulletList') ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
          }`}
          type="button"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4h2M3 8h2M3 12h2M7 4h10M7 8h10M7 12h10" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('orderedList') ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
          }`}
          type="button"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4h2M3 8h2M3 12h2M7 4h10M7 8h10M7 12h10" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Link */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <button
          onClick={() => {
            const url = window.prompt('Enter URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive('link') ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
          }`}
          type="button"
          title="Insert Link"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        {editor.isActive('link') && (
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
            type="button"
            title="Remove Link"
          >
            Remove Link
          </button>
        )}
      </div>

      {/* Image */}
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
        <button
          onClick={() => setShowImageDialog(true)}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
          type="button"
          title="Insert Image"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Special Blocks */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => {
            setEditingBlockType('code')
            setEditingBlock({ code: '', language: '', filename: '' })
            setShowCodeBlockDialog(true)
          }}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
          type="button"
          title="Insert Code Block"
        >
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
        <button
          onClick={() => {
            setEditingBlockType('authorBox')
            setEditingBlock({ authorId: '', name: '', bio: '', avatar: '' })
            setShowAuthorBoxDialog(true)
          }}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
          type="button"
          title="Insert Author Box"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        <button
          onClick={() => {
            setEditingBlockType('tableOfContents')
            setEditingBlock({ autoGenerate: true, title: 'Table of Contents', items: [] })
            setShowTOCDialog(true)
          }}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
          type="button"
          title="Insert Table of Contents"
        >
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={() => {
            setEditingBlockType('quiz')
            setEditingBlock({ 
              question: '', 
              options: [{ text: '', value: 0 }, { text: '', value: 1 }], 
              allowMultipleAnswers: false,
              blockType: 'quiz'
            })
            setShowQuizDialog(true)
          }}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
          type="button"
          title="Insert Quiz/Poll"
        >
          <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </button>
        <button
          onClick={() => {
            setEditingBlockType('carousel')
            setEditingBlock({ items: [] })
            setShowCarouselDialog(true)
          }}
          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
          type="button"
          title="Insert Carousel"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  )

  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true)
      const media = await mediaService.uploadFile(file)
      const fullUrl = mediaService.getMediaUrl(media.url)
      
      // Insert image into editor
      editor.chain().focus().setImage({ 
        src: fullUrl,
        alt: media.originalName 
      }).run()
      
      setShowImageDialog(false)
      setImageUrl('')
      setImageAlt('')
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleInsertImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ 
        src: imageUrl.trim(),
        alt: imageAlt.trim() || 'Image'
      }).run()
      setShowImageDialog(false)
      setImageUrl('')
      setImageAlt('')
    }
  }

  return (
    <>
      <div className="border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 h-full flex flex-col">
        <MenuBar />
        <div className="relative flex-1 overflow-auto">
          <EditorContent editor={editor} className="h-full min-h-[600px] prose prose-sm max-w-none" />
          {!editor.getText() && (
            <div className="absolute top-4 left-4 pointer-events-none text-gray-400">
              {placeholder}
            </div>
          )}
        </div>
      </div>

      {/* Image Insert Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Insert Image</h3>
              <button
                onClick={() => {
                  setShowImageDialog(false)
                  setImageUrl('')
                  setImageAlt('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload from file */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      handleImageUpload(file)
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <div className="mt-2 flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Insert from URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://example.com/image.jpg or /uploads/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe the image"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowImageDialog(false)
                  setImageUrl('')
                  setImageAlt('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertImage}
                disabled={!imageUrl.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Block Dialog */}
      {showCodeBlockDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {window.__codeBlockUpdateCallback ? 'Edit Code Block' : 'Insert Code Block'}
              </h3>
              <button
                onClick={() => {
                  setShowCodeBlockDialog(false)
                  setEditingBlock(null)
                  setEditingBlockType(null)
                  window.__codeBlockUpdateCallback = null
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CodeBlock
              block={editingBlock ? { type: 'code', data: editingBlock } : null}
              index={0}
              onUpdate={(updatedBlock) => {
                setEditingBlock(updatedBlock.data)
              }}
              onDelete={() => {
                setShowCodeBlockDialog(false)
                setEditingBlock(null)
                setEditingBlockType(null)
              }}
            />
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
              <button
                onClick={() => {
                  setShowCodeBlockDialog(false)
                  setEditingBlock(null)
                  setEditingBlockType(null)
                  window.__codeBlockUpdateCallback = null
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingBlock && editingBlock.code && editingBlock.code.trim()) {
                    // Check if we're updating an existing block
                    if (window.__codeBlockUpdateCallback) {
                      window.__codeBlockUpdateCallback({
                        code: editingBlock.code,
                        language: editingBlock.language || '',
                        filename: editingBlock.filename || ''
                      })
                      window.__codeBlockUpdateCallback = null
                    } else {
                      // Insert new block
                      editor.chain().focus().insertContent({
                        type: 'codeBlock',
                        attrs: {
                          code: editingBlock.code,
                          language: editingBlock.language || '',
                          filename: editingBlock.filename || ''
                        }
                      }).run()
                    }
                    setShowCodeBlockDialog(false)
                    setEditingBlock(null)
                    setEditingBlockType(null)
                  }
                }}
                disabled={!editingBlock || !editingBlock.code || !editingBlock.code.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {window.__codeBlockUpdateCallback ? 'Update Code Block' : 'Insert Code Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Author Box Dialog */}
      {showAuthorBoxDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {window.__authorBoxUpdateCallback ? 'Edit Author Box' : 'Insert Author Box'}
              </h3>
              <button
                onClick={() => {
                  setShowAuthorBoxDialog(false)
                  setEditingBlock(null)
                  setEditingBlockType(null)
                  window.__authorBoxUpdateCallback = null
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AuthorBoxBlock
              block={editingBlock ? { type: 'authorBox', data: editingBlock } : null}
              index={0}
              onUpdate={(updatedBlock) => {
                setEditingBlock(updatedBlock.data)
              }}
              onDelete={() => {
                setShowAuthorBoxDialog(false)
                setEditingBlock(null)
                setEditingBlockType(null)
              }}
            />
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
              <button
                onClick={() => {
                  setShowAuthorBoxDialog(false)
                  setEditingBlock(null)
                  setEditingBlockType(null)
                  window.__authorBoxUpdateCallback = null
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingBlock && ((editingBlock.authorId && editingBlock.authorId.trim()) || (editingBlock.name && editingBlock.name.trim() && editingBlock.bio && editingBlock.bio.trim()))) {
                    // Check if we're updating an existing block
                    if (window.__authorBoxUpdateCallback) {
                      window.__authorBoxUpdateCallback({
                        authorId: editingBlock.authorId || '',
                        name: editingBlock.name || '',
                        bio: editingBlock.bio || '',
                        avatar: editingBlock.avatar || ''
                      })
                      window.__authorBoxUpdateCallback = null
                    } else {
                      // Insert new block
                      editor.chain().focus().insertContent({
                        type: 'authorBox',
                        attrs: {
                          authorId: editingBlock.authorId || '',
                          name: editingBlock.name || '',
                          bio: editingBlock.bio || '',
                          avatar: editingBlock.avatar || ''
                        }
                      }).run()
                    }
                    setShowAuthorBoxDialog(false)
                    setEditingBlock(null)
                    setEditingBlockType(null)
                  }
                }}
                disabled={!editingBlock || (!editingBlock.authorId && (!editingBlock.name || !editingBlock.bio))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {window.__authorBoxUpdateCallback ? 'Update Author Box' : 'Insert Author Box'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table of Contents Dialog */}
      {showTOCDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {window.__tocUpdateCallback ? 'Edit Table of Contents' : 'Insert Table of Contents'}
              </h3>
              <button
                onClick={() => {
                  setShowTOCDialog(false)
                  setEditingBlock(null)
                  setEditingBlockType(null)
                  window.__tocUpdateCallback = null
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TableOfContentsBlock
              block={editingBlock ? { type: 'tableOfContents', data: editingBlock } : null}
              index={0}
              allBlocks={editor ? tiptapToBlocks(editor.getJSON()) : []}
              onUpdate={(updatedBlock) => {
                setEditingBlock(updatedBlock.data)
              }}
              onDelete={() => {
                setShowTOCDialog(false)
                setEditingBlock(null)
                setEditingBlockType(null)
                window.__tocUpdateCallback = null
              }}
            />
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
              <button
                onClick={() => {
                  setShowTOCDialog(false)
                  setEditingBlock(null)
                  setEditingBlockType(null)
                  window.__tocUpdateCallback = null
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingBlock) {
                    // Check if we're updating an existing block
                    if (window.__tocUpdateCallback) {
                      window.__tocUpdateCallback({
                        autoGenerate: editingBlock.autoGenerate !== false,
                        title: editingBlock.title || 'Table of Contents',
                        items: editingBlock.items || []
                      })
                      window.__tocUpdateCallback = null
                    } else {
                      // Insert new block
                      editor.chain().focus().insertContent({
                        type: 'tableOfContents',
                        attrs: {
                          autoGenerate: editingBlock.autoGenerate !== false,
                          title: editingBlock.title || 'Table of Contents',
                          items: editingBlock.items || []
                        }
                      }).run()
                    }
                    setShowTOCDialog(false)
                    setEditingBlock(null)
                    setEditingBlockType(null)
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {window.__tocUpdateCallback ? 'Update Table of Contents' : 'Insert Table of Contents'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz/Poll Dialog */}
      {showQuizDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {window.__quizUpdateCallback ? 'Edit Quiz/Poll' : 'Insert Quiz/Poll'}
              </h3>
              <button
                onClick={() => {
                  setShowQuizDialog(false)
                  setEditingBlock(null)
                  setEditingBlockType(null)
                  window.__quizUpdateCallback = null
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <QuizBlock
              ref={quizBlockRef}
              block={editingBlock ? { type: editingBlock.blockType || 'quiz', data: editingBlock } : null}
              index={0}
              onUpdate={null}
              onValidityChange={setQuizFormValid}
              onDelete={() => {
                setShowQuizDialog(false)
                setEditingBlock(null)
                setEditingBlockType(null)
                window.__quizUpdateCallback = null
              }}
            />
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
              <button
                onClick={() => {
                  setShowQuizDialog(false)
                  setEditingBlock(null)
                  setEditingBlockType(null)
                  window.__quizUpdateCallback = null
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Get current data from QuizBlock component via ref
                  if (!quizBlockRef.current) return
                  
                  const blockData = quizBlockRef.current.getData()
                  const currentData = blockData.data
                  
                  if (currentData.question && currentData.question.trim() && 
                      currentData.options && currentData.options.filter(opt => opt.text && opt.text.trim()).length >= 2) {
                    const isPoll = currentData.blockType === 'poll'
                    const attrs = {
                      question: currentData.question,
                      options: currentData.options.filter(opt => opt.text && opt.text.trim()),
                      allowMultipleAnswers: currentData.allowMultipleAnswers || false,
                      blockType: currentData.blockType || 'quiz'
                    }
                    
                    // Only include correct answers for quiz blocks (not polls)
                    if (!isPoll) {
                      if (currentData.correctAnswer !== undefined && currentData.correctAnswer !== null) {
                        attrs.correctAnswer = currentData.correctAnswer
                      }
                      if (currentData.correctAnswers !== undefined && currentData.correctAnswers !== null) {
                        attrs.correctAnswers = currentData.correctAnswers
                      }
                    }
                    
                    // Check if we're updating an existing block
                    if (window.__quizUpdateCallback) {
                      window.__quizUpdateCallback(attrs)
                      window.__quizUpdateCallback = null
                    } else {
                      // Insert new block
                      editor.chain().focus().insertContent({
                        type: 'quiz',
                        attrs
                      }).run()
                    }
                    setShowQuizDialog(false)
                    setEditingBlock(null)
                    setEditingBlockType(null)
                  }
                }}
                disabled={!quizFormValid}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {window.__quizUpdateCallback ? 'Update Quiz/Poll' : 'Insert Quiz/Poll'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carousel Dialog */}
      {showCarouselDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {window.__carouselUpdateCallback ? 'Edit Carousel' : 'Insert Carousel'}
              </h3>
              <button
                onClick={() => {
                  setShowCarouselDialog(false)
                  setEditingBlock(null)
                  setEditingBlockType(null)
                  window.__carouselUpdateCallback = null
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CarouselBlock
              ref={carouselBlockRef}
              block={editingBlock ? { type: 'carousel', data: editingBlock } : null}
              index={0}
              onUpdate={null}
              onValidityChange={setCarouselFormValid}
              onDelete={() => {
                setShowCarouselDialog(false)
                setEditingBlock(null)
                setEditingBlockType(null)
                window.__carouselUpdateCallback = null
              }}
            />
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
              <button
                onClick={() => {
                  setShowCarouselDialog(false)
                  setEditingBlock(null)
                  setEditingBlockType(null)
                  window.__carouselUpdateCallback = null
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!carouselBlockRef.current) return
                  
                  const blockData = carouselBlockRef.current.getData()
                  const currentData = blockData.data
                  
                  if (currentData.items && currentData.items.length > 0) {
                    // Check if we're updating an existing block
                    if (window.__carouselUpdateCallback) {
                      window.__carouselUpdateCallback({
                        items: currentData.items
                      })
                      window.__carouselUpdateCallback = null
                    } else {
                      // Insert new block
                      editor.chain().focus().insertContent({
                        type: 'carousel',
                        attrs: {
                          items: currentData.items
                        }
                      }).run()
                    }
                    setShowCarouselDialog(false)
                    setEditingBlock(null)
                    setEditingBlockType(null)
                  }
                }}
                disabled={!carouselFormValid}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {window.__carouselUpdateCallback ? 'Update Carousel' : 'Insert Carousel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RichTextEditor

