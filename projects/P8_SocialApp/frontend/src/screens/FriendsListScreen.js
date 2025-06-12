import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDebounce } from '../utils/debounce';
import FriendListItem from '../components/FriendListItem';
import friendService from '../services/friendService';
import { showToast } from '../utils/toast';
import theme from '../config/theme';

const FriendsListScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoading, setActionLoading] = useState({});

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load friends list
  const loadFriends = useCallback(async (pageNum = 0, append = false) => {
    setLoading(true);
    try {
      const response = await friendService.getFriends(pageNum, 20);
      
      if (response.success && response.data) {
        const friendsData = response.data.content || [];
        
        if (append) {
          setFriends(prev => [...prev, ...friendsData]);
        } else {
          setFriends(friendsData);
        }

        setPage(pageNum);
        setHasMore(!response.data.last);
        setTotalElements(response.data.totalElements || 0);
      } else {
        if (!append) {
          setFriends([]);
        }
        showToast.error(response.message || 'Failed to load friends', 'Error');
      }
    } catch (error) {
      console.error('Load friends error:', error);
      if (!append) {
        setFriends([]);
      }
      showToast.error(error.message || 'Failed to load friends', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFriends(0, false);
  }, []);

  // Filter friends based on search query
  useEffect(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.trim().length === 0) {
      setFilteredFriends(friends);
    } else {
      const query = debouncedSearchQuery.toLowerCase().trim();
      const filtered = friends.filter(friend => 
        friend.fullName?.toLowerCase().includes(query) ||
        friend.email?.toLowerCase().includes(query)
      );
      setFilteredFriends(filtered);
    }
  }, [debouncedSearchQuery, friends]);

  // Load more (pagination)
  const loadMore = () => {
    if (!loading && hasMore && searchQuery.trim().length === 0) {
      loadFriends(page + 1, true);
    }
  };

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadFriends(0, false);
  };

  // Handle unfriend
  const handleUnfriend = async (friendId) => {
    console.log('FriendsListScreen handleUnfriend called with friendId:', friendId);
    console.log('friendId type:', typeof friendId);
    
    if (!friendId) {
      console.error('friendId is null or undefined!');
      showToast.error('Invalid friend ID', 'Error');
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [friendId]: true }));
    try {
      console.log('Calling friendService.unfriend with friendId:', friendId);
      const response = await friendService.unfriend(friendId);
      console.log('Unfriend API response:', response);
      
      if (response && response.success) {
        showToast.success('Friend removed successfully', 'Success');
        // Remove friend from list
        setFriends(prev => prev.filter(f => f.userId !== friendId));
        setFilteredFriends(prev => prev.filter(f => f.userId !== friendId));
        setTotalElements(prev => Math.max(0, prev - 1));
      } else {
        showToast.error(response?.message || 'Failed to remove friend', 'Error');
      }
    } catch (error) {
      console.error('Unfriend error:', error);
      showToast.error(error.message || 'Failed to remove friend', 'Error');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[friendId];
        return newState;
      });
    }
  };

  // Handle friend profile navigation
  const handleFriendPress = (friend) => {
    navigation.navigate('UserProfile', { userId: friend.userId });
  };

  // Render friend item
  const renderItem = ({ item }) => (
    <FriendListItem
      friend={item}
      onPress={() => handleFriendPress(item)}
      onUnfriend={handleUnfriend}
      showUnfriendButton={true}
    />
  );

  // Render footer (loading indicator for pagination)
  const renderFooter = () => {
    if (!loading || page === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  // Render header with results count
  const renderListHeader = () => {
    if (totalElements > 0) {
      return (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {searchQuery.trim().length > 0 
              ? `${filteredFriends.length} ${filteredFriends.length === 1 ? 'result' : 'results'}`
              : `${totalElements} ${totalElements === 1 ? 'friend' : 'friends'}`
            }
          </Text>
        </View>
      );
    }
    return null;
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading && page === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Loading friends...</Text>
        </View>
      );
    }

    if (searchQuery.trim().length > 0 && filteredFriends.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No friends found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      );
    }

    if (friends.length === 0 && !loading) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>
            Start by sending friend requests to connect with others
          </Text>
        </View>
      );
    }

    return null;
  };

  // Tab bar height: iOS = 88, Android = 70
  const tabBarHeight = Platform.OS === 'ios' ? 88 : 70;

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search friends..."
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Friends List */}
      <FlatList
        data={filteredFriends}
        renderItem={renderItem}
        keyExtractor={(item) => item.userId.toString()}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={[
          styles.listContent,
          filteredFriends.length === 0 && styles.listContentEmpty,
          { paddingBottom: tabBarHeight + theme.spacing.md },
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  searchContainer: {
    paddingHorizontal: 0,
    paddingVertical: theme.spacing.sm + 2,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginHorizontal: theme.spacing.md,
    minHeight: 40,
    maxHeight: 40,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 14,
    minHeight: 20,
    color: theme.colors.text,
  },
  clearButton: {
    marginLeft: theme.spacing.xs,
    padding: theme.spacing.xs / 2,
  },
  resultsHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'transparent',
  },
  resultsCount: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
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

export default FriendsListScreen;

