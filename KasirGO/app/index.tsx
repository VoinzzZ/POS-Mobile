import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();

  // Show loading indicator
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // Redirect based on auth state
  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (user.role === 'ADMIN') {
    return <Redirect href="/(admin)/dashboard" />;
  }

  if (user.role === 'CASHIER') {
    return <Redirect href="/(cashier)/dashboard" />;
  }

  // Fallback
  return <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  text: {
    marginTop: 10,
    color: '#94a3b8',
    fontSize: 16,
  },
});
