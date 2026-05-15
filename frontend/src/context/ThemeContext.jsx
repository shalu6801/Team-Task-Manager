import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => localStorage.getItem('ttm_theme') !== 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ttm_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const value = useMemo(() => ({ dark, toggleDark: () => setDark((value) => !value) }), [dark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
