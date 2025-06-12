import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../config/theme';

const ProfilePhoto = ({ 
  photoUrl, 
  size = 100, 
  onPress, 
  editable = false,
  style 
}) => {
  const imageSource = photoUrl 
    ? { uri: photoUrl }
    : null;

  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
    style,
  ];

  const imageStyle = [
    styles.image,
    { width: size, height: size, borderRadius: size / 2 },
  ];

  const renderContent = () => {
    if (imageSource) {
      return <Image source={imageSource} style={imageStyle} />;
    } else {
      // Placeholder with user icon
      return (
        <View style={[imageStyle, styles.placeholder]}>
          <Ionicons 
            name="person" 
            size={size * 0.5} 
            color={theme.colors.primary} 
          />
        </View>
      );
    }
  };

  if (onPress || editable) {
    return (
      <TouchableOpacity 
        style={styles.wrapper}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={containerStyle}>
          {renderContent()}
        </View>
        {editable && (
          <View style={[styles.addButton, { 
            width: size * 0.35, 
            height: size * 0.35,
            borderRadius: size * 0.175,
          }]}>
            <Ionicons 
              name="add" 
              size={size * 0.2} 
              color={theme.colors.onPrimary} 
            />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    position: 'relative',
    backgroundColor: theme.colors.primaryLight,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
});

export default ProfilePhoto;

