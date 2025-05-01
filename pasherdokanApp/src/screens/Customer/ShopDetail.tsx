import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import api from '../../services/api';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};

type Shop = {
  _id: string;
  name: string;
  shopType: string;
  location: { latitude: number; longitude: number };
};

type RootStackParamList = {
  ShopDetail: { shop: Shop };
  OrderPlacement: { shop: { _id: string; name: string }; product: { _id: string; name: string; price: number } };
};

type ShopDetailRouteProp = RouteProp<RootStackParamList, 'ShopDetail'>;
type ShopDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ShopDetail'>;

type Props = {
  route: ShopDetailRouteProp;
  navigation: ShopDetailNavigationProp;
};

const ShopDetail: React.FC<Props> = ({ route, navigation }) => {
  const { shop } = route.params;
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get(`/products?shop=${shop._id}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [shop._id]);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text>Category: {item.category}</Text>
      <Text>Price: ৳{item.price}</Text>
      <Text>Stock: {item.stock}</Text>
      <Button
        title="Order Now"
        onPress={() => navigation.navigate('OrderPlacement', { shop: { _id: shop._id, name: shop.name }, product: { _id: item._id, name: item.name, price: item.price } })}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.shopName}>{shop.name}</Text>
      <Text style={styles.shopInfo}>Type: {shop.shopType}</Text>
      <Text style={styles.shopInfo}>
        Location: {shop.location.latitude}, {shop.location.longitude}
      </Text>
      <Text style={styles.sectionTitle}>Products</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        ListEmptyComponent={<Text>No products available.</Text>}
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
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  shopInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  productCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ShopDetail;
