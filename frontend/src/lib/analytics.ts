import apiClient from '@/lib/api';

const SESSION_KEY = 'rolegenie-session-id';

export type AnalyticsMetadata = Record<string, string | number | boolean | null | undefined>;

export const getAnalyticsSessionId = (): string => {
  let sessionId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const trackEvent = (
  eventName: string,
  options: {
    pagePath?: string;
    referrerPath?: string;
    funnelStep?: string;
    metadata?: AnalyticsMetadata;
  } = {}
) => {
  const payload = {
    event_name: eventName,
    session_id: getAnalyticsSessionId(),
    page_path: options.pagePath ?? window.location.pathname,
    referrer_path: options.referrerPath,
    funnel_step: options.funnelStep ?? eventName,
    metadata: options.metadata ?? {},
  };

  void apiClient.post('/analytics/events', payload).catch(() => {
    // Analytics must never block the user flow.
  });
};
