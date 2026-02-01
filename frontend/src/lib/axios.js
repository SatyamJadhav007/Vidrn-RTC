import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});

// Response interceptor for rate limit handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 60;
      toast.error(`Too many requests. Try again in ${retryAfter}s`, {
        id: "rate-limit", // Prevent duplicate toasts
        duration: 4000,
      });
    }
    return Promise.reject(error);
  }
);
