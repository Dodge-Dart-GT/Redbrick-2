import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://redbrick-api.onrender.com';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export default axiosInstance;