import { Node, mergeAttributes } from '@tiptap/core'

export const TableOfContentsExtension = Node.create({
  name: 'tableOfContents',
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
      autoGenerate: {
        default: true,
        parseHTML: element => element.getAttribute('data-auto-generate') === 'true',
        renderHTML: attributes => {
          return {
            'data-auto-generate': attributes.autoGenerate ? 'true' : 'false',
          }
        },
      },
      title: {
        default: 'Table of Contents',
        parseHTML: element => element.getAttribute('data-title') || 'Table of Contents',
        renderHTML: attributes => {
          if (!attributes.title) {
            return {}
          }
          return {
            'data-title': attributes.title,
          }
        },
      },
      items: {
        default: [],
        parseHTML: element => {
          const itemsAttr = element.getAttribute('data-items')
          return itemsAttr ? JSON.parse(itemsAttr) : []
        },
        renderHTML: attributes => {
          if (!attributes.items || attributes.items.length === 0) {
            return {}
          }
          return {
            'data-items': JSON.stringify(attributes.items),
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="tableOfContents"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'tableOfContents' }), 0]
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement('div')
      dom.className = 'toc-block-node border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50 my-4 cursor-pointer hover:bg-purple-100 transition-colors'
      dom.setAttribute('data-type', 'tableOfContents')
      dom.setAttribute('data-auto-generate', node.attrs.autoGenerate ? 'true' : 'false')
      dom.setAttribute('data-title', node.attrs.title || 'Table of Contents')
      if (node.attrs.items && node.attrs.items.length > 0) {
        dom.setAttribute('data-items', JSON.stringify(node.attrs.items))
      }

      const header = document.createElement('div')
      header.className = 'flex items-center justify-between mb-2'
      
      const leftSection = document.createElement('div')
      leftSection.className = 'flex items-center space-x-2'
      
      const icon = document.createElement('svg')
      icon.className = 'w-5 h-5 text-purple-600'
      icon.setAttribute('fill', 'none')
      icon.setAttribute('viewBox', '0 0 24 24')
      icon.setAttribute('stroke', 'currentColor')
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />'
      
      const title = document.createElement('span')
      title.className = 'text-sm font-semibold text-gray-900'
      title.textContent = node.attrs.title || 'Table of Contents'
      
      leftSection.appendChild(icon)
      leftSection.appendChild(title)
      
      if (node.attrs.autoGenerate) {
        const badge = document.createElement('span')
        badge.className = 'px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded'
        badge.textContent = 'Auto-generate'
        leftSection.appendChild(badge)
      } else {
        const badge = document.createElement('span')
        badge.className = 'px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded'
        badge.textContent = 'Manual'
        leftSection.appendChild(badge)
      }
      
      const editButton = document.createElement('button')
      editButton.type = 'button'
      editButton.className = 'p-1.5 rounded hover:bg-purple-200 text-purple-700 transition-colors'
      editButton.title = 'Edit Table of Contents'
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
            autoGenerate: node.attrs.autoGenerate !== false,
            title: node.attrs.title || 'Table of Contents',
            items: node.attrs.items || []
          }, (updatedData) => {
            // Update the node
            const pos = getPos()
            if (typeof pos === 'number') {
              editor.commands.command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  autoGenerate: updatedData.autoGenerate,
                  title: updatedData.title,
                  items: updatedData.items
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
      if (node.attrs.autoGenerate) {
        preview.textContent = 'Will be auto-generated from headings'
      } else if (node.attrs.items && node.attrs.items.length > 0) {
        preview.textContent = `${node.attrs.items.length} manual items`
      } else {
        preview.textContent = 'Empty table of contents'
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

