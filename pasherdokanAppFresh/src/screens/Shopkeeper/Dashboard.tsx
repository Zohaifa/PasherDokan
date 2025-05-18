import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LogoutButton from '../../components/LogoutButton';
import ShopkeeperLayout from './BottomNav';
import api from '../../services/api';
import { useAuth } from '../../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

interface Shop {
  _id: string;
  name: string;
  type: string;
}

const { width } = Dimensions.get('window');
const ANIMATION_DURATION = 300;

const DashboardScreen = () => {
  // State management
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(20))[0];

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

  // Data fetching
  const fetchShops = useCallback(async (showRefresh = false) => {
    try {
      if (!showRefresh) setLoading(true);
      if (showRefresh) setRefreshing(true);
      setError(null);
      
      console.log('Fetching shops...');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await api.get('/shops', config);
      console.log(`Fetched ${response.data.length} shops`);
      
      setShops(response.data);
      
      let shopToUse = params.shopId as string;
      
      if (!shopToUse && response.data.length > 0) {
        shopToUse = response.data[0]._id;
        console.log('Using first shop:', shopToUse);
        await AsyncStorage.setItem('activeShopId', shopToUse);
      }
      
      setActiveShopId(shopToUse || null);
    } catch (err: any) {
      console.error('Error fetching shops:', err.response?.data || err.message);
      setError('Failed to load shops. Please pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, params.shopId]);

  // Initial data load
  useEffect(() => {
    if (token) {
      fetchShops();
    } else {
      setError('Authentication token missing. Please log in again.');
      setLoading(false);
    }
  }, [token, fetchShops]);

  const onRefresh = useCallback(() => {
    fetchShops(true);
  }, [fetchShops]);

  const handleDeleteShop = async () => {
    if (!activeShopId) {
      Alert.alert('Error', 'No active shop selected to delete.');
      return;
    }

    Alert.alert(
      'Delete Shop',
      `Are you sure you want to delete ${activeShop?.name}?`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleteLoading(true);
              setError(null);

              const config = {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              };

              await api.delete(`/shops/${activeShopId}`, config);

              const updatedShops = shops.filter(shop => shop._id !== activeShopId);
              setShops(updatedShops);

              let newActiveShopId: string | null = null;
              if (updatedShops.length > 0) {
                newActiveShopId = updatedShops[0]._id;
                await AsyncStorage.setItem('activeShopId', newActiveShopId);
              } else {
                await AsyncStorage.removeItem('activeShopId');
              }

              setActiveShopId(newActiveShopId);
              Alert.alert('Success', 'Shop deleted successfully');
            } catch (err: any) {
              console.error('Error deleting shop:', err.response?.data || err.message || err.toString());
              setError(err.response?.data?.message || 'Failed to delete shop. Please try again.');
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAddProduct = () => {
    if (!activeShopId) {
      Alert.alert('Error', 'Please create a shop first.');
      return;
    }
    router.push(`/shopkeeper/add-product?shopId=${activeShopId}`);
  };

  const activeShop = shops.find(shop => shop._id === activeShopId);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a69bd" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

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
              <Text style={styles.headerTitle}>Dashboard</Text>
              <Text style={styles.headerSubtitle}>Manage your business</Text>
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
              onPress={() => fetchShops()}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}

                {/* Shop Status Card */}
        <Animated.View 
          style={[
            styles.formSection, 
            { opacity: fadeAnim, transform: [{ translateY }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop Status</Text>
            {activeShop && (
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            )}
          </View>
          
          {activeShop ? (
            <View style={styles.shopStatusContainer}>
              <LinearGradient
                colors={['#eef2ff', '#f7f9ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shopInfoGradient}
              >
                <View style={styles.shopInfoBox}>
                  <View style={styles.shopIconOuterContainer}>
                    <LinearGradient
                      colors={['#e6efff', '#d1e3ff']}
                      style={styles.shopIconContainer}
                    >
                      <Ionicons name="storefront" size={28} color="#4a69bd" />
                    </LinearGradient>
                  </View>
                  
                  <View style={styles.shopInfoContent}>
                    <Text style={styles.shopName} numberOfLines={1} ellipsizeMode="tail">
                      {activeShop.name}
                    </Text>
                    
                    <View style={styles.shopMetaRow}>
                      <View style={styles.shopTypeContainer}>
                        <Ionicons name="business-outline" size={12} color="#4a69bd" style={styles.shopTypeIcon} />
                        <Text style={styles.shopType}>{activeShop.type}</Text>
                      </View>
                      
                      <View style={styles.shopDivider} />
                      
                      <Text style={styles.shopIdText}>
                        ID: {activeShopId?.substring(0, 8)}...
                      </Text>
                    </View>
                    
                    <View style={styles.shopStatsRow}>
                      <View style={styles.shopStatItem}>
                        <Ionicons name="time-outline" size={14} color="#64748b" />
                        <Text style={styles.shopStatText}>Created recently</Text>
                      </View>
                      <View style={styles.shopStatDivider} />
                      <View style={styles.shopStatItem}>
                        <Ionicons name="checkmark-circle-outline" size={14} color="#27ae60" />
                        <Text style={[styles.shopStatText, {color: '#27ae60'}]}>Active</Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.deleteIconContainer}
                    onPress={handleDeleteShop}
                    disabled={deleteLoading}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator size="small" color="#e74c3c" />
                    ) : (
                      <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                    )}
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              
              <View style={styles.quickActionRow}>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={handleAddProduct}
                >
                  <Ionicons name="add-circle-outline" size={16} color="#4a69bd" />
                  <Text style={styles.quickActionText}>Add Product</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => router.push(`/shopkeeper/inventory?shopId=${activeShopId}`)}
                >
                  <Ionicons name="list-outline" size={16} color="#4a69bd" />
                  <Text style={styles.quickActionText}>View Inventory</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noShopContainer}>
              <View style={styles.noShopIconContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
              </View>
              <Text style={styles.statusInactive}>No Shop Created</Text>
              <Text style={styles.statusMessage}>Create a shop to start selling products</Text>
              
              <TouchableOpacity
                style={styles.createFirstShopButton}
                onPress={() => router.push('/shopkeeper/add-shop')}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.createFirstShopText}>Create Your First Shop</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Shop Selector */}
        {shops.length > 1 && (
          <Animated.View 
            style={[
              styles.formSection, 
              { opacity: fadeAnim, transform: [{ translateY }] }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Shops</Text>
              <Text style={styles.shopCount}>{shops.length} shops</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Tap to switch between shops</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.shopSelectorScroll}
              contentContainerStyle={styles.shopSelectorContent}
            >
              {shops.map(shop => (
                <TouchableOpacity
                  key={shop._id}
                  style={[
                    styles.shopItem,
                    shop._id === activeShopId ? styles.activeShopItem : null
                  ]}
                  onPress={() => {
                    setActiveShopId(shop._id);
                    AsyncStorage.setItem('activeShopId', shop._id);
                  }}
                >
                  <Ionicons 
                    name={shop._id === activeShopId ? "storefront" : "storefront-outline"} 
                    size={20} 
                    color={shop._id === activeShopId ? "#fff" : "#4a69bd"} 
                  />
                  <Text 
                    style={[
                      styles.shopItemText,
                      shop._id === activeShopId ? styles.activeShopText : null
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {shop.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View 
          style={[
            styles.formSection, 
            { opacity: fadeAnim, transform: [{ translateY }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, activeShop ? styles.secondaryActionCard : styles.primaryActionCard]}
              onPress={() => router.push('/shopkeeper/add-shop')}
            >
              <View style={[
                styles.actionIconContainer, 
                { backgroundColor: activeShop ? '#eef2ff' : '#e8f0fe' }
              ]}>
                <Ionicons 
                  name="add-circle" 
                  size={26} 
                  color={activeShop ? "#6a89cc" : "#4a69bd"} 
                />
              </View>
              <Text style={styles.actionTitle}>
                {activeShop ? 'Add Shop' : 'Create Shop'}
              </Text>
              <Text style={styles.actionDescription}>
                {activeShop ? 'Add another business' : 'Get started selling'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, !activeShop && styles.disabledActionCard]}
              onPress={handleAddProduct}
              disabled={!activeShop}
            >
              <View style={[
                styles.actionIconContainer, 
                { backgroundColor: activeShop ? '#eef2ff' : '#f5f5f5' }
              ]}>
                <Ionicons 
                  name="pricetag" 
                  size={26} 
                  color={activeShop ? "#4a69bd" : "#bdc3c7"} 
                />
              </View>
              <Text style={[styles.actionTitle, !activeShop && styles.disabledText]}>
                Add Product
              </Text>
              <Text style={[styles.actionDescription, !activeShop && styles.disabledText]}>
                Add new items to sell
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, !activeShop && styles.disabledActionCard]}
              onPress={() => activeShopId 
                ? router.push(`/shopkeeper/inventory?shopId=${activeShopId}`) 
                : Alert.alert('Error', 'Please create a shop first.')}
              disabled={!activeShop}
            >
              <View style={[
                styles.actionIconContainer, 
                { backgroundColor: activeShop ? '#eef2ff' : '#f5f5f5' }
              ]}>
                <MaterialCommunityIcons 
                  name="clipboard-list-outline" 
                  size={26} 
                  color={activeShop ? "#4a69bd" : "#bdc3c7"} 
                />
              </View>
              <Text style={[styles.actionTitle, !activeShop && styles.disabledText]}>
                Inventory
              </Text>
              <Text style={[styles.actionDescription, !activeShop && styles.disabledText]}>
                Manage your stock
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, !activeShop && styles.disabledActionCard]}
              onPress={() => activeShopId 
                ? router.push(`/shopkeeper/orders?shopId=${activeShopId}`) 
                : Alert.alert('Error', 'Please create a shop first.')}
              disabled={!activeShop}
            >
              <View style={[
                styles.actionIconContainer, 
                { backgroundColor: activeShop ? '#eef2ff' : '#f5f5f5' }
              ]}>
                <Ionicons 
                  name="receipt" 
                  size={26} 
                  color={activeShop ? "#4a69bd" : "#bdc3c7"} 
                />
              </View>
              <Text style={[styles.actionTitle, !activeShop && styles.disabledText]}>
                Orders
              </Text>
              <Text style={[styles.actionDescription, !activeShop && styles.disabledText]}>
                Manage customer orders
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ShopkeeperDashboard: React.FC = () => {
  return (
    <ShopkeeperLayout currentTab="Dashboard">
      <DashboardScreen />
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
  shopIconOuterContainer: {
    shadowColor: '#4a69bd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderRadius: 16,
    marginRight: 16,
  },
  shopIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c9d8f9',
  },
  shopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  shopTypeIcon: {
    marginRight: 4,
  },
  shopDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 8,
  },
  shopStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopStatText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  shopStatDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  deleteIconContainer: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffd5d5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    width: '100%',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f8ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  shopCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    marginTop: -6,
  },
  shopStatusContainer: {
    alignItems: 'center',
  },
  shopStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ef',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  shopInfoGradient: {
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  shopInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1dafa',
    borderRadius: 12,
    width: '100%',
  },
  shopIcon: {
    marginRight: 12,
  },
  shopInfoContent: {
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  shopTypeContainer: {
    backgroundColor: '#f0f4ff',
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  shopType: {
    fontSize: 13,
    color: '#4a69bd',
    fontWeight: '500',
  },
  shopIdText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
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
  shopSelectorScroll: {
    marginVertical: 8,
  },
  shopSelectorContent: {
    paddingVertical: 4,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f5f8ff',
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d1dafa',
    maxWidth: width * 0.42,
  },
  activeShopItem: {
    backgroundColor: '#4a69bd',
    borderColor: '#4a69bd',
  },
  shopItemText: {
    color: '#2c3e50',
    fontWeight: '500',
    marginLeft: 6,
    maxWidth: width * 0.25,
  },
  activeShopText: {
    color: 'white',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e6e9f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryActionCard: {
    borderColor: '#d1dafa',
  },
  secondaryActionCard: {
    borderColor: '#e1e5eb',
  },
  disabledActionCard: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e8e8e8',
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  disabledText: {
    color: '#bdc3c7',
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
});

export default ShopkeeperDashboard;