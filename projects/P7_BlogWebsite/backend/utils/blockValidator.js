/**
 * Valid block types
 */
export const BLOCK_TYPES = [
  'paragraph',
  'heading',
  'image',
  'code',
  'authorBox',
  'tableOfContents',
  'quiz',
  'poll',
  'carousel'
];

/**
 * Validate a single content block
 * @param {Object} block - Content block to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateBlock = (block) => {
  if (!block || typeof block !== 'object') {
    return { valid: false, error: 'Block must be an object' };
  }

  if (!block.type || typeof block.type !== 'string') {
    return { valid: false, error: 'Block must have a type property' };
  }

  if (!BLOCK_TYPES.includes(block.type)) {
    return { valid: false, error: `Invalid block type: ${block.type}. Must be one of: ${BLOCK_TYPES.join(', ')}` };
  }

  if (block.data === undefined || block.data === null) {
    return { valid: false, error: 'Block must have a data property' };
  }

  if (typeof block.data !== 'object' || Array.isArray(block.data)) {
    return { valid: false, error: 'Block data must be an object' };
  }

  // Type-specific validation
  switch (block.type) {
    case 'paragraph':
      if (typeof block.data.text !== 'string') {
        return { valid: false, error: 'Paragraph block must have text in data.text' };
      }
      break;

    case 'heading':
      if (typeof block.data.text !== 'string') {
        return { valid: false, error: 'Heading block must have text in data.text' };
      }
      if (![1, 2, 3].includes(block.data.level)) {
        return { valid: false, error: 'Heading block must have level 1, 2, or 3 in data.level' };
      }
      break;

    case 'image':
      if (typeof block.data.url !== 'string' || !block.data.url.trim()) {
        return { valid: false, error: 'Image block must have a valid URL in data.url' };
      }
      // Validate URL format
      try {
        // Allow both absolute URLs and relative paths (for uploaded files)
        if (!block.data.url.startsWith('http://') && 
            !block.data.url.startsWith('https://') && 
            !block.data.url.startsWith('/uploads/') &&
            !block.data.url.startsWith('/')) {
          return { valid: false, error: 'Image URL must be a valid URL or path' };
        }
      } catch {
        return { valid: false, error: 'Image URL must be a valid URL or path' };
      }
      if (typeof block.data.alt !== 'string') {
        return { valid: false, error: 'Image block must have alt text in data.alt' };
      }
      break;

    case 'code':
      if (typeof block.data.code !== 'string') {
        return { valid: false, error: 'Code block must have code in data.code' };
      }
      if (block.data.code.trim().length === 0) {
        return { valid: false, error: 'Code block cannot be empty' };
      }
      // Validate language if provided
      if (block.data.language !== undefined) {
        if (typeof block.data.language !== 'string') {
          return { valid: false, error: 'Code block language must be a string' };
        }
        // Validate language is a valid identifier (alphanumeric, hyphens, underscores)
        const languagePattern = /^[a-zA-Z0-9_-]+$/;
        if (block.data.language.trim().length > 0 && !languagePattern.test(block.data.language.trim())) {
          return { valid: false, error: 'Code block language must be a valid identifier' };
        }
      }
      // Optional filename for code blocks
      if (block.data.filename !== undefined && typeof block.data.filename !== 'string') {
        return { valid: false, error: 'Code block filename must be a string' };
      }
      break;

    case 'authorBox':
      // Author box can either reference an author by ID or have custom data
      // If authorId is provided, it should be a valid ObjectId string
      // If custom data is provided, it should have name, bio, and optionally avatar
      if (block.data.authorId && typeof block.data.authorId === 'string' && block.data.authorId.trim()) {
        // If authorId is provided, validate it's a valid MongoDB ObjectId format
        const authorId = block.data.authorId.trim();
        if (!/^[0-9a-fA-F]{24}$/.test(authorId)) {
          return { valid: false, error: 'Author box authorId must be a valid MongoDB ObjectId' };
        }
      } else {
        // If no authorId, custom data must be provided
        if (typeof block.data.name !== 'string' || !block.data.name || !block.data.name.trim()) {
          return { valid: false, error: 'Author box must have name in data.name (or authorId)' };
        }
        if (typeof block.data.bio !== 'string' || block.data.bio === undefined) {
          return { valid: false, error: 'Author box must have bio in data.bio' };
        }
        // Avatar is optional but if provided, must be a valid URL or path
        if (block.data.avatar && typeof block.data.avatar === 'string' && block.data.avatar.trim()) {
          const avatarUrl = block.data.avatar.trim();
          if (!avatarUrl.startsWith('http://') && 
              !avatarUrl.startsWith('https://') && 
              !avatarUrl.startsWith('/uploads/') &&
              !avatarUrl.startsWith('/')) {
            return { valid: false, error: 'Author box avatar must be a valid URL or path' };
          }
        }
      }
      break;

    case 'tableOfContents':
      // Table of contents block can be auto-generated or manually configured
      // If autoGenerate is true, TOC will be generated from headings in the post
      // If autoGenerate is false, items array can be provided manually
      if (block.data.autoGenerate !== undefined && typeof block.data.autoGenerate !== 'boolean') {
        return { valid: false, error: 'Table of contents autoGenerate must be a boolean' };
      }
      
      // If not auto-generating, items array is optional but if provided must be valid
      if (block.data.items && Array.isArray(block.data.items)) {
        for (let i = 0; i < block.data.items.length; i++) {
          const item = block.data.items[i];
          if (typeof item !== 'object' || !item) {
            return { valid: false, error: `Table of contents item ${i} must be an object` };
          }
          if (typeof item.text !== 'string' || !item.text.trim()) {
            return { valid: false, error: `Table of contents item ${i} must have text` };
          }
          if (typeof item.id !== 'string' || !item.id.trim()) {
            return { valid: false, error: `Table of contents item ${i} must have id` };
          }
          if (item.level !== undefined && ![1, 2, 3, 4, 5, 6].includes(item.level)) {
            return { valid: false, error: `Table of contents item ${i} level must be between 1 and 6` };
          }
        }
      } else if (block.data.items !== undefined && !Array.isArray(block.data.items)) {
        return { valid: false, error: 'Table of contents items must be an array' };
      }
      
      // Title is optional
      if (block.data.title !== undefined && typeof block.data.title !== 'string') {
        return { valid: false, error: 'Table of contents title must be a string' };
      }
      break;

    case 'quiz':
    case 'poll':
      // Quiz/Poll block validation
      if (typeof block.data.question !== 'string' || block.data.question.trim().length === 0) {
        return { valid: false, error: 'Quiz/Poll block must have a non-empty question' };
      }
      if (block.data.question.length > 500) {
        return { valid: false, error: 'Quiz/Poll question cannot exceed 500 characters' };
      }
      if (!Array.isArray(block.data.options) || block.data.options.length < 2) {
        return { valid: false, error: 'Quiz/Poll block must have at least 2 options' };
      }
      if (block.data.options.length > 20) {
        return { valid: false, error: 'Quiz/Poll block cannot have more than 20 options' };
      }
      // Validate each option
      for (let i = 0; i < block.data.options.length; i++) {
        const option = block.data.options[i];
        if (typeof option !== 'object' || option === null) {
          return { valid: false, error: `Quiz/Poll option ${i + 1} must be an object` };
        }
        if (typeof option.text !== 'string' || option.text.trim().length === 0) {
          return { valid: false, error: `Quiz/Poll option ${i + 1} must have a non-empty text` };
        }
        if (option.text.length > 200) {
          return { valid: false, error: `Quiz/Poll option ${i + 1} text cannot exceed 200 characters` };
        }
        // Optional: value field (if not provided, use index)
        if (option.value !== undefined && typeof option.value !== 'string' && typeof option.value !== 'number') {
          return { valid: false, error: `Quiz/Poll option ${i + 1} value must be a string or number` };
        }
      }
      // For quiz: allowMultipleAnswers is optional boolean
      if (block.data.allowMultipleAnswers !== undefined && typeof block.data.allowMultipleAnswers !== 'boolean') {
        return { valid: false, error: 'Quiz/Poll allowMultipleAnswers must be a boolean' };
      }
      
      // Only validate correct answers for quiz blocks (not poll blocks)
      const isPoll = block.type === 'poll' || block.data.blockType === 'poll';
      if (!isPoll) {
        // Optional: correctAnswer (for quiz with single answer)
        if (block.data.correctAnswer !== undefined && block.data.correctAnswer !== null) {
          if (typeof block.data.correctAnswer !== 'string' && typeof block.data.correctAnswer !== 'number') {
            return { valid: false, error: 'Quiz correctAnswer must be a string or number' };
          }
        }
        // Optional: correctAnswers (for quiz with multiple answers)
        if (block.data.correctAnswers !== undefined && block.data.correctAnswers !== null) {
          if (!Array.isArray(block.data.correctAnswers)) {
            return { valid: false, error: 'Quiz correctAnswers must be an array' };
          }
        }
      }
      break;

    case 'carousel':
      // Carousel block validation
      if (!Array.isArray(block.data.items) || block.data.items.length === 0) {
        return { valid: false, error: 'Carousel block must have at least one item' };
      }
      if (block.data.items.length > 50) {
        return { valid: false, error: 'Carousel block cannot have more than 50 items' };
      }
      // Validate each carousel item
      for (let i = 0; i < block.data.items.length; i++) {
        const item = block.data.items[i];
        if (typeof item !== 'object' || item === null) {
          return { valid: false, error: `Carousel item ${i + 1} must be an object` };
        }
        // Image URL is required
        if (typeof item.imageUrl !== 'string' || !item.imageUrl.trim()) {
          return { valid: false, error: `Carousel item ${i + 1} must have a valid imageUrl` };
        }
        // Validate image URL format
        try {
          if (!item.imageUrl.startsWith('http://') && 
              !item.imageUrl.startsWith('https://') && 
              !item.imageUrl.startsWith('/uploads/') &&
              !item.imageUrl.startsWith('/')) {
            return { valid: false, error: `Carousel item ${i + 1} imageUrl must be a valid URL or path` };
          }
        } catch {
          return { valid: false, error: `Carousel item ${i + 1} imageUrl must be a valid URL or path` };
        }
        // Alt text is required
        if (typeof item.alt !== 'string' || !item.alt.trim()) {
          return { valid: false, error: `Carousel item ${i + 1} must have alt text` };
        }
        if (item.alt.length > 200) {
          return { valid: false, error: `Carousel item ${i + 1} alt text cannot exceed 200 characters` };
        }
        // Link is optional but if provided must be valid
        if (item.link !== undefined && item.link !== null) {
          // If link is not a string, it's invalid
          if (typeof item.link !== 'string') {
            return { valid: false, error: `Carousel item ${i + 1} link must be a valid URL string` };
          }
          // Trim the link
          const trimmedLink = item.link.trim();
          // If link is empty after trimming, it's valid (optional field)
          if (trimmedLink.length === 0) {
            // Empty link is allowed (optional field) - skip validation
          } else {
            // Validate link URL format only if it's not empty
            if (!trimmedLink.startsWith('http://') && 
                !trimmedLink.startsWith('https://') && 
                !trimmedLink.startsWith('/') &&
                !trimmedLink.startsWith('#') &&
                !trimmedLink.startsWith('mailto:') &&
                !trimmedLink.startsWith('tel:')) {
              return { valid: false, error: `Carousel item ${i + 1} link must be a valid URL (http:// or https://), path (starting with /), or anchor (starting with #)` };
            }
          }
        }
        // Title is optional
        if (item.title !== undefined && typeof item.title !== 'string') {
          return { valid: false, error: `Carousel item ${i + 1} title must be a string` };
        }
        if (item.title && item.title.length > 200) {
          return { valid: false, error: `Carousel item ${i + 1} title cannot exceed 200 characters` };
        }
        // Description is optional
        if (item.description !== undefined && typeof item.description !== 'string') {
          return { valid: false, error: `Carousel item ${i + 1} description must be a string` };
        }
        if (item.description && item.description.length > 500) {
          return { valid: false, error: `Carousel item ${i + 1} description cannot exceed 500 characters` };
        }
      }
      break;

    default:
      return { valid: false, error: `Unknown block type: ${block.type}` };
  }

  return { valid: true, error: null };
};

/**
 * Validate an array of content blocks
 * @param {Array} blocks - Array of content blocks
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateBlocks = (blocks) => {
  if (!Array.isArray(blocks)) {
    return { valid: false, errors: ['Content must be an array'] };
  }

  const errors = [];

  blocks.forEach((block, index) => {
    const validation = validateBlock(block);
    if (!validation.valid) {
      errors.push(`Block ${index}: ${validation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize block content to prevent XSS
 * @param {Object} block - Content block to sanitize
 * @returns {Object} Sanitized block
 */
