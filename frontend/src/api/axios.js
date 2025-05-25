import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Axios instance for public  requests
export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios instance for private requests
export const privateApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// privateApi: Add the access token
privateApi.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// privateApi: Handle 401 Unauthorized errors
privateApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "Authentication error (401). Token might be expired or invalid. Forcing logout."
      );

      // Clear tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Redirect to login page
      alert("Your session has expired or is invalid. Please log in again.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
