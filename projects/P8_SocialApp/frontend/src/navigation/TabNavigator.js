import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PostFeedScreen from '../screens/PostFeedScreen';
import SearchScreen from '../screens/SearchScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { useNotifications } from '../context/NotificationContext';
import theme from '../config/theme';

const Tab = createBottomTabNavigator();

// Header component with drawer button
const DrawerHeaderButton = () => {
  const navigation = useNavigation();
  
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <TouchableOpacity
      onPress={openDrawer}
      style={{ marginLeft: 16 }}
      activeOpacity={0.7}
    >
      <Ionicons name="menu" size={28} color={theme.colors.onPrimary} />
    </TouchableOpacity>
  );
};

// Custom tab bar icon with badge support
const TabBarIcon = ({ route, focused, color, size, badge }) => {
  let iconName;
  const iconSize = 24;

  if (route.name === 'Feed') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (route.name === 'Search') {
    iconName = focused ? 'search' : 'search-outline';
  } else if (route.name === 'CreatePost') {
    iconName = focused ? 'add-circle' : 'add-circle-outline';
  } else if (route.name === 'Notifications') {
    iconName = focused ? 'notifications' : 'notifications-outline';
  }

  return (
    <View style={styles.iconContainer}>
      <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
        <Ionicons 
          name={iconName} 
          size={iconSize} 
          color={focused ? theme.colors.primary : theme.colors.textSecondary}
        />
      </View>
      {badge && typeof badge === 'number' && badge > 0 && (
        <View style={styles.badge}>
          {badge > 99 ? (
            <View style={styles.badgeDot} />
          ) : (
            <Text style={styles.badgeText}>{badge}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const TabNavigator = () => {
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const badge = route.name === 'Notifications' && unreadCount > 0 ? unreadCount : null;
          return (
            <TabBarIcon 
              route={route} 
              focused={focused} 
              color={color} 
              size={size}
              badge={badge}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 0,
          paddingBottom: 0,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          position: 'absolute',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          paddingHorizontal: 4,
        },
        tabBarHideOnKeyboard: true,
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
        headerLeft: () => <DrawerHeaderButton />,
      })}
    >
      <Tab.Screen
        name="Feed"
        component={PostFeedScreen}
        options={{ title: 'Feed' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Search' }}
      />
      <Tab.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ 
          title: 'Create',
          tabBarLabel: 'Create',
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
  },
  iconWrapperActive: {
    backgroundColor: theme.colors.primary + '15',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.error,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  badgeText: {
    color: theme.colors.onError,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 12,
    includeFontPadding: false,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.onError,
  },
});

export default TabNavigator;

