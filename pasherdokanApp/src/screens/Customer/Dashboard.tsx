import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import api from '../../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Shop = {
  _id: string;
  name: string;
  shopType: string;
  location: { latitude: number; longitude: number };
};

type RootStackParamList = {
  CustomerDashboard: undefined;
  ShopDetail: { shop: Shop };
};

type CustomerDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CustomerDashboard'>;

type Props = {
  navigation: CustomerDashboardNavigationProp;
};

const CustomerDashboard: React.FC<Props> = ({ navigation }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        fetchNearbyShops(latitude, longitude);
      },
      (error) => {
        Alert.alert('Error', 'Unable to fetch location. Please enable location services.');
        console.log(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  const fetchNearbyShops = async (lat: number, lng: number) => {
    try {
      const response = await api.get(`/shops/nearby?lat=${lat}&lng=${lng}`);
      setShops(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nearby shops.');
      console.error('Error fetching shops:', error);
    }
  };

  const renderShop = ({ item }: { item: Shop }) => (
    <View style={styles.shopCard}>
      <Text style={styles.shopName}>{item.name}</Text>
      <Text>Type: {item.shopType}</Text>
      <Button
        title="View Shop"
        onPress={() => navigation.navigate('ShopDetail', { shop: item })}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Shops</Text>
      {location ? (
        <Text style={styles.locationText}>
          Your Location: {location.latitude}, {location.longitude}
        </Text>
      ) : (
        <Text style={styles.locationText}>Fetching location...</Text>
      )}
      <FlatList
        data={shops}
        keyExtractor={(item) => item._id}
        renderItem={renderShop}
        ListEmptyComponent={<Text>No shops found nearby.</Text>}
      />
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
  locationText: {
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
  },
  shopCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomerDashboard;
