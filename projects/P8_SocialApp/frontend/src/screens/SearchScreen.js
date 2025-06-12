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
import SearchResultItem from '../components/SearchResultItem';
import searchService from '../services/searchService';
import { showToast } from '../utils/toast';
import theme from '../config/theme';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  // Debounce search query (wait 500ms after user stops typing)
  const debouncedQuery = useDebounce(query, 500);

  // Perform search
  const performSearch = useCallback(async (searchQuery, pageNum = 0, append = false) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([]);
      setHasMore(false);
      setTotalElements(0);
      return;
    }

    setLoading(true);
    try {
      const response = await searchService.searchUsers(searchQuery.trim(), pageNum, 20);
      
      if (response.success && response.data) {
        const searchData = response.data;
        const newResults = searchData.content || [];
        
        if (append) {
          setResults(prev => [...prev, ...newResults]);
        } else {
          setResults(newResults);
        }

        setPage(pageNum);
        setHasMore(!searchData.last);
        setTotalElements(searchData.totalElements || 0);
      } else {
        if (!append) {
          setResults([]);
        }
        showToast.error(response.message || 'Search failed', 'Error');
      }
    } catch (error) {
      console.error('Search error:', error);
      if (!append) {
        setResults([]);
      }
      showToast.error(error.message || 'Failed to search users', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length > 0) {
      performSearch(debouncedQuery, 0, false);
    } else {
      setResults([]);
      setHasMore(false);
      setTotalElements(0);
    }
  }, [debouncedQuery, performSearch]);

  // Load more results (pagination)
  const loadMore = () => {
    if (!loading && hasMore && debouncedQuery && debouncedQuery.trim().length > 0) {
      performSearch(debouncedQuery, page + 1, true);
    }
  };

  // Refresh search results
  const onRefresh = () => {
    if (debouncedQuery && debouncedQuery.trim().length > 0) {
      setRefreshing(true);
      performSearch(debouncedQuery, 0, false);
    }
  };

  // Handle user profile navigation
  const handleUserPress = (user) => {
    navigation.navigate('UserProfile', { userId: user.id });
  };

  // Render search result item
  const renderItem = ({ item }) => (
    <SearchResultItem
      user={item}
      onPress={() => handleUserPress(item)}
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

  // Render empty state
  const renderEmpty = () => {
    if (loading && page === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (query.trim().length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Start typing to search for users</Text>
          <Text style={styles.emptySubtext}>Search by name or email</Text>
        </View>
      );
    }

    if (results.length === 0 && !loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      );
    }

    return null;
  };

  // Tab bar height: iOS = 88, Android = 70
  const tabBarHeight = Platform.OS === 'ios' ? 88 : 70;

  // Render header with results count
  const renderListHeader = () => {
    if (totalElements > 0) {
      return (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {totalElements} {totalElements === 1 ? 'result' : 'results'}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or email..."
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={[
          styles.listContent,
          results.length === 0 && styles.listContentEmpty,
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

export default SearchScreen;

