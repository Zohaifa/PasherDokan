import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthContext } from './src/utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<'shopkeeper' | 'customer' | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Starting AsyncStorage check...');
        const token = await AsyncStorage.getItem('userToken');
        console.log('Token retrieved:', token);
        const role = await AsyncStorage.getItem('userRole');
        console.log('Role retrieved:', role);
        if (token && role && ['shopkeeper', 'customer'].includes(role)) {
          setIsAuthenticated(true);
          setUserRole(role as 'shopkeeper' | 'customer');
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userRole, setUserRole }}>
        <AppNavigator />
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
