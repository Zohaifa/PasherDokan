import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ShopkeeperDashboard: { shopId?: string };
  AddShop: undefined;
  AddProduct: { shopId: string };
};

type ShopkeeperDashboardRouteProp = RouteProp<RootStackParamList, 'ShopkeeperDashboard'>;
type ShopkeeperDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ShopkeeperDashboard'>;

type Props = {
  route: ShopkeeperDashboardRouteProp;
  navigation: ShopkeeperDashboardNavigationProp;
};

const ShopkeeperDashboard: React.FC<Props> = ({ route, navigation }) => {
  const shopId = route.params?.shopId;

  const handleAddProduct = () => {
    if (!shopId) {
      Alert.alert('Error', 'Please create a shop first.');
      return;
    }
    navigation.navigate('AddProduct', { shopId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopkeeper Dashboard</Text>
      {shopId && <Text style={styles.info}>Shop ID: {shopId}</Text>}
      <Button
        title="Create a Shop"
        onPress={() => navigation.navigate('AddShop')}
      />
      <Button
        title="Add Product"
        onPress={handleAddProduct}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default ShopkeeperDashboard;
