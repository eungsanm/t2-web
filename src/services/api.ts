import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5095/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      error.message = 'No se puede conectar con el servidor. Asegúrate de que la API esté corriendo en http://localhost:5233';
    }
    return Promise.reject(error);
  }
);

export default api;
