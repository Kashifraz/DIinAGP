import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RichTextEditor from './RichTextEditor';
import EmojiSelector from './EmojiSelector';
import { showToast } from '../utils/toast';
import theme from '../config/theme';

const CommentForm = ({
  initialContent = '',
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  submitLabel = "Comment",
  showCancel = true,
}) => {
  const [content, setContent] = useState(initialContent);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const editorRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    // Insert emoji at cursor position in rich text editor
    if (editorRef.current && editorRef.current.insertContent) {
      editorRef.current.insertContent(emoji);
    } else if (editorRef.current && editorRef.current.editor) {
      // Fallback: use editor directly
      editorRef.current.editor.insertContent(emoji);
    } else {
      // Final fallback: append to content
      setContent((prev) => prev + emoji);
    }
    setShowEmojiSelector(false);
  };

  const handleSubmit = async () => {
    // Extract plain text from HTML for validation
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    
    if (!plainText) {
      showToast.error('Comment cannot be empty', 'Validation Error');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(content);
      // Clear form after successful submission
      setContent('');
      if (editorRef.current && editorRef.current.setContent) {
        editorRef.current.setContent('');
      }
    } catch (error) {
      showToast.error(error?.message || 'Failed to submit comment', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    if (onCancel) {
      onCancel();
    }
  };

  const charCount = content.replace(/<[^>]*>/g, '').length;
  const maxChars = 10000;
  const isDisabled = submitting || !content.replace(/<[^>]*>/g, '').trim();

  return (
    <View style={styles.container}>
      <View style={styles.editorWrapper}>
        <RichTextEditor
          ref={editorRef}
          value={content}
          onChange={setContent}
          placeholder={placeholder}
          style={styles.editor}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => setShowEmojiSelector(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="happy-outline" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.charCount}>
            {charCount} / {maxChars}
          </Text>
        </View>

        <View style={styles.submitActions}>
          {showCancel && onCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={submitting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.submitButton, isDisabled && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isDisabled}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.submitButtonText}>{submitLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <EmojiSelector
        visible={showEmojiSelector}
        onClose={() => setShowEmojiSelector(false)}
        onEmojiSelect={handleEmojiSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  editorWrapper: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  editor: {
    minHeight: 120,
    maxHeight: 300,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: '#FAFAFA',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.md,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  charCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  submitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cancelButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.textSecondary + '40',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.onPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default CommentForm;