export const sanitizeBlock = (block) => {
  if (!block || typeof block !== 'object') {
    return block;
  }

  const sanitized = { ...block };

  // Sanitize text content
  if (block.data && typeof block.data === 'object') {
    sanitized.data = { ...block.data };

    // Sanitize text fields (remove HTML tags)
    if (sanitized.data.text) {
      sanitized.data.text = sanitized.data.text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }

    // Sanitize code block data
    if (block.type === 'code') {
      // Preserve code content as-is (will be escaped when rendered)
      if (sanitized.data.code && typeof sanitized.data.code === 'string') {
        // Ensure code is a string and trim whitespace from edges
        sanitized.data.code = sanitized.data.code;
      }
      
      // Sanitize language identifier
      if (sanitized.data.language && typeof sanitized.data.language === 'string') {
        // Only allow alphanumeric, hyphens, and underscores
        sanitized.data.language = sanitized.data.language
          .trim()
          .replace(/[^a-zA-Z0-9_-]/g, '')
          .toLowerCase();
        // If empty after sanitization, remove it
        if (sanitized.data.language.length === 0) {
          delete sanitized.data.language;
        }
      }
      
      // Sanitize filename if provided
      if (sanitized.data.filename && typeof sanitized.data.filename === 'string') {
        // Remove potentially dangerous characters from filename
        sanitized.data.filename = sanitized.data.filename
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
          .trim();
        // If empty after sanitization, remove it
        if (sanitized.data.filename.length === 0) {
          delete sanitized.data.filename;
        }
      }
    }

    // Sanitize URLs
    if (sanitized.data.url) {
      try {
        new URL(sanitized.data.url);
      } catch {
        sanitized.data.url = '';
      }
    }

    // Sanitize author box data
    if (block.type === 'authorBox') {
      // If authorId is provided, keep it as-is (it's validated)
      if (sanitized.data.authorId) {
        // Ensure it's a valid ObjectId format
        if (!/^[0-9a-fA-F]{24}$/.test(sanitized.data.authorId)) {
          delete sanitized.data.authorId;
        }
      }
      // Sanitize custom author data
      if (sanitized.data.name) {
        sanitized.data.name = sanitized.data.name
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .trim();
      }
      if (sanitized.data.bio) {
        sanitized.data.bio = sanitized.data.bio
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .trim();
      }
      // Validate avatar URL if provided
      if (sanitized.data.avatar && typeof sanitized.data.avatar === 'string') {
        const avatarUrl = sanitized.data.avatar.trim();
        if (!avatarUrl.startsWith('http://') && 
            !avatarUrl.startsWith('https://') && 
            !avatarUrl.startsWith('/uploads/') &&
            !avatarUrl.startsWith('/')) {
          sanitized.data.avatar = '';
        }
      }
    }

    // Sanitize table of contents data
    if (block.type === 'tableOfContents') {
      // Sanitize title if provided
      if (sanitized.data.title && typeof sanitized.data.title === 'string') {
        sanitized.data.title = sanitized.data.title
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .trim();
      }
      
      // Sanitize items if provided
      if (sanitized.data.items && Array.isArray(sanitized.data.items)) {
        sanitized.data.items = sanitized.data.items.map(item => {
          const sanitizedItem = { ...item };
          
          // Sanitize text
          if (sanitizedItem.text && typeof sanitizedItem.text === 'string') {
            sanitizedItem.text = sanitizedItem.text
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#x27;')
              .trim();
          }
          
          // Sanitize id (should be URL-safe)
          if (sanitizedItem.id && typeof sanitizedItem.id === 'string') {
            sanitizedItem.id = sanitizedItem.id
              .replace(/[^a-zA-Z0-9\-_]/g, '')
              .trim();
          }
          
          // Ensure level is valid
          if (sanitizedItem.level !== undefined) {
            const level = parseInt(sanitizedItem.level);
            if (isNaN(level) || level < 1 || level > 6) {
              sanitizedItem.level = 2; // Default to H2
            } else {
              sanitizedItem.level = level;
            }
          }
          
          return sanitizedItem;
        });
      }
    }

    // Sanitize quiz/poll data
    if (block.type === 'quiz' || block.type === 'poll') {
      // Sanitize question
      if (sanitized.data.question && typeof sanitized.data.question === 'string') {
        sanitized.data.question = sanitized.data.question
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .trim();
      }
      
      // Sanitize options
      if (sanitized.data.options && Array.isArray(sanitized.data.options)) {
        sanitized.data.options = sanitized.data.options.map((option, index) => {
          const sanitizedOption = {
            text: option.text ? sanitizeString(option.text).trim() : '',
            value: option.value !== undefined ? (typeof option.value === 'string' ? sanitizeString(option.value) : option.value) : index
          };
          return sanitizedOption;
        });
      }
      
      // Preserve allowMultipleAnswers as boolean
      if (sanitized.data.allowMultipleAnswers !== undefined) {
        sanitized.data.allowMultipleAnswers = sanitized.data.allowMultipleAnswers === true;
      }
      
      // Preserve correctAnswer/correctAnswers if provided (only for quiz blocks, not polls)
      const isPoll = sanitized.type === 'poll' || sanitized.data.blockType === 'poll';
      if (!isPoll) {
        if (sanitized.data.correctAnswer !== undefined && sanitized.data.correctAnswer !== null) {
          sanitized.data.correctAnswer = typeof sanitized.data.correctAnswer === 'string' 
            ? sanitizeString(sanitized.data.correctAnswer) 
            : sanitized.data.correctAnswer;
        }
        if (sanitized.data.correctAnswers !== undefined && sanitized.data.correctAnswers !== null && Array.isArray(sanitized.data.correctAnswers)) {
          sanitized.data.correctAnswers = sanitized.data.correctAnswers.map(ans => 
            typeof ans === 'string' ? sanitizeString(ans) : ans
          );
        }
      } else {
        // Remove correct answer fields for polls
        delete sanitized.data.correctAnswer;
        delete sanitized.data.correctAnswers;
      }
    }

    // Sanitize carousel data
    if (block.type === 'carousel') {
      // Sanitize carousel items
      if (sanitized.data.items && Array.isArray(sanitized.data.items)) {
        sanitized.data.items = sanitized.data.items.map(item => {
          const sanitizedItem = {
            imageUrl: item.imageUrl || '',
            alt: sanitizeString(item.alt || '').trim()
          };
          
          // Optional fields
          if (item.link && typeof item.link === 'string' && item.link.trim()) {
            sanitizedItem.link = item.link.trim();
          }
          if (item.title && typeof item.title === 'string') {
            sanitizedItem.title = sanitizeString(item.title).trim();
          }
          if (item.description && typeof item.description === 'string') {
            sanitizedItem.description = sanitizeString(item.description).trim();
          }
          
          return sanitizedItem;
        });
      }
    }

    // Sanitize carousel data
    if (block.type === 'carousel') {
      // Sanitize carousel items
      if (sanitized.data.items && Array.isArray(sanitized.data.items)) {
        sanitized.data.items = sanitized.data.items.map(item => {
          const sanitizedItem = {
            imageUrl: item.imageUrl || '',
            alt: sanitizeString(item.alt || '').trim()
          };
          
          // Optional fields
          if (item.link && typeof item.link === 'string' && item.link.trim()) {
            sanitizedItem.link = item.link.trim();
          }
          if (item.title && typeof item.title === 'string') {
            sanitizedItem.title = sanitizeString(item.title).trim();
          }
          if (item.description && typeof item.description === 'string') {
            sanitizedItem.description = sanitizeString(item.description).trim();
          }
          
          return sanitizedItem;
        });
      }
    }
  }

  return sanitized;
};

/**
 * Helper function to sanitize strings
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Sanitize an array of blocks
 * @param {Array} blocks - Array of content blocks
 * @returns {Array} Sanitized blocks
 */
export const sanitizeBlocks = (blocks) => {
  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks.map(block => sanitizeBlock(block));
};

