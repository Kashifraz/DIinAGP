import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FriendRequestItem from '../components/FriendRequestItem';
import friendService from '../services/friendService';
import { showToast } from '../utils/toast';
import theme from '../config/theme';

const FriendRequestsScreen = ({ navigation }) => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [receivedPage, setReceivedPage] = useState(0);
  const [sentPage, setSentPage] = useState(0);
  const [receivedHasMore, setReceivedHasMore] = useState(false);
  const [sentHasMore, setSentHasMore] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Load friend requests
  const loadRequests = useCallback(async (tab, page = 0, append = false) => {
    try {
      let response;
      if (tab === 'received') {
        response = await friendService.getReceivedRequests(page, 20);
      } else {
        response = await friendService.getSentRequests(page, 20);
      }

      if (response.success && response.data) {
        const requests = response.data.content || [];
        
        if (tab === 'received') {
          if (append) {
            setReceivedRequests(prev => [...prev, ...requests]);
          } else {
            setReceivedRequests(requests);
          }
          setReceivedPage(page);
          setReceivedHasMore(!response.data.last);
        } else {
          if (append) {
            setSentRequests(prev => [...prev, ...requests]);
          } else {
            setSentRequests(requests);
          }
          setSentPage(page);
          setSentHasMore(!response.data.last);
        }
      }
    } catch (error) {
      console.error('Load requests error:', error);
      showToast.error(error.message || 'Failed to load friend requests', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRequests('received', 0, false);
    loadRequests('sent', 0, false);
  }, []);

  // Load more (pagination)
  const loadMore = () => {
    if (activeTab === 'received' && !loading && receivedHasMore) {
      loadRequests('received', receivedPage + 1, true);
    } else if (activeTab === 'sent' && !loading && sentHasMore) {
      loadRequests('sent', sentPage + 1, true);
    }
  };

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadRequests(activeTab, 0, false);
  };

  // Handle accept
  const handleAccept = async (requestId) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const response = await friendService.acceptFriendRequest(requestId);
      if (response.success) {
        showToast.success('Friend request accepted!', 'Success');
        // Reload requests
        loadRequests('received', 0, false);
        loadRequests('sent', 0, false);
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to accept friend request', 'Error');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  // Handle reject
  const handleReject = async (requestId) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const response = await friendService.rejectFriendRequest(requestId);
      if (response.success) {
        showToast.info('Friend request rejected', 'Rejected');
        // Reload requests
        loadRequests('received', 0, false);
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to reject friend request', 'Error');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  // Handle cancel
  const handleCancel = async (requestId) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const response = await friendService.cancelFriendRequest(requestId);
      if (response.success) {
        showToast.info('Friend request cancelled', 'Cancelled');
        // Reload requests
        loadRequests('sent', 0, false);
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to cancel friend request', 'Error');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  // Handle user press (navigate to profile)
  const handleUserPress = (request) => {
    const userId = activeTab === 'received' ? request.senderId : request.receiverId;
    navigation.navigate('UserProfile', { userId });
  };

  // Render item
  const renderItem = ({ item }) => (
    <FriendRequestItem
      request={item}
      type={activeTab}
      onAccept={handleAccept}
      onReject={handleReject}
      onCancel={handleCancel}
      onPress={() => handleUserPress(item)}
      loading={actionLoading[item.id] || false}
    />
  );

  // Render footer (loading indicator for pagination)
  const renderFooter = () => {
    if (!loading || (activeTab === 'received' ? receivedPage === 0 : sentPage === 0)) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading && (activeTab === 'received' ? receivedPage === 0 : sentPage === 0)) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name={activeTab === 'received' ? 'person-add-outline' : 'send-outline'} 
          size={64} 
          color={theme.colors.textSecondary} 
        />
        <Text style={styles.emptyText}>
          {activeTab === 'received' 
            ? 'No pending friend requests' 
            : 'No sent friend requests'}
        </Text>
        <Text style={styles.emptySubtext}>
          {activeTab === 'received'
            ? 'You have no pending friend requests'
            : 'You have not sent any friend requests'}
        </Text>
      </View>
    );
  };

  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;
  const tabBarHeight = Platform.OS === 'ios' ? 88 : 70;

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Received
          </Text>
          {receivedRequests.length > 0 && (
            <View style={[styles.badge, activeTab === 'received' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'received' && styles.badgeTextActive]}>
                {receivedRequests.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Sent
          </Text>
          {sentRequests.length > 0 && (
            <View style={[styles.badge, activeTab === 'sent' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'sent' && styles.badgeTextActive]}>
                {sentRequests.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      <FlatList
        data={currentRequests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          currentRequests.length === 0 && styles.listContentEmpty,
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
  tabContainer: {
    flexDirection: 'row',
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
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    position: 'relative',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.textSecondary + '20',
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: theme.colors.primary,
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

export default FriendRequestsScreen;

