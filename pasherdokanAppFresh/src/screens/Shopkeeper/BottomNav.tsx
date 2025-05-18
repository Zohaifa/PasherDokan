import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

interface ShopkeeperLayoutProps {
  children: React.ReactNode;
  currentTab: string;
}

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const [indicatorPosition] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: state.index * (width / 4),
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [state.index, indicatorPosition]);

  return (
    <View style={styles.tabBarContainer}>
      {/* Active tab indicator */}
      <Animated.View 
        style={[
          styles.indicator, 
          {
            transform: [{ translateX: indicatorPosition }],
            width: width / 4,
          }
        ]}
      >
        <View style={styles.indicatorInner} />
      </Animated.View>
      
      {/* Tab buttons */}
      <View style={styles.tabsWrapper}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;
          
          const getTabIcon = () => {
            let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'home';
            
            if (route.name === 'Dashboard') {
              iconName = isFocused ? 'home' : 'home-outline';
            } else if (route.name === 'AddProduct') {
              iconName = isFocused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Inventory') {
              iconName = isFocused ? 'list' : 'list-outline';
            } else if (route.name === 'Orders') {
              iconName = isFocused ? 'receipt' : 'receipt-outline';
            }
            
            return (
              <Ionicons 
                name={iconName} 
                size={24} 
                color={isFocused ? '#4a69bd' : '#94a3b8'} 
              />
            );
          };
          
          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={() => navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              {getTabIcon()}
              <Text style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelActive : null
              ]}>
                {typeof label === 'string' ? label : null}
              </Text>
              
              {isFocused && (
                <View style={styles.activeTabHighlight} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const ShopkeeperLayout: React.FC<ShopkeeperLayoutProps> = ({ children, currentTab }) => {
  const { shopId: urlShopId } = useLocalSearchParams();
  const [activeShopId, setActiveShopId] = useState<string | null>(urlShopId as string || null);
  const router = useRouter();

  useEffect(() => {
    const getStoredShopId = async () => {
      if (!activeShopId) {
        try {
          const storedShopId = await AsyncStorage.getItem('activeShopId');
          if (storedShopId) {
            console.log('Retrieved shopId from storage:', storedShopId);
            setActiveShopId(storedShopId);
          }
        } catch (err) {
          console.error('Failed to get shopId from storage:', err);
        }
      }
    };
    
    getStoredShopId();
  }, [urlShopId, activeShopId]);

  const effectiveShopId = urlShopId || activeShopId;

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, 
        }}
        initialRouteName={currentTab}
        tabBar={props => <CustomTabBar {...props} />}
      >
        <Tab.Screen
          name="Dashboard"
          options={{ title: 'Home' }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              router.push(`/shopkeeper/dashboard${effectiveShopId ? `?shopId=${effectiveShopId}` : ''}`);
            },
          }}
        >
          {() => children}
        </Tab.Screen>
        <Tab.Screen
          name="AddProduct"
          options={{ title: 'Add' }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              if (effectiveShopId) {
                router.push(`/shopkeeper/add-product?shopId=${effectiveShopId}`);
              } else {
                Alert.alert('Error', 'Please create a shop first.');
              }
            },
          }}
        >
          {() => children}
        </Tab.Screen>
        <Tab.Screen
          name="Inventory"
          options={{ title: 'Stock' }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              if (effectiveShopId) {
                router.push(`/shopkeeper/inventory?shopId=${effectiveShopId}`);
              } else {
                Alert.alert('Error', 'Please create a shop first.');
              }
            },
          }}
        >
          {() => children}
        </Tab.Screen>
        <Tab.Screen
          name="Orders"
          options={{ title: 'Orders' }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              if (effectiveShopId) {
                router.push(`/shopkeeper/orders?shopId=${effectiveShopId}`);
              } else {
                Alert.alert('Error', 'Please create a shop first.');
              }
            },
          }}
        >
          {() => children}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    height: Platform.OS === 'ios' ? 80 : 70,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'column',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 5,
  },
  tabsWrapper: {
    flexDirection: 'row',
    height: '100%',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#94a3b8',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#4a69bd', 
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorInner: {
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4a69bd',
  },
  activeTabHighlight: {
    position: 'absolute',
    bottom: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4a69bd',
  }
});

export default ShopkeeperLayout;