import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ThemeToggleProps {
  style?: any;
  position?: 'absolute' | 'relative';
}

const ThemeToggle = ({ style, position = 'absolute' }: ThemeToggleProps) => {
  const { theme, colors, toggleTheme } = useTheme();

  const backgroundColor = theme === 'dark'
    ? '#2A2A2E'
    : 'rgba(255, 255, 255, 0.9)';

  return (
    <TouchableOpacity
      style={[
        styles.themeToggle,
        position === 'absolute' && styles.absolute,
        { backgroundColor },
        style
      ]}
      onPress={toggleTheme}
    >
      {theme === 'dark' ? (
        <Ionicons name="sunny" size={24} color={colors.primary} />
      ) : (
        <Ionicons name="moon" size={24} color={colors.primary} />
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
  absolute: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
});

export default ThemeToggle;