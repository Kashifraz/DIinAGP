import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostItem from '../components/PostItem';
import postService from '../services/postService';
import { showToast } from '../utils/toast';
import theme from '../config/theme';

const PostFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (pageNum = 0, append = false) => {
    setLoading(true);
    try {
      const response = await postService.getPostsFeed(pageNum, 20);
      
      if (response.success && response.data) {
        const postsData = response.data.content || [];
        
        // Debug: Log posts to check if images are included
        console.log('PostFeedScreen: Loaded posts', postsData.length);
        postsData.forEach((post, idx) => {
          console.log(`Post ${idx}:`, {
            id: post.id,
            hasImages: !!post.images,
            imageCount: post.images?.length || 0,
            images: post.images,
          });
        });
        
        if (append) {
          setPosts((prev) => [...prev, ...postsData]);
        } else {
          setPosts(postsData);
        }

        setPage(pageNum);
        setHasMore(!response.data.last);
      } else {
        if (!append) {
          setPosts([]);
        }
        showToast.error(response.message || 'Failed to load posts', 'Error');
      }
    } catch (error) {
      console.error('Load posts error:', error);
      if (!append) {
        setPosts([]);
      }
      showToast.error(error.message || 'Failed to load posts', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(0, false);
    
    // Refresh posts when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadPosts(0, false);
    });

    return unsubscribe;
  }, [navigation, loadPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts(0, false);
  }, [loadPosts]);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadPosts(page + 1, true);
    }
  };

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const handleAuthorPress = (authorId) => {
    navigation.navigate('UserProfile', { userId: authorId });
  };

  const renderFooter = () => {
    if (!loading || page === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading && page === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Loading posts...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubtext}>
          Start by creating a post or connecting with friends
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onPress={() => handlePostPress(item)}
            onAuthorPress={handleAuthorPress}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          posts.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  listContent: {
    padding: theme.spacing.sm,
    paddingBottom: 100, // Space for bottom tab bar
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  footer: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontWeight: '600',
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontSize: 14,
  },
});

export default PostFeedScreen;

