import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../utils/auth';

const LogoutButton: React.FC = () => {
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    console.log('Logout button pressed');
    console.log('Router object available:', !!router);
    try {
      console.log('Logout proceeding...');
      if (typeof auth.logout === 'function') {
        await auth.logout();
        console.log('Logout successful, navigating to Login');
        router.replace('/login');
      } else {
        console.error('Logout function is not available in auth context');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

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