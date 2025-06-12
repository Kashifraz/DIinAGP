import { Node, mergeAttributes } from '@tiptap/core'

export const CodeBlockExtension = Node.create({
  name: 'codeBlock',
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
      code: {
        default: '',
        parseHTML: element => element.getAttribute('data-code'),
        renderHTML: attributes => {
          if (!attributes.code) {
            return {}
          }
          return {
            'data-code': attributes.code,
          }
        },
      },
      language: {
        default: '',
        parseHTML: element => element.getAttribute('data-language'),
        renderHTML: attributes => {
          if (!attributes.language) {
            return {}
          }
          return {
            'data-language': attributes.language,
          }
        },
      },
      filename: {
        default: '',
        parseHTML: element => element.getAttribute('data-filename'),
        renderHTML: attributes => {
          if (!attributes.filename) {
            return {}
          }
          return {
            'data-filename': attributes.filename,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="codeBlock"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'codeBlock' }), 0]
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement('div')
      dom.className = 'code-block-node border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50 my-4 cursor-pointer hover:bg-green-100 transition-colors'
      dom.setAttribute('data-type', 'codeBlock')
      dom.setAttribute('data-code', node.attrs.code || '')
      dom.setAttribute('data-language', node.attrs.language || '')
      dom.setAttribute('data-filename', node.attrs.filename || '')

      const header = document.createElement('div')
      header.className = 'flex items-center justify-between mb-2'
      
      const leftSection = document.createElement('div')
      leftSection.className = 'flex items-center space-x-2'
      
      const icon = document.createElement('svg')
      icon.className = 'w-5 h-5 text-green-600'
      icon.setAttribute('fill', 'none')
      icon.setAttribute('viewBox', '0 0 24 24')
      icon.setAttribute('stroke', 'currentColor')
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />'
      
      const title = document.createElement('span')
      title.className = 'text-sm font-semibold text-gray-900'
      title.textContent = 'Code Block'
      
      leftSection.appendChild(icon)
      leftSection.appendChild(title)
      
      if (node.attrs.language) {
        const langBadge = document.createElement('span')
        langBadge.className = 'px-2 py-1 bg-green-200 text-green-800 text-xs rounded'
        langBadge.textContent = node.attrs.language
        leftSection.appendChild(langBadge)
      }
      
      if (node.attrs.filename) {
        const filename = document.createElement('span')
        filename.className = 'text-xs text-gray-600 font-mono'
        filename.textContent = node.attrs.filename
        leftSection.appendChild(filename)
      }
      
      const editButton = document.createElement('button')
      editButton.className = 'p-1.5 rounded hover:bg-green-200 text-green-700 transition-colors'
      editButton.title = 'Edit Code Block'
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
            code: node.attrs.code || '',
            language: node.attrs.language || '',
            filename: node.attrs.filename || ''
          }, (updatedData) => {
            // Update the node
            const pos = getPos()
            if (typeof pos === 'number') {
              editor.commands.command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  code: updatedData.code,
                  language: updatedData.language,
                  filename: updatedData.filename
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
      preview.className = 'mt-2 p-3 bg-gray-900 rounded text-gray-100 text-xs font-mono overflow-x-auto'
      preview.textContent = node.attrs.code || 'Empty code block'

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

