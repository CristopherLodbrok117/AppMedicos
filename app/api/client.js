import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://192.168.100.8:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API warning:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;