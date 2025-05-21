import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { useAuth } from '../../utils/auth';
import ShopkeeperLayout from './BottomNav';

const ANIMATION_DURATION = 300;

const AddProductScreen = () => {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(20))[0];

  // Run entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, translateY]);

  // Memoize handlers to prevent re-renders
  const handleNameChange = useCallback((text: string) => {
    setName(text);
  }, []);

  const handleCategoryChange = useCallback((text: string) => {
    setCategory(text);
  }, []);

  const handlePriceChange = useCallback((text: string) => {
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(text) || text === '') {
      setPrice(text);
    }
  }, []);

  const handleStockChange = useCallback((text: string) => {
    // Allow only numbers and decimal point for kg
    if (/^\d*\.?\d*$/.test(text) || text === '') {
      setStock(text);
    }
  }, []);

  const handleSubmit = async () => {
    // Validate inputs
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!category.trim()) {
      setError('Category is required');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price per kg');
      return;
    }

    if (!stock || parseFloat(stock) <= 0) {
      setError('Please enter a valid stock quantity in kg');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Prepare product data
      const productData = {
        name: name.trim(),
        category: category.trim(),
        price: parseFloat(price),
        stock: parseFloat(stock),
        shopId
      };
      
      // Add the authorization header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      
      // Send API request with proper authorization
      await api.post('/products', productData, config);
      
      // Success message and redirect
      Alert.alert(
        'Success',
        'Product added successfully',
        [
          {
            text: 'View Inventory',
            onPress: () => router.push(`/shopkeeper/inventory?shopId=${shopId}`)
          },
          {
            text: 'Add Another',
            onPress: () => {
              setName('');
              setCategory('');
              setPrice('');
              setStock('');
            }
          }
        ]
      );
    } catch (err: any) {
      console.error('Error adding product:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Add Product</Text>
            <Text style={styles.headerSubtitle}>{shopId ? 'Add new item to inventory' : 'Please select a shop first'}</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!shopId ? (
            <Animated.View 
              style={[
                styles.formSection,
                { opacity: fadeAnim, transform: [{ translateY }] }
              ]}
            >
              <View style={styles.noShopContainer}>
                <View style={styles.noShopIconContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
                </View>
                <Text style={styles.statusInactive}>No Shop Selected</Text>
                <Text style={styles.statusMessage}>Please select a shop to add products</Text>
                
                <TouchableOpacity
                  style={styles.createFirstShopButton}
                  onPress={() => router.push('/shopkeeper/dashboard')}
                >
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                  <Text style={styles.createFirstShopText}>Go to Dashboard</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            <>
              {/* Product Info Form */}
              <Animated.View 
                style={[
                  styles.formSection,
                  { opacity: fadeAnim, transform: [{ translateY }] }
                ]}
              >
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Product Information</Text>
                </View>
                
                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Product Name</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="cube-outline" size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter product name (e.g., Alu, Peyaj)"
                      placeholderTextColor="#a0a0a0"
                      value={name}
                      onChangeText={handleNameChange}
                    />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="pricetag-outline" size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Vegetables, Fruits, Spices"
                      placeholderTextColor="#a0a0a0"
                      value={category}
                      onChangeText={handleCategoryChange}
                    />
                  </View>
                </View>
                
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Price (৳) per kg</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="cash-outline" size={20} color="#64748b" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor="#a0a0a0"
                        keyboardType="decimal-pad"
                        value={price}
                        onChangeText={handlePriceChange}
                      />
                      <View style={styles.unitBadge}>
                        <Text style={styles.unitText}>৳/kg</Text>
                      </View>
                    </View>
                    <Text style={styles.helperText}>Enter price for 1kg</Text>
                  </View>
                  
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Stock Quantity</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="scale-outline" size={20} color="#64748b" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="0.0"
                        placeholderTextColor="#a0a0a0"
                        keyboardType="decimal-pad"
                        value={stock}
                        onChangeText={handleStockChange}
                      />
                      <View style={styles.unitBadge}>
                        <Text style={styles.unitText}>kg</Text>
                      </View>
                    </View>
                    <Text style={styles.helperText}>Total quantity in kilograms</Text>
                  </View>
                </View>

                <View style={styles.infoNote}>
                  <Ionicons name="information-circle-outline" size={16} color="#64748b" />
                  <Text style={styles.infoText}>
                    Customers can purchase in smaller quantities (grams)
                  </Text>
                </View>
              </Animated.View>

              {/* Submit Button */}
              <Animated.View 
                style={[
                  styles.buttonsContainer,
                  { opacity: fadeAnim }
                ]}
              >
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="add-circle" size={20} color="#ffffff" />
                      <Text style={styles.buttonText}>Add Product</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.back()}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const AddProduct: React.FC = () => {
  return (
    <ShopkeeperLayout currentTab="AddProduct">
      <AddProductScreen />
    </ShopkeeperLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 45 : 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f5f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e1e8f5',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: {
    flex: 1,
    color: '#e74c3c',
    fontSize: 14,
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#2c3e50',
  },
  unitBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1dafa',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a69bd',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginLeft: 4,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoText: {
    flex: 1,
    color: '#0369a1',
    fontSize: 13,
    marginLeft: 8,
  },
  buttonsContainer: {
    marginTop: 10,
  },
  submitButton: {
    height: 56,
    backgroundColor: '#4a69bd',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4a69bd',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cancelButton: {
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
  },
  noShopContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noShopIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  statusInactive: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  createFirstShopButton: {
    backgroundColor: '#4a69bd',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4a69bd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    width: '100%',
  },
  createFirstShopText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AddProduct;