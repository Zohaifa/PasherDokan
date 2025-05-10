import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../services/api';
import ShopkeeperLayout from './BottomNav';

const AddProduct: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { shopId } = useLocalSearchParams();

  const handleAddProduct = async () => {
    if (!productName || !category || !price || !stock) {
      Alert.alert('Missing Information', 'Please fill in all fields to continue.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/products', {
        name: productName,
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        shop: shopId,
      });
      Alert.alert('Success', 'Product added successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add product. Please try again.');
      console.error('Add product error:', error);
    } finally {
      setLoading(false);
    }
  };

  const PageContent = () => (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Add New Product</Text>
            <Text style={styles.subtitle}>Fill in the details to add a product to your inventory</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                placeholderTextColor="#a0a0a0"
                value={productName}
                onChangeText={setProductName}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Food, Electronics, Clothing"
                placeholderTextColor="#a0a0a0"
                value={category}
                onChangeText={setCategory}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (Taka)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter price"
                placeholderTextColor="#a0a0a0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Stock Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="Available quantity"
                placeholderTextColor="#a0a0a0"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddProduct}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Add Product</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return (
    <ShopkeeperLayout currentTab="AddProduct">
      <PageContent />
    </ShopkeeperLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e2c41',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  formContainer: {
    marginVertical: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e2c41',
    marginBottom: 8,
  },
  input: {
    height: 54,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e5eb',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2c3e50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 16,
    gap: 12,
  },
  addButton: {
    height: 54,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  cancelButton: {
    height: 54,
    backgroundColor: 'rgba(239, 241, 245, 0.9)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.3,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.3,
  },
});

export default AddProduct;