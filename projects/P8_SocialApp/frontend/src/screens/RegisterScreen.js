import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import { showToast } from '../utils/toast';
import theme from '../config/theme';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Calculate password strength
  const getPasswordStrength = (passwordValue) => {
    if (!passwordValue) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (passwordValue.length >= 6) strength++;
    if (passwordValue.length >= 8) strength++;
    if (/[a-z]/.test(passwordValue) && /[A-Z]/.test(passwordValue)) strength++;
    if (/\d/.test(passwordValue)) strength++;
    if (/[^a-zA-Z0-9]/.test(passwordValue)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#30D158'];
    
    return {
      strength: Math.min(strength, 4),
      label: labels[Math.min(strength, 4)],
      color: colors[Math.min(strength, 4)],
    };
  };

  // Enhanced full name validation
  const validateFullName = (nameValue) => {
    if (!nameValue || !nameValue.trim()) {
      return 'Full name is required';
    }
    const trimmedName = nameValue.trim();
    if (trimmedName.length < 2) {
      return 'Full name must be at least 2 characters';
    }
    if (trimmedName.length > 100) {
      return 'Full name is too long (max 100 characters)';
    }
    // Allow letters, spaces, hyphens, apostrophes, and common international characters
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedName)) {
      return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }
    // Check for at least one letter (not just spaces/special chars)
    if (!/[a-zA-ZÀ-ÿ]/.test(trimmedName)) {
      return 'Full name must contain at least one letter';
    }
    return null;
  };

  // Enhanced email validation
  const validateEmail = (emailValue) => {
    if (!emailValue || !emailValue.trim()) {
      return 'Email is required';
    }
    const trimmedEmail = emailValue.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return 'Please enter a valid email address';
    }
    if (trimmedEmail.length > 254) {
      return 'Email is too long (max 254 characters)';
    }
    return null;
  };

  // Enhanced password validation
  const validatePassword = (passwordValue) => {
    if (!passwordValue) {
      return 'Password is required';
    }
    if (passwordValue.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (passwordValue.length > 128) {
      return 'Password is too long (max 128 characters)';
    }
    return null;
  };

  // Validate confirm password
  const validateConfirmPassword = (confirmValue, passwordValue) => {
    if (!confirmValue) {
      return 'Please confirm your password';
    }
    if (confirmValue !== passwordValue) {
      return 'Passwords do not match';
    }
    return null;
  };

  // Validate single field
  const validateField = (fieldName, value, compareValue = null) => {
    let error = null;
    switch (fieldName) {
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, compareValue || password);
        break;
      default:
        break;
    }
    return error;
  };

  // Validate all fields
  const validate = () => {
    const newErrors = {};
    const fullNameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);

    if (fullNameError) newErrors.fullName = fullNameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      !validateFullName(fullName) &&
      !validateEmail(email) &&
      !validatePassword(password) &&
      !validateConfirmPassword(confirmPassword, password)
    );
  };

  // Handle field change with real-time validation
  const handleFieldChange = (fieldName, value) => {
    switch (fieldName) {
      case 'fullName':
        setFullName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        // Re-validate confirm password if it's been touched
        if (touched.confirmPassword) {
          const confirmError = validateConfirmPassword(confirmPassword, value);
          if (confirmError) {
            setErrors({ ...errors, confirmPassword: confirmError });
          } else {
            const newErrors = { ...errors };
            delete newErrors.confirmPassword;
            setErrors(newErrors);
          }
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      default:
        break;
    }

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: null });
    }

    // Real-time validation if field has been touched
    if (touched[fieldName]) {
      const compareValue = fieldName === 'confirmPassword' ? password : null;
      const error = validateField(fieldName, value, compareValue);
      if (error) {
        setErrors({ ...errors, [fieldName]: error });
      } else {
        const newErrors = { ...errors };
        delete newErrors[fieldName];
        setErrors(newErrors);
      }
    }
  };

  // Handle field blur - validate on blur
  const handleFieldBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
    let value;
    let compareValue = null;
    switch (fieldName) {
      case 'fullName':
        value = fullName;
        break;
      case 'email':
        value = email;
        break;
      case 'password':
        value = password;
        break;
      case 'confirmPassword':
        value = confirmPassword;
        compareValue = password;
        break;
      default:
        break;
    }
    const error = validateField(fieldName, value, compareValue);
    if (error) {
      setErrors({ ...errors, [fieldName]: error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    const result = await register(email.trim().toLowerCase(), password, fullName.trim());
    setLoading(false);

    if (result.success) {
      showToast.success('Account created successfully!', 'Registration Successful');
    } else {
      showToast.error(result.message || 'Registration failed. Please try again.', 'Registration Failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add" size={48} color={theme.colors.primary} />
            </View>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to join our community</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.form}>
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={(text) => handleFieldChange('fullName', text)}
              onBlur={() => handleFieldBlur('fullName')}
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoComplete="name"
              error={errors.fullName}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={(text) => handleFieldChange('email', text)}
              onBlur={() => handleFieldBlur('email')}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <View>
              <Input
                label="Password"
                value={password}
                onChangeText={(text) => handleFieldChange('password', text)}
                onBlur={() => handleFieldBlur('password')}
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="password-new"
                error={errors.password}
              />
              {password && !errors.password && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.passwordStrengthBar}>
                    {[0, 1, 2, 3, 4].map((index) => (
                      <View
                        key={index}
                        style={[
                          styles.passwordStrengthSegment,
                          index <= passwordStrength.strength && {
                            backgroundColor: passwordStrength.color,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              )}
            </View>

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => handleFieldChange('confirmPassword', text)}
              onBlur={() => handleFieldBlur('confirmPassword')}
              placeholder="Confirm your password"
              secureTextEntry
              autoComplete="password-new"
              error={errors.confirmPassword}
            />

            <TouchableOpacity
              style={[
                styles.registerButton,
                (loading || !isFormValid()) && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading || !isFormValid()}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Create Account</Text>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.onPrimary} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary + '30',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: '700',
    fontSize: 32,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  form: {
    width: '100%',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md + 4,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 16,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.xs,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    backgroundColor: theme.colors.textSecondary + '60',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.onPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  linkText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  passwordStrengthContainer: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: theme.spacing.xs,
  },
  passwordStrengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  passwordStrengthText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
});

export default RegisterScreen;

