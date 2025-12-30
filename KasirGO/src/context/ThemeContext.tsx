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
  background: "#000000ff",      
  surface: "#000000ff",
  card: "#171717",      
  text: "#FFFFFF",
  textSecondary: "#B3B3B8",
  border: "#2A2A2E",
  primary: "#4ECDC4",
  secondary: "#4ECDC4",      
  tertiary: "#4ECDC4",
  success: "#22C55E",     
  error: "#FF4D4F",     
  warning: "#FBBF24",       
  info: "#60A5FA",     
  disabled: "#3A3A3F",
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

  // Set initial StatusBar configuration
  useEffect(() => {
    StatusBar.setTranslucent(true);
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

    StatusBar.setBarStyle(theme === "light" ? "dark-content" : "light-content");
    StatusBar.setTranslucent(true);
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
