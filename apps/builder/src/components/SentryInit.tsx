import { useEffect } from 'react';
import { initSentry } from '../lib/sentry';

export const SentryInit = () => {
  useEffect(() => {
    initSentry();
  }, []);

  return null;
}; 