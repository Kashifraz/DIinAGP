import { useState, useEffect } from 'react'

const TableOfContentsBlock = ({ block, onUpdate, onDelete, index, allBlocks = [] }) => {
  const [tocData, setTocData] = useState({
    autoGenerate: block?.data?.autoGenerate !== undefined ? block.data.autoGenerate : true,
    title: block?.data?.title || 'Table of Contents',
    items: block?.data?.items || []
  })

  // Generate TOC from headings in all blocks
  const generateTOCFromHeadings = () => {
    const headings = []
    
    allBlocks.forEach((blk, idx) => {
      if (blk.type === 'heading' && blk.data?.text) {
        const text = blk.data.text.trim()
        const level = blk.data.level || 2
        
        // Generate a URL-friendly ID from the heading text
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        
        headings.push({
          text: text,
          id: id || `heading-${idx}`,
          level: level
        })
      }
    })
    
    return headings
  }

  // Update parent when data changes
  useEffect(() => {
    if (onUpdate) {
      const blockData = {
        type: 'tableOfContents',
        data: {
          autoGenerate: tocData.autoGenerate,
          title: tocData.title || undefined,
          items: tocData.autoGenerate ? undefined : tocData.items
        }
      }
      onUpdate(blockData)
    }
  }, [tocData, onUpdate])

  // Auto-generate TOC when autoGenerate is true and blocks change
  useEffect(() => {
    if (tocData.autoGenerate) {
      const generatedItems = generateTOCFromHeadings()
      setTocData(prev => ({ ...prev, items: generatedItems }))
    }
  }, [allBlocks, tocData.autoGenerate])

  const handleModeChange = (autoGen) => {
    setTocData(prev => ({
      ...prev,
      autoGenerate: autoGen,
      items: autoGen ? generateTOCFromHeadings() : prev.items
    }))
  }

  const handleTitleChange = (title) => {
    setTocData(prev => ({ ...prev, title: title || 'Table of Contents' }))
  }

  const handleItemChange = (itemIndex, field, value) => {
    setTocData(prev => {
      const newItems = [...prev.items]
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        [field]: value
      }
      return { ...prev, items: newItems }
    })
  }

  const handleAddItem = () => {
    setTocData(prev => ({
      ...prev,
      items: [...prev.items, { text: '', id: '', level: 2 }]
    }))
  }

  const handleRemoveItem = (itemIndex) => {
    setTocData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== itemIndex)
    }))
  }

  const handleRegenerate = () => {
    const generatedItems = generateTOCFromHeadings()
    setTocData(prev => ({ ...prev, items: generatedItems }))
  }

  return (
    <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50 my-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900">Table of Contents #{index + 1}</h3>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
            type="button"
          >
            Remove
          </button>
        )}
      </div>

      {/* Mode Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Generation Mode</label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={tocData.autoGenerate}
              onChange={() => handleModeChange(true)}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Auto-generate from headings</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={!tocData.autoGenerate}
              onChange={() => handleModeChange(false)}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Manual configuration</span>
          </label>
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title (optional)
        </label>
        <input
          type="text"
          value={tocData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Table of Contents"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      {tocData.autoGenerate ? (
        /* Auto-generate Mode */
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-generated from headings</p>
              <p className="text-xs text-gray-500 mt-1">
                {tocData.items.length} {tocData.items.length === 1 ? 'heading' : 'headings'} found
              </p>
            </div>
            <button
              onClick={handleRegenerate}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
              type="button"
            >
              Regenerate
            </button>
          </div>

          {/* Preview of generated items */}
          {tocData.items.length > 0 && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Preview:</p>
              <ul className="space-y-1">
                {tocData.items.slice(0, 5).map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-600" style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                    {item.text}
                  </li>
                ))}
                {tocData.items.length > 5 && (
                  <li className="text-xs text-gray-400 italic">... and {tocData.items.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          {tocData.items.length === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No headings found in the post. Add headings (H1, H2, H3) to generate a table of contents.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Manual Mode */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Manual Items</label>
            <button
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
              type="button"
            >
              + Add Item
            </button>
          </div>

          {tocData.items.length > 0 ? (
            <div className="space-y-2">
              {tocData.items.map((item, itemIndex) => (
                <div key={itemIndex} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Item {itemIndex + 1}</span>
                    <button
                      onClick={() => handleRemoveItem(itemIndex)}
                      className="text-red-600 hover:text-red-800 text-xs"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Text *</label>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleItemChange(itemIndex, 'text', e.target.value)}
                      placeholder="Section title"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">ID *</label>
                      <input
                        type="text"
                        value={item.id}
                        onChange={(e) => handleItemChange(itemIndex, 'id', e.target.value)}
                        placeholder="section-id"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                      <select
                        value={item.level || 2}
                        onChange={(e) => handleItemChange(itemIndex, 'level', parseInt(e.target.value))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value={1}>H1</option>
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                        <option value={4}>H4</option>
                        <option value={5}>H5</option>
                        <option value={6}>H6</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-500">No items added yet. Click "Add Item" to create a table of contents entry.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TableOfContentsBlock

