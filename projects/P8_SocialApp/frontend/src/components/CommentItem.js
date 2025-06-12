import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import ProfilePhoto from './ProfilePhoto';
import CommentForm from './CommentForm';
import { API_BASE_URL } from '../config/api';
import theme from '../config/theme';

const CommentItem = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  currentUserId,
  postAuthorId,
  level = 0, // Nesting level for indentation
  maxLevel = 3, // Maximum nesting depth
}) => {
  const { width } = useWindowDimensions();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLiked, setIsLiked] = useState(comment?.isLiked || false);
  const [isDisliked, setIsDisliked] = useState(comment?.isDisliked || false);
  const [likeCount, setLikeCount] = useState(comment?.likeCount || 0);
  const [dislikeCount, setDislikeCount] = useState(comment?.dislikeCount || 0);
  const [reacting, setReacting] = useState(false);

  // Update local state when comment prop changes
  React.useEffect(() => {
    setIsLiked(comment?.isLiked || false);
    setIsDisliked(comment?.isDisliked || false);
    setLikeCount(comment?.likeCount || 0);
    setDislikeCount(comment?.dislikeCount || 0);
  }, [comment?.isLiked, comment?.isDisliked, comment?.likeCount, comment?.dislikeCount]);

  const isOwnComment = currentUserId && comment?.authorId && 
    (String(currentUserId) === String(comment.authorId) || Number(currentUserId) === Number(comment.authorId));
  const isPostAuthor = currentUserId && postAuthorId && 
    (String(currentUserId) === String(postAuthorId) || Number(currentUserId) === Number(postAuthorId));

  const getProfilePhotoUrl = () => {
    if (!comment?.authorProfilePhotoUrl) return null;
    let filename = comment.authorProfilePhotoUrl.trim();
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

  const handleLike = async () => {
    if (reacting || !comment?.id || !onReaction) return;
    
    setReacting(true);
    const previousLiked = isLiked;
    const previousDisliked = isDisliked;
    const previousLikeCount = likeCount;
    const previousDislikeCount = dislikeCount;

    // Optimistic update
    if (previousLiked) {
      setIsLiked(false);
      setLikeCount(Math.max(0, likeCount - 1));
    } else {
      setIsLiked(true);
      setLikeCount(likeCount + 1);
      if (previousDisliked) {
        setIsDisliked(false);
        setDislikeCount(Math.max(0, dislikeCount - 1));
      }
    }

    try {
      await onReaction(comment.id, 'LIKE');
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      setIsDisliked(previousDisliked);
      setLikeCount(previousLikeCount);
      setDislikeCount(previousDislikeCount);
    } finally {
      setReacting(false);
    }
  };

  const handleDislike = async () => {
    if (reacting || !comment?.id || !onReaction) return;
    
    setReacting(true);
    const previousLiked = isLiked;
    const previousDisliked = isDisliked;
    const previousLikeCount = likeCount;
    const previousDislikeCount = dislikeCount;

    // Optimistic update
    if (previousDisliked) {
      setIsDisliked(false);
      setDislikeCount(Math.max(0, dislikeCount - 1));
    } else {
      setIsDisliked(true);
      setDislikeCount(dislikeCount + 1);
      if (previousLiked) {
        setIsLiked(false);
        setLikeCount(Math.max(0, likeCount - 1));
      }
    }

    try {
      await onReaction(comment.id, 'DISLIKE');
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      setIsDisliked(previousDisliked);
      setLikeCount(previousLikeCount);
      setDislikeCount(previousDislikeCount);
    } finally {
      setReacting(false);
    }
  };

  const handleReply = (content) => {
    if (onReply) {
      onReply(comment.id, content);
      setShowReplyForm(false);
    }
  };

  const handleEdit = (content) => {
    if (onEdit) {
      onEdit(comment.id, content);
      setShowEditForm(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(comment.id);
    }
  };

  const indentWidth = Math.min(level, maxLevel) * 20;

  return (
    <View style={[styles.container, { marginLeft: indentWidth }]}>
      <View style={styles.commentCard}>
        <View style={styles.commentContent}>
          <ProfilePhoto
            photoUrl={getProfilePhotoUrl()}
            size={40}
            editable={false}
          />
          <View style={styles.commentBody}>
            <View style={styles.commentHeader}>
              <Text style={styles.authorName} numberOfLines={1}>
                {comment?.authorFullName || comment?.authorEmail || 'User'}
              </Text>
              <View style={styles.dotSeparator} />
              <Text style={styles.commentDate}>{formatDate(comment?.createdAt)}</Text>
            </View>

            {showEditForm ? (
              <View style={styles.editFormContainer}>
                <CommentForm
                  initialContent={comment?.content || ''}
                  onSubmit={handleEdit}
                  onCancel={() => setShowEditForm(false)}
                  placeholder="Edit your comment..."
                  submitLabel="Update"
                />
              </View>
            ) : (
              <>
                <View style={styles.commentText}>
                  <RenderHTML
                    contentWidth={width - (indentWidth + 60 + theme.spacing.md * 3)}
                    source={{ html: comment?.content || '' }}
                    baseStyle={styles.commentTextContent}
                    tagsStyles={{
                      p: { margin: 0, marginBottom: 6 },
                      div: { margin: 0, marginBottom: 6 },
                    }}
                    defaultTextProps={{
                      style: styles.commentTextContent,
                    }}
                  />
                </View>

                <View style={styles.commentActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, isLiked && styles.actionButtonActive]}
                    onPress={handleLike}
                    disabled={reacting}
                    activeOpacity={0.6}
                  >
                    <Ionicons
                      name={isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                      size={18}
                      color={isLiked ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    {likeCount > 0 && (
                      <Text style={[styles.reactionCount, isLiked && styles.reactionCountActive]}>
                        {likeCount}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, isDisliked && styles.actionButtonActive]}
                    onPress={handleDislike}
                    disabled={reacting}
                    activeOpacity={0.6}
                  >
                    <Ionicons
                      name={isDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
                      size={18}
                      color={isDisliked ? theme.colors.error : theme.colors.textSecondary}
                    />
                    {dislikeCount > 0 && (
                      <Text style={[styles.reactionCount, isDisliked && styles.reactionCountActive]}>
                        {dislikeCount}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {level < maxLevel && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setShowReplyForm(!showReplyForm)}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="chatbubble-outline" size={18} color={theme.colors.textSecondary} />
                      <Text style={styles.actionText}>Reply</Text>
                    </TouchableOpacity>
                  )}

                  {isOwnComment && (
                    <>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setShowEditForm(true)}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="pencil-outline" size={18} color={theme.colors.textSecondary} />
                        <Text style={styles.actionText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleDelete}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                        <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {!isOwnComment && isPostAuthor && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleDelete}
                      activeOpacity={0.6}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                      <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {showReplyForm && !showEditForm && level < maxLevel && (
        <View style={styles.replyFormContainer}>
          <CommentForm
            onSubmit={handleReply}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Write a reply..."
            submitLabel="Reply"
          />
        </View>
      )}

      {/* Render nested replies */}
      {comment?.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReaction={onReaction}
              currentUserId={currentUserId}
              postAuthorId={postAuthorId}
              level={level + 1}
              maxLevel={maxLevel}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  commentContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentBody: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  authorName: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.xs,
  },
  commentDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  commentText: {
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  commentTextContent: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
    fontSize: 14,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.md,
    marginTop: theme.spacing.xs,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  actionButtonActive: {
    backgroundColor: theme.colors.primary + '12',
  },
  actionText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    fontSize: 13,
    fontWeight: '500',
  },
  deleteText: {
    color: theme.colors.error,
  },
  reactionCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    fontSize: 13,
    fontWeight: '600',
  },
  reactionCountActive: {
    color: theme.colors.primary,
  },
  editFormContainer: {
    marginTop: theme.spacing.xs,
  },
  replyFormContainer: {
    marginTop: theme.spacing.md,
    marginLeft: theme.spacing.md,
  },
  repliesContainer: {
    marginTop: theme.spacing.md,
    marginLeft: theme.spacing.lg,
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E5E5',
  },
});

export default CommentItem;

