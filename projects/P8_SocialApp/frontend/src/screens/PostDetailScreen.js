import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import ProfilePhoto from '../components/ProfilePhoto';
import ReactionPicker from '../components/ReactionPicker';
import ReactionSummary from '../components/ReactionSummary';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';
import postService from '../services/postService';
import reactionService from '../services/reactionService';
import commentService from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import { API_BASE_URL } from '../config/api';
import theme from '../config/theme';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsRefreshing, setCommentsRefreshing] = useState(false);
  const [commentPage, setCommentPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const response = await postService.getPostById(postId);
      if (response.success) {
        setPost(response.data);
      } else {
        showToast.error(response.message || 'Failed to load post', 'Error');
        navigation.goBack();
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to load post', 'Error');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    // Use Platform.OS check for web compatibility
    const confirmDelete = () => {
      setDeleting(true);
      postService.deletePost(postId)
        .then((response) => {
          if (response && response.success) {
            showToast.success('Post deleted successfully', 'Success');
            navigation.goBack();
          } else {
            showToast.error(response?.message || 'Failed to delete post', 'Error');
            setDeleting(false);
          }
        })
        .catch((error) => {
          console.error('Delete post error:', error);
          showToast.error(error?.response?.data?.message || error?.message || 'Failed to delete post', 'Error');
          setDeleting(false);
        });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: confirmDelete,
          },
        ]
      );
    }
  };

  const handleReactionSelect = async (reactionType) => {
    if (reacting || !post?.id) return;

    setReacting(true);
    const previousReaction = post.userReaction;
    const previousCounts = {
      heartCount: post.heartCount || 0,
      thumbsUpCount: post.thumbsUpCount || 0,
      laughCount: post.laughCount || 0,
      sadCount: post.sadCount || 0,
      angryCount: post.angryCount || 0,
      thumbsDownCount: post.thumbsDownCount || 0,
    };

    // If selecting the same reaction, remove it (toggle off)
    const isRemoving = previousReaction === reactionType;

    // Optimistic update
    if (isRemoving) {
      setPost(prev => ({
        ...prev,
        userReaction: null,
        [getReactionCountKey(previousReaction)]: Math.max(0, (prev[getReactionCountKey(previousReaction)] || 0) - 1),
      }));
    } else {
      // If different reaction, update it
      const updates = {
        userReaction: reactionType,
        [getReactionCountKey(reactionType)]: (previousCounts[getReactionCountKey(reactionType)] || 0) + 1,
      };
      if (previousReaction) {
        updates[getReactionCountKey(previousReaction)] = Math.max(0, (previousCounts[getReactionCountKey(previousReaction)] || 0) - 1);
      }
      setPost(prev => ({ ...prev, ...updates }));
    }

    try {
      const response = await reactionService.addReaction(post.id, reactionType);
      if (response && response.success) {
        // Reload post to get accurate counts
        await loadPost();
      } else {
        // Revert on error
        setPost(prev => ({
          ...prev,
          userReaction: previousReaction,
          heartCount: previousCounts.heartCount,
          thumbsUpCount: previousCounts.thumbsUpCount,
          laughCount: previousCounts.laughCount,
          sadCount: previousCounts.sadCount,
          angryCount: previousCounts.angryCount,
          thumbsDownCount: previousCounts.thumbsDownCount,
        }));
        showToast.error(response?.message || 'Failed to react to post', 'Error');
      }
    } catch (error) {
      // Revert on error
      setPost(prev => ({
        ...prev,
        userReaction: previousReaction,
        heartCount: previousCounts.heartCount,
        thumbsUpCount: previousCounts.thumbsUpCount,
        laughCount: previousCounts.laughCount,
        sadCount: previousCounts.sadCount,
        angryCount: previousCounts.angryCount,
        thumbsDownCount: previousCounts.thumbsDownCount,
      }));
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
    if (post?.userReaction) {
      // If user has a reaction, clicking it removes it
      handleReactionSelect(post.userReaction);
    } else {
      // If no reaction, show picker
      setShowPicker(true);
    }
  };

  const loadComments = async (pageNum = 0, append = false) => {
    if (commentsLoading) return;
    
    setCommentsLoading(true);
    try {
      const response = await commentService.getComments(postId, pageNum, 20);
      if (response.success && response.data) {
        const commentsData = response.data.content || [];
        
        if (append) {
          setComments((prev) => [...prev, ...commentsData]);
        } else {
          setComments(commentsData);
        }

        setCommentPage(pageNum);
        setHasMoreComments(!response.data.last);
      } else {
        if (!append) {
          setComments([]);
        }
        showToast.error(response.message || 'Failed to load comments', 'Error');
      }
    } catch (error) {
      console.error('Load comments error:', error);
      if (!append) {
        setComments([]);
      }
      showToast.error(error.message || 'Failed to load comments', 'Error');
    } finally {
      setCommentsLoading(false);
      setCommentsRefreshing(false);
    }
  };

  const onCommentsRefresh = () => {
    setCommentsRefreshing(true);
    loadComments(0, false);
  };

  const onCommentsLoadMore = () => {
    if (!commentsLoading && hasMoreComments) {
      loadComments(commentPage + 1, true);
    }
  };

  const handleCreateComment = async (content) => {
    setSubmittingComment(true);
    try {
      const response = await commentService.createComment(postId, content);
      if (response.success) {
        showToast.success('Comment added successfully', 'Success');
        // Reload comments
        await loadComments(0, false);
      } else {
        showToast.error(response.message || 'Failed to create comment', 'Error');
      }
    } catch (error) {
      showToast.error(error?.response?.data?.message || error?.message || 'Failed to create comment', 'Error');
      throw error;
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    try {
      const response = await commentService.createReply(parentCommentId, content);
      if (response.success) {
        showToast.success('Reply added successfully', 'Success');
        // Reload comments
        await loadComments(0, false);
      } else {
        showToast.error(response.message || 'Failed to create reply', 'Error');
      }
    } catch (error) {
      showToast.error(error?.response?.data?.message || error?.message || 'Failed to create reply', 'Error');
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      const response = await commentService.updateComment(commentId, content);
      if (response.success) {
        showToast.success('Comment updated successfully', 'Success');
        // Reload comments
        await loadComments(0, false);
      } else {
        showToast.error(response.message || 'Failed to update comment', 'Error');
      }
    } catch (error) {
      showToast.error(error?.response?.data?.message || error?.message || 'Failed to update comment', 'Error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    // Use Platform.OS check for web compatibility
    const confirmDelete = () => {
      commentService.deleteComment(commentId)
        .then((response) => {
          if (response && response.success) {
            showToast.success('Comment deleted successfully', 'Success');
            // Reload comments
            loadComments(0, false);
          } else {
            showToast.error(response?.message || 'Failed to delete comment', 'Error');
          }
        })
        .catch((error) => {
          console.error('Delete comment error:', error);
          showToast.error(error?.response?.data?.message || error?.message || 'Failed to delete comment', 'Error');
        });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Comment',
        'Are you sure you want to delete this comment? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: confirmDelete,
          },
        ]
      );
    }
  };

  const handleCommentReaction = async (commentId, reactionType) => {
    try {
      const response = await commentService.addReaction(commentId, reactionType);
      if (response.success) {
        // Reload comments to get updated reaction counts
        await loadComments(0, false);
      } else {
        showToast.error(response.message || 'Failed to react to comment', 'Error');
      }
    } catch (error) {
      showToast.error(error?.response?.data?.message || error?.message || 'Failed to react to comment', 'Error');
      throw error;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '';
    }
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  // Check if current user is the author of the post
  // Handle both string and number comparisons
  const isOwnPost = post && user && (
    String(post.authorId) === String(user.userId) || 
    Number(post.authorId) === Number(user.userId)
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Author Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorInfo}
          onPress={() => navigation.navigate('UserProfile', { userId: post.authorId })}
          activeOpacity={0.7}
        >
          <ProfilePhoto
            photoUrl={getAuthorPhotoUrl()}
            size={50}
            editable={false}
          />
          <View style={styles.authorDetails}>
            <Text style={styles.authorName} numberOfLines={1}>
              {post.authorFullName || post.authorEmail}
            </Text>
            <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>

        {isOwnPost && (
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            style={styles.deleteButton}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={theme.colors.error} />
            ) : (
              <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        <RenderHTML
          contentWidth={width - (theme.spacing.md * 2 + 32)} // Account for padding and margins
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
      {post.images && post.images.length > 0 && (
        <View style={styles.imagesContainer}>
          {post.images.map((image) => {
            const imageUrl = postService.getPostImageUrl(image.imageUrl);
            return (
              <Image
                key={image.id}
                source={{ uri: imageUrl }}
                style={styles.postImage}
                resizeMode="cover"
              />
            );
          })}
        </View>
      )}

      {/* Reactions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.reactionButton, post.userReaction && styles.reactionButtonActive]}
          onPress={handleReactionButtonPress}
          onLongPress={() => setShowPicker(true)}
          disabled={reacting}
          activeOpacity={0.7}
        >
          {reacting ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <>
              <Ionicons
                name={post.userReaction ? 'heart' : 'add-circle-outline'}
                size={28}
                color={post.userReaction ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text style={[styles.reactionButtonText, post.userReaction && styles.reactionButtonTextActive]}>
                {post.userReaction ? 'Remove Reaction' : 'React'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <ReactionSummary
          heartCount={post.heartCount || 0}
          thumbsUpCount={post.thumbsUpCount || 0}
          laughCount={post.laughCount || 0}
          sadCount={post.sadCount || 0}
          angryCount={post.angryCount || 0}
          thumbsDownCount={post.thumbsDownCount || 0}
          userReaction={post.userReaction}
          onPress={() => setShowPicker(true)}
        />
      </View>

      <ReactionPicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onReactionSelect={handleReactionSelect}
        currentReaction={post?.userReaction}
      />

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Comments</Text>
          {comments.length > 0 && (
            <View style={styles.commentCountBadge}>
              <Text style={styles.commentCountText}>{comments.length}</Text>
            </View>
          )}
        </View>

        {/* Comment Form */}
        <View style={styles.commentFormContainer}>
          <CommentForm
            onSubmit={handleCreateComment}
            placeholder="Write a comment..."
            submitLabel="Comment"
            showCancel={false}
          />
        </View>

        {/* Comments List */}
        <View style={styles.commentsListContainer}>
          <CommentList
            comments={comments}
            loading={commentsLoading}
            refreshing={commentsRefreshing}
            onRefresh={onCommentsRefresh}
            onReply={handleReply}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            onReaction={handleCommentReaction}
            currentUserId={user?.userId}
            postAuthorId={post?.authorId}
            onLoadMore={onCommentsLoadMore}
            hasMore={hasMoreComments}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorDetails: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  authorName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  postDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  postContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.md,
  },
  postText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
    fontSize: 16,
  },
  imagesContainer: {
    marginTop: theme.spacing.sm,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: 'transparent',
  },
  reactionButtonActive: {
    backgroundColor: theme.colors.primary + '10',
  },
  reactionButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    fontWeight: '600',
  },
  reactionButtonTextActive: {
    color: theme.colors.primary,
  },
  commentsSection: {
    marginTop: theme.spacing.lg,
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginHorizontal: -theme.spacing.md,
    marginBottom: -theme.spacing.md,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  commentsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 20,
  },
  commentCountBadge: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentCountText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  commentFormContainer: {
    marginBottom: theme.spacing.md,
  },
  commentsListContainer: {
    backgroundColor: 'transparent',
  },
});

export default PostDetailScreen;

