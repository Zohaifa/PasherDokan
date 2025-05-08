import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuth } from '../../utils/auth';
import api from '../../services/api';

type RootStackParamList = {
  AddShop: undefined;
  ShopkeeperDashboard: { shopId?: string };
  Login: undefined;
};

type Props = StackScreenProps<RootStackParamList, 'AddShop'>;

const AddShop: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateShop = async () => {
    // Validation
    if (!name || !type || !location) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Parse location string to get latitude and longitude
      const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
      if (isNaN(lat) || isNaN(lng)) {
        setError('Invalid location format. Use "latitude,longitude"');
        setLoading(false);
        return;
      }
      const response = await api.post('/shops', {
        name,
        type,
        location: { type: 'Point', coordinates: [lng, lat] },
      });
      Alert.alert(
        'Success',
        'Shop created successfully',
        [{ text: 'OK', onPress: () => navigation.navigate('ShopkeeperDashboard', { shopId: response.data._id }) }]
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create shop');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authMessage}>
          <Text style={styles.authText}>Please log in to add a shop</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Create a New Shop</Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Shop Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter shop name"
                  placeholderTextColor="#a0a0a0"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setError('');
                  }}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Shop Type</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Grocery, Electronics, Clothing"
                  placeholderTextColor="#a0a0a0"
                  value={type}
                  onChangeText={(text) => {
                    setType(text);
                    setError('');
                  }}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Format: latitude,longitude (e.g., 23.8103,90.4125)"
                  placeholderTextColor="#a0a0a0"
                  value={location}
                  onChangeText={(text) => {
                    setLocation(text);
                    setError('');
                  }}
                />
                <Text style={styles.helperText}>
                  Enter the coordinates of your shop location
                </Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateShop}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Create Shop</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => navigation.goBack()}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center', // Centers content vertically
  },
  header: {
    marginBottom: 5,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 20, // Add vertical margin
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcdde1',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#2c3e50',
  },
  helperText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 10,
    gap: 10,
  },
  createButton: {
    height: 50,
    backgroundColor: '#4a69bd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cancelButton: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  authMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a69bd',
  },
});

export default AddShop;
