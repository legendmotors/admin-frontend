import axios, { AxiosInstance } from "axios";

// Create an Axios instance with the base URL from environment variables
export const api: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/file-system`,
});
