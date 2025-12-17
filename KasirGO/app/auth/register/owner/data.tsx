import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import DataContent from '@/src/components/auth/owner/DataContent';

interface OwnerEmailData {
  user_email: string;
  user_name: string;
  user_full_name: string;
  user_phone: string;
  registration_id?: string; // Keep as string for consistency with router params
}

export default function OwnerEmailSetupScreen() {
  const [emailData, setEmailData] = useState<OwnerEmailData>({
    user_email: '',
    user_name: '',
    user_full_name: '',
    user_phone: '',
  });
  const [errors, setErrors] = useState<Partial<OwnerEmailData>>({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, theme } = useTheme();
  const { sendOwnerEmailVerification } = useAuth();

  const handleBack = () => {
    router.back();
  };

  // Handle registration recovery when registration_id is invalid
  const handleRegistrationRecovery = () => {
    Alert.alert(
      'Mulai Ulang Registrasi',
      'Data registrasi Anda tidak valid. Apakah Anda ingin memulai registrasi dari awal?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Mulai dari Awal',
          style: 'destructive',
          onPress: () => router.replace('/auth/registerSelectType')
        }
      ]
    );
  };

  useEffect(() => {
    // Pre-fill all data that was provided from previous step or when returning from OTP verification
    if (params) {
      setEmailData(prev => ({
        ...prev,
        user_email: params.user_email || params.tenant_email || prev.user_email,
        user_name: params.user_name || prev.user_name,
        user_full_name: params.user_full_name || prev.user_full_name,
        user_phone: params.user_phone || prev.user_phone,
      }));
    }
  }, [params.user_email, params.user_name, params.user_full_name, params.user_phone, params.tenant_email]);

  // Light mode - use light background image
  if (theme === "light") {
    return (
      <ImageBackground
        source={require("../../../../assets/images/backgroundAuthLight.png")}
        resizeMode="cover"
        style={styles.background}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
          hidden={false}
        />
        {/* Back Button - Top Left Corner */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <DataContent
          colors={colors}
          emailData={emailData}
          setEmailData={setEmailData}
          errors={errors}
          setErrors={setErrors}
          loading={loading}
          setLoading={setLoading}
          params={params}
          sendOwnerEmailVerification={sendOwnerEmailVerification}
          router={router}
        />
      </ImageBackground>
    );
  }

  // Dark mode - use dark background image
  return (
    <ImageBackground
      source={require("../../../../assets/images/backgroundAuth.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
        hidden={false}
      />
      {/* Back Button - Top Left Corner */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.card }]}
        onPress={handleBack}
      >
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </TouchableOpacity>

      <DataContent
        colors={colors}
        emailData={emailData}
        setEmailData={setEmailData}
        errors={errors}
        setErrors={setErrors}
        loading={loading}
        setLoading={setLoading}
        params={params}
        sendOwnerEmailVerification={sendOwnerEmailVerification}
        router={router}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
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