import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const VocabularyList = ({ 
  hskLevel, 
  searchQuery = '', 
  searchType = 'all',
  onVocabularyPress,
  onLevelChange
}) => {
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const { token } = useAuth();
  const { showError } = useToast();

  const getLevelColor = (level) => {
    const colors = {
      1: '#10B981',
      2: '#3B82F6', 
      3: '#8B5CF6',
      4: '#F59E0B',
      5: '#EF4444',
    };
    return colors[level] || '#6B7280';
  };

  const pageSize = 20;

  const loadVocabulary = async (pageNum = 0, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let response;
      
      if (searchQuery.trim()) {
        // Search functionality
        switch (searchType) {
          case 'chinese':
            response = await ApiService.searchByChinese(searchQuery, pageNum, pageSize);
            break;
          case 'english':
            response = await ApiService.searchByEnglish(searchQuery, pageNum, pageSize);
            break;
          case 'pinyin':
            response = await ApiService.searchByPinyin(searchQuery, pageNum, pageSize);
            break;
          case 'level':
            response = await ApiService.searchByLevelAndTerm(hskLevel, searchQuery, pageNum, pageSize);
            break;
          default:
            response = await ApiService.getVocabularyByLevel(hskLevel, pageNum, pageSize);
        }
      } else {
        // Get by level
        response = await ApiService.getVocabularyByLevel(hskLevel, pageNum, pageSize);
      }

      if (response.success) {
        const newVocabulary = response.data || [];
        const pagination = response.pagination || {};
        
        if (pageNum === 0 || isRefresh) {
          setVocabulary(newVocabulary);
        } else {
          setVocabulary(prev => [...prev, ...newVocabulary]);
        }
        
        setHasMore(pagination.hasNext || false);
        setTotalElements(pagination.totalElements || 0);
      } else {
        showError(response.message || 'Failed to load vocabulary');
      }
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      showError('Failed to load vocabulary. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVocabulary(0, true);
  }, [hskLevel, searchQuery, searchType]);

  const handleRefresh = () => {
    setPage(0);
    loadVocabulary(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadVocabulary(nextPage, false);
    }
  };

  const renderVocabularyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.vocabularyItem}
      onPress={() => onVocabularyPress && onVocabularyPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.vocabularyContent}>
        <View style={styles.chineseContainer}>
          <Text style={styles.chineseText}>{item.simplifiedChinese}</Text>
          <Text style={styles.pinyinText}>{item.pinyin}</Text>
        </View>
        <View style={styles.meaningContainer}>
          <Text style={styles.englishText}>{item.englishMeaning}</Text>
          {item.radical && (
            <Text style={styles.radicalText}>Radical: {item.radical}</Text>
          )}
          {item.classifiers && (
            <Text style={styles.classifierText}>Classifier: {item.classifiers}</Text>
          )}
        </View>
        <View style={styles.levelContainer}>
          <View style={[styles.levelTag, { backgroundColor: getLevelColor(item.hskLevel) }]}>
            <Text style={styles.levelIcon}>📚</Text>
            <Text style={styles.levelText}>HSK {item.hskLevel}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading || page === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery ? 'No vocabulary found matching your search' : 'No vocabulary available'}
      </Text>
    </View>
  );

  if (loading && page === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vocabulary...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>HSK Level {hskLevel} Vocabulary</Text>
          <Text style={styles.countText}>
            {totalElements} {totalElements === 1 ? 'word' : 'words'}
          </Text>
        </View>
        <View style={styles.levelSelector}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={styles.levelButton}
              onPress={() => onLevelChange && onLevelChange(level)}
              activeOpacity={0.7}
            >
              {hskLevel === level ? (
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6', '#EC4899']}
                  style={styles.levelButtonGradient}
                >
                  <Text style={styles.levelButtonTextActive}>
                    {level}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.levelButtonInactive}>
                  <Text style={styles.levelButtonText}>
                    {level}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <FlatList
        data={vocabulary}
        renderItem={renderVocabularyItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  countText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  levelSelector: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  levelButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.sm,
  },
  levelButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  levelButtonInactive: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  levelButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  levelButtonTextActive: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.white,
  },
  listContainer: {
    padding: spacing.sm,
  },
  vocabularyItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  vocabularyContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  chineseContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  chineseText: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  pinyinText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  meaningContainer: {
    flex: 2,
    marginRight: spacing.md,
  },
  englishText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  radicalText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  classifierText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  levelIcon: {
    fontSize: typography.xs,
  },
  levelText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default VocabularyList;
