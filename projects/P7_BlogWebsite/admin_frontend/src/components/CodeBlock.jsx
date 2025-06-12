import { useState, useEffect } from 'react'

const CodeBlock = ({ block, onUpdate, onDelete, index }) => {
  const [codeData, setCodeData] = useState({
    code: block?.data?.code || '',
    language: block?.data?.language || '',
    filename: block?.data?.filename || ''
  })

  // Common programming languages
  const languages = [
    { value: '', label: 'Plain Text' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'scala', label: 'Scala' },
    { value: 'r', label: 'R' },
    { value: 'matlab', label: 'MATLAB' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'yaml', label: 'YAML' },
    { value: 'dockerfile', label: 'Dockerfile' },
    { value: 'shell', label: 'Shell' }
  ]

  // Update parent when data changes
  useEffect(() => {
    if (onUpdate) {
      const blockData = {
        type: 'code',
        data: {
          code: codeData.code,
          language: codeData.language || undefined,
          filename: codeData.filename || undefined
        }
      }
      onUpdate(blockData)
    }
  }, [codeData, onUpdate])

  const handleCodeChange = (code) => {
    setCodeData(prev => ({ ...prev, code }))
  }

  const handleLanguageChange = (language) => {
    setCodeData(prev => ({ ...prev, language: language.trim().toLowerCase() }))
  }

  const handleFilenameChange = (filename) => {
    setCodeData(prev => ({ ...prev, filename }))
  }

  return (
    <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50 my-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900">Code Block #{index + 1}</h3>
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

      {/* Language Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Programming Language (optional)
        </label>
        <select
          value={codeData.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        >
          {languages.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Or enter a custom language identifier
        </p>
        <input
          type="text"
          value={codeData.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          placeholder="e.g., javascript, python, html"
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>

      {/* Filename */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filename (optional)
        </label>
        <input
          type="text"
          value={codeData.filename}
          onChange={(e) => handleFilenameChange(e.target.value)}
          placeholder="e.g., example.js, app.py"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>

      {/* Code Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Code <span className="text-red-500">*</span>
        </label>
        <textarea
          value={codeData.code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="Enter your code here..."
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          {codeData.code.length} characters
        </p>
      </div>

      {/* Preview */}
      {codeData.code && (
        <div className="mt-4 p-3 bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {codeData.language && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  {codeData.language}
                </span>
              )}
              {codeData.filename && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  {codeData.filename}
                </span>
              )}
            </div>
          </div>
          <pre className="text-gray-100 text-xs overflow-x-auto">
            <code>{codeData.code}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

export default CodeBlock

