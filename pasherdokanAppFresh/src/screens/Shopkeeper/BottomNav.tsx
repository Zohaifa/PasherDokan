import React from 'react';
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const Tab = createBottomTabNavigator();

interface ShopkeeperLayoutProps {
  children: React.ReactNode;
  currentTab: string;
}

const ShopkeeperLayout: React.FC<ShopkeeperLayoutProps> = ({ children, currentTab }) => {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();

  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap | undefined;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'AddProduct') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Inventory') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Orders') {
              iconName = focused ? 'receipt' : 'receipt-outline';
            }

            return iconName ? <Ionicons name={iconName} size={size} color={color} /> : null;
          },
          tabBarActiveTintColor: '#4a69bd',
          tabBarInactiveTintColor: '#7f8c8d',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            height: 75,
            paddingBottom: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerShown: false,
        })}
        initialRouteName={currentTab}
      >
        <Tab.Screen
          name="Dashboard"
          options={{ title: 'Dashboard' }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              router.push(`/shopkeeper/dashboard?shopId=${shopId || ''}`);
            },
          }}
        >
          {() => children}
        </Tab.Screen>
        <Tab.Screen
          name="AddProduct"
          options={{ title: 'Add Product' }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              if (shopId) {
                router.push(`/shopkeeper/add-product?shopId=${shopId}`);
              } else {
                Alert.alert('Error', 'Please create a shop first.');
              }
            },
          }}
        >
          {() => children}
        </Tab.Screen>
        <Tab.Screen
          name="Inventory"
          options={{ title: 'Inventory' }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              if (shopId) {
                router.push(`/shopkeeper/inventory?shopId=${shopId}`);
              } else {
                Alert.alert('Error', 'Please create a shop first.');
              }
            },
          }}
        >
          {() => children}
        </Tab.Screen>
        <Tab.Screen
          name="Orders"
          options={{ title: 'Orders' }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              if (shopId) {
                router.push(`/shopkeeper/orders?shopId=${shopId}`);
              } else {
                Alert.alert('Error', 'Please create a shop first.');
              }
            },
          }}
        >
          {() => children}
        </Tab.Screen>
      </Tab.Navigator>
  );
};

export default ShopkeeperLayout;