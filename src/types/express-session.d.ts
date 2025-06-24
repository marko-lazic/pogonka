import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    preferences?: {
      language?: string;
      theme?: string;
      [key: string]: string | undefined;
    };
  }
}