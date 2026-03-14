import apiClient, { tokenManager } from './client';

export interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    createdAt: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export const authApi = {
    /**
     * Register a new user
     */
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);
        // Store token
        if (response.data.access_token) {
            tokenManager.setToken(response.data.access_token);
        }
        return response.data;
    },

    /**
     * Login with email and password
     */
    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        // Store token
        if (response.data.access_token) {
            tokenManager.setToken(response.data.access_token);
        }
        return response.data;
    },

    /**
     * Get current authenticated user
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('/auth/me');
        return response.data;
    },

    /**
     * Logout - clear token
     */
    logout: (): void => {
        tokenManager.removeToken();
    },

    /**
     * Request password reset email
     */
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset password with token
     */
    resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
            token,
            password,
        });
        return response.data;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return tokenManager.hasToken();
    },

    /**
     * Get Google OAuth URL
     */
    getGoogleAuthUrl: (): string => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        return `${apiUrl}/auth/google`;
    },
};
