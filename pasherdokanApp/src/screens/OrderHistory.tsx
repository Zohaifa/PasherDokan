import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuth } from '../utils/auth';
import api from '../services/api';
import Button from '../components/Button';

type Order = {
  _id: string;
  shopId: string;
  products: { productId: string; quantity: number }[];
  totalPrice: number;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: string;
};

type RootStackParamList = {
  OrderHistory: undefined;
};

type Props = StackScreenProps<RootStackParamList, 'OrderHistory'>;

const OrderHistory: React.FC<Props> = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/customer');
      setOrders(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load order history');
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <Text>Order ID: {item._id}</Text>
      <Text>Total: ${item.totalPrice.toFixed(2)}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  );

  if (!isAuthenticated) {
    return <Text>Please log in to view your order history</Text>;
  }

  return (
    <View>
      <Text style={styles.titleText}>Order History</Text>
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>No orders found</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
        />
      )}
      <Button title="Refresh" onPress={fetchOrders} />
    </View>
  );
};

const styles = StyleSheet.create({
  orderItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  titleText: {
    fontSize: 20,
    padding: 10,
  },
  noOrdersText: {
    padding: 10,
  },
});

export default OrderHistory;
