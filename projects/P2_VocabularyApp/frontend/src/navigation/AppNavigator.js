import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import QuizScreen from '../screens/QuizScreen';
import QuizStatisticsScreen from '../screens/QuizStatisticsScreen';
import QuizReviewScreen from '../screens/QuizReviewScreen';

// Import navigators
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
    <Stack.Screen name="Quiz" component={QuizScreen} />
    <Stack.Screen name="QuizStatistics" component={QuizStatisticsScreen} />
    <Stack.Screen name="QuizReview" component={QuizReviewScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🔵 AppNavigator - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
