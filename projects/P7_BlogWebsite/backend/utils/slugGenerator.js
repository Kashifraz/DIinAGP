/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} Generated slug
 */
export const generateSlug = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate a unique slug by appending a number if slug already exists
 * @param {string} baseSlug - Base slug to make unique
 * @param {Function} checkExists - Function to check if slug exists (should return Promise<boolean>)
 * @param {string} excludeId - Post ID to exclude from uniqueness check (for updates)
 * @returns {Promise<string>} Unique slug
 */
export const generateUniqueSlug = async (baseSlug, checkExists, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const exists = await checkExists(slug, excludeId);
    
    if (!exists) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return slug;
};

