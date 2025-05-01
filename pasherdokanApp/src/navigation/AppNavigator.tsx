import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import ShopkeeperDashboard from '../screens/Shopkeeper/Dashboard';
import AddShop from '../screens/Shopkeeper/AddShop';
import AddProduct from '../screens/Shopkeeper/AddProduct';
import CustomerDashboard from '../screens/Customer/Dashboard';
import ShopDetail from '../screens/Customer/ShopDetail';
import OrderPlacement from '../screens/Customer/OrderPlacement';

// Define the parameter list for the navigation stack
type RootStackParamList = {
  Login: undefined;
  ShopkeeperDashboard: { shopId?: string };
  AddShop: undefined;
  AddProduct: { shopId: string };
  CustomerDashboard: undefined;
  ShopDetail: { shop: { _id: string; name: string; shopType: string; location: { latitude: number; longitude: number } } };
  OrderPlacement: { shop: { _id: string; name: string }; product: { _id: string; name: string; price: number } };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ShopkeeperDashboard" component={ShopkeeperDashboard} />
        <Stack.Screen name="AddShop" component={AddShop} />
        <Stack.Screen name="AddProduct" component={AddProduct} />
        <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
        <Stack.Screen name="ShopDetail" component={ShopDetail} />
        <Stack.Screen name="OrderPlacement" component={OrderPlacement} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
