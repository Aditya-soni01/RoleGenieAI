import axios from 'axios';

const getStoredAccessToken = (): string | null => {
  try {
    const rawAuthState = window.localStorage.getItem('auth-store');
    if (!rawAuthState) return null;

    const parsedAuthState = JSON.parse(rawAuthState) as {
      state?: { accessToken?: string | null };
    };
    return parsedAuthState.state?.accessToken ?? null;
  } catch {
    return null;
  }
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token from persisted auth state on every request.
apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
