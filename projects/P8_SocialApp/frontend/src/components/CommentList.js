import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import CommentItem from './CommentItem';
import { Ionicons } from '@expo/vector-icons';
import theme from '../config/theme';

const CommentList = ({
  comments = [],
  loading = false,
  refreshing = false,
  onRefresh,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  currentUserId,
  postAuthorId,
  onLoadMore,
  hasMore = false,
}) => {
  const renderComment = ({ item }) => (
    <CommentItem
      comment={item}
      onReply={onReply}
      onEdit={onEdit}
      onDelete={onDelete}
      onReaction={onReaction}
      currentUserId={currentUserId}
      postAuthorId={postAuthorId}
      level={0}
      maxLevel={3}
    />
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Loading comments...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>No comments yet</Text>
        <Text style={styles.emptySubtext}>
          Be the first to comment on this post
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={comments}
      renderItem={renderComment}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
        />
      }
      onEndReached={hasMore && !loading ? onLoadMore : null}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading && comments.length > 0 ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : null
      }
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.sm,
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontWeight: '600',
  },
  emptySubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontSize: 13,
  },
  footer: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
});

export default CommentList;

