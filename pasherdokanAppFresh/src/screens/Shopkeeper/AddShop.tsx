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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../utils/auth';
import api from '../../services/api';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      console.log('API endpoint:', `${api.defaults.baseURL}/shops`); // Add this for debugging

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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Create a New Shop</Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Shop Name</Text>
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
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Shop Type</Text>
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
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Shop Location</Text>
                {mapLoading ? (
                  <View style={styles.mapLoading}>
                    <ActivityIndicator size="large" color="#4a69bd" />
                    <Text style={styles.helperText}>Loading map...</Text>
                  </View>
                ) : (
                  <View style={styles.mapContainer}>
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
                    <Text style={styles.helperText}>
                      Tap on the map to set your shop location
                    </Text>
                    {selectedLocation && (
                      <Text style={styles.coordinatesText}>
                        Selected: {selectedLocation.latitude.toFixed(6)},{' '}
                        {selectedLocation.longitude.toFixed(6)}
                      </Text>
                    )}
                    <Text style={styles.attribution}>
                      © OpenStreetMap contributors
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateShop}
                  disabled={loading || mapLoading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Create Shop</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.back()}
                  disabled={loading || mapLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 5,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcdde1',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#2c3e50',
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 5,
  },
  attribution: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 10,
    gap: 10,
  },
  createButton: {
    height: 50,
    backgroundColor: '#4a69bd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cancelButton: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  authMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a69bd',
  },
});

export default AddShop;