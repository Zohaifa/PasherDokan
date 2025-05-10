
// This file defines the main navigation structure of the app, including authentication and role-based navigation.
// This file is no longer used in the app, as the navigation structure is expo router based.
// However, it is kept here for reference and potential future use.




import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../utils/auth';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ShopkeeperDashboard from '../screens/Shopkeeper/Dashboard';
import AddShop from '../screens/Shopkeeper/AddShop';
import AddProduct from '../screens/Shopkeeper/AddProduct';
import CustomerDashboard from '../screens/Customer/Dashboard';
import ShopDetail from '../screens/Customer/ShopDetail';
import OrderPlacement from '../screens/Customer/OrderPlacement';
import Cart from '../screens/Cart';
import OrderHistory from '../screens/OrderHistory';
//import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack navigator for shopkeeper screens
const ShopkeeperStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopkeeperDashboardScreen" component={ShopkeeperDashboard as React.ComponentType} />
      <Stack.Screen name="AddShop" component={AddShop as React.ComponentType} />
      <Stack.Screen name="AddProduct" component={AddProduct as React.ComponentType} />
    </Stack.Navigator>
  );
};

// Stack navigator for customer screens
const CustomerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerDashboardScreen" component={CustomerDashboard as React.ComponentType} />
      <Stack.Screen name="ShopDetail" component={ShopDetail as React.ComponentType} />
      <Stack.Screen name="OrderPlacement" component={OrderPlacement as React.ComponentType} />
    </Stack.Navigator>
  );
};

// Icon function for shopkeeper tabs
const getShopkeeperTabIcon = (route: any, focused: boolean, color: string, size: number) => {
  let iconName = '';
  if (route.name === 'Dashboard') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (route.name === 'Orders') {
    iconName = focused ? 'list' : 'list-outline';
  }
  //return <Ionicons name={iconName} size={size} color={color} />;
};

// Bottom tab navigator for shopkeeper
const ShopkeeperTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getShopkeeperTabIcon(route, focused, color, size),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={ShopkeeperStack} />
      <Tab.Screen name="Orders" component={OrderHistory as React.ComponentType} />
    </Tab.Navigator>
  );
};
const getCustomerTabIcon = (route: any, focused: boolean, color: string, size: number) => {
  let iconName = '';
  if (route.name === 'Shops') {
    iconName = focused ? 'grid' : 'grid-outline';
  } else if (route.name === 'Cart') {
    iconName = focused ? 'cart' : 'cart-outline';
  } else if (route.name === 'Orders') {
    iconName = focused ? 'list' : 'list-outline';
  }
  return <Ionicons name={iconName} size={size} color={color} />;
};

const CustomerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getCustomerTabIcon(route, focused, color, size),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Shops" component={CustomerStack} />
      <Tab.Screen name="Cart" component={Cart as React.ComponentType} />
      <Tab.Screen name="Orders" component={OrderHistory as React.ComponentType} />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? null;
  const userRole = auth?.userRole;

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated === false ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen as React.ComponentType} />
            <Stack.Screen name="Register" component={RegisterScreen as React.ComponentType} />
          </>
        ) : (
          <>
            {userRole === 'shopkeeper' ? (
              <Stack.Screen name="ShopkeeperMain" component={ShopkeeperTabs} />
            ) : (
              <Stack.Screen name="CustomerMain" component={CustomerTabs} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
