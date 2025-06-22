import { Request, Response } from 'express';
import { SessionService } from '../../application/service/SessionService';

/**
 * Controller for handling session-related HTTP requests
 */
export class SessionController {
  private sessionService: SessionService;

  constructor() {
    this.sessionService = SessionService.getInstance();
  }

  /**
   * Initialize a session for a user
   * @param req - Express request object
   * @param res - Express response object
   */
  public initSession(req: Request, res: Response): void {
    const userId = this.sessionService.initSession(req);
    res.locals.userId = userId;
  }

  /**
   * Set the language preference for a user
   * @param req - Express request object
   * @param res - Express response object
   */
  public setLanguage(req: Request, res: Response): void {
    const language = req.query.lang as string;
    if (language) {
      this.sessionService.setLanguagePreference(req, language);
      res.cookie('lang', language, { maxAge: 900000, httpOnly: true });
    }
    res.redirect(req.headers.referer || '/');
  }

  /**
   * Set the theme preference for a user
   * @param req - Express request object
   * @param res - Express response object
   */
  public setTheme(req: Request, res: Response): void {
    const theme = req.query.theme as string;
    if (theme) {
      this.sessionService.setThemePreference(req, theme);
    }
    res.redirect(req.headers.referer || '/');
  }

  /**
   * Log out a user by clearing their session
   * @param req - Express request object
   * @param res - Express response object
   */
  public logout(req: Request, res: Response): void {
    // Clear the session
    this.sessionService.clearSession(req);

    // Reset the language cookie to default
    res.cookie('lang', 'sr', { maxAge: 900000, httpOnly: true });

    // Redirect to the home page
    res.redirect('/');
  }
}
