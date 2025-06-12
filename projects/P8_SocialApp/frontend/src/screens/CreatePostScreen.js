import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import RichTextEditor from '../components/RichTextEditor';
import EmojiSelector from '../components/EmojiSelector';
import postService from '../services/postService';
import { showToast } from '../utils/toast';
import theme from '../config/theme';

const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const editorRef = useRef(null);
  const { width } = useWindowDimensions();
  
  // Tab bar height: iOS = 88, Android = 70
  const tabBarHeight = Platform.OS === 'ios' ? 88 : 70;

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

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast.error('Permission to access camera roll is required!', 'Permission Denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          filename: asset.fileName || `image_${Date.now()}.jpg`,
        }));
        
        if (images.length + newImages.length > 10) {
          showToast.error('Maximum 10 images allowed per post', 'Limit Exceeded');
          return;
        }
        
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to pick images', 'Error');
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    // Get plain text from HTML content for validation
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (!plainText && images.length === 0) {
      showToast.error('Post content cannot be empty', 'Validation Error');
      return;
    }

    setLoading(true);
    try {
      // Create post with HTML content (rich text editor returns HTML)
      const response = await postService.createPost(content);
      
      if (response.success) {
        const postId = response.data.id;
        
        // Upload images if any
        if (images.length > 0) {
          setUploadingImages(true);
          try {
            const imageResponse = await postService.uploadPostImages(postId, images);
            console.log('Image upload response:', imageResponse);
            if (imageResponse && imageResponse.success) {
              console.log('Uploaded post images:', imageResponse.data?.images);
            }
          } catch (imageError) {
            console.error('Image upload error:', imageError);
            showToast.error('Post created but failed to upload some images', 'Warning');
          } finally {
            setUploadingImages(false);
          }
        }
        
        showToast.success('Post created successfully!', 'Success');
        // Navigate back and refresh feed
        navigation.goBack();
      } else {
        showToast.error(response.message || 'Failed to create post', 'Error');
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to create post', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const charCount = content.replace(/<[^>]*>/g, '').length;
  const maxChars = 10000;
  const isDisabled = loading || uploadingImages || (!content.replace(/<[^>]*>/g, '').trim() && images.length === 0);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + theme.spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Editor Card */}
        <View style={styles.editorCard}>
          <RichTextEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder="What's on your mind?"
            style={styles.editor}
          />
        </View>

        {/* Image Preview */}
        {images.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.sectionLabel}>Attached Images ({images.length})</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageScrollContent}
            >
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri: image.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.removeButtonInner}>
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={pickImages}
            activeOpacity={0.7}
          >
            <Ionicons name="images-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Add Images</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowEmojiSelector(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="happy-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Add Emoji</Text>
          </TouchableOpacity>
        </View>

        {/* Character Count and Create Button */}
        <View style={styles.footerContainer}>
          <Text style={styles.charCount}>
            {charCount} / {maxChars}
          </Text>
          <TouchableOpacity
            style={[styles.createButton, isDisabled && styles.createButtonDisabled]}
            onPress={handleCreatePost}
            disabled={isDisabled}
            activeOpacity={0.8}
          >
            {loading || uploadingImages ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <>
                <Ionicons name="send" size={18} color={theme.colors.onPrimary} style={styles.createButtonIcon} />
                <Text style={styles.createButtonText}>Create Post</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Emoji Selector Modal */}
      <EmojiSelector
        visible={showEmojiSelector}
        onClose={() => setShowEmojiSelector(false)}
        onEmojiSelect={handleEmojiSelect}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  editorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  editor: {
    minHeight: 200,
    maxHeight: 400,
  },
  imagePreviewContainer: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    fontSize: 13,
  },
  imageScrollContent: {
    paddingRight: theme.spacing.md,
  },
  imagePreview: {
    marginRight: theme.spacing.md,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  removeButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: theme.colors.primary + '30',
    gap: theme.spacing.xs,
  },
  actionButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  charCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    gap: theme.spacing.xs,
    minWidth: 140,
  },
  createButtonDisabled: {
    backgroundColor: theme.colors.textSecondary + '60',
    opacity: 0.6,
  },
  createButtonIcon: {
    // Icon spacing handled by gap
  },
  createButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.onPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CreatePostScreen;

