import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../services/api';

const OrderPlacement: React.FC = () => {
  const { shop: shopParam, product: productParam } = useLocalSearchParams();
  const router = useRouter();
  const shop = shopParam ? JSON.parse(shopParam as string) : null;
  const product = productParam ? JSON.parse(productParam as string) : null;
  const [quantity, setQuantity] = useState(1);

  const handlePlaceOrder = async () => {
    if (!shop || !product) {
      Alert.alert('Error', 'Missing shop or product information.');
      return;
    }

    try {
      await api.post('/orders', {
        shop: shop._id,
        product: product._id,
        quantity,
        totalPrice: product.price * quantity,
        paymentMethod: 'cash_on_delivery',
      });
      Alert.alert('Success', 'Order placed successfully!');
      router.push('/customer/dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
      console.error('Place order error:', error);
    }
  };

  if (!shop || !product) {
    return <View><Text>Error: Shop or product data not found.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Place Order</Text>
      <Text style={styles.info}>Shop: {shop.name}</Text>
      <Text style={styles.info}>Product: {product.name}</Text>
      <Text style={styles.info}>Price per Unit: ৳{product.price}</Text>
      <Text style={styles.info}>Quantity: {quantity}</Text>
      <View style={styles.quantityContainer}>
        <Button title="-" onPress={() => setQuantity(Math.max(1, quantity - 1))} />
        <Button title="+" onPress={() => setQuantity(quantity + 1)} />
      </View>
      <Text style={styles.info}>Total: ৳{product.price * quantity}</Text>
      <Text style={styles.info}>Payment: Cash on Delivery</Text>
      <Button title="Place Order" onPress={handlePlaceOrder} />
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
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    width: 100,
  },
});

export default OrderPlacement;