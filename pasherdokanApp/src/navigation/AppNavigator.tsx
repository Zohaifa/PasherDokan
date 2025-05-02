import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
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

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? null;
  const userRole = auth?.userRole;

  if (isAuthenticated === null) {
    return null; // Loading state handled in App.tsx
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
              <>
                <Stack.Screen name="ShopkeeperDashboard" component={ShopkeeperDashboard as React.ComponentType} />
                <Stack.Screen name="AddShop" component={AddShop as React.ComponentType} />
                <Stack.Screen name="AddProduct" component={AddProduct as React.ComponentType} />
              </>
            ) : (
              <>
                <Stack.Screen name="CustomerDashboard" component={CustomerDashboard as React.ComponentType} />
                <Stack.Screen name="ShopDetail" component={ShopDetail as React.ComponentType} />
                <Stack.Screen name="OrderPlacement" component={OrderPlacement as React.ComponentType} />
                <Stack.Screen name="Cart" component={Cart as React.ComponentType} />
                <Stack.Screen name="OrderHistory" component={OrderHistory as React.ComponentType} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
