import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import LogoutButton from '../../components/LogoutButton';
import ShopkeeperLayout from './BottomNav';
import api from '../../services/api';
import { useAuth } from '../../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Shop {
  _id: string;
  name: string;
  type: string;
}

const DashboardScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        console.log('Fetching shops...');
        
        const response = await api.get('/shops');
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
        setError('Failed to load shops');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchShops();
    }
  }, [token, params.shopId]);

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
        <Text style={{ marginTop: 10, color: '#7f8c8d' }}>Loading your shop...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>PD</Text>
          </View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.logoutButtonContainer}>
            <LogoutButton />
          </View>
        </View>

        {error ? (
          <View style={[styles.statusCard, styles.errorCard]}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => router.replace('/shopkeeper/dashboard')}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.statusCard}>
          {activeShop ? (
            <>
              <Text style={styles.statusTitle}>Shop Status</Text>
              <Text style={styles.statusActive}>Active</Text>
              <Text style={styles.shopName}>{activeShop.name} ({activeShop.type})</Text>
              <Text style={styles.shopIdText}>Shop ID: {activeShopId}</Text>
            </>
          ) : (
            <>
              <Text style={styles.statusTitle}>Shop Status</Text>
              <Text style={styles.statusInactive}>No Shop Created</Text>
              <Text style={styles.statusMessage}>Create a shop to start selling products</Text>
            </>
          )}
        </View>

        {shops.length > 1 && (
          <View style={styles.shopSelector}>
            <Text style={styles.shopSelectorTitle}>Your Shops:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                  <Text 
                    style={[
                      styles.shopItemText,
                      shop._id === activeShopId ? styles.activeShopText : null
                    ]}
                  >
                    {shop.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, activeShop ? styles.secondaryButton : styles.primaryButton]}
            onPress={() => router.push('/shopkeeper/add-shop')}
          >
            <Text style={styles.actionButtonText}>
              {activeShop ? 'Create Another Shop' : 'Create a Shop'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, !activeShop && styles.disabledButton]}
            onPress={handleAddProduct}
            disabled={!activeShop}
          >
            <Text style={styles.actionButtonText}>Add New Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, !activeShop && styles.disabledButton]}
            onPress={() => activeShopId 
              ? router.push(`/shopkeeper/inventory?shopId=${activeShopId}`) 
              : Alert.alert('Error', 'Please create a shop first.')}
            disabled={!activeShop}
          >
            <Text style={styles.actionButtonText}>View Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, !activeShop && styles.disabledButton]}
            onPress={() => activeShopId 
              ? router.push(`/shopkeeper/orders?shopId=${activeShopId}`) 
              : Alert.alert('Error', 'Please create a shop first.')}
            disabled={!activeShop}
          >
            <Text style={styles.actionButtonText}>View Orders</Text>
          </TouchableOpacity>
        </View>
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
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginTop: 35,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a69bd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  logoutButtonContainer: {
    marginLeft: 'auto',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  statusActive: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
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
  },
  shopIdText: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 5,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 5,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#4a69bd',
  },
  secondaryButton: {
    backgroundColor: '#6a89cc',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    opacity: 0.7,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorCard: {
    backgroundColor: '#fff8f8',
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  shopSelector: {
    marginBottom: 20,
  },
  shopSelectorTitle: {
    fontSize: 16,
    fontWeight: '600', 
    color: '#2c3e50',
    marginBottom: 8,
  },
  shopItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  activeShopItem: {
    backgroundColor: '#4a69bd',
  },
  shopItemText: {
    color: '#2c3e50',
  },
  activeShopText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ShopkeeperDashboard;