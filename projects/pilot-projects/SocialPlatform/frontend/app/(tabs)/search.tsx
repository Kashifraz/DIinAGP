import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Image, Alert, Platform } from 'react-native';
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
}

interface FriendRequest {
  to_user_id: number;
  from_user_id: number;
  status: string;
}

interface Friend {
  id: number;
  name: string;
  email: string;
  profile_photo: string | null;
  bio: string | null;
}

const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sending, setSending] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchFriendData();
  }, []);

  const fetchFriendData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      // Get friend requests
      const reqRes = await fetch(`${API_BASE_URL}/api/friends/requests`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (reqRes.ok) {
        const data = await reqRes.json();
        setFriendRequests([
          ...data.incoming,
          ...data.outgoing,
        ]);
      }
      // Get friends
      const frRes = await fetch(`${API_BASE_URL}/api/friends/list`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (frRes.ok) {
        const data = await frRes.json();
        setFriends(data.friends);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/profile/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data.users);
      } else {
        setResults([]);
        Alert.alert('Error', 'No users found');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
    setLoading(false);
  };

  const handleSendRequest = async (to_user_id: number) => {
    setSending(to_user_id);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to_user_id }),
      });
      if (response.ok) {
        Alert.alert('Success', 'Friend request sent!');
        fetchFriendData();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Failed to send request');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
    setSending(null);
  };

  const getButtonState = (user: User) => {
    if (friends.some(f => f.id === user.id)) {
      return { label: 'Friends', disabled: true };
    }
    if (friendRequests.some(fr => fr.to_user_id === user.id && fr.status === 'pending')) {
      return { label: 'Request Sent', disabled: true };
    }
    if (friendRequests.some(fr => fr.from_user_id === user.id && fr.status === 'pending')) {
      return { label: 'Requested You', disabled: true };
    }
    return { label: 'Send Friend Request', disabled: false };
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 36 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Search Users</Text>
        <View style={styles.searchInputRow}>
          <Ionicons name="search" size={22} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search by name or email"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchIconButton} onPress={handleSearch} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="search" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={results}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const { label, disabled } = getButtonState(item);
          return (
            <View style={styles.userItem}>
              {item.profile_photo ? (
                <Image source={{ uri: `${API_BASE_URL}${item.profile_photo}` }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <FontAwesome name="user" size={24} color="#666" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <TouchableOpacity
                style={[styles.requestIconButton, disabled && styles.disabledButton]}
                disabled={disabled || sending === item.id}
                onPress={() => handleSendRequest(item.id)}
              >
                {sending === item.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  label === 'Friends' ? <MaterialIcons name="check-circle" size={22} color="#fff" /> :
                  label === 'Request Sent' ? <MaterialIcons name="hourglass-top" size={22} color="#fff" /> :
                  label === 'Requested You' ? <MaterialIcons name="person-add-alt-1" size={22} color="#fff" /> :
                  <MaterialIcons name="person-add" size={22} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.noResults}>No users found.</Text>}
        style={{ marginTop: 24 }}
        contentContainerStyle={styles.flatListContent}
      />
      <TouchableOpacity style={styles.cancelButton} onPress={() => router.replace('/profile')}>
        <MaterialIcons name="arrow-back" size={18} color="#333" style={{ marginRight: 4 }} />
        <Text style={styles.cancelButtonText}>Back to Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 40,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20, marginTop: 36 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 24, alignSelf: 'center', letterSpacing: 1 },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 8, marginBottom: 16 },
  inputIcon: { marginRight: 6 },
  input: { flex: 1, fontSize: 16, paddingVertical: 10, backgroundColor: 'transparent' },
  searchIconButton: { backgroundColor: '#007bff', borderRadius: 8, padding: 8, marginLeft: 6, alignItems: 'center', justifyContent: 'center', width: 36, height: 36 },
  userItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, shadowColor: '#007bff', shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  profileImage: { width: 48, height: 48, borderRadius: 24, marginRight: 16, borderWidth: 1, borderColor: '#007bff' },
  placeholderImage: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#007bff' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  email: { fontSize: 14, color: '#666' },
  noResults: { textAlign: 'center', color: '#999', marginTop: 32 },
  requestIconButton: { backgroundColor: '#28a745', borderRadius: 8, padding: 8, alignItems: 'center', justifyContent: 'center', minWidth: 36, minHeight: 36 },
  disabledButton: { backgroundColor: '#ccc' },
  cancelButton: { flexDirection: 'row', backgroundColor: '#e0e0e0', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 24, justifyContent: 'center', alignSelf: 'center', width: '100%' },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
});

export default SearchScreen; 