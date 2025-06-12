import React, { useEffect, useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../config/theme';

// Web-only version with rich text formatting toolbar
const RichTextEditor = forwardRef(({ value, onChange, placeholder, style }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });
  const editorRef = useRef(null);
  const isInternalUpdate = useRef(false);
  const lastExternalValue = useRef(value || '');

  // Initialize editor content on mount
  useEffect(() => {
    if (editorRef.current && value !== undefined && !editorRef.current.dataset.initialized) {
      editorRef.current.innerHTML = value || '';
      editorRef.current.dataset.initialized = 'true';
      lastExternalValue.current = value || '';
      updateCharCount();
    }
  }, []);

  // Convert HTML to display in contentEditable
  // Only update if value changes externally (not from user input)
  useEffect(() => {
    if (editorRef.current && value !== undefined && editorRef.current.dataset.initialized === 'true') {
      // Only update if value changed externally (not from our own onChange)
      if (value !== lastExternalValue.current && !isInternalUpdate.current) {
        const currentContent = editorRef.current.innerHTML;
        // Only update if the value is different and editor is not focused
        // This prevents resetting content while user is typing
        if (value !== currentContent && !isFocused) {
          editorRef.current.innerHTML = value || '';
          lastExternalValue.current = value || '';
          updateCharCount();
        } else if (value === '' && currentContent !== '') {
          // Allow clearing content
          editorRef.current.innerHTML = '';
          lastExternalValue.current = '';
          updateCharCount();
        }
      }
      isInternalUpdate.current = false;
    }
  }, [value, isFocused]);

  const updateCharCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || editorRef.current.textContent || '';
      setCharCount(text.length);
    }
  };

  const handleInput = () => {
    if (editorRef.current && onChange) {
      const html = editorRef.current.innerHTML;
      isInternalUpdate.current = true;
      lastExternalValue.current = html;
      onChange(html);
      updateCharCount();
    }
  };

  const checkFormatState = () => {
    if (editorRef.current) {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Check format state when editor gains focus
    setTimeout(checkFormatState, 100);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (editorRef.current && onChange) {
      const html = editorRef.current.innerHTML;
      isInternalUpdate.current = true;
      lastExternalValue.current = html;
      onChange(html);
    }
  };

  const handleSelectionChange = () => {
    if (editorRef.current && document.activeElement === editorRef.current) {
      checkFormatState();
    }
  };

  // Listen for selection changes
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.addEventListener('selectionchange', handleSelectionChange);
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }
  }, []);

  // Formatting functions
  const formatText = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
      // Update format state after a short delay
      setTimeout(checkFormatState, 50);
    }
  };

  const insertEmoji = (emoji) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(emoji);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.innerHTML += emoji;
      }
      handleInput();
    }
  };

  useImperativeHandle(ref, () => ({
    editor: null,
    insertContent: (content) => {
      insertEmoji(content);
    },
    getContent: () => {
      return editorRef.current ? editorRef.current.innerHTML : '';
    },
    setContent: (content) => {
      if (editorRef.current) {
        editorRef.current.innerHTML = content || '';
        lastExternalValue.current = content || '';
        updateCharCount();
      }
    },
  }), []);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused, style]}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarLabel}>Write your post</Text>
        <Text style={styles.charCount}>{charCount} / 10000</Text>
      </View>

      {/* Formatting Toolbar */}
      <View style={styles.formatToolbar}>
        <TouchableOpacity
          style={[
            styles.formatButton,
            activeFormats.bold && styles.formatButtonActive
          ]}
          onPress={() => formatText('bold')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.formatButtonText,
            activeFormats.bold && styles.formatButtonTextActive
          ]}>B</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.formatButton,
            activeFormats.italic && styles.formatButtonActive
          ]}
          onPress={() => formatText('italic')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.formatButtonText,
            { fontStyle: 'italic' },
            activeFormats.italic && styles.formatButtonTextActive
          ]}>I</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.formatButton,
            activeFormats.underline && styles.formatButtonActive
          ]}
          onPress={() => formatText('underline')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.formatButtonText,
            { textDecorationLine: 'underline' },
            activeFormats.underline && styles.formatButtonTextActive
          ]}>U</Text>
        </TouchableOpacity>
        <View style={styles.toolbarSeparator} />
        <TouchableOpacity
          style={[
            styles.formatButton,
            activeFormats.justifyLeft && styles.formatButtonActive
          ]}
          onPress={() => formatText('justifyLeft')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.formatButtonText,
            { fontSize: 14 },
            activeFormats.justifyLeft && styles.formatButtonTextActive
          ]}>L</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.formatButton,
            activeFormats.justifyCenter && styles.formatButtonActive
          ]}
          onPress={() => formatText('justifyCenter')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.formatButtonText,
            { fontSize: 14 },
            activeFormats.justifyCenter && styles.formatButtonTextActive
          ]}>C</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.formatButton,
            activeFormats.justifyRight && styles.formatButtonActive
          ]}
          onPress={() => formatText('justifyRight')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.formatButtonText,
            { fontSize: 14 },
            activeFormats.justifyRight && styles.formatButtonTextActive
          ]}>R</Text>
        </TouchableOpacity>
        <View style={styles.toolbarSeparator} />
        <TouchableOpacity
          style={[
            styles.formatButton,
            activeFormats.insertUnorderedList && styles.formatButtonActive
          ]}
          onPress={() => formatText('insertUnorderedList')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="list-outline" 
            size={18} 
            color={activeFormats.insertUnorderedList ? theme.colors.primary : theme.colors.text} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.formatButton,
            activeFormats.insertOrderedList && styles.formatButtonActive
          ]}
          onPress={() => formatText('insertOrderedList')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.formatButtonText,
            { fontSize: 14 },
            activeFormats.insertOrderedList && styles.formatButtonTextActive
          ]}>1.</Text>
        </TouchableOpacity>
      </View>

      {/* ContentEditable Editor - Using web-specific div */}
      <div
        ref={(ref) => {
          editorRef.current = ref;
        }}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseUp={checkFormatState}
        onKeyUp={(e) => {
          checkFormatState();
          // Only call handleInput on keyUp for certain keys to avoid double updates
          if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Shift') {
            handleInput();
          }
        }}
        onKeyDown={(e) => {
          // Allow all key events including backspace, delete, etc.
          // Don't prevent default to allow normal text editing
          // This ensures typing, backspace, delete all work properly
        }}
        style={{
          minHeight: 150,
          padding: 16,
          fontSize: 16,
          lineHeight: '24px',
          color: theme.colors.text,
          outline: 'none',
          overflowY: 'auto',
          backgroundColor: theme.colors.background,
          fontFamily: 'inherit',
          WebkitUserSelect: 'text',
          userSelect: 'text',
          cursor: 'text',
        }}
        data-placeholder={placeholder || "What's on your mind?"}
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: ${theme.colors.textSecondary};
          pointer-events: none;
        }
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>

      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          💡 Tip: Use the toolbar above to format text, and the emoji button below to add emojis
        </Text>
      </View>
    </View>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
    minHeight: 200,
    overflow: 'hidden',
  },
  containerFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toolbarLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
  },
  charCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  formatToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  formatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
    marginHorizontal: 2,
    borderRadius: theme.borderRadius.small,
    minWidth: 32,
    minHeight: 32,
    backgroundColor: 'transparent',
  },
  formatButtonActive: {
    backgroundColor: theme.colors.primary + '20', // 20% opacity
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  formatButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  formatButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  toolbarSeparator: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.xs,
  },
  hintContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  hintText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default RichTextEditor;
