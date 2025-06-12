import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';

const VocabularySearch = ({ onSearch, onSearchTypeChange, searchType, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const searchTypes = [
    { key: 'all', label: 'All', icon: '🔍' },
    { key: 'chinese', label: 'Chinese', icon: '中' },
    { key: 'english', label: 'English', icon: 'E' },
    { key: 'pinyin', label: 'Pinyin', icon: 'P' },
    { key: 'level', label: 'Level', icon: 'L' },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), searchType);
    }
  };

  const handleSearchTypeSelect = (type) => {
    onSearchTypeChange(type);
    setIsExpanded(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('', searchType);
  };

  const getSearchTypeLabel = () => {
    const type = searchTypes.find(t => t.key === searchType);
    return type ? type.label : 'All';
  };

  const getSearchTypeIcon = () => {
    const type = searchTypes.find(t => t.key === searchType);
    return type ? type.icon : '🔍';
  };

  const { width } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <Text style={styles.title}>Search Vocabulary</Text>
        <Text style={styles.subtitle}>Find Chinese words by different criteria</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Enter search term..."
            placeholderTextColor={colors.gray400}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Type Selector */}
        <View style={styles.searchTypeContainer}>
          <TouchableOpacity
            style={styles.searchTypeButton}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.searchTypeIcon}>{getSearchTypeIcon()}</Text>
            <Text style={styles.searchTypeLabel}>{getSearchTypeLabel()}</Text>
            <Text style={styles.dropdownIcon}>{isExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.searchTypeDropdown}>
              {searchTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.searchTypeOption,
                    searchType === type.key && styles.searchTypeOptionActive
                  ]}
                  onPress={() => handleSearchTypeSelect(type.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.searchTypeOptionIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.searchTypeOptionLabel,
                    searchType === type.key && styles.searchTypeOptionLabelActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={isLoading || !searchQuery.trim()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isLoading || !searchQuery.trim() 
              ? [colors.gray400, colors.gray400] 
              : [colors.primary, colors.primaryDark]
            }
            style={styles.searchButtonGradient}
          >
            <Text style={styles.searchButtonIcon}>🔍</Text>
            <Text style={styles.searchButtonText}>
              {isLoading ? 'Searching...' : 'Search'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Search Tips */}
        <View style={[styles.tipsContainer, isExpanded && styles.tipsContainerExpanded]}>
          <Text style={styles.tipsTitle}>Search Tips:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tipsContent}>
              <Text style={styles.tipText}>• Chinese: Search by characters (你好)</Text>
              <Text style={styles.tipText}>• English: Search by meaning (hello)</Text>
              <Text style={styles.tipText}>• Pinyin: Search by pronunciation (nǐ hǎo)</Text>
              <Text style={styles.tipText}>• Level: Search within specific HSK level</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    zIndex: 1,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  searchContainer: {
    padding: spacing.lg,
  },
  searchInputContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingRight: 50,
  },
  clearButton: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.white,
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  searchTypeContainer: {
    position: 'relative',
    marginBottom: spacing.md,
    zIndex: 1000,
  },
  searchTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  searchTypeIcon: {
    fontSize: typography.lg,
    marginRight: spacing.sm,
  },
  searchTypeLabel: {
    flex: 1,
    fontSize: typography.base,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  dropdownIcon: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  searchTypeDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
    ...shadows.lg,
    zIndex: 9999,
    elevation: 10,
  },
  searchTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  searchTypeOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  searchTypeOptionIcon: {
    fontSize: typography.lg,
    marginRight: spacing.sm,
    width: 20,
    textAlign: 'center',
  },
  searchTypeOptionLabel: {
    flex: 1,
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  searchTypeOptionLabelActive: {
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  searchButton: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonIcon: {
    fontSize: typography.lg,
  },
  searchButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  tipsContainer: {
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  tipsContainerExpanded: {
    marginTop: spacing['2xl'],
  },
  tipsTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tipsContent: {
    flexDirection: 'row',
  },
  tipText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginRight: spacing.lg,
  },
});

export default VocabularySearch;
