import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import LogoutButton from '../../components/LogoutButton';
import api from '../../services/api';
import ShopkeeperLayout from './BottomNav';

const OrdersScreen = () => {
  const { shopId } = useLocalSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!shopId) {
        setError('No shop ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/orders/shop/${shopId}`);
        setOrders(response.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [shopId]);

  if (!shopId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>PD</Text>
          </View>
          <Text style={styles.headerTitle}>Orders</Text>
          <View style={styles.logoutButtonContainer}>
            <LogoutButton />
          </View>
        </View>
        <View style={styles.centered}>
          <Text style={styles.statusInactive}>Please create a shop first</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>PD</Text>
          </View>
          <Text style={styles.headerTitle}>Orders</Text>
          <View style={styles.logoutButtonContainer}>
            <LogoutButton />
          </View>
        </View>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4a69bd" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.statusMessage}>No orders found</Text>
          </View>
        ) : (
          <>
            {orders.map((order) => (
              <View key={order._id} style={styles.orderCard}>
                <Text style={styles.orderId}>Order ID: {order._id}</Text>
                <Text style={styles.orderDetail}>Customer: {order.customerName || 'Unknown'}</Text>
                <Text style={styles.orderDetail}>Status: {order.status || 'Pending'}</Text>
                <Text style={styles.orderDetail}>Date: {order.createdAt || 'N/A'}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const ShopkeeperOrders: React.FC = () => {
  return (
    <ShopkeeperLayout currentTab="Orders">
      <OrdersScreen />
    </ShopkeeperLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginTop: 35,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  logoutButtonContainer: {
    marginLeft: 'auto',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  orderDetail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  statusInactive: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  statusMessage: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
});

export default ShopkeeperOrders;