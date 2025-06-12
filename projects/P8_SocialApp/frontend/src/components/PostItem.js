import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import ProfilePhoto from './ProfilePhoto';
import ReactionPicker from './ReactionPicker';
import ReactionSummary from './ReactionSummary';
import postService from '../services/postService';
import reactionService from '../services/reactionService';
import { API_BASE_URL } from '../config/api';
import { showToast } from '../utils/toast';
import theme from '../config/theme';

const PostItem = ({ post, onPress, onAuthorPress, onReactionUpdate }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [reacting, setReacting] = useState(false);
  const { width } = useWindowDimensions();

  // Reaction state from post prop
  const [reactionCounts, setReactionCounts] = useState({
    heartCount: post?.heartCount || 0,
    thumbsUpCount: post?.thumbsUpCount || 0,
    laughCount: post?.laughCount || 0,
    sadCount: post?.sadCount || 0,
    angryCount: post?.angryCount || 0,
    thumbsDownCount: post?.thumbsDownCount || 0,
  });
  const [userReaction, setUserReaction] = useState(post?.userReaction || null);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return '';
    }
  };

  // Update local state when post prop changes
  React.useEffect(() => {
    setReactionCounts({
      heartCount: post?.heartCount || 0,
      thumbsUpCount: post?.thumbsUpCount || 0,
      laughCount: post?.laughCount || 0,
      sadCount: post?.sadCount || 0,
      angryCount: post?.angryCount || 0,
      thumbsDownCount: post?.thumbsDownCount || 0,
    });
    setUserReaction(post?.userReaction || null);
  }, [
    post?.heartCount,
    post?.thumbsUpCount,
    post?.laughCount,
    post?.sadCount,
    post?.angryCount,
    post?.thumbsDownCount,
    post?.userReaction,
  ]);

  const getAuthorPhotoUrl = () => {
    if (!post?.authorProfilePhotoUrl) return null;
    let filename = post.authorProfilePhotoUrl.trim();
    if (filename.includes('/')) {
      filename = filename.split('/').pop();
    }
    if (filename.includes('\\')) {
      filename = filename.split('\\').pop();
    }
    const encodedFilename = encodeURIComponent(filename);
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}/api/media/profile-photo/${encodedFilename}`;
  };

  const handleReactionSelect = async (reactionType) => {
    if (reacting || !post?.id) return;

    setReacting(true);
    const previousReaction = userReaction;
    const previousCounts = { ...reactionCounts };

    // If selecting the same reaction, remove it (toggle off)
    const isRemoving = previousReaction === reactionType;

    // Optimistic update
    if (isRemoving) {
      setUserReaction(null);
      // Decrease count for the removed reaction
      const countKey = getReactionCountKey(previousReaction);
      if (countKey) {
        setReactionCounts(prev => ({
          ...prev,
          [countKey]: Math.max(0, prev[countKey] - 1),
        }));
      }
    } else {
      // If different reaction, update it
      if (previousReaction) {
        // Decrease count for previous reaction
        const prevCountKey = getReactionCountKey(previousReaction);
        if (prevCountKey) {
          setReactionCounts(prev => ({
            ...prev,
            [prevCountKey]: Math.max(0, prev[prevCountKey] - 1),
          }));
        }
      }
      // Set new reaction
      setUserReaction(reactionType);
      // Increase count for new reaction
      const newCountKey = getReactionCountKey(reactionType);
      if (newCountKey) {
        setReactionCounts(prev => ({
          ...prev,
          [newCountKey]: (prev[newCountKey] || 0) + 1,
        }));
      }
    }

    try {
      const response = await reactionService.addReaction(post.id, reactionType);
      if (response && response.success) {
        // Update with server response
        if (response.data) {
          setUserReaction(response.data.reactionType || null);
          // Refresh counts from server if needed
          if (onReactionUpdate) {
            onReactionUpdate(post.id, response.data.reactionType || null);
          }
        }
      } else {
        // Revert on error
        setUserReaction(previousReaction);
        setReactionCounts(previousCounts);
        showToast.error(response?.message || 'Failed to react to post', 'Error');
      }
    } catch (error) {
      // Revert on error
      setUserReaction(previousReaction);
      setReactionCounts(previousCounts);
      showToast.error(
        error?.response?.data?.message || error?.message || 'Failed to react to post',
        'Error'
      );
    } finally {
      setReacting(false);
    }
  };

  const getReactionCountKey = (reactionType) => {
    if (!reactionType) return null;
    const mapping = {
      HEART: 'heartCount',
      THUMBS_UP: 'thumbsUpCount',
      LAUGH: 'laughCount',
      SAD: 'sadCount',
      ANGRY: 'angryCount',
      THUMBS_DOWN: 'thumbsDownCount',
    };
    return mapping[reactionType] || null;
  };

  const handleReactionButtonPress = () => {
    if (userReaction) {
      // If user has a reaction, clicking it removes it
      handleReactionSelect(userReaction);
    } else {
      // If no reaction, show picker
      setShowPicker(true);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.95}
        style={styles.postContentWrapper}
      >
        {/* Author Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.authorInfo}
            onPress={() => onAuthorPress && onAuthorPress(post.authorId)}
            activeOpacity={0.7}
          >
            <ProfilePhoto
              photoUrl={getAuthorPhotoUrl()}
              size={48}
              editable={false}
            />
            <View style={styles.authorDetails}>
              <Text style={styles.authorName} numberOfLines={1}>
                {post.authorFullName || post.authorEmail}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                <View style={styles.dotSeparator} />
                <Ionicons name="globe-outline" size={12} color={theme.colors.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <View style={styles.content}>
          <RenderHTML
            contentWidth={width - (theme.spacing.md * 4 + 48)} // Account for padding and margins
            source={{ html: post.content || '' }}
            baseStyle={styles.postText}
            tagsStyles={{
              p: { margin: 0, marginBottom: 8 },
              div: { margin: 0, marginBottom: 8 },
            }}
            defaultTextProps={{
              style: styles.postText,
            }}
          />
        </View>

        {/* Post Images */}
        {post.images && Array.isArray(post.images) && post.images.length > 0 && (
          <View style={styles.imagesContainer}>
            {post.images.length === 1 ? (
              <Image
                source={{ uri: postService.getPostImageUrl(post.images[0].imageUrl) }}
                style={styles.singleImage}
                resizeMode="cover"
                onError={(error) => {
                  console.error('PostItem: Image load error', error.nativeEvent.error);
                }}
              />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesContent}
              >
                {post.images.map((image, index) => {
                  if (!image || !image.imageUrl) {
                    console.warn('PostItem: Invalid image data', image);
                    return null;
                  }
                  const imageUrl = postService.getPostImageUrl(image.imageUrl);
                  if (!imageUrl) {
                    console.warn('PostItem: Could not construct image URL for', image.imageUrl);
                    return null;
                  }
                  return (
                    <Image
                      key={image.id || `image-${index}`}
                      source={{ uri: imageUrl }}
                      style={styles.postImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.error('PostItem: Image load error', error.nativeEvent.error, imageUrl);
                      }}
                    />
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Reactions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.reactionButton, userReaction && styles.reactionButtonActive]}
          onPress={handleReactionButtonPress}
          onLongPress={() => setShowPicker(true)}
          disabled={reacting}
          activeOpacity={0.6}
        >
          <Ionicons
            name={userReaction ? 'heart' : 'heart-outline'}
            size={22}
            color={userReaction ? theme.colors.error : theme.colors.textSecondary}
          />
          <Text style={[styles.reactionButtonText, userReaction && styles.reactionButtonTextActive]}>
            {userReaction ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.commentButton}
          onPress={onPress}
          activeOpacity={0.6}
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.commentButtonText}>Comment</Text>
        </TouchableOpacity>

        <ReactionSummary
          heartCount={reactionCounts.heartCount}
          thumbsUpCount={reactionCounts.thumbsUpCount}
          laughCount={reactionCounts.laughCount}
          sadCount={reactionCounts.sadCount}
          angryCount={reactionCounts.angryCount}
          thumbsDownCount={reactionCounts.thumbsDownCount}
          userReaction={userReaction}
          onPress={() => setShowPicker(true)}
        />
      </View>

      <ReactionPicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onReactionSelect={handleReactionSelect}
        currentReaction={userReaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  postContentWrapper: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  authorName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.xs,
  },
  content: {
    marginBottom: theme.spacing.md,
  },
  postText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
    fontSize: 15,
  },
  imagesContainer: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  imagesContent: {
    paddingRight: theme.spacing.sm,
  },
  singleImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  postImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginRight: theme.spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 20,
    backgroundColor: 'transparent',
    minWidth: 80,
    justifyContent: 'center',
  },
  reactionButtonActive: {
    backgroundColor: theme.colors.error + '10',
  },
  reactionButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    fontWeight: '600',
    fontSize: 14,
  },
  reactionButtonTextActive: {
    color: theme.colors.error,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 20,
    backgroundColor: 'transparent',
    minWidth: 80,
    justifyContent: 'center',
  },
  commentButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default PostItem;

