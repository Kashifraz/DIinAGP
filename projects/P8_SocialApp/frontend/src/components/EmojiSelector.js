import React from 'react';
import EmojiPicker from 'rn-emoji-keyboard';
import theme from '../config/theme';

const EmojiSelector = ({ visible, onClose, onEmojiSelect }) => {
  const handleEmojiSelected = (emojiObject) => {
    // rn-emoji-keyboard returns an object with emoji property
    const emoji = emojiObject.emoji || emojiObject;
    if (onEmojiSelect) {
      onEmojiSelect(emoji);
    }
  };

  return (
    <EmojiPicker
      onEmojiSelected={handleEmojiSelected}
      open={visible}
      onClose={onClose}
      // Customize theme to match app theme
      theme={{
        // You can customize colors here if needed
        // The package has built-in themes: light, dark, auto
      }}
      // Enable search for better UX
      enableSearchBar={true}
      // Enable category buttons
      categoryOrder={[
        'smileys',
        'people',
        'animals',
        'food',
        'activities',
        'travel',
        'objects',
        'symbols',
        'flags',
      ]}
    />
  );
};

export default EmojiSelector;
