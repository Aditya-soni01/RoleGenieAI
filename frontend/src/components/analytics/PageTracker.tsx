import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';

const PageTracker = () => {
  const location = useLocation();
  const previousPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}`;
    trackEvent('page_view', {
      pagePath,
      referrerPath: previousPath.current,
      funnelStep: location.pathname.startsWith('/admin') ? 'admin_page_view' : 'page_view',
    });
    previousPath.current = pagePath;
  }, [location.pathname, location.search]);

  return null;
};

export default PageTracker;
