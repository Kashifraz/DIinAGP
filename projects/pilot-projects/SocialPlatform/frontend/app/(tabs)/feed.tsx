import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
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

interface Post {
  id: number;
  user_id: number;
  user_name: string;
  user_profile_photo: string | null;
  text: string | null;
  image_url: string | null;
  created_at: string;
}

interface LikeState {
  [postId: number]: { liked: boolean; count: number };
}

interface CommentCountState {
  [postId: number]: number;
}

const FeedScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [likeState, setLikeState] = useState<LikeState>({});
  const [commentCount, setCommentCount] = useState<CommentCountState>({});
  const [liking, setLiking] = useState<number | null>(null);
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUserId();
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      fetchLikesForPosts(posts.map(p => p.id));
      fetchCommentCounts(posts.map(p => p.id));
    }
  }, [posts]);

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

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const fetchLikesForPosts = async (postIds: number[]) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const newLikeState: LikeState = {};
      await Promise.all(postIds.map(async (postId) => {
        const countRes = await fetch(`${API_BASE_URL}/api/likes/count?post_id=${postId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        let count = 0;
        if (countRes.ok) {
          const data = await countRes.json();
          count = data.like_count;
        }
        newLikeState[postId] = { liked: false, count };
      }));
      setLikeState(newLikeState);
    } catch (err) {}
  };

  const fetchCommentCounts = async (postIds: number[]) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const newCommentCount: CommentCountState = {};
      await Promise.all(postIds.map(async (postId) => {
        const res = await fetch(`${API_BASE_URL}/api/comments?post_id=${postId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        let count = 0;
        if (res.ok) {
          const data = await res.json();
          count = data.comments.length;
        }
        newCommentCount[postId] = count;
      }));
      setCommentCount(newCommentCount);
    } catch (err) {}
  };

  const handleLike = async (postId: number) => {
    setLiking(postId);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/likes/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post_id: postId }),
      });
      if (response.ok) {
        const data = await response.json();
        setLikeState(prev => ({
          ...prev,
          [postId]: {
            liked: data.liked,
            count: prev[postId] ? (data.liked ? prev[postId].count + 1 : prev[postId].count - 1) : 1,
          },
        }));
      }
    } catch (err) {}
    setLiking(null);
  };

  const handleDelete = async (post_id: number) => {
    setDeleting(post_id);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/posts/${post_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setPosts(posts.filter(p => p.id !== post_id));
      } else {
        Alert.alert('Error', 'Failed to delete post');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
    setDeleting(null);
  };

  const handleEdit = (post: Post) => {
    router.push({ pathname: '/edit-post', params: { postId: post.id.toString() } });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Feed</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => router.push('/create-post')}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.createButtonText}>Create Post</Text>
        </TouchableOpacity>
        {loading ? <ActivityIndicator size="large" color="#007bff" /> : null}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {posts.length === 0 && !loading && <Text style={styles.noResults}>No posts found.</Text>}
        {posts.map(post => (
          <View key={post.id} style={styles.postItem}>
            <View style={styles.postHeader}>
              {post.user_profile_photo ? (
                <Image source={{ uri: `${API_BASE_URL}${post.user_profile_photo}` }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <FontAwesome name="user" size={24} color="#666" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{post.user_name}</Text>
                <Text style={styles.date}>{new Date(post.created_at).toLocaleString()}</Text>
              </View>
              {userId === post.user_id && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(post)}>
                    <MaterialIcons name="edit" size={20} color="#ffc107" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(post.id)} disabled={deleting === post.id}>
                    {deleting === post.id ? <ActivityIndicator color="#ff4444" /> : <MaterialIcons name="delete" size={20} color="#ff4444" />}
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {post.text ? <Text style={styles.postText}>{post.text}</Text> : null}
            {post.image_url ? (
              <Image source={{ uri: `${API_BASE_URL}${post.image_url}` }} style={styles.postImage} />
            ) : null}
            <View style={styles.likeCommentRow}>
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => handleLike(post.id)}
                disabled={liking === post.id}
              >
                <Ionicons
                  name={likeState[post.id]?.liked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={likeState[post.id]?.liked ? '#e0245e' : '#888'}
                />
                <Text style={styles.likeButtonText}>{likeState[post.id]?.count || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.commentButton}
                onPress={() => router.push({ pathname: '/comments', params: { postId: post.id.toString() } })}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#007bff" />
                <Text style={styles.commentButtonText}>{commentCount[post.id] || 0}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  createButton: { flexDirection: 'row', backgroundColor: '#007bff', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16, alignSelf: 'center', minWidth: 160, justifyContent: 'center' },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 8 },
  noResults: { textAlign: 'center', color: '#999', marginBottom: 16 },
  postItem: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 20, shadowColor: '#007bff', shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#007bff' },
  placeholderImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#007bff' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  date: { fontSize: 12, color: '#888' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  iconButton: { padding: 6, marginLeft: 2 },
  postText: { fontSize: 16, color: '#333', marginBottom: 8 },
  postImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 8, resizeMode: 'cover', borderWidth: 1, borderColor: '#007bff' },
  likeCommentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 4, gap: 16 },
  likeButton: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  likeButtonText: { marginLeft: 4, color: '#e0245e', fontWeight: 'bold', fontSize: 15 },
  commentButton: { flexDirection: 'row', alignItems: 'center' },
  commentButtonText: { marginLeft: 4, color: '#007bff', fontWeight: 'bold', fontSize: 15 },
});

export default FeedScreen; 