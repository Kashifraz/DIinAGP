import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';

const Toast = ({ 
  visible, 
  message, 
  type = 'success', 
  duration = 3000, 
  onHide 
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) {
        onHide();
      }
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success,
          borderLeftColor: colors.successLight,
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          borderLeftColor: colors.errorLight,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          borderLeftColor: colors.secondaryLight,
        };
      case 'info':
        return {
          backgroundColor: colors.info,
          borderLeftColor: colors.primaryLight,
        };
      default:
        return {
          backgroundColor: colors.success,
          borderLeftColor: colors.successLight,
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '✅';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.toast, getToastStyle()]}>
        <TouchableOpacity
          style={styles.toastContent}
          onPress={hideToast}
          activeOpacity={0.8}
        >
          <Text style={styles.icon}>{getIcon()}</Text>
          <Text style={styles.message}>{message}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  toast: {
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    ...shadows.lg,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  icon: {
    fontSize: typography.lg,
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.medium,
    lineHeight: typography.normal * typography.base,
  },
});

export default Toast;
