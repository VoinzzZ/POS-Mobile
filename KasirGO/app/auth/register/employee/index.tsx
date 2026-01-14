import React, { useEffect } from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from '@/src/components/shared/ThemeToggle';
import PinRegistrationContent from '@/src/components/auth/employee/PinRegistrationContent';
import { useOrientation } from '@/src/hooks/useOrientation';

export default function EmployeeRegistrationScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { isLandscape: isLand } = useOrientation();

  const handleBackToRegisterType = () => {
    router.push('/auth/registerSelectType');
  };

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor("transparent");
    StatusBar.setTranslucent(true);
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
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: colors.card,
              top: isLand ? 30 : 75,
              left: isLand ? 30 : 20,
              width: isLand ? 50 : 40,
              height: isLand ? 50 : 40,
              borderRadius: isLand ? 25 : 20,
            }
          ]}
          onPress={handleBackToRegisterType}
        >
          <Ionicons name="arrow-back" size={isLand ? 24 : 20} color={colors.text} />
        </TouchableOpacity>

        <ThemeToggle
          style={{
            top: isLand ? 30 : 60,
            right: isLand ? 30 : 20,
          }}
        />

        <PinRegistrationContent onBackToRegisterType={handleBackToRegisterType} />
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