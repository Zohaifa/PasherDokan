import React, { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AuthProvider from '../src/utils/AuthProvider';
import SplashScreen from '../src/components/SplashScreen';
import { useAuth } from '../src/utils/auth';

function RootLayoutNav() {
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      if (userRole === 'shopkeeper') {
        router.replace('/shopkeeper/dashboard');
      } else if (userRole === 'customer') {
        router.replace('/customer/dashboard');
      }
    }
  }, [isAuthenticated, userRole, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
      <Stack.Screen name="cart" options={{ title: 'Cart' }} />
      <Stack.Screen name="order-history" options={{ title: 'Order History' }} />
      <Stack.Screen name="shopkeeper/dashboard" options={{ title: 'Shopkeeper Dashboard' }} />
      <Stack.Screen name="shopkeeper/add-shop" options={{ title: 'Add Shop' }} />
      <Stack.Screen name="shopkeeper/add-product" options={{ title: 'Add Product' }} />
      <Stack.Screen name="shopkeeper/orders" options={{ title: 'Orders' }} />
      <Stack.Screen name='shopkeeper/inventory' options={{ title: 'Inventory' }} />
      <Stack.Screen name="customer/dashboard" options={{ title: 'Customer Dashboard' }} />
      <Stack.Screen name="customer/shop-detail" options={{ title: 'Shop Detail' }} />
      <Stack.Screen name="customer/order-placement" options={{ title: 'Order Placement' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <>
        <StatusBar style="light" backgroundColor="#4a69bd" />
        <SplashScreen isLoading={isLoading} />
      </>
    );
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
    </AuthProvider>
  );
}