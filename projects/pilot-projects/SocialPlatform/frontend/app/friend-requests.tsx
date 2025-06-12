import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
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

interface FriendRequest {
  id: number;
  from_user_id: number;
  to_user_id: number;
  status: string;
  created_at: string;
  from_user: { id: number; name: string; profile_photo: string | null } | null;
  to_user: { id: number; name: string; profile_photo: string | null } | null;
}

const FriendRequestsScreen: React.FC = () => {
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/friends/requests`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setIncoming(data.incoming);
        setOutgoing(data.outgoing);
      }
    } catch (err) {
      // ignore
    }
    setLoading(false);
  };

  const handleRespond = async (request_id: number, action: 'accept' | 'reject') => {
    setResponding(request_id);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/friends/request/${request_id}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        Alert.alert('Success', `Request ${action}ed!`);
        fetchRequests();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Failed to respond');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
    setResponding(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Friend Requests</Text>
        {loading ? <ActivityIndicator size="large" color="#007bff" /> : null}
        <Text style={styles.sectionTitle}>Incoming Requests</Text>
        {incoming.length === 0 && <Text style={styles.noResults}>No incoming requests.</Text>}
        {incoming.map(req => (
          <View key={req.id} style={styles.requestItem}>
            {req.from_user && req.from_user.profile_photo ? (
              <Image source={{ uri: `${API_BASE_URL}${req.from_user.profile_photo}` }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>{req.from_user?.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{req.from_user?.name}</Text>
              <Text style={styles.status}>Status: {req.status}</Text>
            </View>
            {req.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#28a745' }]}
                  onPress={() => handleRespond(req.id, 'accept')}
                  disabled={responding === req.id}
                >
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#ff4444' }]}
                  onPress={() => handleRespond(req.id, 'reject')}
                  disabled={responding === req.id}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        <Text style={styles.sectionTitle}>Outgoing Requests</Text>
        {outgoing.length === 0 && <Text style={styles.noResults}>No outgoing requests.</Text>}
        {outgoing.map(req => (
          <View key={req.id} style={styles.requestItem}>
            {req.to_user && req.to_user.profile_photo ? (
              <Image source={{ uri: `${API_BASE_URL}${req.to_user.profile_photo}` }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>{req.to_user?.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{req.to_user?.name}</Text>
              <Text style={styles.status}>Status: {req.status}</Text>
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#007bff', marginTop: 16, marginBottom: 8 },
  noResults: { textAlign: 'center', color: '#999', marginBottom: 16 },
  requestItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  profileImage: { width: 48, height: 48, borderRadius: 24, marginRight: 16 },
  placeholderImage: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  placeholderText: { fontSize: 20, fontWeight: 'bold', color: '#666' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  status: { fontSize: 14, color: '#666' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8, borderRadius: 8, marginLeft: 8 },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cancelButton: { backgroundColor: '#e0e0e0', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 24 },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
});

export default FriendRequestsScreen; 