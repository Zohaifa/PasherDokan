import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

interface ShopkeeperLayoutProps {
  children: React.ReactNode;
  currentTab: string;
}

const ShopkeeperLayout: React.FC<ShopkeeperLayoutProps> = ({ children, currentTab }) => {
  const { shopId: urlShopId } = useLocalSearchParams();
  const [activeShopId, setActiveShopId] = useState<string | null>(urlShopId as string || null);
  const router = useRouter();

  // Check both URL params and AsyncStorage for shopId
  useEffect(() => {
    const getStoredShopId = async () => {
      if (!activeShopId) {
        try {
          const storedShopId = await AsyncStorage.getItem('activeShopId');
          if (storedShopId) {
            console.log('Retrieved shopId from storage:', storedShopId);
            setActiveShopId(storedShopId);
          }
        } catch (err) {
          console.error('Failed to get shopId from storage:', err);
        }
      }
    };
    
    getStoredShopId();
  }, [urlShopId, activeShopId]);

  // Use either URL param shopId or the stored one
  const effectiveShopId = urlShopId || activeShopId;

  // Remove the unused function since we're handling navigation directly in the listeners

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
              router.push(`/shopkeeper/dashboard${effectiveShopId ? `?shopId=${effectiveShopId}` : ''}`);
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
              if (effectiveShopId) {
                router.push(`/shopkeeper/add-product?shopId=${effectiveShopId}`);
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
              if (effectiveShopId) {
                router.push(`/shopkeeper/inventory?shopId=${effectiveShopId}`);
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
              if (effectiveShopId) {
                router.push(`/shopkeeper/orders?shopId=${effectiveShopId}`);
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