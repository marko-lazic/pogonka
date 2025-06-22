import { EventEmitter } from 'events';

/**
 * Service for managing server-sent events (SSE) notifications
 */
export class NotificationService {
  private static instance: NotificationService;
  private eventEmitter: EventEmitter;
  private clients: Map<string, { response: any, userId: string }>;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.clients = new Map();
  }

  /**
   * Get the singleton instance of NotificationService
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Register a new SSE client
   * @param clientId - Unique identifier for the client
   * @param response - Express response object to send events to
   * @param userId - ID of the user associated with this client
   */
  public addClient(clientId: string, response: any, userId: string): void {
    this.clients.set(clientId, { response, userId });

    // Set up response headers for SSE
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Send initial connection message
    response.write('data: {"type":"connected"}\n\n');

    // Handle client disconnection
    response.on('close', () => {
      this.clients.delete(clientId);
    });
  }

  /**
   * Send a notification about order changes to all clients except the originator
   * @param excludeUserId - User ID to exclude from notification (usually the user who made the change)
   */
  public notifyOrderChange(excludeUserId: string): void {
    // Ensure excludeUserId is not empty or undefined
    if (!excludeUserId) {
      return;
    }

    this.clients.forEach(({ response, userId }, clientId) => {
      // Don't send notification to the user who made the change
      // Make sure both userIds are defined and do a strict comparison
      if (userId && excludeUserId && userId !== excludeUserId) {
        response.write(`data: {"type":"order-change"}\n\n`);
      }
    });
  }

  /**
   * Send a notification about product changes to all clients except the originator
   * @param excludeUserId - User ID to exclude from notification (usually the user who made the change)
   */
  public notifyProductChange(excludeUserId: string): void {
    // Ensure excludeUserId is not empty or undefined
    if (!excludeUserId) {
      return;
    }

    this.clients.forEach(({ response, userId }, clientId) => {
      // Don't send notification to the user who made the change
      // Make sure both userIds are defined and do a strict comparison
      if (userId && excludeUserId && userId !== excludeUserId) {
        response.write(`data: {"type":"product-change"}\n\n`);
      }
    });
  }
}
