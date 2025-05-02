import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useAuth } from '../utils/auth';
import api from '../services/api';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type RootStackParamList = {
  Cart: undefined;
  OrderPlacement: undefined;
};

type Props = StackScreenProps<RootStackParamList, 'Cart'>;

const Cart: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart'); // Placeholder endpoint - update with actual backend route
      setCartItems(response.data);
      setTotal(response.data.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0));
    } catch (error) {
      Alert.alert('Error', 'Failed to load cart');
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
    fetchCart(); // Refresh total and sync with backend
  };

  const removeItem = (productId: string) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
    fetchCart(); // Sync with backend
  };

  const proceedToCheckout = () => {
    if (cartItems.length > 0) {
      navigation.navigate('OrderPlacement');
    } else {
      Alert.alert('Cart Empty', 'Please add items to your cart');
    }
  };

  if (!isAuthenticated) {
    return <Text>Please log in to view your cart</Text>;
  }

  return (
    <View>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name} - ${item.price} x {item.quantity}</Text>
            <Button title="+" onPress={() => updateQuantity(item.productId, item.quantity + 1)} />
            <Button title="-" onPress={() => updateQuantity(item.productId, item.quantity - 1)} />
            <Button title="Remove" onPress={() => removeItem(item.productId)} color="red" />
          </View>
        )}
      />
      <Text>Total: ${total.toFixed(2)}</Text>
      <Button title="Proceed to Checkout" onPress={proceedToCheckout} />
    </View>
  );
};

export default Cart;
