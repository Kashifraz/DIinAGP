import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }
  return 'http://192.168.1.100:5000'; // <-- Replace with your actual local IP
};

const API_BASE_URL = getApiBaseUrl();

interface User {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  profile_photo: string | null;
  created_at: string;
}

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        router.replace('/login');
      } else {
        Alert.alert('Error', 'Failed to load profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#ff4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            {user.profile_photo ? (
              <Image
                source={{ uri: `${API_BASE_URL}${user.profile_photo}` }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <FontAwesome name="user" size={60} color="#666" />
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={20} color="#007bff" style={styles.infoIcon} />
            <Text style={styles.name}>{user.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color="#007bff" style={styles.infoIcon} />
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#007bff" style={styles.infoIcon} />
            <Text style={styles.date}>Joined {new Date(user.created_at).toLocaleDateString()}</Text>
          </View>
          {user.bio ? (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={20} color="#007bff" style={styles.infoIcon} />
              <Text style={styles.bio}>{user.bio}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => router.push('/profile-update')}
        >
          <MaterialIcons name="edit" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.updateButtonText}>Update Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.friendRequestsButton}
          onPress={() => router.push('/friend-requests')}
        >
          <Ionicons name="person-add-outline" size={18} color="#222" style={{ marginRight: 6 }} />
          <Text style={styles.friendRequestsButtonText}>Friend Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.friendsListButton}
          onPress={() => router.push('/friends-list')}
        >
          <Ionicons name="people-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.friendsListButtonText}>Friends List</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    marginTop: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    letterSpacing: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#ffeaea',
    borderRadius: 6,
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007bff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  bio: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
  },
  updateButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
    minWidth: 160,
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  friendRequestsButton: {
    flexDirection: 'row',
    backgroundColor: '#ffc107',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
    minWidth: 160,
    justifyContent: 'center',
  },
  friendRequestsButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
  friendsListButton: {
    flexDirection: 'row',
    backgroundColor: '#6f42c1',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
    minWidth: 160,
    justifyContent: 'center',
  },
  friendsListButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default ProfileScreen;
