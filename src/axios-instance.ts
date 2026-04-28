import axios, { AxiosRequestConfig } from 'axios';

const baseURL =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : typeof window !== 'undefined' && (window as any).__API_URL__
    ? (window as any).__API_URL__
    : '';

export const axiosClient = axios.create({ baseURL });

axiosClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const axiosInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return axiosClient(config).then((res) => res.data);
};
