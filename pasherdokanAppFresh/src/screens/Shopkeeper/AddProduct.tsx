import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../../services/api';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Use the RootStackParamList defined in AppNavigator
type RootStackParamList = {
  AddProduct: { shopId: string };
};

type AddProductRouteProp = RouteProp<RootStackParamList, 'AddProduct'>;
type AddProductNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddProduct'>;

type Props = {
  route: AddProductRouteProp;
  navigation: AddProductNavigationProp;
};

const AddProduct: React.FC<Props> = ({ route, navigation }) => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const handleAddProduct = async () => {
    if (!productName || !category || !price || !stock) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      await api.post('/products', {
        name: productName,
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        shop: route.params?.shopId,
      });
      Alert.alert('Success', 'Product added successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add product. Please try again.');
      console.error('Add product error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Product</Text>
      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="Category (e.g., Food, Electronics)"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Price (in Taka)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Stock Quantity"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />
      <Button title="Add Product" onPress={handleAddProduct} />
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
});

export default AddProduct;
