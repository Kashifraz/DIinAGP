import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';
import VocabularyList from '../components/VocabularyList';
import VocabularyDetail from '../components/VocabularyDetail';
import VocabularySearch from '../components/VocabularySearch';

const VocabularyScreen = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'search'
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [selectedVocabulary, setSelectedVocabulary] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
  };

  const handleSearch = (query, type) => {
    setSearchQuery(query);
    setSearchType(type);
    setCurrentView('list');
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
  };

  const handleVocabularyPress = (vocabulary) => {
    setSelectedVocabulary(vocabulary);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedVocabulary(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <VocabularyList
            hskLevel={selectedLevel}
            searchQuery={searchQuery}
            searchType={searchType}
            onVocabularyPress={handleVocabularyPress}
            onLevelChange={handleLevelChange}
          />
        );
      case 'search':
        return (
          <VocabularySearch
            onSearch={handleSearch}
            onSearchTypeChange={handleSearchTypeChange}
            searchType={searchType}
            isLoading={false}
          />
        );
      default:
        return (
          <VocabularyList
            hskLevel={selectedLevel}
            searchQuery={searchQuery}
            searchType={searchType}
            onVocabularyPress={handleVocabularyPress}
            onLevelChange={handleLevelChange}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setCurrentView('list')}
          activeOpacity={0.7}
        >
          {currentView === 'list' ? (
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.activeTabGradient}
            >
              <Text style={styles.tabIcon}>📚</Text>
              <Text style={styles.activeTabText}>Vocabulary</Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveTab}>
              <Text style={styles.tabIcon}>📚</Text>
              <Text style={styles.tabText}>Vocabulary</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setCurrentView('search')}
          activeOpacity={0.7}
        >
          {currentView === 'search' ? (
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              style={styles.activeTabGradient}
            >
              <Text style={styles.tabIcon}>🔍</Text>
              <Text style={styles.activeTabText}>Search</Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveTab}>
              <Text style={styles.tabIcon}>🔍</Text>
              <Text style={styles.tabText}>Search</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Current View */}
      <View style={styles.content}>
        {renderCurrentView()}
      </View>

      {/* Vocabulary Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseDetail}
      >
        {selectedVocabulary && (
          <VocabularyDetail
            vocabularyId={selectedVocabulary.id}
            onClose={handleCloseDetail}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  activeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  inactiveTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.gray50,
    gap: spacing.xs,
  },
  tabIcon: {
    fontSize: typography.lg,
  },
  tabText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  activeTabText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
});

export default VocabularyScreen;
