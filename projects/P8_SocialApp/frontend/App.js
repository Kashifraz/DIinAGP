import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import TestScreen from './src/screens/TestScreen';
import theme from './src/config/theme';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.onPrimary,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {isAuthenticated ? (
            <>
              <Stack.Screen 
                name="MainDrawer" 
                component={DrawerNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="EditProfile" 
                component={EditProfileScreen}
                options={{ title: 'Edit Profile' }}
              />
              <Stack.Screen 
                name="PostDetail" 
                component={PostDetailScreen}
                options={{ title: 'Post' }}
              />
              <Stack.Screen 
                name="CreatePost" 
                component={CreatePostScreen}
                options={{ title: 'Create Post' }}
              />
              <Stack.Screen 
                name="UserProfile" 
                component={ProfileScreen}
                options={{ title: 'User Profile' }}
              />
              <Stack.Screen 
                name="TestScreen" 
                component={TestScreen}
                options={{ title: 'Test Screen' }}
              />
            </>
          ) : (
            <Stack.Screen 
              name="Auth" 
              component={AuthNavigator}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NotificationProvider>
          <AppNavigator />
        </NotificationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

