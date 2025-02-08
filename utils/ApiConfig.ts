import axios, { AxiosInstance } from 'axios';
import { getCookie } from './cookieFunction';
import { API_URL } from './apiUrls';

// Define the return type of getCookie function (if it's unknown, use `string | null`)
const token: string | null = getCookie('token');

// Create the axios instance with proper typing
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : '' // Add fallback in case token is null
    },
    withCredentials: true, // Ensures cookies are sent in requests
});

export default axiosInstance;
