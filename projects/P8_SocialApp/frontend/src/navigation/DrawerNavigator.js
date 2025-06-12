import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { showToast } from '../utils/toast';
import TabNavigator from './TabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import FriendRequestsScreen from '../screens/FriendRequestsScreen';
import FriendsListScreen from '../screens/FriendsListScreen';
import ProfilePhoto from '../components/ProfilePhoto';
import { API_BASE_URL } from '../config/api';
import theme from '../config/theme';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { user, logout } = useAuth();
  const { isConnected } = useNotifications();
  const [profilePhotoUrl, setProfilePhotoUrl] = React.useState(null);

  React.useEffect(() => {
    // Fetch profile photo if needed
    // For now, we'll construct it from user data if available
    if (user?.profilePhotoUrl) {
      let filename = user.profilePhotoUrl.trim();
      if (filename.includes('/')) {
        filename = filename.split('/').pop();
      }
      if (filename.includes('\\')) {
        filename = filename.split('\\').pop();
      }
      const encodedFilename = encodeURIComponent(filename);
      const baseUrl = API_BASE_URL.replace('/api', '');
      setProfilePhotoUrl(`${baseUrl}/api/media/profile-photo/${encodedFilename}`);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    showToast.info('You have been logged out', 'Logout Successful');
    props.navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const getProfilePhotoUrl = () => {
    if (profilePhotoUrl) return profilePhotoUrl;
    return null;
  };

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={styles.drawerContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.drawerHeader}>
          <View style={styles.headerGradient}>
            <View style={styles.userInfoSection}>
              <View style={styles.avatarContainer}>
                <ProfilePhoto
                  photoUrl={getProfilePhotoUrl()}
                  size={64}
                  editable={false}
                />
                {isConnected && (
                  <View style={styles.connectionBadge}>
                    <View style={styles.connectionDot} />
                  </View>
                )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.fullName || 'User'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email || ''}
                </Text>
                {isConnected && (
                  <View style={styles.connectionStatus}>
                    <View style={styles.connectionIndicator} />
                    <Text style={styles.connectionText}>Online</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Navigation Items */}
        <View style={styles.drawerBody}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Footer Section */}
      <View style={styles.drawerFooter}>
        <View style={styles.footerDivider} />
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIconContainer}>
            <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 300,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 15,
          fontWeight: '500',
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 12,
          marginVertical: 4,
          paddingVertical: 8,
        },
        drawerActiveBackgroundColor: theme.colors.primary + '15',
        drawerInactiveBackgroundColor: 'transparent',
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        swipeEnabled: true,
        gestureHandlerProps: {
          enableTrackpadTwoFingerGesture: true,
        },
        drawerIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'MainTabs') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'FriendRequests') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'FriendsList') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <Ionicons name={iconName} size={24} color={focused ? theme.colors.primary : color} />;
        },
      })}
    >
      <Drawer.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
        }}
      />
      <Drawer.Screen
        name="FriendRequests"
        component={FriendRequestsScreen}
        options={{
          title: 'Friend Requests',
        }}
      />
      <Drawer.Screen
        name="FriendsList"
        component={FriendsListScreen}
        options={{
          title: 'My Friends',
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  drawerHeader: {
    backgroundColor: theme.colors.primary,
    paddingBottom: theme.spacing.xl,
    ...Platform.select({
      ios: {
        paddingTop: 60,
      },
      android: {
        paddingTop: theme.spacing.xl,
      },
    }),
  },
  headerGradient: {
    paddingHorizontal: theme.spacing.lg,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  connectionBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success || '#4CAF50',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...theme.typography.h3,
    color: theme.colors.onPrimary,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
    fontSize: 20,
  },
  userEmail: {
    ...theme.typography.bodySmall,
    color: theme.colors.onPrimary + 'DD',
    marginBottom: theme.spacing.xs,
    fontSize: 13,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success || '#4CAF50',
    marginRight: theme.spacing.xs,
  },
  connectionText: {
    ...theme.typography.caption,
    color: theme.colors.onPrimary + 'DD',
    fontSize: 12,
    fontWeight: '500',
  },
  drawerBody: {
    flex: 1,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  drawerFooter: {
    backgroundColor: '#FFFFFF',
    paddingTop: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  footerDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 12,
    backgroundColor: theme.colors.error + '08',
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  logoutText: {
    ...theme.typography.body,
    color: theme.colors.error,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default DrawerNavigator;

