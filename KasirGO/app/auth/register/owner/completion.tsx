import React, { useEffect } from 'react';
import {
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  BackHandler,
  View,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from '@/src/components/shared/ThemeToggle';
import CompletionContent from '@/src/components/auth/owner/CompletionContent';

export default function RegistrationCompletionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, theme } = useTheme();

  // Set transparent StatusBar for auth screen
  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor("transparent");
    StatusBar.setTranslucent(true);
  }, []);

  // Disable hardware back button
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Perhatian',
        'Pendaftaran Anda telah selesai. Silakan kembali ke halaman login.',
        [
          {
            text: 'OK',
            style: 'default',
          }
        ]
      );
      return true; // Block back navigation
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

        <CompletionContent
          colors={colors}
          params={params}
          router={router}
        />
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
});