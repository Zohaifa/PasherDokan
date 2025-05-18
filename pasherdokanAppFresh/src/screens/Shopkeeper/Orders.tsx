import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl,
  Platform,
  Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from '../../components/LogoutButton';
import api from '../../services/api';
import ShopkeeperLayout from './BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../utils/auth';

const ANIMATION_DURATION = 300;

interface Order {
  _id: string;
  customerName: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  items: {
    product: {
      name: string;
    };
    quantity: number;
    price: number;
  }[];
}

const OrdersScreen = () => {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch orders
  const fetchOrders = useCallback(async (showRefresh = false) => {
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

      const response = await api.get(`/orders/shop/${shopId}`, config);
      setOrders(response.data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shopId, token]);

  // Initial data load
  useEffect(() => {
    if (shopId) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [shopId, fetchOrders]);

  const onRefresh = useCallback(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#27ae60';
      case 'processing':
        return '#3498db';
      case 'shipped':
        return '#9b59b6';
      case 'pending':
        return '#f39c12';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a69bd" />
        <Text style={styles.loadingText}>Loading orders...</Text>
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
              <Text style={styles.headerTitle}>Orders</Text>
              <Text style={styles.headerSubtitle}>Manage customer requests</Text>
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
              onPress={() => fetchOrders()}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        {/* Orders Status Section */}
        {shopId ? (
          <Animated.View 
            style={[
              styles.formSection, 
              { opacity: fadeAnim, transform: [{ translateY }] }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Order Status</Text>
              {orders.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{orders.length}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.ordersInfoBox}>
              <View style={styles.orderIconContainer}>
                <Ionicons name="receipt" size={24} color="#4a69bd" />
              </View>
              <View style={styles.ordersInfoContent}>
                {orders.length > 0 ? (
                  <>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{orders.length}</Text>
                        <Text style={styles.statLabel}>Total Orders</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{orders.filter(o => o.status?.toLowerCase() === 'pending').length}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{orders.filter(o => o.status?.toLowerCase() === 'completed').length}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                      </View>
                    </View>
                    <View style={styles.infoNote}>
                      <Ionicons name="information-circle" size={14} color="#64748b" />
                      <Text style={styles.infoText}>Pull down to refresh orders</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.noOrdersMessage}>
                    <Text style={styles.noOrdersText}>No orders received yet</Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        ) : null}

        {/* Orders List */}
        {shopId && orders.length > 0 ? (
          <Animated.View 
            style={[
              styles.formSection, 
              { opacity: fadeAnim, transform: [{ translateY }] }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
            </View>
            
            <View style={styles.ordersList}>
              {orders.map((order) => (
                <TouchableOpacity 
                  key={order._id} 
                  style={styles.orderCard}
                  onPress={() => router.push(`/shopkeeper/order-details?id=${order._id}`)}
                >
                  <View style={styles.orderCardHeader}>
                    <View style={styles.orderIdContainer}>
                      <Text style={styles.orderIdLabel}>ORDER #</Text>
                      <Text style={styles.orderId}>{order._id.substring(0, 8)}...</Text>
                    </View>
                    
                    <View 
                      style={[
                        styles.orderStatusBadge,
                        { backgroundColor: `${getStatusColor(order.status)}20` }
                      ]}
                    >
                      <View 
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(order.status) }
                        ]} 
                      />
                      <Text 
                        style={[
                          styles.orderStatusText,
                          { color: getStatusColor(order.status) }
                        ]}
                      >
                        {order.status || 'Pending'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderCardBody}>
                    <View style={styles.orderDetail}>
                      <Text style={styles.orderDetailLabel}>Customer</Text>
                      <Text style={styles.orderDetailValue}>{order.customerName || 'Anonymous'}</Text>
                    </View>
                    
                    <View style={styles.orderDetail}>
                      <Text style={styles.orderDetailLabel}>Date</Text>
                      <Text style={styles.orderDetailValue}>{formatDate(order.createdAt)}</Text>
                    </View>
                    
                    <View style={styles.orderDetail}>
                      <Text style={styles.orderDetailLabel}>Items</Text>
                      <Text style={styles.orderDetailValue}>{order.items?.length || 0} products</Text>
                    </View>
                    
                    <View style={styles.orderDetail}>
                      <Text style={styles.orderDetailLabel}>Total</Text>
                      <Text style={styles.orderAmount}>৳{order.totalAmount || 0}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderCardFooter}>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => router.push(`/shopkeeper/order-details?id=${order._id}`)}
                    >
                      <Text style={styles.viewButtonText}>View Details</Text>
                      <Ionicons name="chevron-forward" size={16} color="#4a69bd" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
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
              <Ionicons name="receipt-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
              <Text style={styles.emptyStateMessage}>
                When customers place orders, they will appear here
              </Text>
              
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={onRefresh}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
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
              <Text style={styles.statusMessage}>Please select a shop to view orders</Text>
              
              <TouchableOpacity
                style={styles.createFirstShopButton}
                onPress={() => router.push('/shopkeeper/dashboard')}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
                <Text style={styles.createFirstShopText}>Go to Dashboard</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const ShopkeeperOrders: React.FC = () => {
  return (
    <ShopkeeperLayout currentTab="Orders">
      <OrdersScreen />
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
  ordersInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1dafa',
    padding: 16,
  },
  orderIconContainer: {
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
  ordersInfoContent: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#d1dafa',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  noOrdersMessage: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  noOrdersText: {
    fontSize: 14,
    color: '#64748b',
  },
  ordersList: {
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e9f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderIdContainer: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: 2,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  orderStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderCardBody: {
    padding: 16,
  },
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderDetailLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4a69bd',
  },
  orderCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a69bd',
    marginRight: 4,
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

export default ShopkeeperOrders;