import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Use HttpOnly cookies
});

// We no longer manage tokens via localStorage because they are httpOnly cookies
export const tokenManager = {
    getToken: (): string | null => null,
    setToken: (token: string): void => {},
    removeToken: (): void => {},
    hasToken: (): boolean => true, // We assume true until a 401 returns
};

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      // Retries don't need a token explicitly because it's a cookie
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Prevent infinite refresh loops
            if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login') {
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                    window.location.href = '/auth/login';
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh token
                await axios.get(`${API_URL}/auth/refresh`, { withCredentials: true });
                isRefreshing = false;
                processQueue(null);
                
                // Retry the original request
                return apiClient(originalRequest);
            } catch (err) {
                isRefreshing = false;
                processQueue(err, null);
                
                // Redirect to login on refresh failure
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                    window.location.href = '/auth/login';
                }
                
                return Promise.reject(err);
            }
        }

        // Format error message
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject({
            ...error,
            message: Array.isArray(message) ? message.join(', ') : message,
        });
    }
);

export default apiClient;
