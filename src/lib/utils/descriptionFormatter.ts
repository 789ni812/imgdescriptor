/**
 * Utility functions for formatting image descriptions for display
 */

export interface FormattedDescription {
  short: string;
  full: string;
  isTruncated: boolean;
}

/**
 * Formats an image description object into a readable string
 */
export function formatImageDescription(description: any): string {
  if (typeof description === 'string') {
    return description;
  }
  
  if (typeof description === 'object' && description !== null) {
    const parts: string[] = [];
    
    // Add setting if available
    if (description.setting) {
      parts.push(description.setting);
    }
    
    // Add objects if available
    if (Array.isArray(description.objects) && description.objects.length > 0) {
      parts.push(description.objects.join(', '));
    }
    
    // Add characters if available
    if (Array.isArray(description.characters) && description.characters.length > 0) {
      parts.push(description.characters.join(', '));
    }
    
    // Add mood if available
    if (description.mood) {
      parts.push(description.mood);
    }
    
    // Add hooks if available
    if (Array.isArray(description.hooks) && description.hooks.length > 0) {
      parts.push(description.hooks.join('. '));
    }
    
    return parts.join('. ');
  }
  
  return String(description);
}

/**
 * Creates a truncated version of a description with hover functionality
 */
export function createTruncatedDescription(
  description: any, 
  maxLength: number = 150
): FormattedDescription {
  const fullText = formatImageDescription(description);
  
  if (fullText.length <= maxLength) {
    return {
      short: fullText,
      full: fullText,
      isTruncated: false
    };
  }
  
  // Find a good break point (end of sentence or word)
  let truncated = fullText.substring(0, maxLength);
  
  // Try to break at sentence end
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  const sentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
  
  if (sentenceEnd > maxLength * 0.7) {
    truncated = truncated.substring(0, sentenceEnd + 1);
  } else {
    // Break at word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      truncated = truncated.substring(0, lastSpace);
    }
  }
  
  return {
    short: truncated.trim() + '...',
    full: fullText,
    isTruncated: true
  };
}

/**
 * Extracts the main character/fighter name from the description
 */
export function extractFighterName(description: any): string {
  if (typeof description === 'string') {
    // Look for patterns like "character name - description" or "name, description"
    const nameMatch = description.match(/^([^-,\n]+?)(?:\s*[-,\n]|$)/);
    if (nameMatch) {
      return nameMatch[1].trim();
    }
    return description.split(' ').slice(0, 3).join(' '); // First 3 words as fallback
  }
  
  if (typeof description === 'object' && description !== null) {
    // Try to get name from characters array
    if (Array.isArray(description.characters) && description.characters.length > 0) {
      const firstCharacter = description.characters[0];
      // Extract name before any dash or comma
      const nameMatch = firstCharacter.match(/^([^-,\n]+?)(?:\s*[-,\n]|$)/);
      if (nameMatch) {
        return nameMatch[1].trim();
      }
      return firstCharacter;
    }
    
    // Fallback to first part of setting
    if (description.setting) {
      const words = description.setting.split(' ');
      return words.slice(0, 2).join(' '); // First 2 words
    }
  }
  
  return 'Unknown Fighter';
} 