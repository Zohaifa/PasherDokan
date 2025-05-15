import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import api from '../../services/api';
import { useRouter } from 'expo-router';
import { useAuth } from '../../utils/auth';
import LogoutButton from '../../components/LogoutButton';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import CustomerLayout from './CustomerNav';

type Shop = {
  _id: string;
  name: string;
  shopType: string;
  location: { latitude: number; longitude: number };
};

const generateMapHtml = (userLat: number, userLng: number, shops: Shop[]) => {
  console.log(`Generating map HTML with ${shops.length} shops`);

  return `
  <!DOCTYPE html>
    <html>
    <head>
      <title>Customer Map with Leaflet</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .user-marker { background-color: #1e88e5; border: 3px solid white; border-radius: 50%; }
        .shop-number {
          position: absolute;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-weight: bold;
          font-size: 12px;
          text-align: center;
        }
        .shop-info {
          display: none;
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(255, 255, 255, 0.9);
          padding: 5px 10px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          white-space: nowrap;
          z-index: 1000;
        }
        .shop-info .shop-name {
          font-size: 12px;
          font-weight: bold;
          color: #2c3e50;
        }
        .shop-info .shop-type {
          font-size: 10px;
          color: #7f8c8d;
        }
        .leaflet-marker-icon:hover .shop-info {
          display: block; /* Show on hover for desktop testing */
        }
        .popup {
          position: absolute;
          bottom: 10px;
          left: 10px;
          right: 10px;
          padding: 10px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          display: none;
          z-index: 2000;
        }
        .popup-title { font-weight: bold; margin-bottom: 5px; color: #2c3e50; }
        .popup-type { font-size: 14px; color: #666; margin-bottom: 8px; }
        .popup-button { background-color: #4a69bd; color: white; border: none; padding: 8px; border-radius: 4px; width: 100%; cursor: pointer; }
        .close-button { position: absolute; top: 5px; right: 5px; background: none; border: none; font-size: 18px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div id="popup" class="popup">
        <button class="close-button" onclick="closePopup()">×</button>
        <div id="popup-title" class="popup-title"></div>
        <div id="popup-type" class="popup-type"></div>
        <button id="popup-button" class="popup-button" onclick="viewCurrentShop()">Visit Shop</button>
      </div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        let map, userMarker, shopMarkers = {}, currentShopId = null;
        const popup = document.getElementById('popup');

        
        map = L.map('map').setView([${userLat}, ${userLng}], 13);

        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        
        userMarker = L.marker([${userLat}, ${userLng}], {
          icon: L.divIcon({
            className: 'user-marker',
            iconSize: [16, 16],
            html: '<div style="width: 16px; height: 16px;"></div>'
          })
        }).addTo(map);

        // Custom pin icon for shop markers
        const shopIcon = L.icon({
          iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          shadowSize: [41, 41]
        });

        
        ${shops.map((shop, index) => `
          shopMarkers['${shop._id}'] = L.marker([${shop.location.latitude}, ${shop.location.longitude}], {
            icon: shopIcon
          }).addTo(map);
          
          
          shopMarkers['${shop._id}'].setIcon(L.divIcon({
            className: '',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            html: \`
              <div style="position: relative;">
                <img src="https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" style="width: 25px; height: 41px;" />
                <div class="shop-number">${index + 1}</div>
                <div class="shop-info" id="shop-info-${shop._id}">
                  <div class="shop-name">${shop.name.replace(/'/g, "\\'")}</div>
                  <div class="shop-type">${shop.shopType.replace(/'/g, "\\'")}</div>
                </div>
              </div>
            \`
          }));

          
          shopMarkers['${shop._id}'].on('click', function() {
            document.getElementById('popup-title').textContent = "${shop.name.replace(/'/g, "\\'")}";
            document.getElementById('popup-type').textContent = "Type: ${shop.shopType.replace(/'/g, "\\'")}";
            currentShopId = "${shop._id}";
            popup.style.display = 'block';
          });
        `).join('\n')}

        // Zoom event to show/hide shop info
        map.on('zoomend', function() {
          const zoomLevel = map.getZoom();
          const maxZoom = 18;
          ${shops.map(shop => `
            const shopInfo${shop._id} = document.getElementById('shop-info-${shop._id}');
            if (zoomLevel >= maxZoom) {
              shopInfo${shop._id}.style.display = 'block';
            } else {
              shopInfo${shop._id}.style.display = 'none';
            }
          `).join('\n')}
        });

        function closePopup() {
          popup.style.display = 'none';
          currentShopId = null;
        }

        function viewCurrentShop() {
          if (currentShopId) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              action: 'viewShop',
              shopId: currentShopId
            }));
          }
        }

        // Signal map loaded
        window.ReactNativeWebView.postMessage(JSON.stringify({
          action: 'mapLoaded',
          shopsCount: ${shops.length}
        }));
      </script>
    </body>
    </html>
  `;
};
const CustomerDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const router = useRouter();
  const webViewRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const fetchNearbyShops = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      
      const endpoints = [
        `/shops/nearby?lat=${lat}&lng=${lng}&radius=5000`,
      ];
      
      let response = null;
      let succeeded = false;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${api.defaults.baseURL}${endpoint}`);
          response = await api.get(endpoint);
          if (response.status === 200) {
            console.log(`Endpoint ${endpoint} succeeded!`);
            succeeded = true;
            break;
          }
        } catch (endpointError: any) {
          console.log(`Endpoint ${endpoint} failed: ${endpointError.message}`);
        }
      }
      
      if (succeeded && response && Array.isArray(response.data)) {
        response.data.forEach((shop: any, index: number) => {
          console.log(`Shop ${index + 1}:`, shop.name, shop.location);
        });
        
        setShops(response.data);
        console.log(`Found ${response.data.length} shops nearby`);
        setError(null);
      } else {
        console.warn("No endpoints worked or invalid data format received");
        
        console.log("Using mock data for development");
        const mockShops = generateMockShops(lat, lng);
        setShops(mockShops);
        setError("Using mock shops for development (API not available)");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      console.error('Error fetching shops:', error);
      console.error('Error details:', errorMessage);
      
      console.log("Using mock data due to error");
      const mockShops = generateMockShops(lat, lng);
      setShops(mockShops);
      setError(`API Error: ${errorMessage} (showing mock data)`);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Getting current location...");
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Location obtained: ${latitude}, ${longitude}`);
          setLocation({ latitude, longitude });
          fetchNearbyShops(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLoading(false);
          setError(`Location error: ${error.message}`);
          Alert.alert('Error', 'Unable to fetch location. Please enable location services.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  }, [isAuthenticated, fetchNearbyShops]); 
  
  useEffect(() => {
    if (viewMode === 'map' && !mapLoaded) {
      const timer = setTimeout(() => {
        console.log("Force setting mapLoaded=true after timeout");
        setMapLoaded(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [viewMode, mapLoaded]);
  
  useEffect(() => {
    if (viewMode === 'map') {
      setMapLoaded(false);
    }
  }, [viewMode]);
  
  const generateMockShops = (centerLat: number, centerLng: number, count: number = 5): Shop[] => {
    return Array.from({ length: count }, (_, i) => {
      const latOffset = (Math.random() - 0.5) * 0.02; 
      const lngOffset = (Math.random() - 0.5) * 0.02;
      
      return {
        _id: `mock-shop-${i}`,
        name: `Mock Shop ${i + 1}`,
        shopType: ['Grocery', 'Pharmacy', 'Restaurant', 'Electronics', 'Clothing'][i % 5],
        location: {
          latitude: centerLat + latOffset,
          longitude: centerLng + lngOffset
        }
      };
    });
  };

  const handleMapMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("WebView message received:", data);
      
      if (data.action === 'viewShop') {
        const shop = shops.find(s => s._id === data.shopId);
        if (shop) {
          router.push({ 
            pathname: '/customer/shop-detail', 
            params: { shop: JSON.stringify(shop) } 
          });
        } else {
          console.error(`Shop with ID ${data.shopId} not found`);
        }
      } else if (data.action === 'mapLoaded') {
        console.log(`Map loaded with ${data.shopsCount} shops`);
        setMapLoaded(true);
      } else if (data.action === 'mapError') {
        console.error(`Map error: ${data.error}`);
        setError(`Map error: ${data.error}`);
        setMapLoaded(true);
      }
    } catch (error) {
      console.error('Error handling map message:', error);
      setMapLoaded(true);
    }
  };

  useEffect(() => {
    console.log(`Shops state updated: ${shops.length} shops, viewMode: ${viewMode}`);
  }, [shops, viewMode]);

  const renderShop = ({ item }: { item: Shop }) => (
    <View style={styles.shopCard}>
      <View style={styles.shopInfo}>
        <Text style={styles.shopName}>{item.name}</Text>
        <Text style={styles.shopType}>Type: {item.shopType}</Text>
      </View>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => router.push({ pathname: '/customer/shop-detail', params: { shop: JSON.stringify(item) } })}
      >
        <Text style={styles.viewButtonText}>View Shop</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.emptyText}>Please log in to view nearby shops</Text>
        <TouchableOpacity
          style={[styles.viewButton, styles.loginButton]}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.viewButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <CustomerLayout currentTab="Dashboard">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>PD</Text>
          </View>
          <Text style={styles.headerTitle}>PasherDokan</Text>
          <View style={styles.logoutButtonContainer}>
            <LogoutButton />
          </View>
        </View>
        <Text style={styles.title}>Nearby Shops</Text>
        {location ? (
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Your Location:</Text>
            <Text style={styles.locationText}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        ) : (
          <Text style={styles.locationText}>Fetching location...</Text>
        )}

        {/* Error display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Debug info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Shops found: {shops.length}</Text>
        </View>

        {/* View toggle buttons */}
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle, { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }]} 
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>List View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'map' && styles.activeToggle, { borderTopRightRadius: 8, borderBottomRightRadius: 8 }]} 
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.toggleText, viewMode === 'map' && styles.activeToggleText]}>Map View</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a69bd" />
            <Text style={styles.loadingText}>Finding shops near you...</Text>
          </View>
        ) : viewMode === 'list' ? (
          <FlatList
            data={shops}
            keyExtractor={(item) => item._id}
            renderItem={renderShop}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No shops found nearby.</Text>
                <Text style={styles.emptySubtext}>Try expanding your search radius or check back later.</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.mapContainer}>
            {location ? (
              <WebView
                key={`map-${shops.length}-${Date.now()}`} 
                ref={webViewRef}
                source={{ html: generateMapHtml(location.latitude, location.longitude, shops) }}
                style={styles.map}
                onMessage={handleMapMessage}
                originWhitelist={['*']}
                onLoadEnd={() => {
                  console.log("WebView load ended");
                  setTimeout(() => {
                    if (!mapLoaded) {
                      console.log("Setting mapLoaded=true from onLoadEnd timeout");
                      setMapLoaded(true);
                    }
                  }, 2000);
                }}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error("WebView error:", nativeEvent);
                  setError(`WebView error: ${nativeEvent.description}`);
                  setMapLoaded(true);
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mixedContentMode="always"
                allowingReadAccessToURL="*"
              />
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4a69bd" />
                <Text style={styles.loadingText}>Loading map...</Text>
              </View>
            )}
            {!mapLoaded && (
              <View style={styles.mapLoadingOverlay}>
                <ActivityIndicator size="large" color="#4a69bd" />
                <Text style={styles.loadingText}>Loading map...</Text>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </CustomerLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 70,
  },
  header: {
    marginTop: 25, 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15, 
    marginBottom: 5,
    textAlign: 'center',
    color: '#2c3e50',
  },
  locationContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10, 
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  locationText: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  errorContainer: {
    marginHorizontal: 20,
    padding: 10, 
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 5,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  debugContainer: {
    marginHorizontal: 20,
    padding: 5,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 10, 
  },
  debugText: {
    color: '#0d47a1',
    textAlign: 'center',
    fontSize: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10, 
    marginHorizontal: 20,
  },
  toggleButton: {
    paddingVertical: 8, 
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4a69bd',
    minWidth: 100,
    alignItems: 'center',
  },
  toggleText: {
    color: '#4a69bd',
    fontWeight: '500',
  },
  activeToggle: {
    backgroundColor: '#4a69bd',
  },
  activeToggleText: {
    color: 'white',
  },
  listContainer: {
    padding: 15,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 15,
    marginBottom: 15,
    minHeight: '60%', 
  },
  map: {
    flex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  shopType: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  viewButton: {
    backgroundColor: '#4a69bd',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  loginButton: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default CustomerDashboard;