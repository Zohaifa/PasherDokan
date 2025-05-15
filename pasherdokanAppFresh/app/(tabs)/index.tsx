import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../src/utils/auth';

export default function TabRedirect() {
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (userRole === 'shopkeeper') {
      router.replace('/shopkeeper/dashboard');
    } else if (userRole === 'customer') {
      router.replace('/customer/dashboard');
    }
  }, [isAuthenticated, userRole, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4a69bd" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});