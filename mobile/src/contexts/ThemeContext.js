import React, { createContext, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import { lightColors, darkColors } from '../theme';
import { useAppStore } from '../store/appStore';

const ThemeContext = createContext({ colors: lightColors, isDark: false, setDarkMode: () => {} });

export function ThemeProvider({ children }) {
  const darkMode = useAppStore((state) => state.darkMode);
  const darkModeInitialized = useAppStore((state) => state.darkModeInitialized);
  const setDarkMode = useAppStore((state) => state.setDarkMode);
  const setDarkModeInitialized = useAppStore((state) => state.setDarkModeInitialized);

  useEffect(() => {
    if (!darkModeInitialized) {
      setDarkMode(Appearance.getColorScheme() === 'dark');
      setDarkModeInitialized(true);
    }
  }, [darkModeInitialized]);

  const colors = darkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark: darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}