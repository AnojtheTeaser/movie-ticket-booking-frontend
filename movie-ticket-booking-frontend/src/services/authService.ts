import api from './api';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type?: string;
  id?: number;
  username?: string;
  email?: string;
  roles?: string[];
}

export const authService = {
  // Register API Call
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login API Call
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // get Current User details 
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }
};