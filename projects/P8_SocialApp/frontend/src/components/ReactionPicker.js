import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../config/theme';

const REACTION_TYPES = [
  { type: 'HEART', emoji: '❤️', label: 'Love', icon: 'heart' },
  { type: 'THUMBS_UP', emoji: '👍', label: 'Like', icon: 'thumbs-up' },
  { type: 'LAUGH', emoji: '😂', label: 'Funny', icon: 'happy' },
  { type: 'SAD', emoji: '😢', label: 'Sad', icon: 'sad' },
  { type: 'ANGRY', emoji: '😠', label: 'Angry', icon: 'flash' },
  { type: 'THUMBS_DOWN', emoji: '👎', label: 'Dislike', icon: 'thumbs-down' },
];

const ReactionPicker = ({ visible, onClose, onReactionSelect, currentReaction }) => {
  const handleReactionSelect = (reactionType) => {
    onReactionSelect(reactionType);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <View style={styles.picker}>
            <Text style={styles.title}>Choose a reaction</Text>
            <View style={styles.reactionsRow}>
              {REACTION_TYPES.map((reaction) => {
                const isSelected = currentReaction === reaction.type;
                return (
                  <TouchableOpacity
                    key={reaction.type}
                    style={[
                      styles.reactionButton,
                      isSelected && styles.reactionButtonSelected,
                    ]}
                    onPress={() => handleReactionSelect(reaction.type)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emoji}>{reaction.emoji}</Text>
                    <Text style={[
                      styles.label,
                      isSelected && styles.labelSelected,
                    ]}>
                      {reaction.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
  },
  picker: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  reactionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    margin: theme.spacing.xs,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.background,
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reactionButtonSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  emoji: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  labelSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  cancelText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});

export default ReactionPicker;

