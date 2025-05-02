import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from './Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  Logout: undefined;
};

type LogoutButtonProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Logout'>;
};

const LogoutButton: React.FC<LogoutButtonProps> = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userRole']);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Logout" onPress={handleLogout} color="#FF3B30" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingRight: 10,
  },
});

export default LogoutButton;
