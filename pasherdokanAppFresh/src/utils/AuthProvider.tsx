import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './auth';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<'shopkeeper' | 'customer' | null>(null);
  const [token, setToken] = useState<string | null>(null); 

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Starting AsyncStorage check...');
        const storedToken = await AsyncStorage.getItem('userToken');
        console.log('Token retrieved:', storedToken);
        const role = await AsyncStorage.getItem('userRole');
        console.log('Role retrieved:', role);
        if (storedToken && role && ['shopkeeper', 'customer'].includes(role)) {
          setIsAuthenticated(true);
          setUserRole(role as 'shopkeeper' | 'customer');
          setToken(storedToken);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setToken(null);
      }
    };
    checkAuth();
  }, []);

  const logout = async () => {
    console.log('AuthProvider: logout function called');
    try {
      console.log('AuthProvider: clearing AsyncStorage');
      await AsyncStorage.removeItem('userToken');
      console.log('AuthProvider: userToken removed');
      await AsyncStorage.removeItem('userRole');
      console.log('AuthProvider: userRole removed');
      console.log('AuthProvider: updating state');
      setIsAuthenticated(false);
      setUserRole(null);
      setToken(null);
      console.log('AuthProvider: state updated');
    } catch (error) {
      console.error('AuthProvider: logout error:', error);
      throw error;
    }
  };

  const contextValue = {
    isAuthenticated,
    setIsAuthenticated,
    userRole,
    setUserRole,
    token,
    setToken,
    logout,
  };

  console.log('AuthProvider rendering with logout function available:', typeof logout === 'function');
  console.log('Current token in context:', token);

  if (isAuthenticated === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthProvider;