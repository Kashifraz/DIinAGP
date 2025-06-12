import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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

const ProfileUpdateScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
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
        const user = await response.json();
        setName(user.name);
        setBio(user.bio || '');
        setProfilePhoto(user.profile_photo ? `${API_BASE_URL}${user.profile_photo}` : null);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, bio }),
      });
      if (response.ok) {
        setMessage('Profile updated!');
        setTimeout(() => router.replace('/profile'), 1200);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error');
    }
    setSaving(false);
  };

  const handlePickImage = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        if (input.files && input.files[0]) {
          uploadPhotoWeb(input.files[0]);
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
        uploadPhoto(result.assets[0].uri);
      }
    }
  };

  const uploadPhotoWeb = async (file: File) => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const formData = new FormData();
      formData.append('photo', file);
      const response = await fetch(`${API_BASE_URL}/api/profile/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData as any,
      });
      if (response.ok) {
        const data = await response.json();
        setProfilePhoto(`${API_BASE_URL}${data.profile_photo}`);
        setMessage('Profile photo updated!');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to upload photo');
      }
    } catch (err) {
      setError('Network error');
    }
    setSaving(false);
  };

  const uploadPhoto = async (uri: string) => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const formData = new FormData();
      formData.append('photo', {
        uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);
      const response = await fetch(`${API_BASE_URL}/api/profile/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData as any,
      });
      if (response.ok) {
        const data = await response.json();
        setProfilePhoto(`${API_BASE_URL}${data.profile_photo}`);
        setMessage('Profile photo updated!');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to upload photo');
      }
    } catch (err) {
      setError('Network error');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Update Profile</Text>
        {message && <Text style={styles.successText}>{message}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <FontAwesome name="user" size={60} color="#666" />
            </View>
          )}
          <Text style={styles.changePhotoText}><Ionicons name="camera" size={16} color="#007bff" /> Change Photo</Text>
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={22} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="information-circle-outline" size={22} color="#888" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
          />
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <><MaterialIcons name="save" size={18} color="#fff" style={{ marginRight: 4 }} /><Text style={styles.saveButtonText}>Save</Text></>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.replace('/profile')}>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 24, alignSelf: 'center', letterSpacing: 1 },
  successText: { color: 'green', fontSize: 16, textAlign: 'center', marginBottom: 8 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 8 },
  imageContainer: { alignItems: 'center', marginBottom: 24 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#007bff' },
  placeholderImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#007bff' },
  changePhotoText: { color: '#007bff', marginTop: 8, fontWeight: 'bold', fontSize: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 16, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 16, color: '#222' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 24, gap: 12 },
  saveButton: { flexDirection: 'row', backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6, alignItems: 'center', marginRight: 8 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelButton: { flexDirection: 'row', backgroundColor: '#e0e0e0', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6, alignItems: 'center', marginLeft: 8 },
  cancelButtonText: { color: '#333', fontWeight: 'bold', fontSize: 15 },
});

export default ProfileUpdateScreen;
