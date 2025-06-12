import { Node, mergeAttributes } from '@tiptap/core'

export const CarouselExtension = Node.create({
  name: 'carousel',
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
        tag: 'div[data-type="carousel"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'carousel' }), 0]
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement('div')
      dom.className = 'carousel-block-node border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 my-4 cursor-pointer hover:bg-blue-100 transition-colors'
      dom.setAttribute('data-type', 'carousel')
      dom.setAttribute('data-items', JSON.stringify(node.attrs.items || []))

      const header = document.createElement('div')
      header.className = 'flex items-center justify-between mb-2'
      
      const leftSection = document.createElement('div')
      leftSection.className = 'flex items-center space-x-2'
      
      const icon = document.createElement('svg')
      icon.className = 'w-5 h-5 text-blue-600'
      icon.setAttribute('fill', 'none')
      icon.setAttribute('viewBox', '0 0 24 24')
      icon.setAttribute('stroke', 'currentColor')
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />'
      
      const title = document.createElement('span')
      title.className = 'text-sm font-semibold text-gray-900'
      title.textContent = 'Image Carousel'
      
      leftSection.appendChild(icon)
      leftSection.appendChild(title)
      
      const countBadge = document.createElement('span')
      countBadge.className = 'px-2 py-1 bg-blue-200 text-blue-600 text-xs rounded'
      countBadge.textContent = `${node.attrs.items?.length || 0} image${(node.attrs.items?.length || 0) !== 1 ? 's' : ''}`
      leftSection.appendChild(countBadge)
      
      const editButton = document.createElement('button')
      editButton.type = 'button'
      editButton.className = 'p-1.5 rounded hover:bg-blue-200 text-blue-600 transition-colors'
      editButton.title = 'Edit Carousel'
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
            items: node.attrs.items || []
          }, (updatedData) => {
            // Update the node
            const pos = getPos()
            if (typeof pos === 'number') {
              editor.commands.command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
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
      if (node.attrs.items && node.attrs.items.length > 0) {
        const previewText = document.createElement('div')
        previewText.className = 'text-xs text-gray-600'
        previewText.textContent = `Preview: ${node.attrs.items.slice(0, 3).map(item => item.alt || 'Image').join(', ')}${node.attrs.items.length > 3 ? `... and ${node.attrs.items.length - 3} more` : ''}`
        preview.appendChild(previewText)
      } else {
        preview.textContent = 'Empty carousel - click to add images'
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

