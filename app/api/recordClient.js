import axios from 'axios';

const recordClient = axios.create({
  baseURL: 'http://192.168.100.8:8080', // Cambia a tu URL base real
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
});

recordClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API warning:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default recordClient;
