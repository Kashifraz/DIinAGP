import { Node, mergeAttributes } from '@tiptap/core'

export const AuthorBoxExtension = Node.create({
  name: 'authorBox',
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
      authorId: {
        default: '',
        parseHTML: element => element.getAttribute('data-author-id'),
        renderHTML: attributes => {
          if (!attributes.authorId) {
            return {}
          }
          return {
            'data-author-id': attributes.authorId,
          }
        },
      },
      name: {
        default: '',
        parseHTML: element => element.getAttribute('data-name'),
        renderHTML: attributes => {
          if (!attributes.name) {
            return {}
          }
          return {
            'data-name': attributes.name,
          }
        },
      },
      bio: {
        default: '',
        parseHTML: element => element.getAttribute('data-bio'),
        renderHTML: attributes => {
          if (!attributes.bio) {
            return {}
          }
          return {
            'data-bio': attributes.bio,
          }
        },
      },
      avatar: {
        default: '',
        parseHTML: element => element.getAttribute('data-avatar'),
        renderHTML: attributes => {
          if (!attributes.avatar) {
            return {}
          }
          return {
            'data-avatar': attributes.avatar,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="authorBox"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'authorBox' }), 0]
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement('div')
      dom.className = 'author-box-node border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 my-4 cursor-pointer hover:bg-blue-100 transition-colors'
      dom.setAttribute('data-type', 'authorBox')
      dom.setAttribute('data-author-id', node.attrs.authorId || '')
      dom.setAttribute('data-name', node.attrs.name || '')
      dom.setAttribute('data-bio', node.attrs.bio || '')
      dom.setAttribute('data-avatar', node.attrs.avatar || '')

      const header = document.createElement('div')
      header.className = 'flex items-center justify-between mb-2'
      
      const leftSection = document.createElement('div')
      leftSection.className = 'flex items-center space-x-2'
      
      const icon = document.createElement('svg')
      icon.className = 'w-5 h-5 text-blue-600'
      icon.setAttribute('fill', 'none')
      icon.setAttribute('viewBox', '0 0 24 24')
      icon.setAttribute('stroke', 'currentColor')
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />'
      
      const title = document.createElement('span')
      title.className = 'text-sm font-semibold text-gray-900'
      title.textContent = 'Author Box'
      
      leftSection.appendChild(icon)
      leftSection.appendChild(title)
      
      const editButton = document.createElement('button')
      editButton.type = 'button'
      editButton.className = 'p-1.5 rounded hover:bg-blue-200 text-blue-700 transition-colors'
      editButton.title = 'Edit Author Box'
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
            authorId: node.attrs.authorId || '',
            name: node.attrs.name || '',
            bio: node.attrs.bio || '',
            avatar: node.attrs.avatar || ''
          }, (updatedData) => {
            // Update the node
            const pos = getPos()
            if (typeof pos === 'number') {
              editor.commands.command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  authorId: updatedData.authorId,
                  name: updatedData.name,
                  bio: updatedData.bio,
                  avatar: updatedData.avatar
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
      if (node.attrs.authorId) {
        preview.textContent = `Author ID: ${node.attrs.authorId}`
      } else if (node.attrs.name) {
        preview.textContent = `${node.attrs.name}${node.attrs.bio ? ' - ' + node.attrs.bio.substring(0, 50) + '...' : ''}`
      } else {
        preview.textContent = 'Empty author box'
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

