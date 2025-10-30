import React, { useEffect } from 'react';
import {
  StyleSheet,
  ImageBackground,
  StatusBar,
  BackHandler,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import ThemeToggle from '@/src/components/shared/ThemeToggle';
import PasswordSetupContent from '@/src/components/auth/employee/PasswordSetupContent';

export default function EmployeePasswordSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, theme } = useTheme();

  // Set transparent StatusBar for auth screen
  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor("transparent");
    StatusBar.setTranslucent(true);
  }, []);

  // Disable hardware back button completely
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Perhatian',
        'Anda harus menyelesaikan pembuatan password terlebih dahulu sebelum dapat melanjutkan.',
        [
          {
            text: 'OK',
            style: 'default',
          }
        ]
      );
      return true; // Block back navigation completely
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  const backgroundAsset = theme === "light"
    ? require("../../../../assets/images/backgroundAuthLight.png")
    : require("../../../../assets/images/backgroundAuth.png");

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundAsset}
        resizeMode="cover"
        style={styles.background}
      >
        {/* Theme Toggle - Top Right Corner */}
        <ThemeToggle />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <PasswordSetupContent
            colors={colors}
            params={params}
            router={router}
          />
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
});