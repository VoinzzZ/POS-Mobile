import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useOrientation } from '@/src/hooks/useOrientation';

interface ThemeToggleProps {
  style?: any;
  position?: 'absolute' | 'relative';
}

const ThemeToggle = ({ style, position = 'absolute' }: ThemeToggleProps) => {
  const { theme, colors, toggleTheme } = useTheme();
  const { isLandscape: isLand, isTablet: isTab } = useOrientation();

  const backgroundColor = theme === 'dark'
    ? '#2A2A2E'
    : 'rgba(255, 255, 255, 0.9)';

  return (
    <TouchableOpacity
      style={[
        styles.themeToggle,
        isLand && isTab ? styles.landscapeThemeToggle : {},
        position === 'absolute' && styles.absolute,
        isLand && isTab ? styles.landscapeAbsolute : {},
        { backgroundColor },
        style
      ]}
      onPress={toggleTheme}
    >
      {theme === 'dark' ? (
        <Ionicons name="sunny" size={isLand && isTab ? 28 : 24} color={colors.primary} />
      ) : (
        <Ionicons name="moon" size={isLand && isTab ? 28 : 24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  themeToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  landscapeThemeToggle: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  absolute: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  landscapeAbsolute: {
    top: 30,
    right: 30,
  },
});

export default ThemeToggle;