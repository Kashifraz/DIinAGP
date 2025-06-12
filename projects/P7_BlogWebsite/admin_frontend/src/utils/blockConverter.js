/**
 * Convert TipTap JSON to block-based format
 * @param {Object} tiptapContent - TipTap JSON content
 * @returns {Array} Array of content blocks
 */
export const tiptapToBlocks = (tiptapContent) => {
  if (!tiptapContent || !tiptapContent.content) {
    return []
  }

  const blocks = []

  const processNode = (node) => {
    switch (node.type) {
      case 'paragraph':
        if (node.content && node.content.length > 0) {
          const text = extractText(node)
          if (text.trim()) {
            blocks.push({
              type: 'paragraph',
              data: {
                text: text
              }
            })
          }
        } else {
          // Empty paragraph
          blocks.push({
            type: 'paragraph',
            data: {
              text: ''
            }
          })
        }
        break

      case 'heading':
        const headingText = extractText(node)
        if (headingText.trim()) {
          blocks.push({
            type: 'heading',
            data: {
              text: headingText,
              level: node.attrs?.level || 1
            }
          })
        }
        break

      case 'bulletList':
      case 'orderedList':
        if (node.content) {
          node.content.forEach(listItem => {
            if (listItem.type === 'listItem' && listItem.content) {
              listItem.content.forEach(itemContent => {
                processNode(itemContent)
              })
            }
          })
        }
        break

      case 'image':
        if (node.attrs && node.attrs.src) {
          blocks.push({
            type: 'image',
            data: {
              url: node.attrs.src,
              alt: node.attrs.alt || ''
            }
          })
        }
        break

      case 'codeBlock':
        if (node.attrs && node.attrs.code) {
          blocks.push({
            type: 'code',
            data: {
              code: node.attrs.code,
              language: node.attrs.language || '',
              filename: node.attrs.filename || ''
            }
          })
        }
        break

      case 'authorBox':
        blocks.push({
          type: 'authorBox',
          data: {
            authorId: node.attrs?.authorId || '',
            name: node.attrs?.name || '',
            bio: node.attrs?.bio || '',
            avatar: node.attrs?.avatar || ''
          }
        })
        break

      case 'tableOfContents':
        blocks.push({
          type: 'tableOfContents',
          data: {
            autoGenerate: node.attrs?.autoGenerate !== false,
            title: node.attrs?.title || 'Table of Contents',
            items: node.attrs?.items || []
          }
        })
        break

      case 'quiz':
        const isPoll = node.attrs?.blockType === 'poll'
        const quizData = {
          question: node.attrs?.question || '',
          options: node.attrs?.options || [],
          allowMultipleAnswers: node.attrs?.allowMultipleAnswers || false,
          blockType: node.attrs?.blockType || 'quiz'
        }
        
        // Only include correct answers for quiz blocks (not polls)
        if (!isPoll) {
          if (node.attrs?.correctAnswer !== undefined && node.attrs?.correctAnswer !== null) {
            quizData.correctAnswer = node.attrs.correctAnswer
          }
          if (node.attrs?.correctAnswers !== undefined && node.attrs?.correctAnswers !== null) {
            quizData.correctAnswers = node.attrs.correctAnswers
          }
        }
        
        blocks.push({
          type: isPoll ? 'poll' : 'quiz',
          data: quizData
        })
        break

      case 'carousel':
        blocks.push({
          type: 'carousel',
          data: {
            items: node.attrs?.items || []
          }
        })
        break

      default:
        // For other node types, process children
        if (node.content) {
          node.content.forEach(child => processNode(child))
        }
        break
    }
  }

  // Process all top-level nodes
  if (tiptapContent.content) {
    tiptapContent.content.forEach(node => processNode(node))
  }

  return blocks
}

/**
 * Extract text content from a node (including formatted text)
 * @param {Object} node - TipTap node
 * @returns {string} Extracted text
 */
const extractText = (node) => {
  if (node.type === 'text') {
    return node.text || ''
  }

  if (node.content && Array.isArray(node.content)) {
    return node.content.map(child => extractText(child)).join('')
  }

  return ''
}

/**
 * Convert block-based format to TipTap JSON
 * @param {Array} blocks - Array of content blocks
 * @returns {Object} TipTap JSON content
 */
export const blocksToTipTap = (blocks) => {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: []
        }
      ]
    }
  }

  const content = []

  blocks.forEach(block => {
    switch (block.type) {
      case 'paragraph':
        content.push({
          type: 'paragraph',
          content: block.data?.text ? [
            {
              type: 'text',
              text: block.data.text
            }
          ] : []
        })
        break

      case 'heading':
        content.push({
          type: 'heading',
          attrs: {
            level: block.data?.level || 1
          },
          content: block.data?.text ? [
            {
              type: 'text',
              text: block.data.text
            }
          ] : []
        })
        break

      case 'image':
        if (block.data?.url) {
          content.push({
            type: 'image',
            attrs: {
              src: block.data.url,
              alt: block.data.alt || ''
            }
          })
        }
        break

      case 'code':
        if (block.data?.code) {
          content.push({
            type: 'codeBlock',
            attrs: {
              code: block.data.code,
              language: block.data.language || '',
              filename: block.data.filename || ''
            }
          })
        }
        break

      case 'authorBox':
        content.push({
          type: 'authorBox',
          attrs: {
            authorId: block.data?.authorId || '',
            name: block.data?.name || '',
            bio: block.data?.bio || '',
            avatar: block.data?.avatar || ''
          }
        })
        break

      case 'tableOfContents':
        content.push({
          type: 'tableOfContents',
          attrs: {
            autoGenerate: block.data?.autoGenerate !== false,
            title: block.data?.title || 'Table of Contents',
            items: block.data?.items || []
          }
        })
        break

      case 'quiz':
      case 'poll':
        const isPollBlock = block.type === 'poll' || block.data?.blockType === 'poll'
        const quizAttrs = {
          question: block.data?.question || '',
          options: block.data?.options || [],
          allowMultipleAnswers: block.data?.allowMultipleAnswers || false,
          blockType: block.data?.blockType || (block.type === 'poll' ? 'poll' : 'quiz')
        }
        
        // Only include correct answers for quiz blocks (not polls)
        if (!isPollBlock) {
          if (block.data?.correctAnswer !== undefined && block.data?.correctAnswer !== null) {
            quizAttrs.correctAnswer = block.data.correctAnswer
          }
          if (block.data?.correctAnswers !== undefined && block.data?.correctAnswers !== null) {
            quizAttrs.correctAnswers = block.data.correctAnswers
          }
        }
        
        content.push({
          type: 'quiz',
          attrs: quizAttrs
        })
        break

      case 'carousel':
        content.push({
          type: 'carousel',
          attrs: {
            items: block.data?.items || []
          }
        })
        break

      // Other block types will be handled in their respective features
      default:
        // For now, convert unknown blocks to paragraphs
        if (block.data?.text) {
          content.push({
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: block.data.text
              }
            ]
          })
        }
        break
    }
  })

  return {
    type: 'doc',
    content: content.length > 0 ? content : [
      {
        type: 'paragraph',
        content: []
      }
    ]
  }
}

