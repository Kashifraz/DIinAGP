import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { showToast } from '../utils/toast';
import theme from '../config/theme';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    showToast.info('You have been logged out', 'Logout Successful');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>You're successfully logged in</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email}</Text>
          
          <Text style={[styles.label, { marginTop: theme.spacing.md }]}>Full Name:</Text>
          <Text style={styles.value}>{user?.fullName}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="View Profile"
            onPress={() => navigation.navigate('Profile')}
            fullWidth
            style={styles.profileButton}
          />
          <Button
            title="Search Users"
            onPress={() => navigation.navigate('Search')}
            fullWidth
            style={styles.searchButton}
          />
          <Button
            title="Friend Requests"
            onPress={() => navigation.navigate('FriendRequests')}
            fullWidth
            style={styles.friendRequestsButton}
          />
          <Button
            title="My Friends"
            onPress={() => navigation.navigate('FriendsList')}
            fullWidth
            style={styles.friendsListButton}
          />
          <Button
            title="Feed"
            onPress={() => navigation.navigate('PostFeed')}
            fullWidth
            style={styles.feedButton}
          />
          <Button
            title="Create Post"
            onPress={() => navigation.navigate('CreatePost')}
            fullWidth
            style={styles.createPostButton}
          />
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            style={styles.logoutButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  userInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.xl,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
  },
  profileButton: {
    marginBottom: theme.spacing.md,
  },
  searchButton: {
    marginBottom: theme.spacing.md,
  },
  friendRequestsButton: {
    marginBottom: theme.spacing.md,
  },
  friendsListButton: {
    marginBottom: theme.spacing.md,
  },
  feedButton: {
    marginBottom: theme.spacing.md,
  },
  createPostButton: {
    marginBottom: theme.spacing.md,
  },
  logoutButton: {
    marginTop: 0,
  },
});

export default HomeScreen;

