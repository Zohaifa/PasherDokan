import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  RefreshControl,
  Platform,
  Animated,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from '../../components/LogoutButton';
import ShopkeeperLayout from './BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { useAuth } from '../../utils/auth';

const ANIMATION_DURATION = 300;

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const InventoryScreen = () => {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(20))[0];
  const inputRef = useRef<TextInput>(null);

  // Run entrance animation
  useEffect(() => {
    if (!loading) {
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
    }
  }, [loading, fadeAnim, translateY]);

  // Fetch products
  const fetchProducts = useCallback(async (showRefresh = false) => {
    if (!shopId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
  
    try {
      if (!showRefresh) setLoading(true);
      if (showRefresh) setRefreshing(true);
      setError(null);
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
  
      // Use the correct endpoint matching your backend route
      const response = await api.get(`/products/shop/${shopId}`, config);
      setProducts(response.data);
    } catch (err: any) {
      console.error('Error fetching products:', err.response?.data || err.message);
      setError('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shopId, token]);

  // Initial data load
  useEffect(() => {
    if (shopId) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [shopId, fetchProducts]);

  // Start price editing
  const startPriceEdit = useCallback((productId: string, currentPrice: number) => {
    setEditingProduct(productId);
    setNewPrice(currentPrice.toString());
    
    // Focus the input after a short delay to ensure it's rendered
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  }, []);

  // Save price update
  const savePrice = useCallback(async (productId: string) => {
    try {
      if (!newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0) {
        Alert.alert('Invalid Price', 'Please enter a valid price');
        return;
      }

      // Convert to number before sending to API
      const priceValue = parseFloat(newPrice);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      await api.patch(`/products/${productId}`, { price: priceValue }, config);
      
      // Update local state
      setProducts(currentProducts => 
        currentProducts.map(product => 
          product._id === productId ? { ...product, price: priceValue } : product
        )
      );

      // Exit edit mode
      setEditingProduct(null);
      setNewPrice('');
      
    } catch (err: any) {
      console.error('Failed to update price:', err.response?.data || err.message);
      Alert.alert('Update Failed', 'Could not update the product price. Please try again.');
    }
  }, [newPrice, token]);

  // Cancel price editing
  const cancelPriceEdit = useCallback(() => {
    setEditingProduct(null);
    setNewPrice('');
  }, []);

  const onRefresh = () => {
    fetchProducts(true);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a69bd" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  // Format kg with proper decimal places
  const formatWeight = (weight: number) => {
    if (weight % 1 === 0) {
      return `${weight}kg`;
    }
    return `${weight.toFixed(2)}kg`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>PD</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Inventory</Text>
              <Text style={styles.headerSubtitle}>Manage your products</Text>
            </View>
          </View>
          <LogoutButton />
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4a69bd']}
            tintColor="#4a69bd"
          />
        }
      >
        {/* Error Message */}
        {error ? (
          <Animated.View 
            style={[
              styles.formSection, 
              { opacity: fadeAnim, transform: [{ translateY }] }
            ]}
          >
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color="#e74c3c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => fetchProducts()}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        {/* Inventory Status Card */}
        <Animated.View 
          style={[
            styles.formSection, 
            { opacity: fadeAnim, transform: [{ translateY }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inventory Status</Text>
            {shopId ? (
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            ) : null}
          </View>
          
          {shopId ? (
            <View style={styles.shopInfoBox}>
              <View style={styles.shopIconContainer}>
                <Ionicons name="scale" size={24} color="#4a69bd" />
              </View>
              <View style={styles.shopInfoContent}>
                <View style={styles.shopMetaRow}>
                  <Text style={styles.infoLabel}>Total Products</Text>
                  <Text style={styles.infoValue}>{products.length}</Text>
                </View>
                <View style={styles.shopMetaRow}>
                  <Text style={styles.infoLabel}>Shop ID</Text>
                  <Text style={styles.infoValue}>
                    {(Array.isArray(shopId) ? shopId[0] : shopId)?.substring(0, 8)}...
                  </Text>
                </View>
                <View style={styles.infoNote}>
                  <Ionicons name="information-circle" size={14} color="#64748b" />
                  <Text style={styles.infoText}>Tap on price to edit</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noShopContainer}>
              <View style={styles.noShopIconContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
              </View>
              <Text style={styles.statusInactive}>No Shop Selected</Text>
              <Text style={styles.statusMessage}>Please select a shop to view inventory</Text>
              
              <TouchableOpacity
                style={styles.createFirstShopButton}
                onPress={() => router.push('/shopkeeper/dashboard')}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
                <Text style={styles.createFirstShopText}>Go to Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Quick Actions */}
        {shopId && (
          <Animated.View 
            style={[
              styles.formSection, 
              { opacity: fadeAnim, transform: [{ translateY }] }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.quickActionRow}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => router.push(`/shopkeeper/add-product?shopId=${shopId}`)}
              >
                <Ionicons name="add-circle-outline" size={16} color="#4a69bd" />
                <Text style={styles.quickActionText}>Add New Product</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickActionButton, { backgroundColor: '#f5fff8', borderColor: '#c1e7c9' }]}
                onPress={() => Alert.alert('Coming Soon', 'This feature is under development')}
              >
                <Ionicons name="bar-chart-outline" size={16} color="#27ae60" />
                <Text style={[styles.quickActionText, { color: '#27ae60' }]}>Export Inventory</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Product List */}
        {shopId && products.length > 0 ? (
          <Animated.View 
            style={[
              styles.formSection, 
              { opacity: fadeAnim, transform: [{ translateY }] }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Products</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{products.length}</Text>
              </View>
            </View>
            
            <View style={styles.productColumnHeaders}>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Product</Text>
              <Text style={[styles.columnHeader, { width: 80, textAlign: 'center' }]}>Price/kg</Text>
              <Text style={[styles.columnHeader, { width: 70, textAlign: 'center' }]}>Stock</Text>
            </View>
            
            <View style={styles.productList}>
              {products.map((product) => (
                <TouchableOpacity 
                  key={product._id} 
                  style={styles.productCard}
                  onPress={() => router.push(`/shopkeeper/product-details?id=${product._id}`)}
                >
                  <View style={styles.productIconContainer}>
                    <Ionicons name="cube-outline" size={24} color="#4a69bd" />
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryText}>{product.category}</Text>
                    </View>
                  </View>
                  
                  {editingProduct === product._id ? (
                    <View style={styles.priceEditContainer}>
                      <Text style={styles.currencySymbol}>৳</Text>
                      <TextInput
                        ref={inputRef}
                        style={styles.priceEditInput}
                        value={newPrice}
                        onChangeText={setNewPrice}
                        keyboardType="decimal-pad"
                        selectTextOnFocus
                        autoFocus
                        onBlur={cancelPriceEdit}
                      />
                      <View style={styles.priceActionButtons}>
                        <TouchableOpacity 
                          style={styles.priceActionButton}
                          onPress={() => savePrice(product._id)}
                        >
                          <Ionicons name="checkmark" size={18} color="#27ae60" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.priceActionButton}
                          onPress={cancelPriceEdit}
                        >
                          <Ionicons name="close" size={18} color="#e74c3c" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.priceContainer}
                      onPress={() => startPriceEdit(product._id, product.price)}
                    >
                      <Text style={styles.productPriceLabel}>৳{product.price}</Text>
                      <Ionicons name="create-outline" size={14} color="#64748b" style={styles.editIcon} />
                    </TouchableOpacity>
                  )}
                  
                  <View style={styles.stockContainer}>
                    <Text style={[
                      styles.stockValue,
                      product.stock > 10 ? styles.inStock : styles.lowStock
                    ]}>
                      {formatWeight(product.stock)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#27ae60' }]} />
                <Text style={styles.legendText}>Well stocked ({'>'}10kg)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#e67e22' }]} />
                <Text style={styles.legendText}>Low stock (≤10kg)</Text>
              </View>
            </View>
          </Animated.View>
        ) : shopId ? (
          <Animated.View 
            style={[
              styles.formSection, 
              { opacity: fadeAnim, transform: [{ translateY }] }
            ]}
          >
            <View style={styles.emptyStateContainer}>
              <Ionicons name="cube-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>No Products Yet</Text>
              <Text style={styles.emptyStateMessage}>Add your first product to get started</Text>
              
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push(`/shopkeeper/add-product?shopId=${shopId}`)}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const ShopkeeperInventory: React.FC = () => {
  return (
    <ShopkeeperLayout currentTab="Inventory">
      <InventoryScreen />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#4a69bd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#4a69bd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ef',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#27ae60',
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#27ae60',
  },
  countBadge: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  shopInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1dafa',
    padding: 16,
  },
  shopIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e6efff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#c9d8f9',
  },
  shopInfoContent: {
    flex: 1,
  },
  shopMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
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
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f8ff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1dafa',
    flex: 0.48,
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4a69bd',
    marginLeft: 6,
  },
  productColumnHeaders: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  columnHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  productList: {
    marginTop: 4,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e9f0',
    padding: 12,
    marginBottom: 10,
  },
  productIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  categoryTag: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    color: '#64748b',
  },
  priceContainer: {
    width: 80,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  productPriceLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4a69bd',
    marginBottom: 2,
  },
  stockContainer: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  inStock: {
    color: '#27ae60',
  },
  lowStock: {
    color: '#e67e22',
  },
  legend: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
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
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 15,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 6,
  },
  editIcon: {
    marginTop: 2,
  },
  priceEditContainer: {
    width: 80,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a69bd',
    padding: 6,
    marginHorizontal: 4,
  },
  currencySymbol: {
    position: 'absolute',
    left: 8,
    top: 8,
    fontSize: 14,
    color: '#4a69bd',
    fontWeight: '600',
  },
  priceEditInput: {
    height: 30,
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    paddingLeft: 16,
    paddingRight: 50,
  },
  priceActionButtons: {
    position: 'absolute',
    right: 4,
    top: 4,
    flexDirection: 'row',
  },
  priceActionButton: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShopkeeperInventory;