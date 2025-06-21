import i18n from 'i18n';
import path from 'path';

// Define locale type
export type LocaleType = 'en' | 'sr';

// Define constants that can be exported
export const DEFAULT_LOCALE: LocaleType = 'sr';
export const AVAILABLE_LOCALES: LocaleType[] = ['en', 'sr'];

// Define locale format mapping for date formatting
export const LOCALE_FORMATS: Record<LocaleType, string> = {
  'sr': 'sr-Latn-RS',
  'en': 'en-US'
};

// Configure i18n
i18n.configure({
  // Setup some locales - other locales default to en silently
  locales: AVAILABLE_LOCALES,

  // Set default locale
  defaultLocale: DEFAULT_LOCALE,

  // Set directory with localization files
  directory: path.join(__dirname, '../../locales'),

  // Enable object notation for translations
  objectNotation: true,

  // Set cookie name for storing locale
  cookie: 'lang',

  // Auto reload locale files when changed
  autoReload: true,

  // Sync locale information across all files
  syncFiles: true,

  // Update files with missing translations
  updateFiles: false,

  // Log info level to console
  logDebugFn: (msg) => {
    console.log('i18n::debug', msg);
  },

  // Log warn level to console
  logWarnFn: (msg) => {
    console.log('i18n::warn', msg);
  },

  // Log error level to console
  logErrorFn: (msg) => {
    console.log('i18n::error', msg);
  }
});

export default i18n;
