import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

// Attach access token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token when access token expires
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only try refresh when we receive 401
    // and this request hasn't already been retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // Get a new access token using the HTTP-only refresh cookie
        const response = await api.post("/auth/refresh");

        const newAccessToken = response.data.accessToken;

        // Store the new token
        setAccessToken(newAccessToken);

        // Update the failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Try the original request again
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid/expired
        setAccessToken(null);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;