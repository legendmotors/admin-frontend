import axios, { AxiosInstance } from 'axios';
import { getCookie } from './cookieFunction';
import { API_URL } from './apiUrls';

const getAuthToken = () => getCookie('token') || '';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Required for sending cookies in requests
});

// Add Authorization header dynamically for each request
axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
