import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";


type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: "#f8fafc",
  surface: "#ffffff",
  card: "#ffffff",
  text: "#0f172a",
  textSecondary: "#64748b",
  border: "#e2e8f0",
  primary: "#1e40af",
  secondary: "#6366f1",
  tertiary: "#10b981",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  disabled: "#94a3b8",
};

const darkColors = {
  background: "#0f172a",
  surface: "#1e293b",
  card: "#1e293b",
  text: "#ffffff",
  textSecondary: "#94a3b8",
  border: "#334155",
  primary: "#4ECDC4",
  secondary: "#818cf8",
  tertiary: "#34d399",
  success: "#10b981",
  error: "#f87171",
  warning: "#fbbf24",
  info: "#60a5fa",
  disabled: "#475569",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isReady, setIsReady] = useState(false);

  // Load theme once on startup
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("@theme");
        if (savedTheme === "light" || savedTheme === "dark") {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsReady(true);
      }
    };

    loadTheme();
  }, []);

  // Toggle and persist theme
  const toggleTheme = async () => {
    try {
      const newTheme = theme === "light" ? "dark" : "light";
      setTheme(newTheme);
      await AsyncStorage.setItem("@theme", newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  // Update StatusBar automatically
  useEffect(() => {
    if (!isReady) return;

    const currentColors = theme === "light" ? lightColors : darkColors;
    StatusBar.setBarStyle(theme === "light" ? "dark-content" : "light-content");
    StatusBar.setBackgroundColor(currentColors.background);
    StatusBar.setTranslucent(false);
  }, [theme, isReady]);

  // Avoid flicker before theme is loaded
  if (!isReady) return null;

  const colors = theme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
