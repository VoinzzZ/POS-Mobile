import React from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from '@/src/components/shared/ThemeToggle';
import RegisterTypeContent from '@/src/components/auth/RegisterTypeContent';
import { useOrientation } from '@/src/hooks/useOrientation';

export default function RegisterSelectTypeScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  const backgroundAsset = theme === "light"
    ? require("../../assets/images/backgroundAuthLight.png")
    : require("../../assets/images/backgroundAuth.png");

  const { isLandscape: isLand, isTablet: isTab, width, height } = useOrientation();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundAsset}
        resizeMode={isLand && isTab ? "cover" : "cover"}
        style={[styles.background, isLand && isTab ? { width: width, height: height } : {}]}
      >
        {/* Back Button - Top Left Corner */}
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: colors.card,
              top: isLand && isTab ? 30 : 60,
              left: isLand && isTab ? 30 : 20,
              width: isLand && isTab ? 50 : 40,
              height: isLand && isTab ? 50 : 40,
              borderRadius: isLand && isTab ? 25 : 20,
            }
          ]}
          onPress={handleBackToLogin}
        >
          <Ionicons name="arrow-back" size={isLand && isTab ? 24 : 20} color={colors.text} />
        </TouchableOpacity>

        {/* Theme Toggle - Top Right Corner */}
        <ThemeToggle
          style={{
            top: isLand && isTab ? 30 : 60,
            right: isLand && isTab ? 30 : 20,
          }}
        />

        <RegisterTypeContent
          onBackToLogin={handleBackToLogin}
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
});