import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ImageBackground, StatusBar, BackHandler, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import ThemeToggle from '@/src/components/shared/ThemeToggle';
import PasswordSetupContent from '@/src/components/auth/owner/PasswordSetupContent';

export default function OwnerPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, theme } = useTheme();

  // Password states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

        <PasswordSetupContent
          colors={colors}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          loading={loading}
          setLoading={setLoading}
          params={params}
          completeOwnerRegistration={() => {}}
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