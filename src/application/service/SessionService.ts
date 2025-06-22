import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing user sessions
 */
export class SessionService {
  private static instance: SessionService;

  private constructor() {}

  /**
   * Get the singleton instance of SessionService
   */
  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Initialize a new session
   * @param req - Express request object
   * @returns The session ID
   */
  public initSession(req: any): string {
    if (!req.session.userId) {
      req.session.userId = uuidv4();
      req.session.preferences = {
        language: req.cookies?.lang,
        theme: 'light'
      };
    }
    return req.session.userId;
  }

  /**
   * Get the user ID from the session
   * @param req - Express request object
   * @returns The user ID
   */
  public getUserId(req: any): string {
    return req.session?.userId || '';
  }

  /**
   * Set the language preference in the session
   * @param req - Express request object
   * @param language - The language preference
   */
  public setLanguagePreference(req: any, language: string): void {
    if (req.session) {
      req.session.preferences = req.session.preferences || {};
      req.session.preferences.language = language;
    }
  }

  /**
   * Get the language preference from the session
   * @param req - Express request object
   * @returns The language preference
   */
  public getLanguagePreference(req: any): string | undefined {
    return req.session?.preferences?.language;
  }

  /**
   * Set the theme preference in the session
   * @param req - Express request object
   * @param theme - The theme preference
   */
  public setThemePreference(req: any, theme: string): void {
    if (req.session) {
      req.session.preferences = req.session.preferences || {};
      req.session.preferences.theme = theme;
    }
  }

  /**
   * Get the theme preference from the session
   * @param req - Express request object
   * @returns The theme preference
   */
  public getThemePreference(req: any): string | undefined {
    return req.session?.preferences?.theme;
  }

  /**
   * Clear the session
   * @param req - Express request object
   */
  public clearSession(req: any): void {
    if (req.session) {
      req.session.destroy();
    }
  }
}