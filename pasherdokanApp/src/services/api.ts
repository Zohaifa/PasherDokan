import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Adjust if your backend runs on a different port
});

export default api;
