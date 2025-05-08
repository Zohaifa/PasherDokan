import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../utils/auth';

type LogoutButtonProps = {
  navigation: any;
};

const LogoutButton: React.FC<LogoutButtonProps> = ({ navigation }) => {
  const auth = useAuth();
  console.log('LogoutButton rendered, auth object:',
    JSON.stringify({
      hasLogout: typeof auth.logout === 'function',
      isAuthenticated: auth.isAuthenticated,
    })
  );

  const handleLogout = () => {
    console.log('Logout button pressed');
    // Simple direct test - try to navigate immediately to test button clicks
    console.log('Navigation object available:', !!navigation);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Logout confirmed, proceeding...');
              // Call the logout function from auth context
              if (typeof auth.logout === 'function') {
                await auth.logout();
                console.log('Logout successful, navigating to Login');
                // Reset navigation to Login screen
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  })
                );
              } else {
                console.error('Logout function is not available in auth context');
                Alert.alert('Error', 'Logout function not available');
              }
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Let's make the button more visible and easier to tap
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        console.log('TouchableOpacity pressed!');
        handleLogout();
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 4,
    margin: 10,
    minWidth: 80,
    minHeight: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LogoutButton;
