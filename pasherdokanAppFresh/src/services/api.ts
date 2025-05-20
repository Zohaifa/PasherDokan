import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  // baseURL: 'http://192.168.1.19:5000/api', //use only for local testing
  baseURL: 'https://pasherdokan.onrender.com/api', // use this for production
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error retrieving token from AsyncStorage:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
