import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    success: string;
    error: string;
    warning: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightColors = {
  background: "#f8fafc",
  surface: "#ffffff",
  card: "#ffffff",
  text: "#0f172a",
  textSecondary: "#64748b",
  border: "#e2e8f0",
  primary: "#4ECDC4",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
};

const darkColors = {
  background: "#0f172a",
  surface: "#1e293b",
  card: "#1e293b",
  text: "#ffffff",
  textSecondary: "#94a3b8",
  border: "#334155",
  primary: "#4ECDC4",
  success: "#10b981",
  error: "#f87171",
  warning: "#fbbf24",
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("@theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === "light" ? "dark" : "light";
      setTheme(newTheme);
      await AsyncStorage.setItem("@theme", newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  // Update StatusBar based on theme
  useEffect(() => {
    if (theme === "light") {
      StatusBar.setBarStyle("dark-content");
      StatusBar.setBackgroundColor("#f8fafc");
    } else {
      StatusBar.setBarStyle("light-content");
      StatusBar.setBackgroundColor("#0f172a");
    }
  }, [theme]);

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
