export type GoodVsBadTheme = 'good-vs-bad' | 'yin-yang' | 'light-vs-dark' | 'hero-vs-villain';

export interface GoodVsBadConfig {
  isEnabled: boolean;
  badProfilePicture: string | null;
  badDefinition: string;
  theme: GoodVsBadTheme;
  userRole: string;
  badRole: string;
}

export interface GoodVsBadConfigOptions {
  isEnabled?: boolean;
  badProfilePicture?: string | null;
  badDefinition?: string;
  theme?: GoodVsBadTheme;
  userRole?: string;
  badRole?: string;
}

export function createGoodVsBadConfig(options: GoodVsBadConfigOptions = {}): GoodVsBadConfig {
  const {
    isEnabled = false,
    badProfilePicture = null,
    badDefinition = '',
    theme = 'good-vs-bad',
    userRole = 'good',
    badRole = 'bad'
  } = options;

  // Validate theme
  const validThemes: GoodVsBadTheme[] = ['good-vs-bad', 'yin-yang', 'light-vs-dark', 'hero-vs-villain'];
  const validatedTheme = validThemes.includes(theme) ? theme : 'good-vs-bad';

  // Validate roles (default to good/bad if empty)
  const validatedUserRole = userRole.trim() || 'good';
  const validatedBadRole = badRole.trim() || 'bad';

  return {
    isEnabled,
    badProfilePicture,
    badDefinition,
    theme: validatedTheme,
    userRole: validatedUserRole,
    badRole: validatedBadRole
  };
} 