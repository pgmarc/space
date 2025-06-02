import axios from 'axios';
import type { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SPACE_BASE_URL ?? 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;