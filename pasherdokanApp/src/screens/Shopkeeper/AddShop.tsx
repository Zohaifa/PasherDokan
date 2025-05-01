import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import api from '../../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  AddShop: undefined;
  ShopkeeperDashboard: { shopId: string };
};

type AddShopNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddShop'>;

type Props = {
  navigation: AddShopNavigationProp;
};

const AddShop: React.FC<Props> = ({ navigation }) => {
  const [shopName, setShopName] = useState('');
  const [shopType, setShopType] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        Alert.alert('Error', 'Unable to fetch location. Please enable location services.');
        console.log(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  const handleCreateShop = async () => {
    if (!shopName || !shopType || !location) {
      Alert.alert('Error', 'Please fill in all fields and ensure location is enabled.');
      return;
    }

    try {
      const response = await api.post('/shops', {
        name: shopName,
        shopType,
        location,
      });
      Alert.alert('Success', 'Shop created successfully!');
      navigation.navigate('ShopkeeperDashboard', { shopId: response.data._id });
    } catch (error) {
      Alert.alert('Error', 'Failed to create shop. Please try again.');
      console.error('Create shop error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Shop</Text>
      <TextInput
        style={styles.input}
        placeholder="Shop Name"
        value={shopName}
        onChangeText={setShopName}
      />
      <TextInput
        style={styles.input}
        placeholder="Shop Type (e.g., Grocery, Electronics)"
        value={shopType}
        onChangeText={setShopType}
      />
      {location ? (
        <Text style={styles.locationText}>
          Location: {location.latitude}, {location.longitude}
        </Text>
      ) : (
        <Text style={styles.locationText}>Fetching location...</Text>
      )}
      <Button title="Create Shop" onPress={handleCreateShop} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  locationText: {
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default AddShop;
