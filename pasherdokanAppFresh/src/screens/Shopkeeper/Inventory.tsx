import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LogoutButton from '../../components/LogoutButton';
import ShopkeeperLayout from './BottomNav';

const InventoryScreen = () => {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>PD</Text>
          </View>
          <Text style={styles.headerTitle}>Inventory</Text>
          <View style={styles.logoutButtonContainer}>
            <LogoutButton />
          </View>
        </View>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Inventory Status</Text>
          {shopId ? (
            <Text style={styles.statusActive}>Active - Shop ID: {shopId}</Text>
          ) : (
            <Text style={styles.statusInactive}>No Shop Created</Text>
          )}
          <Text style={styles.statusMessage}>
            {shopId ? 'View and manage your product inventory here.' : 'Create a shop to manage inventory.'}
          </Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, shopId ? styles.primaryButton : styles.disabledButton]}
            onPress={() => shopId ? router.push(`/shopkeeper/add-product?shopId=${shopId}`) : Alert.alert('Error', 'Please create a shop first.')}
            disabled={!shopId}
          >
            <Text style={styles.actionButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>
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
  disabledButton: {
    backgroundColor: '#bdc3c7',
    opacity: 0.7,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ShopkeeperInventory;