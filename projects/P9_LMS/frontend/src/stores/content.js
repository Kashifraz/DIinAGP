import { defineStore } from 'pinia'
import { ref } from 'vue'
import { contentService } from '@/services/contentService'

export const useContentStore = defineStore('content', () => {
  const modules = ref([])
  const currentModule = ref(null)
  const contents = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchModulesByCourse(courseId) {
    loading.value = true
    error.value = null
    try {
      const data = await contentService.getModulesByCourse(courseId)
      modules.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch modules'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchModuleById(moduleId) {
    loading.value = true
    error.value = null
    try {
      const module = await contentService.getModuleById(moduleId)
      currentModule.value = module
      return module
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch module'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createModule(courseId, moduleData) {
    loading.value = true
    error.value = null
    try {
      const module = await contentService.createModule(courseId, moduleData)
      modules.value.push(module)
      return module
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to create module'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateModule(moduleId, moduleData) {
    loading.value = true
    error.value = null
    try {
      const updatedModule = await contentService.updateModule(moduleId, moduleData)
      const index = modules.value.findIndex(m => m.id === moduleId)
      if (index !== -1) {
        modules.value[index] = updatedModule
      }
      if (currentModule.value && currentModule.value.id === moduleId) {
        currentModule.value = updatedModule
      }
      return updatedModule
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to update module'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteModule(moduleId) {
    loading.value = true
    error.value = null
    try {
      await contentService.deleteModule(moduleId)
      modules.value = modules.value.filter(m => m.id !== moduleId)
      if (currentModule.value && currentModule.value.id === moduleId) {
        currentModule.value = null
      }
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to delete module'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function reorderModules(courseId, moduleIds) {
    loading.value = true
    error.value = null
    try {
      await contentService.reorderModules(courseId, moduleIds)
      await fetchModulesByCourse(courseId) // Refresh modules
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to reorder modules'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchContentByModule(moduleId) {
    // Validate moduleId before making API call
    if (!moduleId || moduleId === null || moduleId === 'null') {
      const errorMsg = 'Invalid module ID provided'
      error.value = errorMsg
      throw new Error(errorMsg)
    }
    
    loading.value = true
    error.value = null
    try {
      const data = await contentService.getContentByModule(moduleId)
      contents.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch content'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchContentByCourse(courseId) {
    loading.value = true
    error.value = null
    try {
      const data = await contentService.getContentByCourse(courseId)
      contents.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch content'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function uploadContent(moduleId, file, title, description) {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      if (description) {
        formData.append('description', description)
      }
      
      const content = await contentService.uploadContent(moduleId, formData)
      contents.value.push(content)
      return content
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to upload content'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addLink(moduleId, linkData) {
    loading.value = true
    error.value = null
    try {
      const content = await contentService.addLink(moduleId, linkData)
      contents.value.push(content)
      return content
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to add link'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteContent(contentId) {
    loading.value = true
    error.value = null
    try {
      await contentService.deleteContent(contentId)
      contents.value = contents.value.filter(c => c.id !== contentId)
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to delete content'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function downloadContent(contentId, content) {
    try {
      const response = await contentService.downloadContent(contentId)
      
      // Extract filename from Content-Disposition header
      let filename = 'download'
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }
      
      // Fallback: use content info if header doesn't provide filename
      if (filename === 'download' && content && content.title) {
        filename = content.title
        // Add extension if available from filePath or fileType
        if (content.filePath) {
          const extension = content.filePath.substring(content.filePath.lastIndexOf('.'))
          if (extension && !filename.toLowerCase().endsWith(extension.toLowerCase())) {
            filename = filename + extension
          }
        } else if (content.fileType) {
          // Fallback: add extension based on fileType
          const extensionMap = {
            'PDF': '.pdf',
            'PPT': '.ppt',
            'PPTX': '.pptx',
            'DOC': '.doc',
            'DOCX': '.docx',
            'VIDEO': '.mp4',
            'MP4': '.mp4'
          }
          const ext = extensionMap[content.fileType.toUpperCase()]
          if (ext && !filename.toLowerCase().endsWith(ext.toLowerCase())) {
            filename = filename + ext
          }
        }
      }
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: response.type || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to download content'
      throw err
    }
  }

  async function reorderContent(moduleId, contentIds) {
    loading.value = true
    error.value = null
    try {
      await contentService.reorderContent(moduleId, contentIds)
      await fetchContentByModule(moduleId) // Refresh content
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to reorder content'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    modules,
    currentModule,
    contents,
    loading,
    error,
    fetchModulesByCourse,
    fetchModuleById,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    fetchContentByModule,
    fetchContentByCourse,
    uploadContent,
    addLink,
    deleteContent,
    downloadContent,
    reorderContent,
    clearError
  }
})

