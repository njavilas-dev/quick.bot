import * as Sentry from '@sentry/nextjs';

let isInitialized = false;

export const initSentry = () => {
  if (isInitialized) {
    return;
  }

  if (typeof window !== 'undefined') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
    isInitialized = true;
  }
}; 