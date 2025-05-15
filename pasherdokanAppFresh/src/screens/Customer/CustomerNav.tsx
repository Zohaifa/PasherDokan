import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Tab = createBottomTabNavigator();

interface CustomerLayoutProps {
  children: React.ReactNode;
  currentTab: string;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children, currentTab }) => {
  const router = useRouter();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap | undefined;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
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
        options={{ title: 'Shops' }}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            router.push('/customer/dashboard');
          },
        }}
      >
        {() => children}
      </Tab.Screen>
      
      <Tab.Screen
        name="Cart"
        options={{ title: 'Cart' }}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            router.push('/customer/cart');
          },
        }}
      >
        {() => children}
      </Tab.Screen>
      
      <Tab.Screen
        name="Orders"
        options={{ title: 'My Orders' }}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            router.push('/order-history');
          },
        }}
      >
        {() => children}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default CustomerLayout;