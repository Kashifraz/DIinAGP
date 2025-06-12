import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import testService from '../services/testService';
import { showToast } from '../utils/toast';
import theme from '../config/theme';

const TestScreen = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await testService.checkHealth();
      setHealthStatus(response);
      showToast.success('Health check passed!', 'Success');
    } catch (error) {
      showToast.error(error.message || 'Failed to connect to server', 'Error');
      setHealthStatus({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testDatabase = async () => {
    setLoading(true);
    try {
      const response = await testService.checkDatabase();
      setDatabaseStatus(response);
      showToast.success('Database connection verified!', 'Success');
    } catch (error) {
      showToast.error(error.message || 'Failed to connect to database', 'Error');
      setDatabaseStatus({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Test Screen</Text>
          <Text style={styles.subtitle}>React Native Frontend Setup</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Connection Tests</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={testHealth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Test Health Endpoint</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testDatabase}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Test Database Endpoint</Text>
            )}
          </TouchableOpacity>
        </View>

        {healthStatus && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Health Check Result:</Text>
            <Text style={styles.resultText}>
              {JSON.stringify(healthStatus, null, 2)}
            </Text>
          </View>
        )}

        {databaseStatus && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Database Check Result:</Text>
            <Text style={styles.resultText}>
              {JSON.stringify(databaseStatus, null, 2)}
            </Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Project Information</Text>
          <Text style={styles.infoText}>
            • React Native with Expo{'\n'}
            • Navigation configured{'\n'}
            • API service layer ready{'\n'}
            • Theme configuration set up{'\n'}
            • Ready for feature development
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  button: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.onPrimary,
    fontWeight: '600',
  },
  resultSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.md,
  },
  resultTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  resultText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  infoSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.md,
  },
  infoTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
});

export default TestScreen;

