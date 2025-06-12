import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

const QuizBlock = forwardRef(({ block, onUpdate, onDelete, index, onValidityChange }, ref) => {
  // Initialize state from block or create default
  const getInitialData = () => {
    if (block && block.data) {
      return {
        question: block.data.question || '',
        options: block.data.options && block.data.options.length > 0 
          ? block.data.options.map((opt, idx) => ({
              text: opt.text || '',
              value: opt.value !== undefined ? opt.value : idx
            }))
          : [{ text: '', value: 0 }, { text: '', value: 1 }],
        allowMultipleAnswers: block.data.allowMultipleAnswers || false,
        correctAnswer: block.data.correctAnswer !== undefined ? block.data.correctAnswer : null,
        correctAnswers: block.data.correctAnswers || null,
        blockType: block.data.blockType || (block.type === 'poll' ? 'poll' : 'quiz')
      }
    }
    return {
      question: '',
      options: [{ text: '', value: 0 }, { text: '', value: 1 }],
      allowMultipleAnswers: false,
      correctAnswer: null,
      correctAnswers: null,
      blockType: 'quiz'
    }
  }

  const [data, setData] = useState(getInitialData())
  const dataRef = useRef(data)

  // Update ref whenever data changes
  useEffect(() => {
    dataRef.current = data
    // Check validity and notify parent
    if (onValidityChange) {
      const validOptions = data.options.filter(opt => opt.text && opt.text.trim().length > 0)
      const isValid = data.question && data.question.trim().length > 0 && validOptions.length >= 2
      onValidityChange(isValid)
    }
  }, [data, onValidityChange])

  // Expose method to get current data via ref and check validity
  useImperativeHandle(ref, () => ({
    getData: () => {
      const isPoll = dataRef.current.blockType === 'poll'
      const data = {
        question: dataRef.current.question,
        options: dataRef.current.options.filter(opt => opt.text.trim().length > 0),
        allowMultipleAnswers: dataRef.current.allowMultipleAnswers,
        blockType: dataRef.current.blockType
      }
      
      // Only include correct answers for quiz blocks (not polls)
      if (!isPoll) {
        if (dataRef.current.correctAnswer !== undefined && dataRef.current.correctAnswer !== null) {
          data.correctAnswer = dataRef.current.correctAnswer
        }
        if (dataRef.current.correctAnswers !== undefined && dataRef.current.correctAnswers !== null) {
          data.correctAnswers = dataRef.current.correctAnswers
        }
      }
      
      return {
        type: dataRef.current.blockType,
        data
      }
    },
    isValid: () => {
      const current = dataRef.current
      const validOptions = current.options.filter(opt => opt.text && opt.text.trim().length > 0)
      return current.question && current.question.trim().length > 0 && validOptions.length >= 2
    }
  }))

  // Update when block changes (only when block prop actually changes, not on every render)
  useEffect(() => {
    const newData = getInitialData()
    // Only update if the data actually changed to prevent unnecessary re-renders
    const dataChanged = JSON.stringify(newData) !== JSON.stringify(data)
    if (dataChanged) {
      setData(newData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block?.data?.question, block?.data?.blockType, block?.type]) // Only watch specific properties

  const handleQuestionChange = (e) => {
    setData(prev => ({ ...prev, question: e.target.value }))
  }

  const handleOptionChange = (index, field, value) => {
    setData(prev => {
      const newOptions = [...prev.options]
      newOptions[index] = { ...newOptions[index], [field]: value }
      return { ...prev, options: newOptions }
    })
  }

  const addOption = () => {
    if (data.options.length >= 20) {
      alert('Maximum 20 options allowed')
      return
    }
    setData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', value: prev.options.length }]
    }))
  }

  const removeOption = (index) => {
    if (data.options.length <= 2) {
      alert('At least 2 options are required')
      return
    }
    setData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index).map((opt, idx) => ({
        ...opt,
        value: opt.value !== undefined ? opt.value : idx
      }))
    }))
  }

  const handleBlockTypeChange = (e) => {
    const newType = e.target.value
    setData(prev => ({
      ...prev,
      blockType: newType,
      // Clear correct answers when switching to poll
      correctAnswer: newType === 'poll' ? null : prev.correctAnswer,
      correctAnswers: newType === 'poll' ? null : prev.correctAnswers
    }))
  }

  const handleCorrectAnswerChange = (e) => {
    const value = e.target.value
    if (value === '') {
      setData(prev => ({ ...prev, correctAnswer: null }))
    } else {
      // Try to parse as number, otherwise use as string
      const num = Number(value)
      setData(prev => ({ ...prev, correctAnswer: isNaN(num) ? value : num }))
    }
  }

  const toggleCorrectAnswer = (optionValue) => {
    if (data.blockType !== 'quiz' || !data.allowMultipleAnswers) return
    
    setData(prev => {
      const currentAnswers = prev.correctAnswers || []
      const isSelected = currentAnswers.includes(optionValue) || 
                        currentAnswers.some(ans => String(ans) === String(optionValue))
      
      if (isSelected) {
        return {
          ...prev,
          correctAnswers: currentAnswers.filter(ans => 
            String(ans) !== String(optionValue) && ans !== optionValue
          )
        }
      } else {
        return {
          ...prev,
          correctAnswers: [...currentAnswers, optionValue]
        }
      }
    })
  }

  const isValid = data.question.trim().length > 0 && 
                  data.options.filter(opt => opt.text.trim().length > 0).length >= 2

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {data.blockType === 'poll' ? 'Poll Block' : 'Quiz Block'}
        </h3>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Remove block"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Block Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Block Type
          </label>
          <select
            value={data.blockType}
            onChange={handleBlockTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="quiz">Quiz (with correct answers)</option>
            <option value="poll">Poll (no correct answers)</option>
          </select>
        </div>

        {/* Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.question}
            onChange={handleQuestionChange}
            placeholder="Enter your question..."
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            {data.question.length}/500 characters
          </p>
        </div>

        {/* Options */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Answer Options <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addOption}
              disabled={data.options.length >= 20}
              className="text-sm text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              + Add Option
            </button>
          </div>
          <p className="mb-3 text-xs text-gray-500">
            At least 2 options required (max 20)
          </p>
          
          <div className="space-y-3">
            {data.options.map((option, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {data.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Remove option"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Allow Multiple Answers */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`allowMultiple-${index}`}
            checked={data.allowMultipleAnswers}
            onChange={(e) => setData(prev => ({ ...prev, allowMultipleAnswers: e.target.checked }))}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor={`allowMultiple-${index}`} className="text-sm text-gray-700">
            Allow multiple answers
          </label>
        </div>

        {/* Correct Answer(s) - Only for Quiz */}
        {data.blockType === 'quiz' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {data.allowMultipleAnswers ? 'Correct Answers (Select all that apply)' : 'Correct Answer (Optional)'}
            </label>
            {data.allowMultipleAnswers ? (
              <div className="space-y-2">
                {data.options.filter(opt => opt.text.trim().length > 0).map((option, idx) => {
                  const isSelected = data.correctAnswers && (
                    data.correctAnswers.includes(option.value) ||
                    data.correctAnswers.some(ans => String(ans) === String(option.value)) ||
                    data.correctAnswers.includes(idx) ||
                    data.correctAnswers.some(ans => String(ans) === String(idx))
                  )
                  return (
                    <label key={idx} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={() => toggleCorrectAnswer(option.value !== undefined ? option.value : idx)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{option.text || `Option ${idx + 1}`}</span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <select
                value={data.correctAnswer !== null ? String(data.correctAnswer) : ''}
                onChange={handleCorrectAnswerChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">No correct answer</option>
                {data.options.filter(opt => opt.text.trim().length > 0).map((option, idx) => (
                  <option key={idx} value={option.value !== undefined ? String(option.value) : String(idx)}>
                    {option.text || `Option ${idx + 1}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Validation Message */}
        {!isValid && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Please provide a question and at least 2 options with text.
            </p>
          </div>
        )}
      </div>
    </div>
  )
})

QuizBlock.displayName = 'QuizBlock'

export default QuizBlock



