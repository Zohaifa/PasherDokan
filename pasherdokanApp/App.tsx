import React, { useEffect, useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthContext } from './src/utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<'shopkeeper' | 'customer' | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');
        if (token && role) {
          setIsAuthenticated(true);
          setUserRole(role as 'shopkeeper' | 'customer');
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return null; // Show a loading screen here in production
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userRole, setUserRole }}>
        <AppNavigator />
    </AuthContext.Provider>
  );
};

export default App;
