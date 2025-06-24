import { Request } from 'express';

/**
 * Service for managing user preferences (language and theme)
 */
export class UserPreferencesService {
  private static instance: UserPreferencesService;

  private constructor() {}

  /**
   * Get the singleton instance of UserPreferencesService
   */
  public static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService();
    }
    return UserPreferencesService.instance;
  }

  /**
   * Initialize user preferences
   * @param req - Express request object
   */
  public initPreferences(req: Request): void {
    if (!req.session.preferences) {
      req.session.preferences = {
        language: req.cookies?.lang || 'en',
        theme: req.cookies?.theme || 'light'
      };
    }
  }

  /**
   * Set a user preference
   * @param req - Express request object
   * @param key - The preference key (e.g., 'language', 'theme')
   * @param value - The preference value
   */
  public setPreference(req: Request, key: string, value: string): void {
    if (req.session) {
      req.session.preferences = req.session.preferences || {};
      req.session.preferences[key] = value;
    }
  }

  /**
   * Get a user preference
   * @param req - Express request object
   * @param key - The preference key (e.g., 'language', 'theme')
   * @param defaultValue - Default value if preference is not set
   * @returns The preference value
   */
  public getPreference(req: Request, key: string, defaultValue: string = ''): string {
    return req.session?.preferences?.[key] || defaultValue;
  }

  /**
   * Set the language preference
   * @param req - Express request object
   * @param language - The language preference
   */
  public setLanguage(req: Request, language: string): void {
    this.setPreference(req, 'language', language);
  }

  /**
   * Get the language preference
   * @param req - Express request object
   * @returns The language preference
   */
  public getLanguage(req: Request): string {
    return this.getPreference(req, 'language', 'en');
  }

  /**
   * Set the theme preference
   * @param req - Express request object
   * @param theme - The theme preference
   */
  public setTheme(req: Request, theme: string): void {
    this.setPreference(req, 'theme', theme);
  }

  /**
   * Get the theme preference
   * @param req - Express request object
   * @returns The theme preference
   */
  public getTheme(req: Request): string {
    return this.getPreference(req, 'theme', 'light');
  }
}