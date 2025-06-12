import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

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

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  user_name: string;
  user_profile_photo: string | null;
  text: string;
  created_at: string;
}

const CommentsScreen: React.FC = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserId();
    fetchComments();
  }, []);

  const fetchUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserId(data.id);
      }
    } catch (err) {}
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/comments?post_id=${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: Number(postId), text: commentText }),
      });
      if (response.ok) {
        setCommentText('');
        fetchComments();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Failed to add comment');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (comment_id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/comments/${comment_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        fetchComments();
      } else {
        Alert.alert('Error', 'Failed to delete comment');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Comments</Text>
        {loading ? <ActivityIndicator size="large" color="#007bff" /> : null}
        {comments.length === 0 && !loading && <Text style={styles.noResults}>No comments yet.</Text>}
        {comments.map(comment => (
          <View key={comment.id} style={styles.commentItem}>
            {comment.user_profile_photo ? (
              <Image source={{ uri: `${API_BASE_URL}${comment.user_profile_photo}` }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person-circle-outline" size={28} color="#666" />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{comment.user_name}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
              <Text style={styles.date}>{new Date(comment.created_at).toLocaleString()}</Text>
            </View>
            {userId === comment.user_id && (
              <TouchableOpacity style={styles.deleteIconButton} onPress={() => handleDeleteComment(comment.id)}>
                <MaterialIcons name="delete" size={22} color="#ff4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <View style={styles.addCommentSection}>
          <View style={styles.textAreaContainerFull}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.textAreaFull}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
          </View>
          <TouchableOpacity style={styles.addIconButton} onPress={handleAddComment} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={22} color="#fff" />}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={18} color="#333" style={{ marginRight: 4 }} />
          <Text style={styles.cancelButtonText}>Back</Text>
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 24, alignSelf: 'center', letterSpacing: 1 },
  noResults: { textAlign: 'center', color: '#999', marginBottom: 16 },
  commentItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, shadowColor: '#007bff', shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#007bff' },
  placeholderImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#007bff' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  commentText: { fontSize: 16, color: '#333', marginBottom: 4 },
  date: { fontSize: 12, color: '#888' },
  deleteIconButton: { padding: 6, marginLeft: 2 },
  addCommentSection: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 16, marginBottom: 24, gap: 8 },
  textAreaContainerFull: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  textAreaFull: {
    flex: 1,
    minHeight: 40,
    fontSize: 16,
    color: '#222',
    paddingTop: 4,
  },
  inputIcon: { marginRight: 8, marginTop: 4 },
  addIconButton: { backgroundColor: '#007bff', borderRadius: 8, padding: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8, width: 36, height: 36 },
  cancelButton: { flexDirection: 'row', backgroundColor: '#e0e0e0', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 24, justifyContent: 'center', alignSelf: 'center', marginTop: 8, width: '100%' },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
});

export default CommentsScreen; 