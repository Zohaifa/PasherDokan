import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import api from '../../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../utils/auth';
import LogoutButton from '../../components/LogoutButton';

type Shop = {
  _id: string;
  name: string;
  shopType: string;
  location: { latitude: number; longitude: number };
};

type RootStackParamList = {
  CustomerDashboard: undefined;
  ShopDetail: { shop: Shop };
  Login: undefined;
};

type CustomerDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CustomerDashboard'>;

type Props = {
  navigation: CustomerDashboardNavigationProp;
};

const CustomerDashboard: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isAuthenticated) {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchNearbyShops(latitude, longitude);
        },
        (error) => {
          setLoading(false);
          Alert.alert('Error', 'Unable to fetch location. Please enable location services.');
          console.log(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  }, [isAuthenticated]);

  const fetchNearbyShops = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/shops/nearby?lat=${lat}&lng=${lng}`);
      setShops(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nearby shops.');
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderShop = ({ item }: { item: Shop }) => (
    <View style={styles.shopCard}>
      <View style={styles.shopInfo}>
        <Text style={styles.shopName}>{item.name}</Text>
        <Text style={styles.shopType}>Type: {item.shopType}</Text>
      </View>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => navigation.navigate('ShopDetail', { shop: item })}
      >
        <Text style={styles.viewButtonText}>View Shop</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.emptyText}>Please log in to view nearby shops</Text>
        <TouchableOpacity
          style={[styles.viewButton, styles.loginButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.viewButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>PD</Text>
        </View>
        <Text style={styles.headerTitle}>PasherDokan</Text>
        <View style={styles.logoutButtonContainer}>
          <LogoutButton navigation={navigation} />
        </View>
      </View>
      <Text style={styles.title}>Nearby Shops</Text>
      {location ? (
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Your Location:</Text>
          <Text style={styles.locationText}>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      ) : (
        <Text style={styles.locationText}>Fetching location...</Text>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a69bd" />
          <Text style={styles.loadingText}>Finding shops near you...</Text>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item._id}
          renderItem={renderShop}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No shops found nearby.</Text>
              <Text style={styles.emptySubtext}>Try expanding your search radius or check back later.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a69bd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1, // Allow title to take available space
  },
  logoutButtonContainer: {
    marginLeft: 'auto', // Push the logout button to the right
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#2c3e50',
  },
  locationContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  locationText: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
  },
  shopCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  shopType: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  viewButton: {
    backgroundColor: '#4a69bd',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  loginButton: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default CustomerDashboard;
