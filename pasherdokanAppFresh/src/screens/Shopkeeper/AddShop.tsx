import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../utils/auth';
import api from '../../services/api';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ANIMATION_DURATION = 300;

const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>OpenStreetMap with Leaflet</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100vw; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    let map, marker;
    
    // Using a neutral default location (middle of Bangladesh)
    const DEFAULT_LAT = 23.777176;
    const DEFAULT_LNG = 90.399452;

    // Initialize map with a more neutral default location
    map = L.map('map').setView([DEFAULT_LAT, DEFAULT_LNG], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Function to update the user's location - made more robust
    window.setUserLocation = function(lat, lng) {
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          error: 'Invalid coordinates provided: ' + lat + ', ' + lng
        }));
        return;
      }
      
      console.log("Setting view to:", lat, lng);
      map.setView([lat, lng], 16);
      
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
      
      window.ReactNativeWebView.postMessage(JSON.stringify({ 
        info: 'Location set via React Native',
        lat: lat,
        lng: lng
      }));
    };

    // On map click, update marker and send coordinates to React Native
    map.on('click', function(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
      
      // Send coordinates to React Native
      window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lng }));
    });

    // Error handler
    window.onerror = function(message) {
      window.ReactNativeWebView.postMessage(JSON.stringify({error: message}));
    };
    
    // Signal that the map is ready
    window.ReactNativeWebView.postMessage(JSON.stringify({info: 'Map initialized'}));
  </script>
