import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/designSystem';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import VocabularyScreen from '../screens/VocabularyScreen';
import LearningScreen from '../screens/LearningScreen';
import QuizModeSelectionScreen from '../screens/QuizModeSelectionScreen';
import QuizHistoryScreen from '../screens/QuizHistoryScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Vocabulary') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Learning') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Quiz') {
            iconName = focused ? 'brain' : 'brain-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          }

          return (
            <Ionicons 
              name={iconName} 
              size={focused ? 26 : 24} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
          paddingTop: spacing.md,
          height: Platform.OS === 'ios' ? 90 : 70,
          ...shadows.lg,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          borderTopLeftRadius: borderRadius['2xl'],
          borderTopRightRadius: borderRadius['2xl'],
        },
        tabBarLabelStyle: {
          fontSize: typography.xs,
          fontWeight: typography.semibold,
          marginTop: spacing.xs,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingVertical: spacing.xs,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={focused ? 26 : 24} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Vocabulary" 
        component={VocabularyScreen}
        options={{
          title: 'Vocabulary',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'book' : 'book-outline'} 
              size={focused ? 26 : 24} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Learning" 
        component={LearningScreen}
        options={{
          title: 'Learning',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'school' : 'school-outline'} 
              size={focused ? 26 : 24} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Quiz" 
        component={QuizModeSelectionScreen}
        options={{
          title: 'Quiz',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'brain' : 'brain-outline'} 
              size={focused ? 26 : 24} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={QuizHistoryScreen}
        options={{
          title: 'History',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'time' : 'time-outline'} 
              size={focused ? 26 : 24} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
