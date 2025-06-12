import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface Friend {
  id: number;
  name: string;
  email: string;
  profile_photo: string | null;
  bio: string | null;
}

const FriendsListScreen: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/friends/list`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends);
      }
    } catch (err) {
      // ignore
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Friends List</Text>
        {loading ? <ActivityIndicator size="large" color="#007bff" /> : null}
        {friends.length === 0 && !loading && <Text style={styles.noResults}>No friends found.</Text>}
        {friends.map(friend => (
          <View key={friend.id} style={styles.friendItem}>
            {friend.profile_photo ? (
              <Image source={{ uri: `${API_BASE_URL}${friend.profile_photo}` }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>{friend.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{friend.name}</Text>
              <Text style={styles.email}>{friend.email}</Text>
              {friend.bio && <Text style={styles.bio}>{friend.bio}</Text>}
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.replace('/profile')}>
          <Text style={styles.cancelButtonText}>Back to Profile</Text>
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
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20, marginTop: 36 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 24, alignSelf: 'center' },
  noResults: { textAlign: 'center', color: '#999', marginBottom: 16 },
  friendItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  profileImage: { width: 48, height: 48, borderRadius: 24, marginRight: 16 },
  placeholderImage: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  placeholderText: { fontSize: 20, fontWeight: 'bold', color: '#666' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  email: { fontSize: 14, color: '#666' },
  bio: { fontSize: 14, color: '#333' },
  cancelButton: { backgroundColor: '#e0e0e0', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 24 },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
});

export default FriendsListScreen; 