</body>
</html>
`;

const AddShop: React.FC = () => {
  const { isAuthenticated, token, setToken } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const router = useRouter();
  const webViewRef = useRef<any>(null);

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

  useEffect(() => {
    const checkToken = async () => {
      if (isAuthenticated && !token) {
        try {
          const storedToken = await AsyncStorage.getItem('userToken');
          console.log('Fetching token from storage:', storedToken ? 'Found' : 'Not found');
          if (storedToken && setToken) {
            setToken(storedToken);
          }
        } catch (err) {
          console.error('Failed to get token from storage:', err);
        }
      }
    };
    
    checkToken();
  }, [isAuthenticated, token, setToken]);

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          setError('Location permission denied. Using default location.');
          setMapLoading(false);
          return;
        }
    
        console.log('Location permission granted, getting current position...');
        
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest
        });
        
        console.log('Location obtained:', location.coords);
        
        if (location.coords.latitude === 37.4219983 && location.coords.longitude === -122.084) {
          console.log('Detected emulator default location, using Dhaka coordinates instead');
          
          setSelectedLocation({
            latitude: 23.777176, 
            longitude: 90.399452,
          });
        } else {
          setSelectedLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (err: any) {
        console.error('Location error:', err);
        setError(`Failed to get current location: ${err?.message || ''}. Using default location.`);
        setSelectedLocation({
          latitude: 23.777176, 
          longitude: 90.399452,
        });
      } finally {
        setMapLoading(false);
      }
    };
    
    getLocation();
  }, []);

  useEffect(() => {
    if (webViewLoaded && selectedLocation && webViewRef.current) {
      console.log('Injecting location into WebView:', selectedLocation);
      
      const injectScript = `
        try {
          console.log("Setting user location to: ${selectedLocation.latitude}, ${selectedLocation.longitude}");
          window.setUserLocation(${selectedLocation.latitude}, ${selectedLocation.longitude});
        } catch(e) {
          console.error("Error setting location:", e);
        }
        true;
      `;
      
      webViewRef.current.injectJavaScript(injectScript);
      
      setTimeout(() => {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(injectScript);
        }
      }, 1000);
    }
  }, [webViewLoaded, selectedLocation]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.error) {
        console.error('WebView error:', data.error);
        setError(`Map error: ${data.error}`);
        return;
      }
      
      if (data.info) {
        console.log('WebView info:', data.info);
        return;
      }
      
      if (data.lat && data.lng) {
        setSelectedLocation({
          latitude: data.lat,
          longitude: data.lng,
        });
        setError(null);
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
    }
  };

  const handleCreateShop = async () => {
    if (!name.trim() || !type.trim()) {
      setError('Please fill in shop name and type');
      return;
    }

    if (!selectedLocation) {
      setError('Please select a location on the map');
      return;
    }

    let authToken = token;
    if (!authToken) {
      try {
        authToken = await AsyncStorage.getItem('userToken');
        console.log('Retrieved token from storage:', authToken ? 'Found' : 'Not found');
        if (authToken && setToken) {
          setToken(authToken);
        }
      } catch (err) {
        console.error('Failed to get token from storage:', err);
      }
    }

    if (!authToken) {
      setError('Authentication token missing. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { latitude, longitude } = selectedLocation;

      const config = {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      };

      console.log('Sending shop data:', { name, type, location: { type: 'Point', coordinates: [longitude, latitude] } });
      console.log('Using token:', authToken);
      console.log('API endpoint:', `${api.defaults.baseURL}/shops`);

      const response = await api.post(
        '/shops',
        {
          name,
          type,
          location: { type: 'Point', coordinates: [longitude, latitude] },
        },
        config
      );
      Alert.alert(
        'Success',
        'Shop created successfully',
        [{ text: 'OK', onPress: () => router.push(`/shopkeeper/dashboard?shopId=${response.data._id}`) }]
      );
    } catch (err: any) {
      console.error('API Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create shop. Please check the backend logs.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authMessage}>
          <Text style={styles.authText}>Please log in to add a shop</Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Create Shop</Text>
              <Text style={styles.headerSubtitle}>Add a new business location</Text>
            </View>
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Form Container */}
            <Animated.View 
              style={[
                styles.formSection,
                { opacity: fadeAnim, transform: [{ translateY }] }
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Shop Information</Text>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Shop Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="storefront-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter shop name"
                    placeholderTextColor="#a0a0a0"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setError(null);
                    }}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Shop Type</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="pricetag-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Grocery, Electronics, Clothing"
                    placeholderTextColor="#a0a0a0"
                    value={type}
                    onChangeText={(text) => {
                      setType(text);
                      setError(null);
                    }}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Map Section */}
            <Animated.View 
              style={[
                styles.formSection,
                { opacity: fadeAnim, transform: [{ translateY: translateY }] }
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Shop Location</Text>
                {selectedLocation && (
                  <View style={styles.locationBadge}>
                    <Ionicons name="location" size={12} color="#4a69bd" />
                    <Text style={styles.locationBadgeText}>Selected</Text>
                  </View>
                )}
              </View>

              {mapLoading ? (
                <View style={styles.mapLoadingContainer}>
                  <ActivityIndicator size="large" color="#4a69bd" />
                  <Text style={styles.mapLoadingText}>Loading map...</Text>
                </View>
              ) : (
                <View style={styles.mapContainer}>
                  <View style={styles.mapWrapper}>
                    <WebView
                      ref={webViewRef}
                      source={{ html: mapHtml }}
                      style={styles.map}
                      onMessage={handleMessage}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      geolocationEnabled={true}
                      onLoadEnd={() => {
                        setMapLoading(false);
                        setWebViewLoaded(true);
                      }}
                    />
                  </View>

                  <View style={styles.mapInfoContainer}>
                    <View style={styles.mapInstructionContainer}>
                      <Ionicons name="finger-print" size={16} color="#4a69bd" />
                      <Text style={styles.mapInstructionText}>
                        Tap on the map to set your shop location
                      </Text>
                    </View>
                    
                    {selectedLocation && (
                      <View style={styles.coordinatesContainer}>
                        <Text style={styles.coordinatesLabel}>Selected Location:</Text>
                        <Text style={styles.coordinatesText}>
                          {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.attribution}>
                    © OpenStreetMap contributors
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View 
              style={[
                styles.buttonsContainer,
                { opacity: fadeAnim }
              ]}
            >
              <TouchableOpacity
                style={[styles.createButton, (loading || mapLoading) && styles.disabledButton]}
                onPress={handleCreateShop}
                disabled={loading || mapLoading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={20} color="#ffffff" />
                    <Text style={styles.buttonText}>Create Shop</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, (loading || mapLoading) && styles.disabledButton]}
                onPress={() => router.back()}
                disabled={loading || mapLoading}
              >
                <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
  headerTitleContainer: {
    flex: 1,
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
    paddingBottom: 40,
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
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  locationBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a69bd',
    marginLeft: 4,
  },
  inputWrapper: {
    marginBottom: 16,
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
  mapContainer: {
    width: '100%',
  },
  mapWrapper: {
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapInfoContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mapInstructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mapInstructionText: {
    fontSize: 14,
    color: '#4a69bd',
    marginLeft: 8,
    fontWeight: '500',
  },
  coordinatesContainer: {
    marginTop: 8,
    marginLeft: 24,
  },
  coordinatesLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  coordinatesText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  mapLoadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  attribution: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 6,
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
  buttonsContainer: {
    marginTop: 10,
  },
  createButton: {
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
    height: 52,
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  authMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a69bd',
    padding: 12,
  },
});

export default AddShop;