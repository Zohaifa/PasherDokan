import { Tabs } from 'expo-router';
import React, { ComponentProps } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../../src/utils/auth';
import { HapticTab } from '../../components/HapticTab';
import TabBarBackground from '../../components/ui/TabBarBackground';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { userRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; 
  }

  const getShopkeeperTabIcon = (route: { name: string }, focused: boolean, color: string) => {
    let iconName: ComponentProps<typeof Ionicons>['name'] = 'help-outline';
    if (route.name === 'shopkeeper/dashboard') {
      iconName = focused ? 'home' : 'home-outline';
    } else if (route.name === 'orders') {
      iconName = focused ? 'list' : 'list-outline';
    }
    return <Ionicons name={iconName} size={28} color={color} />;
  };

  const getCustomerTabIcon = (route: { name: string }, focused: boolean, color: string) => {
    let iconName: ComponentProps<typeof Ionicons>['name'] = 'help-outline';
    if (route.name === 'customer/dashboard') {
      iconName = focused ? 'grid' : 'grid-outline';
    } else if (route.name === 'cart') {
      iconName = focused ? 'cart' : 'cart-outline';
    } else if (route.name === 'order-history') {
      iconName = focused ? 'list' : 'list-outline';
    }
    return <Ionicons name={iconName} size={28} color={color} />;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      {userRole === 'shopkeeper' ? (
        <>
          <Tabs.Screen
            name="shopkeeper"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ focused, color }) => getShopkeeperTabIcon({ name: 'shopkeeper/dashboard' }, focused, color),
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: 'Orders',
              tabBarIcon: ({ focused, color }) => getShopkeeperTabIcon({ name: 'orders' }, focused, color),
            }}
          />
        </>
      ) : (
        <>
          <Tabs.Screen
            name="customer"
            options={{
              title: 'Shops',
              tabBarIcon: ({ focused, color }) => getCustomerTabIcon({ name: 'customer/dashboard' }, focused, color),
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{
              title: 'Cart',
              tabBarIcon: ({ focused, color }) => getCustomerTabIcon({ name: 'cart' }, focused, color),
            }}
          />
          <Tabs.Screen
            name="order-history"
            options={{
              title: 'Orders',
              tabBarIcon: ({ focused, color }) => getCustomerTabIcon({ name: 'order-history' }, focused, color),
            }}
          />
        </>
      )}
    </Tabs>
  );
}