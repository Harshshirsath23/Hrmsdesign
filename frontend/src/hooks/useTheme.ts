import { useEffect } from 'react';
import { useUIStore } from '@store/uiStore';

export function getResolvedTheme(theme: 'light' | 'dark' | 'system') {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function useTheme() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  useEffect(() => {
    const resolved = getResolvedTheme(theme);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (useUIStore.getState().theme === 'system') {
        document.documentElement.classList.toggle('dark', media.matches);
      }
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  return { theme, setTheme };
}
