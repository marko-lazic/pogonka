import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from '../../application/service/NotificationService';
import { SessionService } from '../../application/service/SessionService';

/**
 * Controller for handling server-sent events (SSE) notifications
 */
export class NotificationController {
  private notificationService: NotificationService;
  private sessionService: SessionService;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.sessionService = SessionService.getInstance();
  }

  /**
   * Establish an SSE connection for a client
   * @param req - Express request object
   * @param res - Express response object
   */
  public subscribeToEvents(req: Request, res: Response): void {
    // Generate a unique client ID
    const clientId = uuidv4();

    // Get user ID from session
    const userId = this.sessionService.getUserId(req);

    // Register the client with the notification service
    this.notificationService.addClient(clientId, res, userId);
  }

  /**
   * Render the notification alert component
   * @param req - Express request object
   * @param res - Express response object
   */
  public renderNotificationAlert(req: Request, res: Response): void {
    res.render('partials/notification-alert', {
      layout: false,
      message: res.__('notifications.state_changed')
    });
  }
}
