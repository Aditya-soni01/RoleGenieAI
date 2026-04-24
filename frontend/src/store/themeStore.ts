import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'rolegenie-theme';

const isBrowser = typeof window !== 'undefined';

const getStoredThemeMode = (): ThemeMode => {
  if (!isBrowser) return 'dark';

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'dark';
};

const getSystemTheme = (): ResolvedTheme => {
  if (!isBrowser) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const resolveThemeMode = (mode: ThemeMode): ResolvedTheme => {
  return mode === 'system' ? getSystemTheme() : mode;
};

export const applyThemeToDocument = (mode: ThemeMode) => {
  if (!isBrowser) return;

  const resolvedTheme = resolveThemeMode(mode);
  const root = window.document.documentElement;

  root.classList.toggle('dark', resolvedTheme === 'dark');
  root.dataset.theme = resolvedTheme;
  root.style.colorScheme = resolvedTheme;
};

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: getStoredThemeMode(),
  setThemeMode: (mode) => {
    if (isBrowser) {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    }

    applyThemeToDocument(mode);
    set({ themeMode: mode });
  },
}));

applyThemeToDocument(getStoredThemeMode());
