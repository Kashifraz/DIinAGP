import { Node, mergeAttributes } from '@tiptap/core'

export const QuizExtension = Node.create({
  name: 'quiz',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      onEdit: null,
    }
  },

  addAttributes() {
    return {
      question: {
        default: '',
        parseHTML: element => element.getAttribute('data-question'),
        renderHTML: attributes => {
          if (!attributes.question) {
            return {}
          }
          return {
            'data-question': attributes.question,
          }
        },
      },
      options: {
        default: [],
        parseHTML: element => {
          const optionsAttr = element.getAttribute('data-options')
          return optionsAttr ? JSON.parse(optionsAttr) : []
        },
        renderHTML: attributes => {
          if (!attributes.options || attributes.options.length === 0) {
            return {}
          }
          return {
            'data-options': JSON.stringify(attributes.options),
          }
        },
      },
      allowMultipleAnswers: {
        default: false,
        parseHTML: element => element.getAttribute('data-allow-multiple') === 'true',
        renderHTML: attributes => {
          return {
            'data-allow-multiple': attributes.allowMultipleAnswers ? 'true' : 'false',
          }
        },
      },
      correctAnswer: {
        default: null,
        parseHTML: element => {
          const attr = element.getAttribute('data-correct-answer')
          if (!attr) return null
          // Try to parse as number, otherwise return as string
          const num = Number(attr)
          return isNaN(num) ? attr : num
        },
        renderHTML: attributes => {
          if (attributes.correctAnswer === null || attributes.correctAnswer === undefined) {
            return {}
          }
          return {
            'data-correct-answer': String(attributes.correctAnswer),
          }
        },
      },
      correctAnswers: {
        default: null,
        parseHTML: element => {
          const attr = element.getAttribute('data-correct-answers')
          return attr ? JSON.parse(attr) : null
        },
        renderHTML: attributes => {
          if (!attributes.correctAnswers || !Array.isArray(attributes.correctAnswers)) {
            return {}
          }
          return {
            'data-correct-answers': JSON.stringify(attributes.correctAnswers),
          }
        },
      },
      blockType: {
        default: 'quiz',
        parseHTML: element => element.getAttribute('data-block-type') || 'quiz',
        renderHTML: attributes => {
          return {
            'data-block-type': attributes.blockType || 'quiz',
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="quiz"]',
      },
      {
        tag: 'div[data-type="poll"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'quiz' }), 0]
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement('div')
      const blockType = node.attrs.blockType || 'quiz'
      const isPoll = blockType === 'poll'
      const borderColor = isPoll ? 'border-orange-300' : 'border-yellow-300'
      const bgColor = isPoll ? 'bg-orange-50' : 'bg-yellow-50'
      const textColor = isPoll ? 'text-orange-600' : 'text-yellow-600'
      
      dom.className = `quiz-block-node border-2 border-dashed ${borderColor} rounded-lg p-4 ${bgColor} my-4 cursor-pointer hover:${bgColor.replace('50', '100')} transition-colors`
      dom.setAttribute('data-type', blockType)
      dom.setAttribute('data-question', node.attrs.question || '')
      dom.setAttribute('data-options', JSON.stringify(node.attrs.options || []))
      dom.setAttribute('data-allow-multiple', node.attrs.allowMultipleAnswers ? 'true' : 'false')
      dom.setAttribute('data-block-type', blockType)

      const header = document.createElement('div')
      header.className = 'flex items-center justify-between mb-2'
      
      const leftSection = document.createElement('div')
      leftSection.className = 'flex items-center space-x-2'
      
      const icon = document.createElement('svg')
      icon.className = `w-5 h-5 ${textColor}`
      icon.setAttribute('fill', 'none')
      icon.setAttribute('viewBox', '0 0 24 24')
      icon.setAttribute('stroke', 'currentColor')
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />'
      
      const title = document.createElement('span')
      title.className = 'text-sm font-semibold text-gray-900'
      title.textContent = isPoll ? 'Poll' : 'Quiz'
      
      leftSection.appendChild(icon)
      leftSection.appendChild(title)
      
      if (node.attrs.allowMultipleAnswers) {
        const badge = document.createElement('span')
        badge.className = `px-2 py-1 ${bgColor.replace('50', '200')} ${textColor} text-xs rounded`
        badge.textContent = 'Multiple answers'
        leftSection.appendChild(badge)
      }
      
      const editButton = document.createElement('button')
      editButton.type = 'button'
      editButton.className = `p-1.5 rounded hover:${bgColor.replace('50', '200')} ${textColor} transition-colors`
      editButton.title = `Edit ${isPoll ? 'Poll' : 'Quiz'}`
      editButton.innerHTML = `
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      `
      editButton.onclick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        if (this.options.onEdit) {
          this.options.onEdit({
            question: node.attrs.question || '',
            options: node.attrs.options || [],
            allowMultipleAnswers: node.attrs.allowMultipleAnswers || false,
            correctAnswer: node.attrs.correctAnswer || null,
            correctAnswers: node.attrs.correctAnswers || null,
            blockType: blockType
          }, (updatedData) => {
            // Update the node
            const pos = getPos()
            if (typeof pos === 'number') {
              editor.commands.command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  question: updatedData.question,
                  options: updatedData.options,
                  allowMultipleAnswers: updatedData.allowMultipleAnswers,
                  correctAnswer: updatedData.correctAnswer,
                  correctAnswers: updatedData.correctAnswers,
                  blockType: updatedData.blockType
                })
                return true
              })
            }
          })
        }
        return false
      }
      
      header.appendChild(leftSection)
      header.appendChild(editButton)

      const preview = document.createElement('div')
      preview.className = 'mt-2 text-sm text-gray-700'
      if (node.attrs.question) {
        const questionText = document.createElement('div')
        questionText.className = 'font-medium mb-2'
        questionText.textContent = node.attrs.question
        preview.appendChild(questionText)
        
        if (node.attrs.options && node.attrs.options.length > 0) {
          const optionsList = document.createElement('div')
          optionsList.className = 'space-y-1 text-xs text-gray-600'
          node.attrs.options.slice(0, 3).forEach((opt, idx) => {
            const optItem = document.createElement('div')
            optItem.textContent = `${idx + 1}. ${opt.text || 'Option ' + (idx + 1)}`
            optionsList.appendChild(optItem)
          })
          if (node.attrs.options.length > 3) {
            const moreItem = document.createElement('div')
            moreItem.className = 'text-gray-500 italic'
            moreItem.textContent = `... and ${node.attrs.options.length - 3} more`
            optionsList.appendChild(moreItem)
          }
          preview.appendChild(optionsList)
        }
      } else {
        preview.textContent = `Empty ${isPoll ? 'poll' : 'quiz'}`
      }

      dom.appendChild(header)
      dom.appendChild(preview)
      
      // Make the whole block clickable
      dom.onclick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.target !== editButton && !editButton.contains(e.target)) {
          editButton.click()
        }
        return false
      }

      return {
        dom,
      }
    }
  },
})

