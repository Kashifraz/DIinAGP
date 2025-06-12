import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../config/theme';

const REACTION_EMOJIS = {
  HEART: '❤️',
  THUMBS_UP: '👍',
  LAUGH: '😂',
  SAD: '😢',
  ANGRY: '😠',
  THUMBS_DOWN: '👎',
};

const ReactionSummary = ({ 
  heartCount = 0,
  thumbsUpCount = 0,
  laughCount = 0,
  sadCount = 0,
  angryCount = 0,
  thumbsDownCount = 0,
  userReaction = null,
  onPress,
  compact = false,
}) => {
  // Build summary string with only non-zero counts
  const buildSummary = () => {
    const parts = [];
    
    if (heartCount > 0) parts.push(`${heartCount} ${REACTION_EMOJIS.HEART}`);
    if (thumbsUpCount > 0) parts.push(`${thumbsUpCount} ${REACTION_EMOJIS.THUMBS_UP}`);
    if (laughCount > 0) parts.push(`${laughCount} ${REACTION_EMOJIS.LAUGH}`);
    if (sadCount > 0) parts.push(`${sadCount} ${REACTION_EMOJIS.SAD}`);
    if (angryCount > 0) parts.push(`${angryCount} ${REACTION_EMOJIS.ANGRY}`);
    if (thumbsDownCount > 0) parts.push(`${thumbsDownCount} ${REACTION_EMOJIS.THUMBS_DOWN}`);
    
    return parts.length > 0 ? parts.join(', ') : 'No reactions yet';
  };

  const totalCount = heartCount + thumbsUpCount + laughCount + sadCount + angryCount + thumbsDownCount;

  if (compact) {
    // Compact view: just show total count and user's reaction if any
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        {userReaction && (
          <Text style={styles.userReactionEmoji}>
            {REACTION_EMOJIS[userReaction]}
          </Text>
        )}
        {totalCount > 0 && (
          <Text style={styles.compactCount}>{totalCount}</Text>
        )}
      </TouchableOpacity>
    );
  }

  // Full view: show summary text
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text style={styles.summaryText}>{buildSummary()}</Text>
      {userReaction && (
        <View style={styles.userReactionBadge}>
          <Text style={styles.userReactionEmoji}>
            {REACTION_EMOJIS[userReaction]}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  summaryText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  userReactionBadge: {
    marginLeft: theme.spacing.xs,
    padding: 2,
  },
  userReactionEmoji: {
    fontSize: 16,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  compactCount: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});

export default ReactionSummary;

