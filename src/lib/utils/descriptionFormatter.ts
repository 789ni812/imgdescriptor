/**
 * Utility functions for formatting image descriptions for display
 */

export interface FormattedDescription {
  short: string;
  full: string;
  isTruncated: boolean;
}

interface ImageDescription {
  setting?: string;
  objects?: string[];
  characters?: string[];
  mood?: string;
  hooks?: string[];
  [key: string]: unknown;
}

/**
 * Formats an image description object into a readable string
 */
export function formatImageDescription(description: string | ImageDescription | unknown): string {
  if (typeof description === 'string') {
    return description;
  }
  
  if (typeof description === 'object' && description !== null) {
    const desc = description as ImageDescription;
    const parts: string[] = [];
    
    // Add setting if available
    if (desc.setting) {
      parts.push(desc.setting);
    }
    
    // Add objects if available
    if (Array.isArray(desc.objects) && desc.objects.length > 0) {
      parts.push(desc.objects.join(', '));
    }
    
    // Add characters if available
    if (Array.isArray(desc.characters) && desc.characters.length > 0) {
      parts.push(desc.characters.join(', '));
    }
    
    // Add mood if available
    if (desc.mood) {
      parts.push(desc.mood);
    }
    
    // Add hooks if available
    if (Array.isArray(desc.hooks) && desc.hooks.length > 0) {
      parts.push(desc.hooks.join('. '));
    }
    
    return parts.join('. ');
  }
  
  return String(description);
}

/**
 * Creates a truncated version of a description with hover functionality
 */
export function createTruncatedDescription(
  description: string | ImageDescription | unknown, 
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
export function extractFighterName(description: string | ImageDescription | unknown): string {
  if (typeof description === 'string') {
    // Look for patterns like "character name - description" or "name, description"
    const nameMatch = description.match(/^([^-,\n]+?)(?:\s*[-,\n]|$)/);
    if (nameMatch) {
      return nameMatch[1].trim();
    }
    return description.split(' ').slice(0, 3).join(' '); // First 3 words as fallback
  }
  
  if (typeof description === 'object' && description !== null) {
    const desc = description as ImageDescription;
    // Try to get name from characters array
    if (Array.isArray(desc.characters) && desc.characters.length > 0) {
      const firstCharacter = desc.characters[0];
      // Extract name before any dash or comma
      const nameMatch = firstCharacter.match(/^([^-,\n]+?)(?:\s*[-,\n]|$)/);
      if (nameMatch) {
        return nameMatch[1].trim();
      }
      return firstCharacter;
    }
    
    // Fallback to first part of setting
    if (desc.setting) {
      const words = desc.setting.split(' ');
      return words.slice(0, 2).join(' '); // First 2 words
    }
  }
  
  return 'Unknown Fighter';
} 