import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import api from '../../services/api';
import { useRouter } from 'expo-router';
import { useAuth } from '../../utils/auth';
import LogoutButton from '../../components/LogoutButton';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

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
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Simple Map</title>
    <style>
      html, body { margin: 0; padding: 0; height: 100%; width: 100%; }
      #map { width: 100%; height: 100%; background-color: #f5f5f5; }
      .marker { position: absolute; transform: translate(-50%, -100%); }
      .user-marker { 
        width: 16px; height: 16px; 
        background-color: #1e88e5; 
        border: 3px solid white; 
        border-radius: 50%;
        z-index: 1000;
      }
      .shop-marker {
        width: 24px; height: 24px;
        background-color: #e53935;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        z-index: 500;
      }
      .shop-label {
        white-space: nowrap;
        background-color: rgba(255,255,255,0.8);
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 10px;
        margin-top: 4px;
        text-align: center;
      }
      .popup {
        position: absolute;
        bottom: 10px;
        left: 10px;
        right: 10px;
        padding: 10px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: none;
        z-index: 2000;
      }
      .popup-title {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .popup-type {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }
      .popup-button {
        background-color: #4a69bd;
        color: white;
        border: none;
        padding: 8px;
        border-radius: 4px;
        width: 100%;
      }
      .close-button {
        position: absolute;
        top: 5px;
        right: 5px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
      }
      #status {
        position: absolute;
        bottom: 10px;
        left: 10px;
        background-color: rgba(255, 255, 255, 0.8);
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 1500;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div id="status">Loading map...</div>
    <div id="popup" class="popup">
      <button class="close-button" onclick="closePopup()">×</button>
      <div id="popup-title" class="popup-title"></div>
      <div id="popup-type" class="popup-type"></div>
      <button id="popup-button" class="popup-button" onclick="viewCurrentShop()">View Shop</button>
    </div>

    <script>
      // Simple map implementation without external libraries
      var map = document.getElementById('map');
      var popup = document.getElementById('popup');
      var currentShopId = null;
      var statusDisplay = document.getElementById('status');
      
      function updateStatus(message) {
        statusDisplay.textContent = message;
        console.log(message);
      }
      
      // Calculate positions based on latitude/longitude
      // This is a very simple projection - not accurate for large distances
      function latLngToPosition(lat, lng, centerLat, centerLng) {
        // Simple Mercator projection approximation
        const pixelsPerDegree = 10000; // Scale factor - higher number = more zoomed in
        
        const y = (centerLat - lat) * pixelsPerDegree;
        const x = (lng - centerLng) * pixelsPerDegree * Math.cos(centerLat * Math.PI / 180);
        
        // Return position relative to center of map
        return {
          left: (50 + x) + '%',
          top: (50 + y) + '%'
        };
      }
      
      function initMap() {
        try {
          updateStatus("Creating map elements...");
          
          // Add user marker
          const userPosition = latLngToPosition(${userLat}, ${userLng}, ${userLat}, ${userLng});
          const userMarker = document.createElement('div');
          userMarker.className = 'marker user-marker';
          userMarker.style.left = userPosition.left;
          userMarker.style.top = userPosition.top;
          map.appendChild(userMarker);
          
          updateStatus("Added user marker");
          
          // Add shop markers
          ${shops.map((shop, index) => `
            try {
              // Shop marker for ${shop.name}
              const shopPosition${index} = latLngToPosition(${shop.location.latitude}, ${shop.location.longitude}, ${userLat}, ${userLng});
              
              const shopMarker${index} = document.createElement('div');
              shopMarker${index}.className = 'marker shop-marker';
              shopMarker${index}.style.left = shopPosition${index}.left;
              shopMarker${index}.style.top = shopPosition${index}.top;
              shopMarker${index}.innerHTML = '${index + 1}';
              shopMarker${index}.setAttribute('data-shop-id', '${shop._id}');
              shopMarker${index}.onclick = function() { 
                showPopup('${shop._id}', '${shop.name.replace(/'/g, "\\'")}', '${shop.shopType.replace(/'/g, "\\'")}'); 
              };
              map.appendChild(shopMarker${index});
              
              const shopLabel${index} = document.createElement('div');
              shopLabel${index}.className = 'marker shop-label';
              shopLabel${index}.style.left = shopPosition${index}.left;
              shopLabel${index}.style.top = 'calc(' + shopPosition${index}.top + ' + 15px)';
              shopLabel${index}.textContent = '${shop.name.replace(/'/g, "\\'")}';
              map.appendChild(shopLabel${index});
            } catch(err) {
              console.error("Error adding shop marker ${index}: " + err.message);
            }
          `).join('\n')}
          
          updateStatus("Added ${shops.length} shop markers");
          
          // Hide status after 3 seconds
          setTimeout(function() {
            statusDisplay.style.display = 'none';
          }, 3000);
          
          // Let React Native know the map is loaded
          notifyMapLoaded();
        } catch(e) {
          updateStatus("Error creating map: " + e.message);
          console.error(e);
        }
      }
      
      function showPopup(shopId, shopName, shopType) {
        document.getElementById('popup-title').textContent = shopName;
        document.getElementById('popup-type').textContent = 'Type: ' + shopType;
        currentShopId = shopId;
        popup.style.display = 'block';
      }
      
      function closePopup() {
        popup.style.display = 'none';
      }
      
      function viewCurrentShop() {
        if (currentShopId) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            action: 'viewShop',
            shopId: currentShopId
          }));
        }
      }
      
      function notifyMapLoaded() {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            action: 'mapLoaded',
            shopsCount: ${shops.length}
          }));
          console.log("Map loaded message sent");
        } catch(e) {
          console.error("Error sending mapLoaded message:", e);
        }
      }
      
      // Start creating the map
      initMap();
      
      // Fallback in case something goes wrong
      setTimeout(function() {
        notifyMapLoaded();
      }, 2000);
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

  // Fix ESLint warning by using useCallback
  const fetchNearbyShops = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      
      // Try these endpoints in order - now we know the correct one
      const endpoints = [
        `/shops/nearby?lat=${lat}&lng=${lng}&radius=5000`,
      ];
      
      let response = null;
      let succeeded = false;
      
      // Try each endpoint until one works
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
        // Debug each shop's data
        response.data.forEach((shop: any, index: number) => {
          console.log(`Shop ${index + 1}:`, shop.name, shop.location);
        });
        
        setShops(response.data);
        console.log(`Found ${response.data.length} shops nearby`);
        setError(null);
      } else {
        console.warn("No endpoints worked or invalid data format received");
        
        // TEMPORARY: Use mock data for testing until backend is fully working
        console.log("Using mock data for development");
        const mockShops = generateMockShops(lat, lng);
        setShops(mockShops);
        setError("Using mock shops for development (API not available)");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      console.error('Error fetching shops:', error);
      console.error('Error details:', errorMessage);
      
      // TEMPORARY: Use mock data for testing
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
  
  // Force map loading to complete after timeout
  useEffect(() => {
    if (viewMode === 'map' && !mapLoaded) {
      const timer = setTimeout(() => {
        console.log("Force setting mapLoaded=true after timeout");
        setMapLoaded(true);
      }, 5000); // Set a 5-second timeout
      
      return () => clearTimeout(timer);
    }
  }, [viewMode, mapLoaded]);
  
  // Reset mapLoaded when switching to map view
  useEffect(() => {
    if (viewMode === 'map') {
      setMapLoaded(false);
    }
  }, [viewMode]);
  
  const generateMockShops = (centerLat: number, centerLng: number, count: number = 5): Shop[] => {
    return Array.from({ length: count }, (_, i) => {
      // Generate shops within ~1km radius
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
        // Find the shop with the matching ID
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
        setMapLoaded(true); // Hide loading spinner even on error
      }
    } catch (error) {
      console.error('Error handling map message:', error);
      setMapLoaded(true); // Safety measure to ensure spinner gets hidden
    }
  };

  // Debug when shops or viewMode changes
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
                // Set a timeout to mark the map as loaded even if the message is never received
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginTop: 35,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    marginTop: 20,
    marginBottom: 10,
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
    marginBottom: 10,
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
    position: 'relative',
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