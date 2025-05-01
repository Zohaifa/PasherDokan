import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import api from '../../services/api';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  OrderPlacement: { shop: { _id: string; name: string }; product: { _id: string; name: string; price: number } };
  CustomerDashboard: undefined;
};

type OrderPlacementRouteProp = RouteProp<RootStackParamList, 'OrderPlacement'>;
type OrderPlacementNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderPlacement'>;

type Props = {
  route: OrderPlacementRouteProp;
  navigation: OrderPlacementNavigationProp;
};

const OrderPlacement: React.FC<Props> = ({ route, navigation }) => {
  const { shop, product } = route.params;
  const [quantity, setQuantity] = useState(1);

  const handlePlaceOrder = async () => {
    try {
      await api.post('/orders', {
        shop: shop._id,
        product: product._id,
        quantity,
        totalPrice: product.price * quantity,
        paymentMethod: 'cash_on_delivery',
      });
      Alert.alert('Success', 'Order placed successfully!');
      navigation.navigate('CustomerDashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
      console.error('Place order error:', error);
    }
  };

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
