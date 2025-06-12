import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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

const CreatePostScreen: React.FC = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePickImage = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        if (input.files && input.files[0]) {
          const file = input.files[0];
          setImage(URL.createObjectURL(file));
          (setImage as any).file = file; // Store file for upload
        }
      };
      input.click();
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const formData = new FormData();
      if (text) formData.append('text', text);
      if (Platform.OS === 'web' && (setImage as any).file) {
        formData.append('image', (setImage as any).file);
      } else if (image && Platform.OS !== 'web') {
        formData.append('image', {
          uri: image,
          name: 'post.jpg',
          type: 'image/jpeg',
        } as any);
      }
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData as any,
      });
      if (response.ok) {
        setMessage('Post created!');
        setTimeout(() => router.replace('/feed'), 1200);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Post</Text>
        {message && <Text style={styles.successText}>{message}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.fullWidthSection}>
          <View style={styles.textAreaContainerFull}>
            <Ionicons name="create-outline" size={22} color="#888" style={styles.inputIcon} />
        <TextInput
              style={styles.textAreaFull}
          placeholder="What's on your mind?"
          value={text}
          onChangeText={setText}
          multiline
        />
          </View>
          <TouchableOpacity style={styles.imagePickerButtonFull} onPress={handlePickImage}>
            <Ionicons name="image" size={24} color="#007bff" />
            <Text style={styles.imagePickerText}>{image ? 'Change' : 'Add'} Image</Text>
        </TouchableOpacity>
        </View>
        {image && (
          <Image source={{ uri: image }} style={styles.previewImage} />
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.postButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <><MaterialIcons name="send" size={18} color="#fff" style={{ marginRight: 4 }} /><Text style={styles.postButtonText}>Post</Text></>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.replace('/feed')}>
            <MaterialIcons name="cancel" size={18} color="#333" style={{ marginRight: 4 }} />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        </View>
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
  successText: { color: 'green', fontSize: 16, textAlign: 'center', marginBottom: 8 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 8 },
  fullWidthSection: {
    width: '100%',
    marginBottom: 16,
  },
  textAreaContainerFull: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    width: '100%',
  },
  textAreaFull: {
    flex: 1,
    minHeight: 80,
    fontSize: 16,
    color: '#222',
    paddingTop: 4,
  },
  imagePickerButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9f2ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    width: '100%',
    justifyContent: 'center',
  },
  imagePickerText: { color: '#007bff', fontWeight: 'bold', fontSize: 15, marginLeft: 6 },
  previewImage: { width: 200, height: 200, borderRadius: 8, alignSelf: 'center', marginBottom: 16, marginTop: 8, borderWidth: 2, borderColor: '#007bff' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 24, gap: 12 },
  postButton: { flexDirection: 'row', backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6, alignItems: 'center', marginRight: 8 },
  postButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelButton: { flexDirection: 'row', backgroundColor: '#e0e0e0', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6, alignItems: 'center', marginLeft: 8 },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: 15 },
  inputIcon: { marginRight: 8, marginTop: 4 },
});

export default CreatePostScreen; 