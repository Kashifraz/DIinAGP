import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, Text } from 'react-native';
import theme from '../config/theme';

// Native version - tentap-editor (this file is NOT used on web)
const RichTextEditor = forwardRef(({ value, onChange, placeholder, style }, ref) => {
  let RichText, Toolbar, useEditorBridge;
  
  try {
    // Dynamic require - only executed on native platforms
    const tentapEditor = require('@10play/tentap-editor');
    RichText = tentapEditor.RichText;
    Toolbar = tentapEditor.Toolbar;
    useEditorBridge = tentapEditor.useEditorBridge;
  } catch (error) {
    console.warn('Failed to load tentap-editor:', error);
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>Rich text editor not available</Text>
      </View>
    );
  }

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: value || '',
    placeholder: placeholder || "What's on your mind?",
    enableToolbar: true,
  });

  // Expose editor instance via ref
  useImperativeHandle(ref, () => ({
    editor: editor,
    insertContent: (content) => {
      editor.insertContent(content);
    },
    getContent: () => {
      return editor.getContent();
    },
    setContent: (content) => {
      editor.setContent(content);
    },
  }), [editor]);

  // Sync external value changes to editor
  useEffect(() => {
    if (value !== undefined && value !== editor.getContent()) {
      editor.setContent(value || '');
    }
  }, [value, editor]);

  // Listen to content changes and call onChange
  useEffect(() => {
    const subscription = editor.on('update', () => {
      if (onChange) {
        const content = editor.getContent();
        onChange(content);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [editor, onChange]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.editorWrapper}>
        <RichText editor={editor} style={styles.richText} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.toolbarContainer}
      >
        <Toolbar editor={editor} />
      </KeyboardAvoidingView>
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
  editorWrapper: {
    flex: 1,
    minHeight: 150,
    backgroundColor: theme.colors.background,
  },
  richText: {
    flex: 1,
    minHeight: 150,
  },
  toolbarContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    padding: theme.spacing.md,
    textAlign: 'center',
  },
});

export default RichTextEditor;
